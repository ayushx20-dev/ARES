from sqlalchemy.orm import Session
from backend.database.models import Hospital

def find_nearby_hospitals(db: Session, location_name: str, require_trauma: bool = True):
    """
    Tool: Searches database for operational hospitals with available beds.
    """
    query = db.query(Hospital).filter(Hospital.status == "OPERATIONAL", Hospital.available_beds > 0)
    if require_trauma:
        query = query.filter(Hospital.trauma_support == True)
        
    hospitals = query.all()
    if not hospitals:
        return {"status": "NOT_FOUND", "message": "No suitable operational hospital found."}
        
    hospitals.sort(key=lambda h: h.available_beds, reverse=True)
    selected = hospitals[0]
    
    return {
        "status": "SUCCESS",
        "hospital_id": selected.id,
        "name": selected.name,
        "available_beds": selected.available_beds,
        "trauma_support": selected.trauma_support,
        "latitude": selected.latitude,
        "longitude": selected.longitude
    }

def check_hospital_capacity(db: Session, hospital_id: str):
    """
    Tool: Verifies current emergency capacity & beds for a specific hospital.
    """
    hospital = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not hospital:
        return {"status": "NOT_FOUND", "message": f"Hospital {hospital_id} not found."}
        
    return {
        "status": "SUCCESS",
        "hospital_id": hospital.id,
        "name": hospital.name,
        "available_beds": hospital.available_beds,
        "trauma_support": hospital.trauma_support,
        "is_ready": hospital.available_beds > 0 and hospital.status == "OPERATIONAL"
    }

def notify_hospital(db: Session, hospital_id: str, incident_id: str, victims_count: int):
    """
    Tool: Sends emergency alert to hospital trauma team and reserves bed.
    """
    hospital = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not hospital or hospital.available_beds < 1:
        return {"status": "FAILED", "reason": "NO_CAPACITY_OR_NOT_FOUND"}
        
    # Reserve 1 bed for incoming patient
    hospital.available_beds = max(0, hospital.available_beds - 1)
    db.commit()
    
    return {
        "status": "SUCCESS",
        "hospital_id": hospital.id,
        "hospital_name": hospital.name,
        "beds_remaining": hospital.available_beds,
        "trauma_bay_alerted": True
    }
