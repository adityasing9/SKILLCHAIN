import enum
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Float, Enum, Index
)
from sqlalchemy.orm import relationship
from app.config.database import Base

class UserRole(str, enum.Enum):
    STUDENT = "STUDENT"
    INSTITUTION = "INSTITUTION"
    VERIFIER = "VERIFIER"
    ADMIN = "ADMIN"

class CredentialType(str, enum.Enum):
    CERTIFICATE = "Certificate"
    INTERNSHIP = "Internship"
    HACKATHON = "Hackathon"
    WORKSHOP = "Workshop"
    COURSE = "Course"
    AWARD = "Award"
    PROJECT = "Project"
    COMPETITION = "Competition"

class CredentialStatus(str, enum.Enum):
    ISSUED = "ISSUED"
    VERIFIED = "VERIFIED"
    REVOKED = "REVOKED"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(128), nullable=False)
    email = Column(String(191), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(32), default=UserRole.STUDENT.value, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    student_profile = relationship("Student", back_populates="user", uselist=False, cascade="all, delete-orphan")
    institution_profile = relationship("Institution", back_populates="user", uselist=False, cascade="all, delete-orphan")

class Institution(Base):
    __tablename__ = "institutions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    institution_name = Column(String(255), nullable=False)
    registration_number = Column(String(128), unique=True, index=True, nullable=False)
    website = Column(String(255), nullable=True)
    wallet_address = Column(String(128), nullable=True)
    verification_status = Column(String(32), default="APPROVED") # PENDING, APPROVED, SUSPENDED
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="institution_profile")
    credentials = relationship("Credential", back_populates="institution")

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    student_identifier = Column(String(64), unique=True, index=True, nullable=False) # e.g. Roll No / Student ID
    college = Column(String(255), nullable=False)
    course = Column(String(128), nullable=False)
    graduation_year = Column(Integer, nullable=False)
    profile_image = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="student_profile")
    credentials = relationship("Credential", back_populates="student")
    skills = relationship("StudentSkill", back_populates="student", cascade="all, delete-orphan")
    resume_analyses = relationship("ResumeAnalysis", back_populates="student", cascade="all, delete-orphan")
    skill_recommendations = relationship("SkillRecommendation", back_populates="student", cascade="all, delete-orphan")

class Credential(Base):
    __tablename__ = "credentials"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    credential_id = Column(String(64), unique=True, index=True, nullable=False) # e.g. SKILL-2026-XXXX
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    institution_id = Column(Integer, ForeignKey("institutions.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    credential_type = Column(String(32), default=CredentialType.CERTIFICATE.value, nullable=False)
    issue_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Cryptographic & Blockchain Storage Proof
    certificate_file_reference = Column(String(512), nullable=True) # file path or storage reference
    certificate_hash = Column(String(66), nullable=False, index=True) # SHA-256 Hex Digest
    blockchain_transaction_hash = Column(String(128), nullable=True) # On-chain TX hash
    blockchain_network = Column(String(64), default="Hardhat Localhost (ChainID: 31337)")
    contract_address = Column(String(64), nullable=True)
    status = Column(String(32), default=CredentialStatus.ISSUED.value) # ISSUED, VERIFIED, REVOKED
    
    created_at = Column(DateTime, default=datetime.utcnow)
    revoked_at = Column(DateTime, nullable=True)
    revocation_reason = Column(Text, nullable=True)

    student = relationship("Student", back_populates="credentials")
    institution = relationship("Institution", back_populates="credentials")
    verification_logs = relationship("VerificationLog", back_populates="credential", cascade="all, delete-orphan")

class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(128), unique=True, index=True, nullable=False)
    category = Column(String(64), default="General") # AI/ML, Web, Cloud, DevOps, Blockchain, Soft Skill

class StudentSkill(Base):
    __tablename__ = "student_skills"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    confidence_score = Column(Float, default=0.75) # 0.0 to 1.0 (75%)
    source = Column(String(64), default="VERIFIED_CREDENTIAL") # VERIFIED_CREDENTIAL, RESUME_ANALYSIS, MIXED
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="skills")
    skill = relationship("Skill")

class ResumeAnalysis(Base):
    __tablename__ = "resume_analysis"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    resume_reference = Column(String(512), nullable=False)
    extracted_text_reference = Column(Text, nullable=True)
    ai_summary = Column(Text, nullable=True)
    detected_skills_json = Column(Text, nullable=True) # JSON string of skills
    experience_json = Column(Text, nullable=True) # JSON string of experience items
    projects_json = Column(Text, nullable=True) # JSON string of projects
    skill_gaps_json = Column(Text, nullable=True) # JSON string of gaps vs career path
    target_career = Column(String(128), default="Software / ML Engineer")
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="resume_analyses")

class SkillRecommendation(Base):
    __tablename__ = "skill_recommendations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    skill_name = Column(String(128), nullable=False)
    reason = Column(Text, nullable=False)
    priority = Column(String(32), default="MEDIUM") # HIGH, MEDIUM, LOW
    related_existing_skill = Column(String(128), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="skill_recommendations")

class VerificationLog(Base):
    __tablename__ = "verification_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    credential_id = Column(Integer, ForeignKey("credentials.id", ondelete="CASCADE"), nullable=True)
    queried_credential_id = Column(String(64), nullable=False)
    verifier_reference = Column(String(128), default="Anonymous Verifier")
    result = Column(String(64), nullable=False) # AUTHENTIC, REVOKED, HASH_MISMATCH, NOT_FOUND
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    credential = relationship("Credential", back_populates="verification_logs")
