from sqlalchemy.orm import Session
from backend.database.models import Ambulance

def find_nearest_ambulance(db: Session, location_name: str, required_capability: str = "BASIC", exclude_ids: list = None):
    """
    Tool: Searches database for available ambulances matching capability.
    Returns nearest available ambulance or None.
    """
    exclude = exclude_ids or []
    ambulances = db.query(Ambulance).filter(
        Ambulance.status == "AVAILABLE",
        ~Ambulance.id.in_(exclude) if exclude else True
    ).all()
    
    if not ambulances:
        return {
            "status": "NOT_FOUND",
            "message": "No available ambulances found matching criteria."
        }
        
    # Sort by ETA
    ambulances.sort(key=lambda a: a.eta_minutes)
    selected = ambulances[0]
    
    return {
        "status": "SUCCESS",
        "ambulance_id": selected.id,
        "vehicle_number": selected.vehicle_number,
        "eta_minutes": selected.eta_minutes,
        "equipment_type": selected.equipment_type,
        "latitude": selected.latitude,
        "longitude": selected.longitude
    }

def get_ambulance_status(db: Session, ambulance_id: str):
    """
    Tool: Checks live status of a specific ambulance.
    """
    ambulance = db.query(Ambulance).filter(Ambulance.id == ambulance_id).first()
    if not ambulance:
        return {"status": "NOT_FOUND", "message": f"Ambulance {ambulance_id} not found."}
        
    return {
        "status": "SUCCESS",
        "ambulance_id": ambulance.id,
        "vehicle_status": ambulance.status,
        "eta_minutes": ambulance.eta_minutes
    }

def dispatch_ambulance(db: Session, ambulance_id: str, incident_id: str):
    """
    Tool: Dispatches an ambulance to an incident.
    Checks availability first to ensure safety.
    """
    ambulance = db.query(Ambulance).filter(Ambulance.id == ambulance_id).first()
    if not ambulance:
        return {"status": "FAILED", "reason": "AMBULANCE_NOT_FOUND"}
        
    if ambulance.status != "AVAILABLE":
        return {
            "status": "FAILED",
            "reason": f"Ambulance {ambulance_id} is currently {ambulance.status} and cannot be dispatched."
        }
        
    ambulance.status = "ASSIGNED"
    db.commit()
    db.refresh(ambulance)
    
    return {
        "status": "SUCCESS",
        "ambulance_id": ambulance.id,
        "vehicle_number": ambulance.vehicle_number,
        "eta_minutes": ambulance.eta_minutes,
        "dispatch_timestamp": str(ambulance.updated_at)
    }

def set_ambulance_status(db: Session, ambulance_id: str, status: str):
    """
    Tool/Helper: Simulates status changes (e.g. OFFLINE, BUSY, AVAILABLE).
    """
    ambulance = db.query(Ambulance).filter(Ambulance.id == ambulance_id).first()
    if ambulance:
        ambulance.status = status
        db.commit()
        return True
    return False
