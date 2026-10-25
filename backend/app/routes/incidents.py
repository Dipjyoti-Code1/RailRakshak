from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, Query, Depends
from ..schemas import (
    IncidentCreate,
    IncidentResponse,
    IncidentStatusUpdate,
    IncidentStatus,
    StatusTransition,
    OfficerMatchResponse
)
from ..database import db
from ..auth import get_current_authority

router = APIRouter(prefix="/api/incidents", tags=["Incidents"])

VALID_TRANSITIONS = {
    IncidentStatus.ACTIVE: [IncidentStatus.ACKNOWLEDGED, IncidentStatus.RESOLVED],
    IncidentStatus.ACKNOWLEDGED: [IncidentStatus.IN_PROGRESS, IncidentStatus.RESOLVED],
    IncidentStatus.IN_PROGRESS: [IncidentStatus.RESOLVED],
    IncidentStatus.RESOLVED: []
}

@router.post("", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
def report_incident(payload: IncidentCreate):
    # Verify journey exists
    journey = db.get_journey(payload.journey_id)
    journey_snapshot = None
    if journey:
        journey_snapshot = {
            "train_number": journey.get("train_number"),
            "train_name": journey.get("train_name"),
            "boarding_station": journey.get("boarding_station"),
            "destination_station": journey.get("destination_station"),
            "coach": journey.get("coach"),
            "seat": journey.get("seat"),
            "primary_passenger": journey.get("primary_passenger")
        }

    incident_id = db.get_next_id("INC", "incidents", "incident_id")
    now_iso = datetime.now(timezone.utc).isoformat() + "Z"

    initial_transition = StatusTransition(
        from_status=IncidentStatus.ACTIVE,
        to_status=IncidentStatus.ACTIVE,
        timestamp=now_iso,
        updated_by="Passenger (SOS Trigger)",
        notes=f"Emergency distress alert initiated by passenger. Category: {payload.category.value}"
    )

    incident_dict = payload.model_dump()
    incident_dict["incident_id"] = incident_id
    incident_dict["status"] = IncidentStatus.ACTIVE.value
    incident_dict["status_history"] = [initial_transition.model_dump()]
    incident_dict["journey_snapshot"] = journey_snapshot
    incident_dict["created_at"] = now_iso
    incident_dict["updated_at"] = now_iso

    saved = db.insert_incident(incident_dict)
    return saved

@router.get("", response_model=List[IncidentResponse])
def list_incidents(
    status: Optional[str] = Query(None, description="Filter by status (ACTIVE, ACKNOWLEDGED, IN_PROGRESS, RESOLVED)"),
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search by ID, passenger name, train number, or station"),
    limit: int = Query(50, ge=1, le=100),
    skip: int = Query(0, ge=0)
):
    return db.list_incidents(status=status, category=category, search=search, limit=limit, skip=skip)

@router.get("/{incident_id}", response_model=IncidentResponse)
def get_incident(incident_id: str):
    incident = db.get_incident(incident_id)
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Incident with ID '{incident_id}' was not found."
        )
    return incident

@router.get("/{incident_id}/potential-officers", response_model=List[OfficerMatchResponse])
def get_potential_officers_for_incident(incident_id: str):
    incident = db.get_incident(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    journey_snap = incident.get("journey_snapshot") or {}
    train_num = journey_snap.get("train_number")
    boarding = journey_snap.get("boarding_station")
    dest = journey_snap.get("destination_station")
    
    matches = db.match_officers_for_incident(train_num, boarding, dest)
    return matches

@router.patch("/{incident_id}/status", response_model=IncidentResponse)
def update_incident_status(
    incident_id: str,
    payload: IncidentStatusUpdate,
    authority_user: str = Depends(get_current_authority)
):
    current = db.get_incident(incident_id)
    if not current:
        raise HTTPException(status_code=404, detail="Incident not found")

    try:
        current_status = IncidentStatus(current.get("status"))
    except (ValueError, TypeError):
        current_status = IncidentStatus.ACTIVE

    updated = db.update_incident_status(
        incident_id=incident_id,
        new_status=payload.status.value,
        updated_by=payload.updated_by or authority_user,
        notes=payload.notes
    )
    if not updated:
        raise HTTPException(status_code=500, detail="Failed to update incident status")
    return updated
