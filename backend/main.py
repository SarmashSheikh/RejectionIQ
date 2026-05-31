from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.database import engine, Base
from database import models
from routes import auth
from config import settings
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend API for RejectionIQ - AI-Driven Career Intelligence"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for demo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    logger.info("Application starting up...")
    
    # Run database migrations for new columns
    from sqlalchemy import text, inspect
    from database.database import engine
    logger.info("Running database migration for verification fields...")
    try:
        inspector = inspect(engine)
        if inspector.has_table("users"):
            columns = [col["name"] for col in inspector.get_columns("users")]
            with engine.connect() as conn:
                if "is_verified" not in columns:
                    conn.execute(text("ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;"))
                    logger.info("Added 'is_verified' column to 'users' table.")
                if "otp" not in columns:
                    conn.execute(text("ALTER TABLE users ADD COLUMN otp VARCHAR(6);"))
                    logger.info("Added 'otp' column to 'users' table.")
                if "otp_expires_at" not in columns:
                    col_type = "TIMESTAMP" if "postgresql" in str(engine.url) else "DATETIME"
                    conn.execute(text(f"ALTER TABLE users ADD COLUMN otp_expires_at {col_type};"))
                    logger.info("Added 'otp_expires_at' column to 'users' table.")
                if "dream_company" not in columns:
                    conn.execute(text("ALTER TABLE users ADD COLUMN dream_company VARCHAR(100) DEFAULT 'Google';"))
                    logger.info("Added 'dream_company' column to 'users' table.")
                if "dream_cgpa" not in columns:
                    conn.execute(text("ALTER TABLE users ADD COLUMN dream_cgpa FLOAT DEFAULT 8.5;"))
                    logger.info("Added 'dream_cgpa' column to 'users' table.")
                if "dream_internships" not in columns:
                    conn.execute(text("ALTER TABLE users ADD COLUMN dream_internships INTEGER DEFAULT 2;"))
                    logger.info("Added 'dream_internships' column to 'users' table.")
                if "dream_projects" not in columns:
                    conn.execute(text("ALTER TABLE users ADD COLUMN dream_projects INTEGER DEFAULT 3;"))
                    logger.info("Added 'dream_projects' column to 'users' table.")
                if "dream_skills" not in columns:
                    conn.execute(text("ALTER TABLE users ADD COLUMN dream_skills VARCHAR DEFAULT '[]';"))
                    logger.info("Added 'dream_skills' column to 'users' table.")
                conn.commit()
            logger.info("Database columns migration completed.")
            
        if inspector.has_table("rejections"):
            rej_columns = [col["name"] for col in inspector.get_columns("rejections")]
            with engine.connect() as conn:
                if "company_type" not in rej_columns:
                    conn.execute(text("ALTER TABLE rejections ADD COLUMN company_type VARCHAR(50) DEFAULT 'Product Based';"))
                    logger.info("Added 'company_type' column to 'rejections' table.")
                if "selected_round" not in rej_columns:
                    conn.execute(text("ALTER TABLE rejections ADD COLUMN selected_round VARCHAR(100);"))
                    logger.info("Added 'selected_round' column to 'rejections' table.")
                conn.commit()
            logger.info("Rejections database columns migration completed.")
    except Exception as e:
        logger.error(f"Database migration error: {e}")

    logger.info("Loading ML Models (Singleton)...")
    # Call directly; if it fails, the app should fail to start as per USER request
    from ml.model_loader import ml_models
    ml_models.load_models()
    logger.info("ML Models loaded successfully.")

@app.get("/")
def read_root():
    return {"message": "Welcome to RejectionIQ API", "status": "online"}

# Future Router Includes:
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
from routes import user
app.include_router(user.router, prefix="/api/users", tags=["users"])
from routes import rejection
app.include_router(rejection.router, prefix="/api/rejections", tags=["rejection"])
from routes import recovery
app.include_router(recovery.router, prefix="/api/recovery", tags=["recovery"])
from routes import analytics
app.include_router(analytics.router, prefix="/api/analysis", tags=["analysis"])
