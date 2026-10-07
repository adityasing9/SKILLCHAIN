import os
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.config.settings import settings
from app.models.entities import (
    User, Institution, Student, Credential, Skill, StudentSkill, SkillRecommendation,
    CredentialStatus, UserRole
)
from app.schemas.schemas import CredentialResponse, CredentialRevoke
from app.auth.auth_handler import get_current_user, require_role
from app.blockchain.blockchain_service import blockchain_service
from app.utils.crypto_utils import (
    calculate_sha256, calculate_file_sha256, generate_default_certificate_pdf
)
from app.ai.ai_service import ai_engine

router = APIRouter(prefix="/credentials", tags=["Credentials"])

@router.post("/issue", response_model=CredentialResponse)
async def issue_credential(
    student_identifier: str = Form(...),
    title: str = Form(...),
    description: str = Form(""),
    credential_type: str = Form("Certificate"),
    file: UploadFile = File(None),
    current_user: User = Depends(require_role(UserRole.INSTITUTION.value, UserRole.ADMIN.value)),
    db: Session = Depends(get_db)
):
    """
    Step 1: Locate target student by identifier or email
    Step 2: Process certificate file or generate tamper-proof PDF
    Step 3: Compute SHA-256 cryptographic hash of document
    Step 4: Register credential hash on Ethereum/Hardhat smart contract
    Step 5: Persist record in MySQL relational database
    Step 6: Trigger AI Skill Intelligence to update student's verified skills
    """
    institution = current_user.institution_profile
    if not institution:
        raise HTTPException(status_code=400, detail="Institution profile not found for user")

    # Locate student
    student = db.query(Student).join(User).filter(
        (Student.student_identifier == student_identifier) | (User.email == student_identifier)
    ).first()

    if not student:
        raise HTTPException(
            status_code=404,
            detail=f"Student with identifier '{student_identifier}' was not found in SkillChain registry"
        )

    # Unique Credential ID
    unique_id = f"SKILL-{datetime.utcnow().year}-{uuid.uuid4().hex[:8].upper()}"

    # Handle certificate file storage and SHA-256 generation
    cert_folder = os.path.join(settings.BASE_UPLOAD_DIR, "certificates")
    os.makedirs(cert_folder, exist_ok=True)
    
    file_path = None
    if file and file.filename:
        # Secure filename
        safe_filename = f"{unique_id}_{file.filename.replace(' ', '_')}"
        file_path = os.path.join(cert_folder, safe_filename)
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)
        cert_hash = calculate_sha256(content)
    else:
        # Generate official SkillChain PDF
        safe_filename = f"{unique_id}_certificate.pdf"
        file_path = os.path.join(cert_folder, safe_filename)
        issue_date_str = datetime.utcnow().strftime("%d %B %Y")
        generate_default_certificate_pdf(
            student_name=student.user.name,
            institution_name=institution.institution_name,
            title=title,
            credential_id=unique_id,
            issue_date_str=issue_date_str,
            output_path=file_path
        )
        cert_hash = calculate_file_sha256(file_path)

    # Blockchain Registration
    bc_result = blockchain_service.register_credential_on_chain(
        credential_id=unique_id,
        cert_hash=cert_hash,
        institution_name=institution.institution_name
    )

    tx_hash = bc_result.get("tx_hash") or f"0x_mock_{cert_hash[:32]}"

    # Save to Database
    credential = Credential(
        credential_id=unique_id,
        student_id=student.id,
        institution_id=institution.id,
        title=title,
        description=description,
        credential_type=credential_type,
        issue_date=datetime.utcnow(),
        certificate_file_reference=os.path.basename(file_path),
        certificate_hash=cert_hash,
        blockchain_transaction_hash=tx_hash,
        blockchain_network="Hardhat Localhost (ChainID: 31337)",
        contract_address=blockchain_service.contract_address or "0x5FbDB2315678afecb367f032d93F642f64180aa3",
        status=CredentialStatus.ISSUED.value
    )
    db.add(credential)
    db.flush()

    # AI Skill Intelligence Extraction from Credential Title & Description
    skill_text = f"{title} {description}"
    extracted_skills = ai_engine.extract_skills_from_text(skill_text)
    for s_info in extracted_skills:
        # Find or create skill
        skill_obj = db.query(Skill).filter(Skill.name == s_info["skill_name"]).first()
        if not skill_obj:
            skill_obj = Skill(name=s_info["skill_name"], category=s_info["category"])
            db.add(skill_obj)
            db.flush()

        # Link to student
        existing_ss = db.query(StudentSkill).filter(
            StudentSkill.student_id == student.id,
            StudentSkill.skill_id == skill_obj.id
        ).first()

        if not existing_ss:
            new_ss = StudentSkill(
                student_id=student.id,
                skill_id=skill_obj.id,
                confidence_score=s_info["confidence_score"],
                source="VERIFIED_CREDENTIAL"
            )
            db.add(new_ss)

    db.commit()
    db.refresh(credential)

    return {
        "id": credential.id,
        "credential_id": credential.credential_id,
        "student_id": credential.student_id,
        "institution_id": credential.institution_id,
        "student_name": student.user.name,
        "student_identifier": student.student_identifier,
        "institution_name": institution.institution_name,
        "title": credential.title,
        "description": credential.description,
        "credential_type": credential.credential_type,
        "issue_date": credential.issue_date,
        "certificate_file_reference": credential.certificate_file_reference,
        "certificate_hash": credential.certificate_hash,
        "blockchain_transaction_hash": credential.blockchain_transaction_hash,
        "blockchain_network": credential.blockchain_network,
        "contract_address": credential.contract_address,
        "status": credential.status,
        "created_at": credential.created_at,
        "revoked_at": credential.revoked_at,
        "revocation_reason": credential.revocation_reason
    }

