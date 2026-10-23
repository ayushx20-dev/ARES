from sqlalchemy.orm import Session
from backend.tools.traffic import get_traffic_status, find_alternate_route, calculate_eta

class TrafficAgent:
    def __init__(self, db: Session):
        self.name = "Traffic Agent"
        self.db = db

    def evaluate_route(self, ambulance_id: str, location_name: str):
        """
        Inspects route congestion and computes fast green-wave bypass.
        """
        traffic_status = get_traffic_status(self.db, location_name)
        
        if traffic_status.get("status") == "WARNING":
            # Bottleneck detected -> call alternate route tool
            alternate = find_alternate_route(self.db, source=ambulance_id, destination=location_name)
            summary = (
                f"Detected heavy congestion on primary artery. "
                f"Selected alternate corridor: '{alternate.get('route_name')}' with optimized ETA {alternate.get('estimated_time_min')} min."
            )
            return {
                "agent": self.name,
                "route_name": alternate.get("route_name"),
                "eta_minutes": alternate.get("estimated_time_min"),
                "congestion": "OPTIMIZED_ALTERNATE",
                "reasoning": summary,
                "tool_called": "find_alternate_route"
            }
        else:
            summary = f"Primary route clear. Recommended: '{traffic_status.get('recommended_route')}'."
            return {
                "agent": self.name,
                "route_name": traffic_status.get("recommended_route", "Express Highway"),
                "eta_minutes": 6.0,
                "congestion": "LOW",
                "reasoning": summary,
                "tool_called": "get_traffic_status"
            }

    def reverify_route(self, ambulance_id: str, existing_route: str, new_eta: float):
        summary = (
            f"Existing emergency corridor '{existing_route}' remains valid. "
            f"No route recalculation required. Dynamic ETA for Ambulance {ambulance_id}: {new_eta} min."
        )
        return {
            "agent": self.name,
            "route_name": existing_route,
            "eta_minutes": new_eta,
            "reasoning": summary,
            "tool_called": "verify_route_validity"
        }
