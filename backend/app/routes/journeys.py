from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status
from ..schemas import JourneyCreate, JourneyResponse
from ..database import db

router = APIRouter(prefix="/api/journeys", tags=["Journeys"])

@router.post("", response_model=JourneyResponse, status_code=status.HTTP_201_CREATED)
def create_journey(payload: JourneyCreate):
    journey_id = db.get_next_id("JRN", "journeys", "journey_id")
    now_iso = datetime.now(timezone.utc).isoformat() + "Z"

    journey_dict = payload.model_dump()
    journey_dict["journey_id"] = journey_id
    journey_dict["created_at"] = now_iso
    journey_dict["updated_at"] = now_iso

    saved = db.insert_journey(journey_dict)
    return saved

@router.get("/{journey_id}", response_model=JourneyResponse)
def get_journey(journey_id: str):
    journey = db.get_journey(journey_id)
    if not journey:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Journey with ID '{journey_id}' was not found."
        )
    return journey
