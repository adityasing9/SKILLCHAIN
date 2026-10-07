import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config.settings import settings
from app.config.database import engine, Base, SessionLocal
from app.api.auth_router import router as auth_router
from app.api.credentials_router import router as credentials_router
from app.api.verification_router import router as verification_router
from app.api.ai_router import router as ai_router
from app.api.student_router import router as student_router
from app.api.institution_router import router as institution_router
from app.api.admin_router import router as admin_router
from app.utils.seeder import seed_database

# Create tables in Database (MySQL or SQLite)
Base.metadata.create_all(bind=engine)

# Auto seed default demo data if empty
try:
    with SessionLocal() as db:
        seed_database(db)
except Exception as e:
    print(f"Warning during seed: {e}")

app = FastAPI(
    title="SkillChain API",
    description="Blockchain-Based Credential Verification & AI Skill Intelligence Platform",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploaded files directory securely
os.makedirs(settings.BASE_UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.BASE_UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(auth_router, prefix="/api")
app.include_router(credentials_router, prefix="/api")
app.include_router(verification_router, prefix="/api")
app.include_router(ai_router, prefix="/api")
app.include_router(student_router, prefix="/api")
app.include_router(institution_router, prefix="/api")
app.include_router(admin_router, prefix="/api")

@app.get("/")
def health_check():
    return {
        "status": "online",
        "service": "SkillChain Platform Core API",
        "version": "1.0.0",
        "blockchain": "EVM Hardhat Localhost (31337)",
        "database": "Relational Storage Active"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
