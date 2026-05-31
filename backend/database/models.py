import datetime
import json
from sqlalchemy import Column, Integer, String, Float, Boolean, Text, Date, DateTime, ForeignKey, TypeDecorator, JSON
from sqlalchemy.orm import relationship
from database.database import Base


from sqlalchemy.dialects.postgresql import ARRAY


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    cgpa = Column(Float, nullable=True)
    college = Column(String(150), nullable=True)
    branch = Column(String(100), nullable=True)
    graduation_year = Column(Integer, nullable=True)
    internship_count = Column(Integer, default=0)
    project_count = Column(Integer, default=0)
    skills = Column(ARRAY(String), default=list)
    target_companies = Column(ARRAY(String), default=list)
    target_roles = Column(ARRAY(String), default=list)
    resume_path = Column(String(255), nullable=True)
    resume_text = Column(Text, nullable=True)
    avatar_url = Column(String(255), nullable=True)
    streak_count = Column(Integer, default=0)
    total_rejections = Column(Integer, default=0)
    resilience_score = Column(Float, default=5.0)
    is_onboarded = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False)
    otp = Column(String(6), nullable=True)
    otp_expires_at = Column(DateTime, nullable=True)
    
    # Custom editable dream company targets
    dream_company = Column(String(100), default="Google")
    dream_cgpa = Column(Float, default=8.5)
    dream_internships = Column(Integer, default=2)
    dream_projects = Column(Integer, default=3)
    dream_skills = Column(JSON, default=list)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    rejections = relationship("Rejection", back_populates="user", cascade="all, delete-orphan")
    recovery_plans = relationship("RecoveryPlan", back_populates="user", cascade="all, delete-orphan")
    resilience_logs = relationship("ResilienceLog", back_populates="user", cascade="all, delete-orphan")
    milestones = relationship("Milestone", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")


class Rejection(Base):
    __tablename__ = "rejections"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    company_name = Column(String(100), index=True, nullable=False)
    company_logo = Column(String(255), nullable=True)
    role = Column(String(100), nullable=False)
    application_date = Column(Date, nullable=True)
    rejection_date = Column(Date, nullable=True)
    days_to_rejection = Column(Integer, nullable=True)
    application_mode = Column(String(50), nullable=True)
    oa_completed = Column(Boolean, default=False)
    recruiter_call = Column(Boolean, default=False)
    technical_round = Column(Boolean, default=False)
    hr_round = Column(Boolean, default=False)
    email_body = Column(Text, nullable=True)
    jd_text = Column(Text, nullable=True)
    rejection_stage = Column(String(50), nullable=True)
    diagnosed_cause = Column(Text, nullable=True)
    confidence_score = Column(Float, nullable=True)
    gap_score = Column(Float, nullable=True)
    missing_keywords = Column(ARRAY(String), default=list)
    matching_keywords = Column(ARRAY(String), default=list)
    notes = Column(Text, nullable=True)
    status = Column(String(50), default="pending")
    diagnosis_data = Column(JSON, nullable=True)
    company_type = Column(String(50), nullable=True)
    selected_round = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="rejections")
    recovery_plans = relationship("RecoveryPlan", back_populates="rejection", cascade="all, delete-orphan")


class RecoveryPlan(Base):
    __tablename__ = "recovery_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    rejection_id = Column(Integer, ForeignKey("rejections.id", ondelete="CASCADE"))
    day_number = Column(Integer, nullable=False)
    week_number = Column(Integer, nullable=False)
    task_title = Column(String(500), nullable=False)
    task_desc = Column(Text, nullable=True)
    category = Column(String(50), nullable=True)
    priority = Column(String(20), default="medium")
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="recovery_plans")
    rejection = relationship("Rejection", back_populates="recovery_plans")


class PeerProfile(Base):
    __tablename__ = "peer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(100), index=True)
    role = Column(String(100), index=True)
    outcome = Column(String(20))  # "Offer" or "Rejected"
    cgpa = Column(Float, nullable=True)
    internship_count = Column(Integer, nullable=True)
    project_count = Column(Integer, nullable=True)
    skills = Column(ARRAY(String), default=list)
    rejection_stage = Column(String(50), nullable=True)
    source = Column(String(50), default="synthetic")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class ResilienceLog(Base):
    __tablename__ = "resilience_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    mood_score = Column(Integer)  # 1-10
    energy = Column(Integer)  # 1-10
    note = Column(Text, nullable=True)
    logged_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="resilience_logs")


class Milestone(Base):
    __tablename__ = "milestones"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    badge_icon = Column(String(50), nullable=True)
    achieved_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="milestones")


class CommunityPost(Base):
    __tablename__ = "community_posts"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(100), index=True)
    role = Column(String(100))
    experience = Column(Text)
    stage_reached = Column(String(50))
    outcome = Column(String(20))
    upvotes = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    type = Column(String(50))
    title = Column(String(200))
    message = Column(Text)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="notifications")
