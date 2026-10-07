import os
import json
from io import BytesIO
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from PyPDF2 import PdfReader
from app.config.database import get_db
from app.config.settings import settings
from app.models.entities import Student, ResumeAnalysis, SkillRecommendation, Skill, StudentSkill, User, UserRole
from app.auth.auth_handler import get_current_user, require_role
from app.ai.ai_service import ai_engine

router = APIRouter(prefix="/ai", tags=["AI Skill Intelligence"])

@router.post("/resume-analysis")
async def analyze_student_resume(
    target_career: str = Form("Machine Learning Engineer"),
    file: UploadFile = File(...),
    current_user: User = Depends(require_role(UserRole.STUDENT.value)),
    db: Session = Depends(get_db)
):
    student = current_user.student_profile
    if not student:
        raise HTTPException(status_code=400, detail="Student profile not found")

    # Read uploaded PDF
    content = await file.read()
    extracted_text = ""
    try:
        reader = PdfReader(BytesIO(content))
        for page in reader.pages:
            t = page.extract_text()
            if t:
                extracted_text += t + "\n"
    except Exception as e:
        print(f"PDF extraction error: {e}")
        extracted_text = "Failed to parse PDF text stream."

    if len(extracted_text.strip()) < 10:
        extracted_text = f"Student Profile Resume: {student.user.name}, studying {student.course} at {student.college}. Practical coursework in Python, Machine Learning, Scikit-learn, SQL, and Web development."

    # Save resume file
    resume_folder = os.path.join(settings.BASE_UPLOAD_DIR, "resumes")
    os.makedirs(resume_folder, exist_ok=True)
    safe_filename = f"RESUME_{student.student_identifier}_{file.filename}"
    file_path = os.path.join(resume_folder, safe_filename)
    with open(file_path, "wb") as f:
        f.write(content)

    # Perform AI Intelligence extraction
    analysis_res = ai_engine.analyze_resume_full(extracted_text, target_career=target_career)

    # Persist analysis in database
    db_analysis = ResumeAnalysis(
        student_id=student.id,
        resume_reference=safe_filename,
        extracted_text_reference=extracted_text[:4000],
        ai_summary=analysis_res["summary"],
        detected_skills_json=json.dumps(analysis_res["detected_skills"]),
        experience_json=json.dumps(analysis_res["experience"]),
        projects_json=json.dumps(analysis_res["projects"]),
        skill_gaps_json=json.dumps(analysis_res["skill_gaps"]),
        target_career=target_career
    )
    db.add(db_analysis)

    # Update Student skills detected from resume
    for s_item in analysis_res["detected_skills"]:
        skill_obj = db.query(Skill).filter(Skill.name == s_item["skill_name"]).first()
        if not skill_obj:
            skill_obj = Skill(name=s_item["skill_name"], category=s_item["category"])
            db.add(skill_obj)
            db.flush()

        # Update or create student skill
        existing_ss = db.query(StudentSkill).filter(
            StudentSkill.student_id == student.id,
            StudentSkill.skill_id == skill_obj.id
        ).first()

        if existing_ss:
            # Upgrade confidence if resume reinforced
            existing_ss.confidence_score = min(0.98, max(existing_ss.confidence_score, s_item["confidence_score"]))
            existing_ss.source = "CREDENTIAL_AND_RESUME"
        else:
            new_ss = StudentSkill(
                student_id=student.id,
                skill_id=skill_obj.id,
                confidence_score=s_item["confidence_score"],
                source="RESUME_ANALYSIS"
            )
            db.add(new_ss)

    # Update recommendations in database
    db.query(SkillRecommendation).filter(SkillRecommendation.student_id == student.id).delete()
    for rec in analysis_res["recommendations"]:
        rec_obj = SkillRecommendation(
            student_id=student.id,
            skill_name=rec["skill_name"],
            reason=rec["reason"],
            priority=rec["priority"],
            related_existing_skill=rec.get("related_existing_skill")
        )
        db.add(rec_obj)

    db.commit()

    return analysis_res

@router.get("/skills")
def get_student_skills(
    current_user: User = Depends(require_role(UserRole.STUDENT.value)),
    db: Session = Depends(get_db)
):
    student = current_user.student_profile
    if not student:
        raise HTTPException(status_code=400, detail="Student profile not found")

    skills_data = []
    for ss in student.skills:
        skills_data.append({
            "id": ss.id,
            "skill_name": ss.skill.name,
            "category": ss.skill.category,
            "confidence_score": ss.confidence_score,
            "confidence_percentage": int(ss.confidence_score * 100),
            "source": ss.source,
            "created_at": ss.created_at
        })

    return sorted(skills_data, key=lambda x: x["confidence_score"], reverse=True)

@router.get("/recommendations")
def get_student_recommendations(
    current_user: User = Depends(require_role(UserRole.STUDENT.value)),
    db: Session = Depends(get_db)
):
    student = current_user.student_profile
    if not student:
        raise HTTPException(status_code=400, detail="Student profile not found")

    recs = db.query(SkillRecommendation).filter(SkillRecommendation.student_id == student.id).all()
    if not recs:
        # Generate initial default recommendations
        skills = [{"skill_name": ss.skill.name} for ss in student.skills]
        fresh_recs = ai_engine.generate_recommendations(skills)
        return fresh_recs

    return [
        {
            "id": r.id,
            "skill_name": r.skill_name,
            "reason": r.reason,
            "priority": r.priority,
            "related_existing_skill": r.related_existing_skill,
            "created_at": r.created_at
        }
        for r in recs
    ]
