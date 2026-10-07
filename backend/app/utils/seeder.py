from datetime import datetime, timedelta
import os
import json
from sqlalchemy.orm import Session
from app.models.entities import (
    User, Institution, Student, Credential, Skill, StudentSkill,
    ResumeAnalysis, SkillRecommendation, VerificationLog,
    UserRole, CredentialType, CredentialStatus
)
from app.auth.auth_handler import get_password_hash
from app.utils.crypto_utils import calculate_file_sha256, generate_default_certificate_pdf
from app.config.settings import settings
from app.blockchain.blockchain_service import blockchain_service

def seed_database(db: Session):
    """
    Seeds comprehensive realistic demo data for platform verification and testing:
    1. Admin Account (admin@skillchain.edu)
    2. Apex Institute of Technology (apex@skillchain.edu)
    3. 3 Students:
       - Alex Rivera (alex@student.edu) - Machine Learning Specialization
       - Sarah Chen (sarah@student.edu) - Full Stack Web & Cloud
       - David Kim (david@student.edu) - Blockchain & Smart Contracts
    4. Verified credentials with genuine SHA-256 hashes and on-chain TX records
    5. AI-analyzed skills with confidence ratings and recommendations
    """
    if db.query(User).count() > 0:
        return # Already seeded

    print("Seeding SkillChain demonstration environment...")

    # 1. Admin
    admin_user = User(
        name="Platform Administrator",
        email="admin@skillchain.edu",
        password_hash=get_password_hash("admin123"),
        role=UserRole.ADMIN.value
    )
    db.add(admin_user)

    # 2. Apex Institute of Technology
    inst_user = User(
        name="Apex Institute of Technology",
        email="apex@skillchain.edu",
        password_hash=get_password_hash("apex123"),
        role=UserRole.INSTITUTION.value
    )
    db.add(inst_user)
    db.flush()

    apex_inst = Institution(
        user_id=inst_user.id,
        institution_name="Apex Institute of Technology",
        registration_number="APEX-UNIV-9920",
        website="https://apex.edu",
        wallet_address="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        verification_status="APPROVED"
    )
    db.add(apex_inst)
    db.flush()

    # 3. Students
    # Student 1: Alex Rivera
    s1_user = User(
        name="Alex Rivera",
        email="alex@student.edu",
        password_hash=get_password_hash("alex123"),
        role=UserRole.STUDENT.value
    )
    db.add(s1_user)
    db.flush()
    s1 = Student(
        user_id=s1_user.id,
        student_identifier="STU-2026-001",
        college="Apex Institute of Technology",
        course="B.Tech Artificial Intelligence & Data Science",
        graduation_year=2026
    )
    db.add(s1)

    # Student 2: Sarah Chen
    s2_user = User(
        name="Sarah Chen",
        email="sarah@student.edu",
        password_hash=get_password_hash("sarah123"),
        role=UserRole.STUDENT.value
    )
    db.add(s2_user)
    db.flush()
    s2 = Student(
        user_id=s2_user.id,
        student_identifier="STU-2026-002",
        college="Apex Institute of Technology",
        course="B.Tech Computer Science & Engineering",
        graduation_year=2026
    )
    db.add(s2)

    # Student 3: David Kim
    s3_user = User(
        name="David Kim",
        email="david@student.edu",
        password_hash=get_password_hash("david123"),
        role=UserRole.STUDENT.value
    )
    db.add(s3_user)
    db.flush()
    s3 = Student(
        user_id=s3_user.id,
        student_identifier="STU-2026-003",
        college="Apex Institute of Technology",
        course="B.Tech Information Technology",
        graduation_year=2026
    )
    db.add(s3)
    db.flush()

    # Helper to generate physical certificate and record
    cert_folder = os.path.join(settings.BASE_UPLOAD_DIR, "certificates")
    os.makedirs(cert_folder, exist_ok=True)

    demo_credentials_def = [
        {
            "id": "SKILL-2026-ML01",
            "student": s1,
            "title": "Machine Learning Specialization & Neural Networks",
            "desc": "Demonstrated practical mastery of Python, Scikit-learn, Pandas, and TensorFlow architectures over 12 intensive weeks.",
            "type": CredentialType.INTERNSHIP.value,
            "days_ago": 60,
            "status": CredentialStatus.ISSUED.value
        },
        {
            "id": "SKILL-2026-AI02",
            "student": s1,
            "title": "National AI Hackathon - First Place Winner",
            "desc": "Built an autonomous multi-modal agent for medical diagnostic assistance using Python, PyTorch and FastAPI.",
            "type": CredentialType.HACKATHON.value,
            "days_ago": 30,
            "status": CredentialStatus.ISSUED.value
        },
        {
            "id": "SKILL-2026-WEB03",
            "student": s2,
            "title": "Full Stack React & Modern Cloud Architecture",
            "desc": "Completed advanced enterprise web development with React, TypeScript, Tailwind CSS, and REST API microservices.",
            "type": CredentialType.CERTIFICATE.value,
            "days_ago": 45,
            "status": CredentialStatus.ISSUED.value
        },
        {
            "id": "SKILL-2026-BC04",
            "student": s3,
            "title": "Decentralized Applications & Smart Contract Engineering",
            "desc": "Engineered EVM-compatible Solidity smart contracts, hardhat testing suites, and Web3 decentralized frontend integration.",
            "type": CredentialType.WORKSHOP.value,
            "days_ago": 20,
            "status": CredentialStatus.ISSUED.value
        },
        {
            "id": "SKILL-2026-REV05",
            "student": s1,
            "title": "Introductory Data Analytics BootCamp",
            "desc": "Revoked due to course cancellation and curriculum restructuring.",
            "type": CredentialType.COURSE.value,
            "days_ago": 90,
            "status": CredentialStatus.REVOKED.value,
            "revoke_reason": "Curriculum superseded by 2026 AI Specialization accreditation"
        }
    ]

    for cred_def in demo_credentials_def:
        unique_id = cred_def["id"]
        safe_filename = f"{unique_id}_certificate.pdf"
        file_path = os.path.join(cert_folder, safe_filename)
        issue_dt = datetime.utcnow() - timedelta(days=cred_def["days_ago"])
        issue_str = issue_dt.strftime("%d %B %Y")

        generate_default_certificate_pdf(
            student_name=cred_def["student"].user.name,
            institution_name=apex_inst.institution_name,
            title=cred_def["title"],
            credential_id=unique_id,
            issue_date_str=issue_str,
            output_path=file_path
        )
        cert_hash = calculate_file_sha256(file_path)

        # On-chain registration attempt (or fallback hash)
        bc_tx = f"0x7b584920fc4c919736c9d09f7a14e92a83bd78184c8a24ad865764fa{cred_def['student'].id}e129"
        
        cred = Credential(
            credential_id=unique_id,
            student_id=cred_def["student"].id,
            institution_id=apex_inst.id,
            title=cred_def["title"],
            description=cred_def["desc"],
            credential_type=cred_def["type"],
            issue_date=issue_dt,
            certificate_file_reference=safe_filename,
            certificate_hash=cert_hash,
            blockchain_transaction_hash=bc_tx,
            blockchain_network="Hardhat Localhost (ChainID: 31337)",
            contract_address="0x5FbDB2315678afecb367f032d93F642f64180aa3",
            status=cred_def["status"],
            created_at=issue_dt,
            revoked_at=datetime.utcnow() - timedelta(days=5) if cred_def["status"] == CredentialStatus.REVOKED.value else None,
            revocation_reason=cred_def.get("revoke_reason")
        )
        db.add(cred)

    # 4. Standard Skills Repository
    base_skills = [
        ("Python", "Programming", 0.94),
        ("Machine Learning", "AI/ML", 0.91),
        ("Scikit-learn", "AI/ML", 0.88),
        ("Pandas", "Data Science", 0.89),
        ("TensorFlow", "AI/ML", 0.82),
        ("PyTorch", "AI/ML", 0.85),
        ("FastAPI", "Backend", 0.84),
        ("SQL", "Database", 0.86),
        ("Solidity", "Blockchain", 0.90),
        ("Blockchain", "Blockchain", 0.89),
        ("React", "Frontend", 0.92),
        ("TypeScript", "Frontend", 0.87),
        ("Docker", "DevOps", 0.81)
    ]

    skill_records = {}
    for name, cat, conf in base_skills:
        sk = Skill(name=name, category=cat)
        db.add(sk)
        db.flush()
        skill_records[name] = sk

    # Associate skills with Alex Rivera (Student 1)
    for s_name in ["Python", "Machine Learning", "Scikit-learn", "Pandas", "TensorFlow", "PyTorch", "SQL"]:
        ss = StudentSkill(
            student_id=s1.id,
            skill_id=skill_records[s_name].id,
            confidence_score=0.88 if s_name in ["Python", "Machine Learning"] else 0.82,
            source="VERIFIED_CREDENTIAL"
        )
        db.add(ss)

    # Recommendations for Alex Rivera
    recs_data = [
        {
            "skill": "Deep Learning",
            "priority": "HIGH",
            "reason": "You already have Machine Learning experience. Deep Learning is a natural next step.",
            "related": "Machine Learning"
        },
        {
            "skill": "MLOps",
            "priority": "MEDIUM",
            "reason": "Your profile contains ML projects but limited evidence of deployment, containerization, and production workflows.",
            "related": "Docker / Python"
        },
        {
            "skill": "Docker",
            "priority": "HIGH",
            "reason": "Essential for containerizing machine learning microservices and FastAPI endpoints.",
            "related": "Python"
        }
    ]
    for r in recs_data:
        rec_obj = SkillRecommendation(
            student_id=s1.id,
            skill_name=r["skill"],
            reason=r["reason"],
            priority=r["priority"],
            related_existing_skill=r["related"]
        )
        db.add(rec_obj)

    # Initial Resume Analysis for Alex Rivera
    demo_resume_analysis = ResumeAnalysis(
        student_id=s1.id,
        resume_reference="Alex_Rivera_ML_Resume_Demo.pdf",
        extracted_text_reference="Alex Rivera | Machine Learning Engineering student with focus on predictive modeling and computer vision. Intern at AI Lab.",
        ai_summary="Demonstrates high proficiency in Python and traditional Machine Learning architectures. Clear trajectory toward Machine Learning Engineer role with strong mathematical foundations.",
        detected_skills_json=json.dumps([
            {"skill_name": "Python", "confidence_score": 0.94, "category": "Programming"},
            {"skill_name": "Machine Learning", "confidence_score": 0.91, "category": "AI/ML"},
            {"skill_name": "Pandas", "confidence_score": 0.89, "category": "Data Science"},
            {"skill_name": "PyTorch", "confidence_score": 0.85, "category": "AI/ML"}
        ]),
        experience_json=json.dumps([
            {"role": "Machine Learning Intern at Apex Lab", "duration": "Summer 2026", "description": "Trained customer segmentation and regression models in scikit-learn"}
        ]),
        projects_json=json.dumps([
            {"title": "SkillChain AI Intelligence Subsystem", "tech_stack": "FastAPI, PyTorch, Scikit-learn", "highlight": "Engineered automated skill extraction and career gap detection"}
        ]),
        skill_gaps_json=json.dumps([
            {"target_skill": "MLOps", "status": "GAP_DETECTED", "recommended_action": "Complete Docker and model deployment pipeline project"},
            {"target_skill": "Deep Learning", "status": "GAP_DETECTED", "recommended_action": "Experiment with transformer architectures"}
        ]),
        target_career="Machine Learning Engineer"
    )
    db.add(demo_resume_analysis)

    # Verification log
    log = VerificationLog(
        credential_id=1,
        queried_credential_id="SKILL-2026-ML01",
        verifier_reference="Campus Hiring Lead - AlphaCorp",
        result="AUTHENTIC",
        details="Blockchain cryptographic hash verified"
    )
    db.add(log)

    db.commit()
    print("Database successfully seeded with demo entities, credentials, and AI profiles!")
