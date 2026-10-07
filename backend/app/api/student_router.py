import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.models.entities import Student, Credential, ResumeAnalysis, User, UserRole, CredentialStatus
from app.auth.auth_handler import get_current_user, require_role

router = APIRouter(prefix="/students", tags=["Student"])

@router.get("/profile")
def get_student_profile(
    current_user: User = Depends(require_role(UserRole.STUDENT.value)),
    db: Session = Depends(get_db)
):
    stud = current_user.student_profile
    if not stud:
        raise HTTPException(status_code=404, detail="Student profile not found")

    return {
        "id": stud.id,
        "name": current_user.name,
        "email": current_user.email,
        "student_identifier": stud.student_identifier,
        "college": stud.college,
        "course": stud.course,
        "graduation_year": stud.graduation_year,
        "created_at": stud.created_at
    }

@router.get("/credentials")
def get_student_credentials(
    current_user: User = Depends(require_role(UserRole.STUDENT.value)),
    db: Session = Depends(get_db)
):
    stud = current_user.student_profile
    if not stud:
        raise HTTPException(status_code=404, detail="Student profile not found")

    creds = db.query(Credential).filter(Credential.student_id == stud.id).order_by(Credential.issue_date.desc()).all()
    
    return [
        {
            "id": c.id,
            "credential_id": c.credential_id,
            "title": c.title,
            "description": c.description,
            "credential_type": c.credential_type,
            "issue_date": c.issue_date,
            "institution_name": c.institution.institution_name,
            "certificate_file_reference": c.certificate_file_reference,
            "certificate_hash": c.certificate_hash,
            "blockchain_transaction_hash": c.blockchain_transaction_hash,
            "blockchain_network": c.blockchain_network,
            "contract_address": c.contract_address,
            "status": c.status,
            "created_at": c.created_at,
            "revoked_at": c.revoked_at,
            "revocation_reason": c.revocation_reason
        }
        for c in creds
    ]

@router.get("/dashboard-stats")
def get_student_dashboard_stats(
    current_user: User = Depends(require_role(UserRole.STUDENT.value)),
    db: Session = Depends(get_db)
):
    stud = current_user.student_profile
    if not stud:
        raise HTTPException(status_code=404, detail="Student profile not found")

    total_credentials = len(stud.credentials)
    verified_credentials = len([c for c in stud.credentials if c.status != CredentialStatus.REVOKED.value])
    revoked_credentials = len([c for c in stud.credentials if c.status == CredentialStatus.REVOKED.value])
    detected_skills_count = len(stud.skills)
    recommendations_count = len(stud.skill_recommendations)

    # Timeline structure
    timeline = []
    for c in sorted(stud.credentials, key=lambda x: x.issue_date, reverse=True):
        timeline.append({
            "year": c.issue_date.year,
            "date": c.issue_date.strftime("%b %d, %Y"),
            "title": c.title,
            "type": c.credential_type,
            "institution": c.institution.institution_name,
            "status": c.status,
            "credential_id": c.credential_id
        })

    # Latest resume analysis
    latest_resume = db.query(ResumeAnalysis).filter(ResumeAnalysis.student_id == stud.id).order_by(ResumeAnalysis.created_at.desc()).first()
    resume_summary = None
    if latest_resume:
        resume_summary = {
            "summary": latest_resume.ai_summary,
            "target_career": latest_resume.target_career,
            "analyzed_at": latest_resume.created_at,
            "skills": json.loads(latest_resume.detected_skills_json or "[]"),
            "gaps": json.loads(latest_resume.skill_gaps_json or "[]")
        }

    return {
        "total_credentials": total_credentials,
        "verified_credentials": verified_credentials,
        "active_credentials": verified_credentials,
        "revoked_credentials": revoked_credentials,
        "detected_skills_count": detected_skills_count,
        "recommendations_count": recommendations_count,
        "timeline": timeline,
        "resume_summary": resume_summary
    }
