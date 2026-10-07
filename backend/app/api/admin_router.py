from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.models.entities import User, Institution, Credential, VerificationLog, UserRole
from app.auth.auth_handler import require_role
from app.blockchain.blockchain_service import blockchain_service

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/dashboard-stats")
def get_admin_dashboard(
    current_user: User = Depends(require_role(UserRole.ADMIN.value)),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).count()
    total_institutions = db.query(Institution).count()
    total_credentials = db.query(Credential).count()
    total_verifications = db.query(VerificationLog).count()

    bc_connected = blockchain_service.is_connected()

    recent_verifications = db.query(VerificationLog).order_by(VerificationLog.timestamp.desc()).limit(10).all()
    
    return {
        "total_users": total_users,
        "total_institutions": total_institutions,
        "total_credentials": total_credentials,
        "total_verifications": total_verifications,
        "blockchain_connected": bc_connected,
        "contract_address": blockchain_service.contract_address,
        "recent_verifications": [
            {
                "id": v.id,
                "credential_id": v.queried_credential_id,
                "verifier": v.verifier_reference,
                "result": v.result,
                "timestamp": v.timestamp.strftime("%Y-%m-%d %H:%M:%S")
            }
            for v in recent_verifications
        ]
    }

@router.get("/institutions")
def list_institutions(
    current_user: User = Depends(require_role(UserRole.ADMIN.value)),
    db: Session = Depends(get_db)
):
    insts = db.query(Institution).all()
    return [
        {
            "id": i.id,
            "institution_name": i.institution_name,
            "registration_number": i.registration_number,
            "website": i.website,
            "status": i.verification_status,
            "admin_email": i.user.email,
            "credentials_count": len(i.credentials)
        }
        for i in insts
    ]

@router.post("/institutions/{institution_id}/status")
def update_institution_status(
    institution_id: int,
    status: str,
    current_user: User = Depends(require_role(UserRole.ADMIN.value)),
    db: Session = Depends(get_db)
):
    inst = db.query(Institution).filter(Institution.id == institution_id).first()
    if not inst:
        raise HTTPException(status_code=404, detail="Institution not found")

    inst.verification_status = status.upper()
    db.commit()
    return {"message": f"Institution status updated to {inst.verification_status}"}
