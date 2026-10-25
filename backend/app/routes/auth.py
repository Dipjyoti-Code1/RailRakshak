from fastapi import APIRouter, HTTPException, status
from ..schemas import AuthorityLoginRequest, AuthorityLoginResponse
from ..auth import create_authority_token
from ..config import settings

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/login", response_model=AuthorityLoginResponse)
def authority_login(payload: AuthorityLoginRequest):
    # Support admin and officer permanent demo credentials
    valid_users = ["admin", "officer", "controller", "rpf_demo", "rpf-officer"]
    valid_passwords = [settings.AUTHORITY_DEMO_PASSWORD, "OfficerDuty@2026", "officer123", "RailDuty@2026"]
    
    username_lower = payload.username.lower().strip()
    
    if username_lower in valid_users and (payload.password in valid_passwords or payload.password == settings.AUTHORITY_DEMO_PASSWORD):
        token = create_authority_token(payload.username)
        role = "OFFICER" if "officer" in username_lower else "AUTHORITY_OPERATOR"
        return AuthorityLoginResponse(
            access_token=token,
            token_type="bearer",
            role=role,
            message=f"{role.replace('_', ' ').title()} authentication successful."
        )
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials. For demo evaluation, use 'admin' / 'ControlRoom@2026' for Control Room or 'officer' / 'OfficerDuty@2026' for Officer Portal."
    )
