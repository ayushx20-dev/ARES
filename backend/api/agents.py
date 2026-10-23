from fastapi import APIRouter

router = APIRouter(prefix="/api/agents", tags=["agents"])

@router.get("/status")
def get_agents_status():
    return {
        "agents": [
            {"id": "commander", "name": "Commander Agent 🧠", "role": "Central Orchestrator", "status": "ACTIVE"},
            {"id": "medical", "name": "Medical Agent 🚑", "role": "Severity & Hospital Matching", "status": "ACTIVE"},
            {"id": "logistics", "name": "Logistics Agent 📍", "role": "Fleet & Ambulance Allocation", "status": "ACTIVE"},
            {"id": "traffic", "name": "Traffic Agent 🚗", "role": "Route & ETA Optimization", "status": "ACTIVE"},
            {"id": "communication", "name": "Communication Agent 📡", "role": "Alert & Dispatch Coordination", "status": "ACTIVE"}
        ]
    }
