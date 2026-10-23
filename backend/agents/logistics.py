from sqlalchemy.orm import Session
from backend.tools.ambulance import find_nearest_ambulance, dispatch_ambulance, get_ambulance_status

class LogisticsAgent:
    def __init__(self, db: Session):
        self.name = "Logistics Agent"
        self.db = db

    def locate_and_assign(self, incident, exclude_ambulance_ids=None):
        """
        Locates nearest available ambulance matching requirements.
        Allows excluding failed/offline ambulance IDs during autonomous replanning.
        """
        exclude = exclude_ambulance_ids or []
        
        # Tool Call: find nearest ambulance
        result = find_nearest_ambulance(
            self.db,
            location_name=incident.location_name,
            required_capability="TRAUMA_ADVANCED",
            exclude_ids=exclude
        )
        
        if result.get("status") == "SUCCESS":
            amb_id = result.get("ambulance_id")
            if amb_id in exclude:
                # Need to find alternative
                from backend.database.models import Ambulance
                alt_ambs = self.db.query(Ambulance).filter(
                    Ambulance.status == "AVAILABLE",
                    ~Ambulance.id.in_(exclude)
                ).order_by(Ambulance.eta_minutes.asc()).all()
                
                if alt_ambs:
                    alt = alt_ambs[0]
                    result = {
                        "status": "SUCCESS",
                        "ambulance_id": alt.id,
                        "vehicle_number": alt.vehicle_number,
                        "eta_minutes": alt.eta_minutes,
                        "equipment_type": alt.equipment_type
                    }
                else:
                    result = {"status": "NOT_FOUND", "message": "No alternative ambulances available."}

        summary = (
            f"Searched emergency fleet near {incident.location_name} (excluded: {exclude}). "
            f"Result: {result.get('ambulance_id')} with ETA {result.get('eta_minutes')} min."
            if result.get("status") == "SUCCESS"
            else f"No available ambulance found after excluding {exclude}."
        )

        return {
            "agent": self.name,
            "result": result,
            "reasoning": summary,
            "tool_called": "find_nearest_ambulance"
        }

    def dispatch(self, ambulance_id: str, incident_id: str):
        dispatch_res = dispatch_ambulance(self.db, ambulance_id, incident_id)
        summary = (
            f"Dispatched Ambulance {ambulance_id} to incident {incident_id}."
            if dispatch_res.get("status") == "SUCCESS"
            else f"Failed to dispatch {ambulance_id}: {dispatch_res.get('reason')}."
        )
        return {
            "agent": self.name,
            "result": dispatch_res,
            "reasoning": summary,
            "tool_called": "dispatch_ambulance"
        }
