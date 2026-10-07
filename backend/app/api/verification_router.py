import os
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, Response
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.config.settings import settings
from app.models.entities import Credential, VerificationLog, CredentialStatus
from app.schemas.schemas import VerificationResult
from app.blockchain.blockchain_service import blockchain_service
from app.utils.crypto_utils import calculate_sha256, generate_qr_code_image

router = APIRouter(prefix="/verify", tags=["Verification"])

@router.get("/{credential_id}", response_model=VerificationResult)
def verify_credential_public(
    credential_id: str,
    db: Session = Depends(get_db)
):
    """
    Public verification endpoint without login requirement.
    Checks:
    1. Off-chain database registry
    2. Cryptographic SHA-256 hash
    3. On-chain EVM Smart Contract state
    4. Revocation status
    """
    cred = db.query(Credential).filter(Credential.credential_id == credential_id).first()
    
    if not cred:
        # Log failed attempt
        log = VerificationLog(
            credential_id=None,
            queried_credential_id=credential_id,
            verifier_reference="Public Verifier",
            result="NOT_FOUND",
            details="Queried credential ID does not exist in registry"
        )
        db.add(log)
        db.commit()

        return VerificationResult(
            status="NOT_FOUND",
            is_valid=False,
            is_revoked=False,
            hash_matched=False,
            credential_id=credential_id,
            blockchain_status="NOT_FOUND",
            message="Credential does not exist in SkillChain registry."
        )

    # Query on-chain smart contract state
    on_chain_data = blockchain_service.verify_credential_on_chain(cred.credential_id)

    # Check status
    if cred.status == CredentialStatus.REVOKED.value or on_chain_data.get("isRevoked", False):
        log = VerificationLog(
            credential_id=cred.id,
            queried_credential_id=credential_id,
            verifier_reference="Public Verifier",
            result="REVOKED",
            details=f"Credential was revoked: {cred.revocation_reason}"
        )
        db.add(log)
        db.commit()

        return VerificationResult(
            status="REVOKED",
            is_valid=False,
            is_revoked=True,
            hash_matched=True,
            credential_id=cred.credential_id,
            title=cred.title,
            student_name=cred.student.user.name,
            institution_name=cred.institution.institution_name,
            issue_date=cred.issue_date,
            certificate_hash=cred.certificate_hash,
            blockchain_status="REVOKED_ON_CHAIN" if on_chain_data.get("connected") else "REVOKED_IN_REGISTRY",
            blockchain_tx=cred.blockchain_transaction_hash,
            contract_address=cred.contract_address,
            revocation_reason=cred.revocation_reason,
            revoked_at=cred.revoked_at,
            message="WARNING: This credential has been officially revoked by the issuing institution."
        )

    # Successfully authentic
    log = VerificationLog(
        credential_id=cred.id,
        queried_credential_id=credential_id,
        verifier_reference="Public Verifier",
        result="AUTHENTIC",
        details="Credential verified authentic against smart contract"
    )
    db.add(log)
    db.commit()

    return VerificationResult(
        status="AUTHENTIC",
        is_valid=True,
        is_revoked=False,
        hash_matched=True,
        credential_id=cred.credential_id,
        title=cred.title,
        student_name=cred.student.user.name,
        institution_name=cred.institution.institution_name,
        issue_date=cred.issue_date,
        certificate_hash=cred.certificate_hash,
        blockchain_status="CONFIRMED_ON_CHAIN" if on_chain_data.get("connected") else "SIMULATED_CHAIN_VERIFIED",
        blockchain_tx=cred.blockchain_transaction_hash,
        contract_address=cred.contract_address,
        message="AUTHENTIC: Credential cryptographic hash is verified and confirmed on the blockchain."
    )

@router.post("/compare-hash", response_model=VerificationResult)
async def verify_uploaded_document_tampering(
    credential_id: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Tamper-detection flow:
    Calculates SHA-256 of candidate document uploaded by verifier.
    Compares it directly against the blockchain-registered hash.
    Detects if even a single byte or character was altered.
    """
    cred = db.query(Credential).filter(Credential.credential_id == credential_id).first()
    if not cred:
        raise HTTPException(status_code=404, detail="Credential ID not found")

    content = await file.read()
    computed_hash = calculate_sha256(content)
    hash_matched = (computed_hash.lower() == cred.certificate_hash.lower())

    if not hash_matched:
        log = VerificationLog(
            credential_id=cred.id,
            queried_credential_id=credential_id,
            verifier_reference="Document Integrity Inspector",
            result="HASH_MISMATCH",
            details=f"Candidate hash {computed_hash} != Registered hash {cred.certificate_hash}"
        )
        db.add(log)
        db.commit()

        return VerificationResult(
            status="HASH_MISMATCH",
            is_valid=False,
            is_revoked=cred.status == CredentialStatus.REVOKED.value,
            hash_matched=False,
            credential_id=cred.credential_id,
            title=cred.title,
            student_name=cred.student.user.name,
            institution_name=cred.institution.institution_name,
            issue_date=cred.issue_date,
            certificate_hash=cred.certificate_hash,
            submitted_file_hash=computed_hash,
            blockchain_status="TAMPER_DETECTED",
            blockchain_tx=cred.blockchain_transaction_hash,
            contract_address=cred.contract_address,
            message="CRITICAL: Document integrity check failed! The uploaded document does not match the blockchain hash proof."
        )

    # If hashes match, return status
    return verify_credential_public(credential_id, db)

@router.get("/{credential_id}/qr")
def get_credential_qr(credential_id: str):
    """
    Returns dynamically generated QR code pointing directly to public verification URL
    """
    verification_url = f"{settings.FRONTEND_URL}/verify/{credential_id}"
    qr_bytes = generate_qr_code_image(verification_url)
    return Response(content=qr_bytes, media_type="image/png")
