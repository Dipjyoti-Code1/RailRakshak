from datetime import datetime, timezone
from fastapi import APIRouter
from ..database import db
from ..config import settings

router = APIRouter(tags=["Health"])

@router.get("/api/health")
def get_system_health():
    return {
        "status": "healthy",
        "service": "RailRakshak Railway Passenger Safety API",
        "timestamp": datetime.now(timezone.utc).isoformat() + "Z",
        "environment": settings.ENVIRONMENT,
        "database": {
            "type": db.db_type,
            "connected": db.is_connected,
            "notice": db.notice
        },
        "version": "1.0.0-mvp",
        "disclaimer": "RailRakshak is a technology prototype platform for evaluation. Not an official Indian Railways emergency service."
    }
