from sqlalchemy.orm import Session

def notify_police(db: Session, incident_id: str, location_name: str, description: str):
    """
    Tool: Sends alert to Police Control Room for accident scene management & crowd control.
    """
    return {
        "status": "SUCCESS",
        "recipient": "Police Control Room (PCR)",
        "incident_id": incident_id,
        "message": f"Police alert dispatched to {location_name}. Unit P-4 assigned.",
        "confirmation_code": f"PCR-{incident_id[:6].upper()}"
    }

def notify_traffic_control(db: Session, incident_id: str, route_name: str):
    """
    Tool: Alerts Traffic Police to clear green wave corridor for dispatched ambulance.
    """
    return {
        "status": "SUCCESS",
        "recipient": "City Traffic Control Center",
        "incident_id": incident_id,
        "message": f"Green corridor requested on route: {route_name}. Signals prioritized.",
        "confirmation_code": "TRAFFIC-GREEN-WAVE-ACTIVE"
    }
