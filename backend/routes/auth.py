from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import JWTError, jwt
import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from database.database import get_db
from database import models
import schemas
from utils.auth import verify_password, get_password_hash, create_access_token
from config import settings

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email not verified. Please verify your email.",
        )
    return user

def send_mock_otp_email(email: str, otp: str):
    # Print a beautiful verification card to the backend console
    print("\n" + "="*80)
    print(" REJECTIONIQ - EMAIL VERIFICATION SERVICE ".center(80, "#"))
    print("="*80)
    print(f"  To:       {email}")
    print(f"  Subject:  Your RejectionIQ One-Time Password (OTP) Verification Code")
    print(f"  Body:")
    print(f"            Welcome to RejectionIQ!")
    print(f"            To complete your registration, please verify your email.")
    print("")
    print(f"            YOUR 6-DIGIT OTP VERIFICATION CODE IS:")
    print(f"            ┌────────────────────────┐")
    print(f"            │         {otp}         │")
    print(f"            └────────────────────────┘")
    print("")
    print(f"            This code is valid for 10 minutes.")
    print("="*80)
    print("="*80 + "\n")

def send_real_otp_email(email: str, otp: str):
    # Always print mock in console as a reliable developer fallback
    send_mock_otp_email(email, otp)
    
    # Check if SMTP settings are configured
    if not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
        print("[SMTP Warning] SMTP_USERNAME and SMTP_PASSWORD not configured. Gmail was not sent.")
        return False
        
    try:
        smtp_from = settings.SMTP_FROM or settings.SMTP_USERNAME
        
        # Create message container
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f"RejectionIQ One-Time Password (OTP) Code: {otp}"
        msg['From'] = smtp_from
        msg['To'] = email
        
        # HTML body for premium feel
        html = f"""
        <html>
          <body style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 40px; margin: 0;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #3b82f6; font-size: 24px; font-weight: bold; margin-bottom: 24px; text-align: center;">Verify Your RejectionIQ Email</h2>
              <p style="font-size: 16px; line-height: 24px; color: #94a3b8; margin-bottom: 24px;">
                Welcome to <strong>RejectionIQ</strong>! Thank you for registering. Please use the following 6-digit One-Time Password (OTP) to verify your account and complete your setup.
              </p>
              
              <div style="background-color: #0f172a; border: 1px dashed #3b82f6; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 24px;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #ffffff;">{otp}</span>
              </div>
              
              <p style="font-size: 14px; color: #64748b; text-align: center; margin-top: 32px; border-top: 1px solid #334155; padding-top: 16px;">
                This code is valid for 10 minutes. If you did not request this code, please ignore this email.
              </p>
            </div>
          </body>
        </html>
        """
        
        # Record the MIME types
        part1 = MIMEText(f"Your RejectionIQ verification code is: {otp}. Valid for 10 minutes.", 'plain')
        part2 = MIMEText(html, 'html')
        
        msg.attach(part1)
        msg.attach(part2)
        
        # Connect to SMTP server
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
        server.starttls()  # Secure the connection
        server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        server.sendmail(smtp_from, email, msg.as_string())
        server.quit()
        
        print(f"[SMTP Success] Email successfully sent to {email}")
        return True
    except Exception as e:
        print(f"[SMTP Error] Failed to send email to {email}: {e}")
        return False

@router.post("/register")
def register(user: schemas.UserCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    
    otp_code = f"{random.randint(100000, 999999)}"
    expiry = datetime.utcnow() + timedelta(minutes=10)
    
    if db_user:
        if db_user.is_verified:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # If user exists but is not verified, update details and resend OTP
        db_user.full_name = user.full_name
        db_user.password_hash = get_password_hash(user.password)
        db_user.otp = otp_code
        db_user.otp_expires_at = expiry
        db.commit()
        db.refresh(db_user)
    else:
        # Create a new unverified user
        hashed_password = get_password_hash(user.password)
        db_user = models.User(
            full_name=user.full_name,
            email=user.email,
            password_hash=hashed_password,
            is_verified=False,
            otp=otp_code,
            otp_expires_at=expiry
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
    # Send verification email asynchronously
    background_tasks.add_task(send_real_otp_email, db_user.email, otp_code)
    
    return {"status": "verification_pending", "email": db_user.email}

@router.post("/verify-otp")
def verify_otp(data: schemas.OTPVerificationRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user.is_verified:
        raise HTTPException(status_code=400, detail="Email already verified")
        
    if not user.otp or user.otp != data.otp:
        raise HTTPException(status_code=400, detail="Incorrect verification code")
        
    if not user.otp_expires_at or user.otp_expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Verification code has expired")
        
    # Mark user as verified
    user.is_verified = True
    user.otp = None
    user.otp_expires_at = None
    db.commit()
    db.refresh(user)
    
    # Generate token for auto-login
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/resend-otp")
def resend_otp(data: schemas.OTPResendRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user.is_verified:
        raise HTTPException(status_code=400, detail="Email already verified")
        
    # Generate new OTP
    otp_code = f"{random.randint(100000, 999999)}"
    user.otp = otp_code
    user.otp_expires_at = datetime.utcnow() + timedelta(minutes=10)
    db.commit()
    
    # Send email asynchronously
    background_tasks.add_task(send_real_otp_email, user.email, otp_code)
    
    return {"message": "Verification code resent successfully"}

@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="EMAIL_NOT_VERIFIED",
        )
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    import json
    if isinstance(current_user.dream_skills, str):
        try:
            current_user.dream_skills = json.loads(current_user.dream_skills)
        except Exception:
            current_user.dream_skills = []
    return current_user

@router.put("/profile", response_model=schemas.UserResponse)
def update_profile(
    profile_data: schemas.UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    for field, value in profile_data.dict(exclude_unset=True).items():
        setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    
    import json
    if isinstance(current_user.dream_skills, str):
        try:
            current_user.dream_skills = json.loads(current_user.dream_skills)
        except Exception:
            current_user.dream_skills = []
            
    return current_user

@router.put("/password")
def change_password(
    data: schemas.PasswordChange,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not verify_password(data.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect current password")
    
    current_user.password_hash = get_password_hash(data.new_password)
    db.commit()
    return {"message": "Password updated successfully"}

@router.delete("/account")
def delete_account(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db.delete(current_user)
    db.commit()
    return {"message": "Account deleted successfully"}
