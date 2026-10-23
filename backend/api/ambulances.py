from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database.database import get_db
from backend.database.models import Ambulance
from backend.tools.ambulance import set_ambulance_status

router = APIRouter(prefix="/api/ambulances", tags=["ambulances"])

@router.get("")
def list_ambulances(db: Session = Depends(get_db)):
    return db.query(Ambulance).all()

@router.get("/{ambulance_id}")
def get_ambulance(ambulance_id: str, db: Session = Depends(get_db)):
    amb = db.query(Ambulance).filter(Ambulance.id == ambulance_id).first()
    if not amb:
        raise HTTPException(status_code=404, detail="Ambulance not found")
    return amb

@router.post("/{ambulance_id}/status")
def update_status(ambulance_id: str, status: str, db: Session = Depends(get_db)):
    success = set_ambulance_status(db, ambulance_id, status)
    if not success:
        raise HTTPException(status_code=404, detail="Ambulance not found")
    return {"status": "SUCCESS", "ambulance_id": ambulance_id, "new_status": status}
