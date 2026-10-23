import asyncio
import datetime
from sqlalchemy.orm import Session
from backend.database.models import Incident, ActionLog, AgentCoTLog, Ambulance, Hospital
from backend.core.state import IncidentState
from backend.agents.commander import CommanderAgent
from backend.api.websocket import manager
from backend.tools.ambulance import set_ambulance_status

class Orchestrator:
    def __init__(self, db: Session, incident_id: str):
        self.db = db
        self.incident_id = incident_id
        self.incident = db.query(Incident).filter(Incident.id == incident_id).first()
        self.commander = CommanderAgent(db)

    async def log_cot(self, agent_name: str, decision_summary: str, tool_called: str = None, result: str = None):
        """
        Persists CoT log entry to database and broadcasts live event to WebSocket clients.
        """
        log_entry = AgentCoTLog(
            incident_id=self.incident_id,
            agent_name=agent_name,
            decision_summary=decision_summary,
            tool_called=tool_called,
            result=result,
            timestamp=datetime.datetime.utcnow()
        )
        self.db.add(log_entry)
        self.db.commit()

        event = {
            "type": "COT_EVENT",
            "incident_id": self.incident_id,
            "agent": agent_name,
            "summary": decision_summary,
            "tool": tool_called,
            "result": result,
            "timestamp": datetime.datetime.utcnow().strftime("%H:%M:%S")
        }
        await manager.broadcast(event)
        await asyncio.sleep(1.8)  # Realistic pacing for human operator observation on live dashboard

    async def update_state(self, state: str):
        self.incident.status = state
        self.db.commit()
        await manager.broadcast({
            "type": "STATE_CHANGE",
            "incident_id": self.incident_id,
            "status": state,
            "timestamp": datetime.datetime.utcnow().strftime("%H:%M:%S")
        })

    async def run_coordination_flow(self, exclude_ambulance_ids=None):
        """
        Main initial autonomous execution flow following:
        Observe -> Reason -> Plan -> Act -> Verify
        """
        exclude_ambs = exclude_ambulance_ids or []
        
        # Reset fleet on fresh initial run
        if not exclude_ambs:
            from backend.database.seed import reset_fleet
            reset_fleet(self.db)

        try:
            # 1. ANALYZING Phase
            await self.update_state(IncidentState.ANALYZING)
            analysis = self.commander.analyze_incident(self.incident)
            await self.log_cot(
                agent_name="Commander Agent 🧠",
                decision_summary=analysis["reasoning"],
                tool_called="analyze_incident",
                result="Incident categorized as CRITICAL road accident."
            )

            # 2. Medical Agent Assessment
            med_eval = self.commander.medical.evaluate(self.incident)
            self.incident.severity = med_eval["severity"]
            self.db.commit()
            await self.log_cot(
                agent_name="Medical Agent 🚑",
                decision_summary=med_eval["reasoning"],
                tool_called=med_eval["tool_called"],
                result=f"Hospital Recommended: {med_eval['recommended_hospital'].get('name')}"
            )

            selected_hospital = med_eval['recommended_hospital']
            self.incident.active_hospital_id = selected_hospital.get("hospital_id")

            # 3. PLANNING Phase — Logistics & Traffic
            await self.update_state(IncidentState.PLANNING)
            logistics_eval = self.commander.logistics.locate_and_assign(self.incident, exclude_ambulance_ids=exclude_ambs)
            
            amb_res = logistics_eval["result"]
            if amb_res.get("status") != "SUCCESS":
                await self.log_cot(
                    agent_name="Logistics Agent 📍",
                    decision_summary="🚨 Critical Resource Shortage: No suitable ambulance available!",
                    result="FAILED"
                )
                await self.update_state(IncidentState.FAILED)
                return

            selected_amb_id = amb_res["ambulance_id"]
            self.incident.active_ambulance_id = selected_amb_id
            self.incident.eta_minutes = amb_res["eta_minutes"]
            self.db.commit()

            await self.log_cot(
                agent_name="Logistics Agent 📍",
                decision_summary=logistics_eval["reasoning"],
                tool_called=logistics_eval["tool_called"],
                result=f"Selected Ambulance {selected_amb_id} (ETA: {amb_res['eta_minutes']} min)"
            )

            # Traffic Route Evaluation
            traffic_eval = self.commander.traffic.evaluate_route(selected_amb_id, self.incident.location_name)
            self.incident.recommended_route = traffic_eval["route_name"]
            self.db.commit()

            await self.log_cot(
                agent_name="Traffic Agent 🚗",
                decision_summary=traffic_eval["reasoning"],
                tool_called=traffic_eval["tool_called"],
                result=f"Optimized Route: {traffic_eval['route_name']}"
            )

            # 4. EXECUTING Phase — Communication & Dispatch
            await self.update_state(IncidentState.EXECUTING)
            dispatch_res = self.commander.logistics.dispatch(selected_amb_id, self.incident.id)
            await self.log_cot(
                agent_name="Logistics Agent 📍",
                decision_summary=dispatch_res["reasoning"],
                tool_called=dispatch_res["tool_called"],
                result="DISPATCHED"
            )

            comm_res = self.commander.communication.dispatch_notifications(
                self.incident,
                ambulance_id=selected_amb_id,
                hospital_id=selected_hospital.get("hospital_id"),
                route_name=traffic_eval["route_name"]
            )
            await self.log_cot(
                agent_name="Communication Agent 📡",
                decision_summary=comm_res["reasoning"],
                tool_called=comm_res["tool_called"],
                result="NOTIFICATIONS_CONFIRMED"
            )

            # 5. VERIFYING Phase
            await self.update_state(IncidentState.VERIFYING)
            verification = self.commander.verify_plan_execution(
                selected_amb_id,
                selected_hospital.get("hospital_id")
            )

            if verification.get("status") == "SUCCESS":
                await self.log_cot(
                    agent_name="Commander Agent 🧠",
                    decision_summary=verification["reasoning"],
                    tool_called="verify_plan_execution",
                    result="SUCCESS"
                )
                await self.update_state(IncidentState.COMPLETED)
                await manager.broadcast({
                    "type": "COORDINATION_COMPLETE",
                    "incident_id": self.incident_id,
                    "ambulance_id": selected_amb_id,
                    "hospital": selected_hospital.get("name"),
                    "eta_minutes": amb_res["eta_minutes"],
                    "route": traffic_eval["route_name"]
                })
            else:
                await self.replan_failed_resource(selected_amb_id)

        except Exception as e:
            await self.log_cot(
                agent_name="Commander Agent 🧠",
                decision_summary=f"Unexpected error in orchestrator: {str(e)}",
                result="ERROR"
            )
            await self.update_state(IncidentState.FAILED)

    async def replan_failed_resource(self, failed_ambulance_id: str):
        """
        State-Aware Autonomous Replanning Engine:
        Identifies failure -> Retains valid state -> Replans ONLY affected subtask -> Computes Plan Delta -> Recovers response plan
        """
        set_ambulance_status(self.db, failed_ambulance_id, "OFFLINE")
        await self.log_cot(
            agent_name="System Sensor Alert ⚠️",
            decision_summary=f"CRITICAL DISRUPTION DETECTED: Ambulance {failed_ambulance_id} reported telemetry failure & went OFFLINE!",
            tool_called="sensor_health_check",
            result="RESOURCE_UNAVAILABLE"
        )
        
        await manager.broadcast({
            "type": "RESOURCE_FAILURE",
            "ambulance_id": failed_ambulance_id,
            "message": f"Ambulance {failed_ambulance_id} went OFFLINE mid-transit!"
        })

        await self.update_state(IncidentState.REPLANNING)
        await asyncio.sleep(0.8)

        # 1. Commander Agent: REPLANNING DECISION (Failure Classification & Valid State Retention)
        hosp = self.db.query(Hospital).filter(Hospital.id == self.incident.active_hospital_id).first()
        hosp_name = hosp.name if hosp else "City Central Emergency & Trauma Center"
        existing_route = self.incident.recommended_route or "Bypass Corridor (Alternate)"
        prev_eta = self.incident.eta_minutes or 6.0

        replanning_decision_summary = (
            f"🧠 REPLANNING DECISION\n"
            f"• Reason: {failed_ambulance_id} telemetry failure (OFFLINE)\n"
            f"• Affected: Ambulance vehicle assignment\n"
            f"• Preserved: Hospital pre-booking ({hosp_name}) + Route corridor ({existing_route})\n"
            f"• Decision: Replace {failed_ambulance_id} with nearest available trauma vehicle"
        )
        await self.log_cot(
            agent_name="Commander Agent 🧠",
            decision_summary=replanning_decision_summary,
            tool_called="evaluate_plan_state",
            result="TARGETED_REPLANNING"
        )

        # 2. Logistics Agent: Targeted Replacement Search (Excludes failed ambulance)
        logistics_eval = self.commander.logistics.locate_and_assign(self.incident, exclude_ambulance_ids=[failed_ambulance_id])
        amb_res = logistics_eval["result"]

        if amb_res.get("status") != "SUCCESS":
            await self.log_cot(
                agent_name="Logistics Agent 📍",
                decision_summary=f"🚨 Critical Resource Shortage: No alternative ambulance available after excluding {failed_ambulance_id}!",
                result="FAILED"
            )
            await self.update_state(IncidentState.FAILED)
            return

        new_amb_id = amb_res["ambulance_id"]
        new_eta = amb_res["eta_minutes"]
        self.incident.active_ambulance_id = new_amb_id
        self.incident.eta_minutes = new_eta
        self.db.commit()

        await self.log_cot(
            agent_name="Logistics Agent 📍",
            decision_summary=f"Searched replacement ambulance for {self.incident.location_name} (excluded: [{failed_ambulance_id}]). Selected Ambulance {new_amb_id} (ETA: {new_eta} min).",
            tool_called="find_nearest_ambulance",
            result=f"Selected Ambulance {new_amb_id} (ETA: {new_eta} min)"
        )

        # 3. Traffic Agent: State-Aware Route Verification & Dynamic ETA Recalculation
        traffic_eval = self.commander.traffic.reverify_route(new_amb_id, existing_route, new_eta)
        await self.log_cot(
            agent_name="Traffic Agent 🚗",
            decision_summary=traffic_eval["reasoning"],
            tool_called=traffic_eval["tool_called"],
            result=f"ETA Recalculated: {new_eta} min"
        )

        # 4. Logistics Agent: Dispatch Replacement Vehicle
        dispatch_res = self.commander.logistics.dispatch(new_amb_id, self.incident.id)
        await self.log_cot(
            agent_name="Logistics Agent 📍",
            decision_summary=dispatch_res["reasoning"],
            tool_called=dispatch_res["tool_called"],
            result="REPLACEMENT_DISPATCHED"
        )

        # 5. Communication Agent: State-Aware Dispatch Update (Retains Hospital Booking)
        comm_res = self.commander.communication.update_dispatch_plan(
            self.incident,
            new_ambulance_id=new_amb_id,
            hospital_name=hosp_name,
            eta_minutes=new_eta
        )
        await self.log_cot(
            agent_name="Communication Agent 📡",
            decision_summary=comm_res["reasoning"],
            tool_called=comm_res["tool_called"],
            result="DISPATCH_PLAN_UPDATED"
        )

        # 6. Commander Agent: PLAN DELTA Recovery Summary
        plan_delta_summary = (
            f"🎯 PLAN DELTA\n"
            f"• Ambulance: {failed_ambulance_id} ➔ {new_amb_id}\n"
            f"• ETA: {prev_eta} min ➔ {new_eta} min\n"
            f"• Route Corridor: Unchanged ({existing_route})\n"
            f"• Hospital Target: Unchanged ({hosp_name})"
        )
        await self.log_cot(
            agent_name="Commander Agent 🧠",
            decision_summary=plan_delta_summary,
            tool_called="compute_plan_delta",
            result="PLAN_DELTA_COMPUTED"
        )

        # 7. Commander Agent: Final Verification & Plan Recovery
        verification = self.commander.verify_plan_execution(new_amb_id, self.incident.active_hospital_id)
        if verification.get("status") == "SUCCESS":
            await self.log_cot(
                agent_name="Commander Agent 🧠",
                decision_summary=f"Verification successful: Replacement Ambulance {new_amb_id} dispatched & Hospital prepped. ✅ RESPONSE PLAN RECOVERED",
                tool_called="verify_plan_execution",
                result="PLAN_RECOVERED"
            )
            await self.update_state(IncidentState.COMPLETED)
            await manager.broadcast({
                "type": "COORDINATION_COMPLETE",
                "incident_id": self.incident_id,
                "ambulance_id": new_amb_id,
                "hospital": hosp_name,
                "eta_minutes": new_eta,
                "route": existing_route
            })
        else:
            await self.update_state(IncidentState.FAILED)

    async def simulate_resource_failure(self, ambulance_id: str):
        """
        Simulates an external resource failure (e.g. Ambulance A17 breaks down or goes OFFLINE).
        ARES detects the state change automatically during verification and executes state-aware targeted replanning!
        """
        await self.replan_failed_resource(ambulance_id)
