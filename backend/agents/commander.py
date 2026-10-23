from sqlalchemy.orm import Session
from backend.agents.medical import MedicalAgent
from backend.agents.logistics import LogisticsAgent
from backend.agents.traffic import TrafficAgent
from backend.agents.communication import CommunicationAgent
from backend.tools.verification import check_resource_status

class CommanderAgent:
    def __init__(self, db: Session):
        self.name = "Commander Agent 🧠"
        self.db = db
        self.medical = MedicalAgent(db)
        self.logistics = LogisticsAgent(db)
        self.traffic = TrafficAgent(db)
        self.communication = CommunicationAgent(db)

    def analyze_incident(self, incident):
        """
        Step 1: Understand incident details and decompose into agent subtasks.
        """
        summary = (
            f"Received incident '{incident.description}' at location '{incident.location_name}'. "
            f"Victims count: {incident.victim_count}. Initiating agent orchestration loop."
        )
        return {
            "agent": self.name,
            "action": "ANALYZE_INCIDENT",
            "reasoning": summary,
            "subtasks": [
                "Medical severity & trauma priority assessment",
                "Logistics fleet discovery & ambulance selection",
                "Traffic congestion & emergency route optimization",
                "Multi-service communication alert dispatch"
            ]
        }

    def verify_plan_execution(self, ambulance_id: str, hospital_id: str):
        """
        Step 2: Actively verifies that the selected resource is functioning properly.
        """
        check_amb = check_resource_status(self.db, "AMBULANCE", ambulance_id)
        if not check_amb.get("is_valid"):
            return {
                "status": "FAILED",
                "failed_resource": ambulance_id,
                "reason": check_amb.get("reason"),
                "reasoning": f"Verification failed: Ambulance {ambulance_id} became UNAVAILABLE/OFFLINE mid-dispatch!"
            }
            
        check_hosp = check_resource_status(self.db, "HOSPITAL", hospital_id)
        if not check_hosp.get("is_valid"):
            return {
                "status": "FAILED",
                "failed_resource": hospital_id,
                "reason": check_hosp.get("reason"),
                "reasoning": f"Verification failed: Hospital {hospital_id} has no bed capacity!"
            }

        return {
            "status": "SUCCESS",
            "reasoning": f"Verification confirmed: Ambulance {ambulance_id} dispatched & Hospital {hospital_id} prepped."
        }
