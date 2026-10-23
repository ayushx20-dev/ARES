from sqlalchemy.orm import Session
from backend.database.models import Ambulance, Hospital

def check_resource_status(db: Session, resource_type: str, resource_id: str):
    """
    Tool: Verifies current runtime status of a deployed resource to ensure it remains active.
    """
    if resource_type == "AMBULANCE":
        amb = db.query(Ambulance).filter(Ambulance.id == resource_id).first()
        if not amb:
            return {"status": "FAILED", "is_valid": False, "reason": "RESOURCE_NOT_FOUND"}
            
        if amb.status in ["OFFLINE", "BUSY"]:
            return {
                "status": "FAILED",
                "is_valid": False,
                "reason": f"Ambulance {resource_id} status changed to {amb.status}!",
                "current_status": amb.status
            }
            
        return {
            "status": "SUCCESS",
            "is_valid": True,
            "current_status": amb.status,
            "eta_minutes": amb.eta_minutes
        }
        
    elif resource_type == "HOSPITAL":
        hosp = db.query(Hospital).filter(Hospital.id == resource_id).first()
        if not hosp:
            return {"status": "FAILED", "is_valid": False, "reason": "HOSPITAL_NOT_FOUND"}
            
        return {
            "status": "SUCCESS",
            "is_valid": True,
            "current_status": hosp.status,
            "beds": hosp.available_beds
        }
        
    return {"status": "FAILED", "is_valid": False, "reason": "UNKNOWN_RESOURCE_TYPE"}
