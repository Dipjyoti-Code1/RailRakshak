import os
from typing import List
from dotenv import load_dotenv

# Load environment variables from .env file if present
load_dotenv()

class Settings:
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "railrakshak_db")
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    AUTHORITY_SECRET_KEY: str = os.getenv("AUTHORITY_SECRET_KEY", "railrakshak_authority_secret_demo_2026")
    AUTHORITY_DEMO_PASSWORD: str = os.getenv("AUTHORITY_DEMO_PASSWORD", "ControlRoom@2026")
    
    # Parse comma-separated CORS origins
    _cors_raw: str = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000")
    CORS_ORIGINS: List[str] = [origin.strip() for origin in _cors_raw.split(",") if origin.strip()]

settings = Settings()
