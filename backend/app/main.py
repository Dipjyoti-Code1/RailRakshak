import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from .config import settings
from .database import db
from .routes import health, journeys, incidents, officers, auth

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("railrakshak")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to MongoDB or establish fallback demo store
    logger.info("Initializing RailRakshak backend database connection...")
    db.connect()
    yield
    # Shutdown
    if db.mongo_client:
        logger.info("Closing MongoDB connection pool...")
        db.mongo_client.close()

app = FastAPI(
    title="RailRakshak — Railway Passenger Safety API",
    description=(
        "Production-grade REST API backend for RailRakshak, a railway passenger safety and assistance platform. "
        "Supports passenger journey tracking, GPS telemetry SOS incident management, authority response workflows, "
        "and officer duty registry."
    ),
    version="1.0.0-mvp",
    lifespan=lifespan
)

# CORS Middleware
is_wildcard = "*" in settings.CORS_ORIGINS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if not is_wildcard else ["*"],
    allow_credentials=not is_wildcard,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom validation exception handler
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for error in exc.errors():
        field_loc = " -> ".join(str(loc) for loc in error["loc"] if loc != "body")
        errors.append({
            "field": field_loc,
            "message": error["msg"]
        })
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Validation Error",
            "message": "One or more fields failed validation checks.",
            "details": errors
        }
    )

# Include Routers
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(journeys.router)
app.include_router(incidents.router)
app.include_router(officers.router)

# Mount frontend/dist if built (enables seamless single-service fullstack deployment on Render)
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))

if os.path.exists(frontend_dist) and os.path.exists(os.path.join(frontend_dist, "index.html")):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Don't intercept API routes
        if full_path.startswith("api/") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            return JSONResponse(status_code=404, content={"detail": "Not Found"})
        target_file = os.path.join(frontend_dist, full_path)
        if os.path.isfile(target_file):
            return FileResponse(target_file)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
else:
    @app.get("/")
    def root():
        return {
            "project": "RailRakshak",
            "tagline": "Your Journey. Your Safety.",
            "docs": "/docs",
            "health": "/api/health"
        }
