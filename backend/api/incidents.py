import uuid
import asyncio
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
from backend.database.database import get_db
from backend.database.models import Incident, AgentCoTLog, Ambulance, Hospital
from backend.core.orchestrator import Orchestrator

router = APIRouter(prefix="/api/incidents", tags=["incidents"])

class IncidentCreateSchema(BaseModel):
    description: str
    location_name: str
    latitude: float = 22.7196
    longitude: float = 75.8577
    victim_count: int = 3
    critical_victim_count: int = 2

@router.post("")
def create_incident(data: IncidentCreateSchema, db: Session = Depends(get_db)):
    incident_id = f"INC-{uuid.uuid4().hex[:6].upper()}"
    incident = Incident(
        id=incident_id,
        description=data.description,
        location_name=data.location_name,
        latitude=data.latitude,
        longitude=data.longitude,
        victim_count=data.victim_count,
        critical_victim_count=data.critical_victim_count,
        status="RECEIVED"
    )
    db.add(incident)
    db.commit()
    db.refresh(incident)
    return incident

@router.get("")
def list_incidents(db: Session = Depends(get_db)):
    return db.query(Incident).order_by(Incident.created_at.desc()).all()

@router.get("/{incident_id}")
def get_incident(incident_id: str, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident

@router.post("/{incident_id}/activate")
async def activate_ares(incident_id: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    orchestrator = Orchestrator(db, incident_id)
    background_tasks.add_task(orchestrator.run_coordination_flow)
    
    return {
        "status": "SUCCESS",
        "message": f"ARES Autonomous Response activated for incident {incident_id}",
        "incident_id": incident_id
    }

@router.post("/{incident_id}/simulate-failure")
async def simulate_failure(incident_id: str, ambulance_id: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    orchestrator = Orchestrator(db, incident_id)
    background_tasks.add_task(orchestrator.simulate_resource_failure, ambulance_id)

    return {
        "status": "SUCCESS",
        "message": f"Simulated resource failure triggered for Ambulance {ambulance_id}. Autonomous replanning initiated!",
        "incident_id": incident_id,
        "failed_ambulance_id": ambulance_id
    }

@router.get("/{incident_id}/timeline")
def get_timeline(incident_id: str, db: Session = Depends(get_db)):
    logs = db.query(AgentCoTLog).filter(AgentCoTLog.incident_id == incident_id).order_by(AgentCoTLog.id.asc()).all()
    return logs
