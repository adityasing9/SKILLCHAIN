import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "SkillChain"
    PROJECT_VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Database: Supports MySQL URL format or SQLite fallback for local developer portability
    # MySQL example: mysql+pymysql://root:password@localhost:3306/skillchain_db
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./skillchain.db")
    
    # JWT Auth
    JWT_SECRET: str = os.getenv("JWT_SECRET", "skillchain-ultra-secure-jwt-secret-key-2026-prod-college")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # Blockchain
    BLOCKCHAIN_RPC_URL: str = os.getenv("BLOCKCHAIN_RPC_URL", "http://127.0.0.1:8545")
    CHAIN_ID: int = int(os.getenv("CHAIN_ID", "31337"))
    CONTRACT_ADDRESS: str = os.getenv("CONTRACT_ADDRESS", "")
    # Default local Hardhat account #0 private key
    ISSUER_PRIVATE_KEY: str = os.getenv("ISSUER_PRIVATE_KEY", "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80")
    
    # AI Engine
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    AI_MODEL: str = os.getenv("AI_MODEL", "gpt-4o-mini")
    AI_DEMO_MODE: bool = os.getenv("AI_DEMO_MODE", "true").lower() in ("true", "1", "t")
    
    # Storage & Uploads
    BASE_UPLOAD_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../uploads"))
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
