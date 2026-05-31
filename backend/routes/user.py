import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from database.database import get_db
from database import models
from routes.auth import get_current_user
import schemas
from config import settings
import fitz # PyMuPDF

router = APIRouter()

@router.put("/onboarding", response_model=schemas.UserResponse)
def update_onboarding_profile(
    profile_data: schemas.UserProfileUpdate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    # Update fields if provided
    update_data = profile_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(current_user, key, value)
        
    current_user.is_onboarded = True
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/resume", response_model=schemas.UserResponse)
def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
        
    # Save file
    file_location = os.path.join(settings.UPLOAD_DIR, f"{current_user.id}_{file.filename}")
    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(file.file, file_object)
        
    # Extract text using PyMuPDF
    try:
        doc = fitz.open(file_location)
        text = ""
        for page in doc:
            text += page.get_text()
            
        current_user.resume_path = file_location
        current_user.resume_text = text
        
        db.commit()
        db.refresh(current_user)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse resume: {str(e)}")
        
    return current_user
