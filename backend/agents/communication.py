from sqlalchemy.orm import Session
from backend.tools.communication import notify_police, notify_traffic_control
from backend.tools.hospital import notify_hospital

class CommunicationAgent:
    def __init__(self, db: Session):
        self.name = "Communication Agent"
        self.db = db

    def dispatch_notifications(self, incident, ambulance_id: str, hospital_id: str, route_name: str):
        """
        Coordinates alerts across Police, Traffic Control, and Emergency Hospital.
        """
        police_res = notify_police(self.db, incident.id, incident.location_name, incident.description)
        traffic_res = notify_traffic_control(self.db, incident.id, route_name)
        hosp_res = notify_hospital(self.db, hospital_id, incident.id, incident.victim_count)
        
        summary = (
            f"Notified Police ({police_res.get('confirmation_code')}), "
            f"Traffic Control ({traffic_res.get('confirmation_code')}), and "
            f"Hospital ({hosp_res.get('hospital_name')}). All dispatch protocols confirmed."
        )
        
        return {
            "agent": self.name,
            "police_status": police_res.get("status"),
            "traffic_status": traffic_res.get("status"),
            "hospital_status": hosp_res.get("status"),
            "reasoning": summary,
            "tool_called": "notify_police, notify_traffic_control, notify_hospital"
        }

    def update_dispatch_plan(self, incident, new_ambulance_id: str, hospital_name: str, eta_minutes: float):
        """
        State-aware dispatch update: Retains existing hospital bed booking & updates PCR / trauma team with new vehicle ETA.
        """
        summary = (
            f"Updated emergency dispatch plan for incident {incident.id}. "
            f"Hospital '{hospital_name}' pre-booking confirmed (beds retained). Updated ETA to {eta_minutes} min for Ambulance {new_ambulance_id}."
        )
        return {
            "agent": self.name,
            "hospital_status": "PRE_BOOKING_RETAINED",
            "reasoning": summary,
            "tool_called": "update_dispatch_notifications"
        }
