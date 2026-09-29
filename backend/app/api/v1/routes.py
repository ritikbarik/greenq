import json
from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.all_models import Route

router = APIRouter(prefix="/routes", tags=["Routes"])

@router.get("")
def get_all_routes(db: Session = Depends(get_db)):
    routes = db.query(Route).all()
    results = []
    for r in routes:
        waypoints = []
        if r.waypoints_json:
            try:
                waypoints = json.loads(r.waypoints_json)
            except Exception:
                waypoints = []
        results.append({
            "id": r.id,
            "name": r.name,
            "origin_port": r.origin_port,
            "destination_port": r.destination_port,
            "distance_nm": r.distance_nm,
            "origin_lat": r.origin_lat,
            "origin_lng": r.origin_lng,
            "dest_lat": r.dest_lat,
            "dest_lng": r.dest_lng,
            "waypoints": waypoints,
            "typical_weather_factor": r.typical_weather_factor
        })
    return results
