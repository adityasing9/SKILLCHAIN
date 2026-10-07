from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.config.database import get_db
from app.models.entities import Institution, Credential, Student, User, UserRole, CredentialStatus, VerificationLog
from app.auth.auth_handler import require_role

router = APIRouter(prefix="/institutions", tags=["Institution"])

@router.get("/dashboard-stats")
def get_institution_dashboard(
    current_user: User = Depends(require_role(UserRole.INSTITUTION.value, UserRole.ADMIN.value)),
    db: Session = Depends(get_db)
):
    inst = current_user.institution_profile
    if not inst:
        raise HTTPException(status_code=400, detail="Institution profile not found")

    creds = db.query(Credential).filter(Credential.institution_id == inst.id).all()
    total_issued = len(creds)
    active_count = len([c for c in creds if c.status != CredentialStatus.REVOKED.value])
    revoked_count = len([c for c in creds if c.status == CredentialStatus.REVOKED.value])

    # Distinct students
    unique_students_count = db.query(Credential.student_id).filter(Credential.institution_id == inst.id).distinct().count()

    # Verification checks count
    cred_ids = [c.id for c in creds]
    total_verifications = db.query(VerificationLog).filter(VerificationLog.credential_id.in_(cred_ids)).count() if cred_ids else 0

    recent_activity = []
    for c in sorted(creds, key=lambda x: x.created_at, reverse=True)[:6]:
        recent_activity.append({
            "credential_id": c.credential_id,
            "title": c.title,
            "student_name": c.student.user.name,
            "status": c.status,
            "date": c.created_at.strftime("%Y-%m-%d %H:%M"),
            "tx_hash": c.blockchain_transaction_hash
        })

    return {
        "institution_name": inst.institution_name,
        "registration_number": inst.registration_number,
        "total_issued": total_issued,
        "active_credentials": active_count,
        "revoked_credentials": revoked_count,
        "total_students": unique_students_count,
        "total_verifications": total_verifications,
        "recent_activity": recent_activity
    }

@router.get("/credentials")
def get_institution_credentials(
    current_user: User = Depends(require_role(UserRole.INSTITUTION.value, UserRole.ADMIN.value)),
    db: Session = Depends(get_db)
):
    inst = current_user.institution_profile
    if not inst:
        raise HTTPException(status_code=400, detail="Institution profile not found")

    creds = db.query(Credential).filter(Credential.institution_id == inst.id).order_by(Credential.created_at.desc()).all()
    
    return [
        {
            "id": c.id,
            "credential_id": c.credential_id,
            "title": c.title,
            "student_name": c.student.user.name,
            "student_identifier": c.student.student_identifier,
            "student_email": c.student.user.email,
            "credential_type": c.credential_type,
            "issue_date": c.issue_date,
            "certificate_hash": c.certificate_hash,
            "blockchain_transaction_hash": c.blockchain_transaction_hash,
            "status": c.status,
            "revoked_at": c.revoked_at,
            "revocation_reason": c.revocation_reason,
            "certificate_file_reference": c.certificate_file_reference
        }
        for c in creds
    ]

@router.get("/students")
def get_enrolled_students(
    search: str = "",
    current_user: User = Depends(require_role(UserRole.INSTITUTION.value, UserRole.ADMIN.value)),
    db: Session = Depends(get_db)
):
    query = db.query(Student).join(User)
    if search:
        query = query.filter(
            (Student.student_identifier.contains(search)) |
            (User.name.contains(search)) |
            (User.email.contains(search))
        )
    students = query.limit(50).all()

    return [
        {
            "student_id": s.id,
            "name": s.user.name,
            "email": s.user.email,
            "student_identifier": s.student_identifier,
            "college": s.college,
            "course": s.course,
            "graduation_year": s.graduation_year,
            "total_credentials": len(s.credentials)
        }
        for s in students
    ]
