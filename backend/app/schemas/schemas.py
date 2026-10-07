from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Any
from datetime import datetime

# --- Auth Schemas ---
class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=128)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: str = Field("STUDENT") # STUDENT, INSTITUTION, VERIFIER, ADMIN
    
    # Institution extra fields
    institution_name: Optional[str] = None
    registration_number: Optional[str] = None
    website: Optional[str] = None
    
    # Student extra fields
    student_identifier: Optional[str] = None
    college: Optional[str] = None
    course: Optional[str] = None
    graduation_year: Optional[int] = 2026

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    created_at: datetime
    profile: Optional[dict] = None

# --- Credential Schemas ---
class CredentialCreate(BaseModel):
    student_identifier: str # target student identifier or email
    title: str = Field(..., min_length=3, max_length=255)
    description: Optional[str] = None
    credential_type: str = "Certificate"
    issue_date: Optional[datetime] = None

class CredentialRevoke(BaseModel):
    reason: str = Field(..., min_length=3)

class CredentialResponse(BaseModel):
    id: int
    credential_id: str
    student_id: int
    institution_id: int
    student_name: str
    student_identifier: str
    institution_name: str
    title: str
    description: Optional[str]
    credential_type: str
    issue_date: datetime
    certificate_file_reference: Optional[str]
    certificate_hash: str
    blockchain_transaction_hash: Optional[str]
    blockchain_network: str
    contract_address: Optional[str]
    status: str
    created_at: datetime
    revoked_at: Optional[datetime]
    revocation_reason: Optional[str]

# --- Verification Schemas ---
class VerificationResult(BaseModel):
    status: str # AUTHENTIC, REVOKED, HASH_MISMATCH, NOT_FOUND
    is_valid: bool
    is_revoked: bool
    hash_matched: bool
    credential_id: str
    title: Optional[str] = None
    student_name: Optional[str] = None
    institution_name: Optional[str] = None
    issue_date: Optional[datetime] = None
    certificate_hash: Optional[str] = None
    submitted_file_hash: Optional[str] = None
    blockchain_status: str
    blockchain_tx: Optional[str] = None
    contract_address: Optional[str] = None
    revocation_reason: Optional[str] = None
    revoked_at: Optional[datetime] = None
    message: str

# --- AI Intelligence Schemas ---
class SkillItem(BaseModel):
    skill_name: str
    confidence_score: float
    category: str
    source: str

class ResumeAnalysisResponse(BaseModel):
    summary: str
    detected_skills: List[dict]
    experience: List[dict]
    projects: List[dict]
    skill_gaps: List[dict]
    recommendations: List[dict]

class SkillRecommendationItem(BaseModel):
    id: int
    skill_name: str
    reason: str
    priority: str
    related_existing_skill: Optional[str]
    created_at: datetime
