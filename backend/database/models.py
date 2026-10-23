import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String, primary_key=True)
    description = Column(Text, nullable=False)
    location_name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    severity = Column(String, default="PENDING")  # CRITICAL, HIGH, MODERATE, LOW
    victim_count = Column(Integer, default=1)
    critical_victim_count = Column(Integer, default=0)
    status = Column(String, default="RECEIVED")  # RECEIVED, ANALYZING, PLANNING, EXECUTING, VERIFYING, REPLANNING, COMPLETED, FAILED
    active_ambulance_id = Column(String, nullable=True)
    active_hospital_id = Column(String, nullable=True)
    recommended_route = Column(String, nullable=True)
    eta_minutes = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class Ambulance(Base):
    __tablename__ = "ambulances"

    id = Column(String, primary_key=True)  # e.g., "A17", "A21", "A24"
    vehicle_number = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    status = Column(String, default="AVAILABLE")  # AVAILABLE, ASSIGNED, BUSY, OFFLINE
    eta_minutes = Column(Float, default=0.0)
    hospital_id = Column(String, nullable=True)
    equipment_type = Column(String, default="ADVANCED_LIFE_SUPPORT")  # ALS, BLS, TRAUMA
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    emergency_capacity = Column(Integer, default=10)
    available_beds = Column(Integer, default=5)
    trauma_support = Column(Boolean, default=True)
    status = Column(String, default="OPERATIONAL")  # OPERATIONAL, FULL
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class TrafficRoute(Base):
    __tablename__ = "traffic_routes"

    id = Column(String, primary_key=True)
    source_name = Column(String, nullable=False)
    destination_name = Column(String, nullable=False)
    route_name = Column(String, nullable=False)
    congestion_level = Column(String, default="LOW")  # LOW, MODERATE, HEAVY, BLOCKED
    estimated_time_min = Column(Float, default=10.0)
    notes = Column(String, nullable=True)

class ActionLog(Base):
    __tablename__ = "actions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    incident_id = Column(String, nullable=False)
    agent = Column(String, nullable=False)
    action = Column(String, nullable=False)
    status = Column(String, nullable=False)  # SUCCESS, FAILED, PENDING
    result = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class AgentCoTLog(Base):
    __tablename__ = "agent_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    incident_id = Column(String, nullable=False)
    agent_name = Column(String, nullable=False)
    decision_summary = Column(Text, nullable=False)
    tool_called = Column(String, nullable=True)
    result = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
