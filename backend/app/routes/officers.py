from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, Query
from ..schemas import OfficerDutyCreate, OfficerDutyResponse
from ..database import db

router = APIRouter(prefix="/api/officers", tags=["Officers"])

@router.post("/duty", response_model=OfficerDutyResponse, status_code=status.HTTP_201_CREATED)
def register_officer_duty(payload: OfficerDutyCreate):
    duty_id = db.get_next_id("OFF", "officer_duties", "duty_id")
    now_iso = datetime.now(timezone.utc).isoformat() + "Z"

    duty_dict = payload.model_dump()
    duty_dict["duty_id"] = duty_id
    duty_dict["created_at"] = now_iso
    duty_dict["updated_at"] = now_iso

    saved = db.insert_officer_duty(duty_dict)
    return saved

@router.get("/on-duty", response_model=List[OfficerDutyResponse])
def get_officers_on_duty(train_or_area: Optional[str] = Query(None, description="Optional train or area filter")):
    return db.list_officers_on_duty(train_or_area=train_or_area)
