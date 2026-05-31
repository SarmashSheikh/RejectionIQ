from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any

class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    is_onboarded: bool
    is_verified: bool
    cgpa: Optional[float] = None
    college: Optional[str] = None
    branch: Optional[str] = None
    graduation_year: Optional[int] = None
    internship_count: Optional[int] = 0
    project_count: Optional[int] = 0
    skills: Optional[List[str]] = []
    target_companies: Optional[List[str]] = []
    target_roles: Optional[List[str]] = []
    total_rejections: Optional[int] = 0
    resilience_score: Optional[float] = 5.0
    
    # Custom dream company benchmark fields
    dream_company: Optional[str] = "Google"
    dream_cgpa: Optional[float] = 8.5
    dream_internships: Optional[int] = 2
    dream_projects: Optional[int] = 3
    dream_skills: Optional[List[str]] = []
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class OTPVerificationRequest(BaseModel):
    email: EmailStr
    otp: str

class OTPResendRequest(BaseModel):
    email: EmailStr

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    cgpa: Optional[float] = None
    college: Optional[str] = None
    branch: Optional[str] = None
    graduation_year: Optional[int] = None
    internship_count: Optional[int] = None
    project_count: Optional[int] = None
    skills: Optional[List[str]] = None
    target_companies: Optional[List[str]] = None
    target_roles: Optional[List[str]] = None
    
    # Custom dream company benchmark fields
    dream_company: Optional[str] = None
    dream_cgpa: Optional[float] = None
    dream_internships: Optional[int] = None
    dream_projects: Optional[int] = None
    dream_skills: Optional[List[str]] = None

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

class RejectionCreate(BaseModel):
    company_name: str
    role: str
    application_date: Optional[str] = None
    rejection_date: Optional[str] = None
    application_mode: Optional[str] = None
    oa_completed: bool = False
    recruiter_call: bool = False
    technical_round: bool = False
    hr_round: bool = False
    email_body: Optional[str] = None
    jd_text: Optional[str] = None
    company_type: Optional[str] = None
    selected_round: Optional[str] = None

class RejectionResponse(BaseModel):
    id: int
    company_name: str
    role: str
    rejection_stage: Optional[str] = None
    confidence_score: Optional[float] = None
    diagnosed_cause: Optional[str] = None
    gap_score: Optional[float] = None
    missing_keywords: List[str] = []
    matching_keywords: List[str] = []
    status: str = "pending"
    rejection_date: Optional[Any] = None
    created_at: Optional[Any] = None
    company_type: Optional[str] = None
    selected_round: Optional[str] = None
    diagnosis_data: Optional[Dict[str, Any]] = None
    
    class Config:
        from_attributes = True

class RejectionListItem(BaseModel):
    id: int
    company_name: str
    role: str
    rejection_stage: Optional[str] = None
    confidence_score: Optional[float] = None
    diagnosed_cause: Optional[str] = None
    status: str = "pending"
    rejection_date: Optional[Any] = None
    created_at: Optional[Any] = None

    class Config:
        from_attributes = True

class RejectionStatusResponse(BaseModel):
    id: int
    status: str
    diagnosis: Optional[Dict[str, Any]] = None
