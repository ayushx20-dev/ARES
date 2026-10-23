from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from backend.database.database import init_db
from backend.database.seed import seed_database
from backend.api.incidents import router as incidents_router
from backend.api.ambulances import router as ambulances_router
from backend.api.hospitals import router as hospitals_router
from backend.api.agents import router as agents_router
from backend.api.websocket import manager

app = FastAPI(
    title="ARES — Autonomous Emergency Response System",
    description="Agentic AI Emergency Coordination Platform Backend API",
    version="1.0.0"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    seed_database()
    print("ARES Backend Ready & Seeded.")

app.include_router(incidents_router)
app.include_router(ambulances_router)
app.include_router(hospitals_router)
app.include_router(agents_router)

@app.websocket("/ws/incidents/{incident_id}")
async def websocket_endpoint(websocket: WebSocket, incident_id: str):
    await manager.connect(websocket)
    try:
        while True:
            # Keep socket alive
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/")
def read_root():
    return {
        "status": "ONLINE",
        "system": "ARES Autonomous Emergency Response System",
        "version": "1.0-Hackathon-MVP"
    }
