import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "RejectionIQ API"
    VERSION: str = "1.0.0"
    
    # Database (PostgreSQL)
    DATABASE_URL: str = "postgresql://postgres:YourNewPassword@localhost:5432/rejectioniq"
    
    # JWT Auth
    SECRET_KEY: str = "super_secret_key_change_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days for demo purposes
    
    # File Storage
    UPLOAD_DIR: str = "./uploads"

    # SMTP Settings for Gmail / Mail delivery
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM: Optional[str] = None

    # Anthropic Claude API Key
    ANTHROPIC_API_KEY: Optional[str] = None

    # Gemini API Key (Generous Free Tier)
    GEMINI_API_KEY: Optional[str] = None


    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