@router.get("/{credential_id}", response_model=CredentialResponse)
def get_credential(credential_id: str, db: Session = Depends(get_db)):
    cred = db.query(Credential).filter(Credential.credential_id == credential_id).first()
    if not cred:
        raise HTTPException(status_code=404, detail="Credential not found")

    return {
        "id": cred.id,
        "credential_id": cred.credential_id,
        "student_id": cred.student_id,
        "institution_id": cred.institution_id,
        "student_name": cred.student.user.name,
        "student_identifier": cred.student.student_identifier,
        "institution_name": cred.institution.institution_name,
        "title": cred.title,
        "description": cred.description,
        "credential_type": cred.credential_type,
        "issue_date": cred.issue_date,
        "certificate_file_reference": cred.certificate_file_reference,
        "certificate_hash": cred.certificate_hash,
        "blockchain_transaction_hash": cred.blockchain_transaction_hash,
        "blockchain_network": cred.blockchain_network,
        "contract_address": cred.contract_address,
        "status": cred.status,
        "created_at": cred.created_at,
        "revoked_at": cred.revoked_at,
        "revocation_reason": cred.revocation_reason
    }

@router.post("/{credential_id}/revoke")
def revoke_credential(
    credential_id: str,
    revoke_data: CredentialRevoke,
    current_user: User = Depends(require_role(UserRole.INSTITUTION.value, UserRole.ADMIN.value)),
    db: Session = Depends(get_db)
):
    cred = db.query(Credential).filter(Credential.credential_id == credential_id).first()
    if not cred:
        raise HTTPException(status_code=404, detail="Credential not found")

    if current_user.role != UserRole.ADMIN.value and cred.institution.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized to revoke credentials issued by other institutions")

    if cred.status == CredentialStatus.REVOKED.value:
        raise HTTPException(status_code=400, detail="Credential is already revoked")

    # Revoke on blockchain
    bc_res = blockchain_service.revoke_credential_on_chain(cred.credential_id, revoke_data.reason)

    cred.status = CredentialStatus.REVOKED.value
    cred.revoked_at = datetime.utcnow()
    cred.revocation_reason = revoke_data.reason
    db.commit()

    return {
        "message": "Credential successfully revoked on blockchain and registry",
        "credential_id": cred.credential_id,
        "status": cred.status,
        "revocation_reason": cred.revocation_reason,
        "blockchain_result": bc_res
    }
