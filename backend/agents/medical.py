from sqlalchemy.orm import Session
from backend.tools.hospital import find_nearby_hospitals, check_hospital_capacity

class MedicalAgent:
    def __init__(self, db: Session):
        self.name = "Medical Agent"
        self.db = db

    def evaluate(self, incident):
        """
        Analyzes victim count & critical conditions to determine required medical priority and hospital.
        """
        victim_count = incident.victim_count
        critical_count = incident.critical_victim_count
        
        severity = "CRITICAL" if critical_count > 0 or victim_count >= 3 else "HIGH"
        trauma_required = critical_count > 0 or victim_count >= 2
        
        # Tool Call: find hospital
        hospital_res = find_nearby_hospitals(
            self.db,
            location_name=incident.location_name,
            require_trauma=trauma_required
        )
        
        summary = (
            f"Evaluated {victim_count} victims ({critical_count} critical). "
            f"Determined Severity: {severity}. Trauma-capable hospital required: {trauma_required}."
        )
        
        return {
            "agent": self.name,
            "severity": severity,
            "trauma_required": trauma_required,
            "recommended_hospital": hospital_res,
            "reasoning": summary,
            "tool_called": "find_nearby_hospitals"
        }
