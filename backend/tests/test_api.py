import pytest
from fastapi.testclient import TestClient
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.main import app
from app.database import db

@pytest.fixture(scope="module", autouse=True)
def init_db():
    db.connect()

@pytest.fixture
def client():
    return TestClient(app)

def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "database" in data
    assert data["database"]["connected"] is True

def test_create_and_get_journey(client):
    payload = {
        "traveler_type": "SOLO",
        "primary_passenger": {
            "full_name": "Arjun Sharma",
            "mobile_number": "9876543210",
            "age": 30,
            "gender": "Male",
            "emergency_contact_name": "Rohit Sharma",
            "emergency_contact_mobile": "9876543211"
        },
        "group_members": [],
        "train_number": "12004",
        "train_name": "Lucknow Shatabdi",
        "boarding_station": "New Delhi (NDLS)",
        "destination_station": "Kanpur Central (CNB)",
        "journey_date": "2026-10-25",
        "coach": "C-2",
        "seat": "45"
    }

    res = client.post("/api/journeys", json=payload)
    assert res.status_code == 201
    journey = res.json()
    assert "journey_id" in journey
    journey_id = journey["journey_id"]

    # Retrieve journey
    get_res = client.get(f"/api/journeys/{journey_id}")
    assert get_res.status_code == 200
    assert get_res.json()["train_number"] == "12004"

def test_journey_validation_same_station(client):
    payload = {
        "traveler_type": "SOLO",
        "primary_passenger": {
            "full_name": "Test User",
            "mobile_number": "9876543210",
            "age": 25
        },
        "train_number": "12004",
        "boarding_station": "New Delhi",
        "destination_station": "New Delhi",
        "journey_date": "2026-10-25"
    }
    res = client.post("/api/journeys", json=payload)
    assert res.status_code == 422

def test_incident_lifecycle(client):
    # 1. Create journey
    j_res = client.post("/api/journeys", json={
        "traveler_type": "SOLO",
        "primary_passenger": {
            "full_name": "Priya Nair",
            "mobile_number": "9812345678",
            "age": 28
        },
        "train_number": "12302",
        "boarding_station": "New Delhi",
        "destination_station": "Howrah",
        "journey_date": "2026-10-26"
    })
    assert j_res.status_code == 201
    journey_id = j_res.json()["journey_id"]

    # 2. Post Incident
    inc_payload = {
        "journey_id": journey_id,
        "affected_person": {
            "full_name": "Priya Nair",
            "relationship": "Self"
        },
        "category": "UNWELL",
        "description": "Severe vertigo and nausea aboard coach B2",
        "location": {
            "latitude": 28.6431,
            "longitude": 77.2197,
            "accuracy_meters": 10.5,
            "available": True,
            "permission_status": "granted"
        },
        "is_demo": False
    }

    inc_res = client.post("/api/incidents", json=inc_payload)
    assert inc_res.status_code == 201
    incident = inc_res.json()
    incident_id = incident["incident_id"]
    assert incident["status"] == "ACTIVE"

    # 3. Update status to ACKNOWLEDGED
    patch_res = client.patch(
        f"/api/incidents/{incident_id}/status",
        json={"status": "ACKNOWLEDGED", "notes": "Control room acknowledged alert"},
        headers={"X-Authority-Token": "demo-authority-token"}
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "ACKNOWLEDGED"

    # 4. Update status to IN_PROGRESS
    patch_res2 = client.patch(
        f"/api/incidents/{incident_id}/status",
        json={"status": "IN_PROGRESS", "notes": "Medical team dispatched at next stop"},
        headers={"X-Authority-Token": "demo-authority-token"}
    )
    assert patch_res2.status_code == 200
    assert patch_res2.json()["status"] == "IN_PROGRESS"

    # 5. Resolve incident
    patch_res3 = client.patch(
        f"/api/incidents/{incident_id}/status",
        json={"status": "RESOLVED", "notes": "Assistance provided and traveler confirmed well"},
        headers={"X-Authority-Token": "demo-authority-token"}
    )
    assert patch_res3.status_code == 200
    assert patch_res3.json()["status"] == "RESOLVED"

def test_officer_duty_registration(client):
    payload = {
        "officer_name": "Insp. Rajesh Kumar",
        "staff_id": "RPF-8921",
        "designation": "RPF Inspector",
        "duty_date": "2026-10-25",
        "shift": "MORNING",
        "assigned_train_or_area": "Train 12004",
        "duty_start_time": "06:00",
        "duty_end_time": "14:00",
        "contact_number": "9876543299",
        "status": "ON_DUTY",
        "is_demo": True
    }

    res = client.post("/api/officers/duty", json=payload)
    assert res.status_code == 201
    duty = res.json()
    assert "duty_id" in duty
    assert duty["staff_id"] == "RPF-8921"

    # Check on-duty listing
    list_res = client.get("/api/officers/on-duty")
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1

def test_auth_logins_and_officer_token(client):
    # Authority login test
    admin_res = client.post("/api/auth/login", json={
        "username": "admin",
        "password": "ControlRoom@2026"
    })
    assert admin_res.status_code == 200
    admin_token = admin_res.json()["access_token"]
    assert "admin" in admin_token

    # Officer login test
    officer_res = client.post("/api/auth/login", json={
        "username": "officer",
        "password": "OfficerDuty@2026"
    })
    assert officer_res.status_code == 200
    officer_token = officer_res.json()["access_token"]
    assert officer_res.json()["role"] == "OFFICER"

    # Create a journey & incident on train 12004
    j_res = client.post("/api/journeys", json={
        "traveler_type": "SOLO",
        "primary_passenger": {
            "full_name": "Test Officer Responder",
            "mobile_number": "9876500000",
            "age": 35
        },
        "train_number": "12004",
        "boarding_station": "New Delhi",
        "destination_station": "Lucknow",
        "journey_date": "2026-10-27"
    })
    assert j_res.status_code == 201
    jid = j_res.json()["journey_id"]

    inc_res = client.post("/api/incidents", json={
        "journey_id": jid,
        "affected_person": {"full_name": "Test Officer Responder"},
        "category": "URGENT_ASSISTANCE",
        "location": {"available": False, "permission_status": "unavailable"}
    })
    assert inc_res.status_code == 201
    inc_id = inc_res.json()["incident_id"]

    # Officer acknowledges incident using officer_token
    patch_res = client.patch(
        f"/api/incidents/{inc_id}/status",
        json={"status": "ACKNOWLEDGED", "notes": "Officer responding on train 12004"},
        headers={"Authorization": f"Bearer {officer_token}"}
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "ACKNOWLEDGED"
