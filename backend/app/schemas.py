from datetime import datetime
from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator
import re

class TravelerType(str, Enum):
    SOLO = "SOLO"
    GROUP = "GROUP"

class IncidentCategory(str, Enum):
    UNWELL = "UNWELL"
    LOST_OR_SEPARATED = "LOST_OR_SEPARATED"
    PERSONAL_SAFETY_CONCERN = "PERSONAL_SAFETY_CONCERN"
    URGENT_ASSISTANCE = "URGENT_ASSISTANCE"
    OTHER = "OTHER"

class IncidentStatus(str, Enum):
    ACTIVE = "ACTIVE"
    ACKNOWLEDGED = "ACKNOWLEDGED"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"

class OfficerShift(str, Enum):
    MORNING = "MORNING"
    AFTERNOON = "AFTERNOON"
    NIGHT = "NIGHT"
    FULL_DAY = "FULL_DAY"

class OfficerDutyStatus(str, Enum):
    ON_DUTY = "ON_DUTY"
    OFF_DUTY = "OFF_DUTY"
    ON_LEAVE = "ON_LEAVE"

# ----------------- Passenger & Journey Models -----------------

class PassengerInfo(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    mobile_number: str = Field(...)
    age: int = Field(..., ge=1, le=120)
    gender: Optional[str] = Field(None, max_length=20)
    emergency_contact_name: Optional[str] = Field(None, max_length=100)
    emergency_contact_mobile: Optional[str] = Field(None)

    @field_validator("mobile_number")
    @classmethod
    def validate_mobile(cls, v: str) -> str:
        cleaned = re.sub(r"[\s\-\+]", "", v)
        if cleaned.startswith("91") and len(cleaned) == 12:
            cleaned = cleaned[2:]
        if cleaned.startswith("0") and len(cleaned) == 11:
            cleaned = cleaned[1:]
        if not re.match(r"^[5-9]\d{9}$", cleaned):
            raise ValueError("Mobile number must be a valid 10-digit number")
        return cleaned

class GroupMemberInfo(BaseModel):
    member_id: str
    full_name: str = Field(..., min_length=2, max_length=100)
    relationship: str = Field(..., min_length=1, max_length=50)
    age: Optional[int] = Field(None, ge=0, le=120)
    gender: Optional[str] = Field(None, max_length=20)
    assistance_needs: Optional[str] = Field(None, max_length=150)

class JourneyCreate(BaseModel):
    traveler_type: TravelerType = TravelerType.SOLO
    primary_passenger: PassengerInfo
    group_members: List[GroupMemberInfo] = Field(default_factory=list)
    train_number: str = Field(..., min_length=3, max_length=10)
    train_name: Optional[str] = Field(None, max_length=100)
    boarding_station: str = Field(..., min_length=2, max_length=100)
    destination_station: str = Field(..., min_length=2, max_length=100)
    journey_date: str = Field(..., min_length=8, max_length=20)
    coach: Optional[str] = Field(None, max_length=20)
    seat: Optional[str] = Field(None, max_length=20)
    expected_arrival_time: Optional[str] = Field(None, max_length=20)

    @field_validator("destination_station")
    @classmethod
    def validate_stations(cls, v: str, info) -> str:
        boarding = info.data.get("boarding_station")
        if boarding and boarding.strip().lower() == v.strip().lower():
            raise ValueError("Destination station cannot be the same as boarding station")
        return v

class JourneyResponse(BaseModel):
    journey_id: str
    traveler_type: TravelerType
    primary_passenger: PassengerInfo
    group_members: List[GroupMemberInfo]
    train_number: str
    train_name: Optional[str] = None
    boarding_station: str
    destination_station: str
    journey_date: str
    coach: Optional[str] = None
    seat: Optional[str] = None
    expected_arrival_time: Optional[str] = None
    created_at: str
    updated_at: str

# ----------------- Incident & Telemetry Models -----------------

class LocationTelemetry(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    accuracy_meters: Optional[float] = None
    last_updated_at: Optional[str] = None
    available: bool = False
    permission_status: str = "prompt"  # granted, denied, prompt, unavailable
    manual_station: Optional[str] = None

class AffectedPersonInfo(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    relationship: Optional[str] = "Self"
    member_id: Optional[str] = None
    assistance_needs: Optional[str] = None

class IncidentCreate(BaseModel):
    journey_id: str = Field(..., min_length=5)
    affected_person: AffectedPersonInfo
    category: IncidentCategory
    description: Optional[str] = Field(None, max_length=1000)
    location: LocationTelemetry
    is_demo: bool = False

class StatusTransition(BaseModel):
    from_status: IncidentStatus
    to_status: IncidentStatus
    timestamp: str
    updated_by: str
    notes: Optional[str] = None

class IncidentResponse(BaseModel):
    incident_id: str
    journey_id: str
    affected_person: AffectedPersonInfo
    category: IncidentCategory
    description: Optional[str] = None
    location: LocationTelemetry
    status: IncidentStatus
    status_history: List[StatusTransition] = Field(default_factory=list)
    journey_snapshot: Optional[Dict[str, Any]] = None
    is_demo: bool = False
    created_at: str
    updated_at: str

class IncidentStatusUpdate(BaseModel):
    status: IncidentStatus
    updated_by: str = "Authority Officer"
    notes: Optional[str] = None

# ----------------- Officer Duty Models -----------------

class OfficerDutyCreate(BaseModel):
    officer_name: str = Field(..., min_length=2, max_length=100)
    staff_id: str = Field(..., min_length=2, max_length=50)
    designation: str = Field(..., min_length=2, max_length=100)
    duty_date: str = Field(..., min_length=8, max_length=20)
    shift: OfficerShift = OfficerShift.MORNING
    assigned_train_or_area: str = Field(..., min_length=2, max_length=100)
    coach: Optional[str] = Field(None, max_length=20)
    duty_start_time: str = Field(..., min_length=3, max_length=10)
    duty_end_time: str = Field(..., min_length=3, max_length=10)
    contact_number: Optional[str] = Field(None, max_length=20)
    status: OfficerDutyStatus = OfficerDutyStatus.ON_DUTY
    is_demo: bool = True

class OfficerDutyResponse(BaseModel):
    duty_id: str
    officer_name: str
    staff_id: str
    designation: str
    duty_date: str
    shift: OfficerShift
    assigned_train_or_area: str
    coach: Optional[str] = None
    duty_start_time: str
    duty_end_time: str
    contact_number: Optional[str] = None
    status: OfficerDutyStatus
    is_demo: bool
    created_at: str
    updated_at: str

# ----------------- Potential Officer Match -----------------

class OfficerMatchResponse(BaseModel):
    officer: OfficerDutyResponse
    potential_match: bool = True
    match_reason: str
    disclaimer: str = "Potential match based on reported train or area. Not a confirmed assignment or dispatch."

# ----------------- Auth Models -----------------

class AuthorityLoginRequest(BaseModel):
    username: str
    password: str

class AuthorityLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str = "AUTHORITY_OPERATOR"
    message: str
