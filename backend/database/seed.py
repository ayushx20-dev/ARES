from .database import SessionLocal, init_db
from .models import Ambulance, Hospital, TrafficRoute, Incident

def seed_database():
    init_db()
    db = SessionLocal()
    
    # Reset existing records
    db.query(Incident).delete()
    db.query(Ambulance).delete()
    db.query(Hospital).delete()
    db.query(TrafficRoute).delete()
    
    # 1. Seed Ambulances
    ambulances = [
        Ambulance(
            id="A17",
            vehicle_number="MP-09-EV-1717",
            latitude=22.7196,
            longitude=75.8577,
            status="AVAILABLE",
            eta_minutes=6.0,
            equipment_type="TRAUMA_ADVANCED"
        ),
        Ambulance(
            id="A21",
            vehicle_number="MP-09-EV-2121",
            latitude=22.7250,
            longitude=75.8650,
            status="AVAILABLE",
            eta_minutes=8.0,
            equipment_type="TRAUMA_ADVANCED"
        ),
        Ambulance(
            id="A24",
            vehicle_number="MP-09-EV-2424",
            latitude=22.7300,
            longitude=75.8800,
            status="BUSY",
            eta_minutes=15.0,
            equipment_type="BASIC"
        ),
    ]
    
    # 2. Seed Hospitals
    hospitals = [
        Hospital(
            id="HOSP-01",
            name="City Central Emergency & Trauma Center",
            latitude=22.7100,
            longitude=75.8500,
            emergency_capacity=10,
            available_beds=4,
            trauma_support=True,
            status="OPERATIONAL"
        ),
        Hospital(
            id="HOSP-02",
            name="Metro Care Hospital",
            latitude=22.7400,
            longitude=75.8900,
            emergency_capacity=8,
            available_beds=1,
            trauma_support=False,
            status="OPERATIONAL"
        ),
    ]
    
    # 3. Seed Traffic Routes
    traffic_routes = [
        TrafficRoute(
            id="TR-01",
            source_name="Ambulance Depot A17",
            destination_name="Ring Road Accident Site",
            route_name="Ring Road Expressway (Direct)",
            congestion_level="HEAVY",
            estimated_time_min=12.0,
            notes="Heavy traffic congestion reported at Square"
        ),
        TrafficRoute(
            id="TR-02",
            source_name="Ambulance Depot A17",
            destination_name="Ring Road Accident Site",
            route_name="Bypass Corridor (Alternate)",
            congestion_level="LOW",
            estimated_time_min=6.0,
            notes="Clear route verified by traffic sensors"
        ),
        TrafficRoute(
            id="TR-03",
            source_name="Ambulance Depot A21",
            destination_name="Ring Road Accident Site",
            route_name="Green Corridor A21",
            congestion_level="LOW",
            estimated_time_min=8.0,
            notes="Optimized bypass green lane active"
        ),
    ]
    
    for a in ambulances:
        db.add(a)
    for h in hospitals:
        db.add(h)
    for r in traffic_routes:
        db.add(r)
        
    db.commit()
    db.close()

def reset_fleet(db: Session = None):
    close_db = False
    if db is None:
        db = SessionLocal()
        close_db = True

    db.query(Ambulance).filter(Ambulance.id == "A17").update({"status": "AVAILABLE", "eta_minutes": 6.0})
    db.query(Ambulance).filter(Ambulance.id == "A21").update({"status": "AVAILABLE", "eta_minutes": 8.0})
    db.query(Ambulance).filter(Ambulance.id == "A24").update({"status": "BUSY", "eta_minutes": 15.0})
    db.query(Hospital).filter(Hospital.id == "HOSP-01").update({"available_beds": 4, "status": "OPERATIONAL"})
    db.query(Hospital).filter(Hospital.id == "HOSP-02").update({"available_beds": 1, "status": "OPERATIONAL"})
    db.commit()

    if close_db:
        db.close()

if __name__ == "__main__":
    seed_database()
    print("Database seeded successfully!")

