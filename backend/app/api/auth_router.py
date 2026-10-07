from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.models.entities import User, Institution, Student, UserRole
from app.schemas.schemas import UserRegister, UserLogin, TokenResponse, UserResponse
from app.auth.auth_handler import verify_password, get_password_hash, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    # Check if user already exists
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists"
        )

    # Create base user
    new_user = User(
        name=user_in.name,
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        role=user_in.role.upper()
    )
    db.add(new_user)
    db.flush()

    # Create associated profile
    if new_user.role == UserRole.INSTITUTION.value:
        inst_name = user_in.institution_name or user_in.name
        reg_no = user_in.registration_number or f"REG-{new_user.id}-2026"
        inst = Institution(
            user_id=new_user.id,
            institution_name=inst_name,
            registration_number=reg_no,
            website=user_in.website or "https://skillchain.edu",
            verification_status="APPROVED"
        )
        db.add(inst)
    elif new_user.role == UserRole.STUDENT.value:
        student_id = user_in.student_identifier or f"STU-{1000 + new_user.id}"
        stud = Student(
            user_id=new_user.id,
            student_identifier=student_id,
            college=user_in.college or "State University",
            course=user_in.course or "Computer Science and Engineering",
            graduation_year=user_in.graduation_year or 2026
        )
        db.add(stud)

    db.commit()
    db.refresh(new_user)

    token = create_access_token(data={"sub": new_user.email, "role": new_user.role, "id": new_user.id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "role": new_user.role
        }
    }

@router.post("/login", response_model=TokenResponse)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_in.email).first()
    if not user or not verify_password(login_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(data={"sub": user.email, "role": user.role, "id": user.id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile_data = {}
    if current_user.role == UserRole.INSTITUTION.value and current_user.institution_profile:
        profile_data = {
            "institution_id": current_user.institution_profile.id,
            "institution_name": current_user.institution_profile.institution_name,
            "registration_number": current_user.institution_profile.registration_number,
            "verification_status": current_user.institution_profile.verification_status
        }
    elif current_user.role == UserRole.STUDENT.value and current_user.student_profile:
        profile_data = {
            "student_id": current_user.student_profile.id,
            "student_identifier": current_user.student_profile.student_identifier,
            "college": current_user.student_profile.college,
            "course": current_user.student_profile.course,
            "graduation_year": current_user.student_profile.graduation_year
        }

    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
        "profile": profile_data
    }
