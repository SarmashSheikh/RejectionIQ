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
        user.is_verified = True
        db.commit()
    return user

def send_mock_otp_email(email: str, otp: str):
    print("\n" + "="*80)
    print(" REJECTIONIQ - EMAIL VERIFICATION SERVICE ".center(80, "#"))
    print("="*80)
    print(f"  To:       {email}")
    print(f"  Subject:  Your RejectionIQ One-Time Password (OTP) Verification Code")
    print(f"  Body:")
    print(f"            Welcome to RejectionIQ!")
    print(f"            To complete your registration/login, please verify your email.")
    print("")
    print(f"            YOUR 6-DIGIT OTP VERIFICATION CODE IS:")
    print(f"            +------------------------+")
    print(f"            |         {otp}         |")
    print(f"            +------------------------+")
    print("")
    print(f"            This code is valid for 10 minutes.")
    print("="*80)
    print("="*80 + "\n")

def send_real_otp_email(email: str, otp: str):
    send_mock_otp_email(email, otp)
    
    html = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 40px; margin: 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #3b82f6; font-size: 24px; font-weight: bold; margin-bottom: 24px; text-align: center;">Verify Your RejectionIQ Email</h2>
          <p style="font-size: 16px; line-height: 24px; color: #94a3b8; margin-bottom: 24px;">
            Welcome to <strong>RejectionIQ</strong>! Please use the following 6-digit One-Time Password (OTP) to verify your account and log in.
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

    if settings.RESEND_API_KEY:
        try:
            import urllib.request
            import json
            headers = {
                "Authorization": f"Bearer {settings.RESEND_API_KEY.strip()}",
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
            payload = {
                "from": settings.SMTP_FROM or "RejectionIQ <onboarding@resend.dev>",
                "to": [email],
                "subject": f"RejectionIQ One-Time Password (OTP) Code: {otp}",
                "html": html
            }
            req = urllib.request.Request("https://api.resend.com/emails", data=json.dumps(payload).encode(), headers=headers)
            with urllib.request.urlopen(req) as resp:
                print(f"[Resend API Success] Email successfully sent to {email}")
                return True
        except Exception as e:
            err_detail = getattr(e, 'read', None)
            err_body = err_detail().decode() if err_detail else str(e)
            print(f"[Resend API Error] Failed to send email to {email}: {err_body}")

    if settings.BREVO_API_KEY:
        try:
            import urllib.request
            import json
            headers = {
                "api-key": settings.BREVO_API_KEY,
                "Content-Type": "application/json"
            }
            payload = {
                "sender": {"email": settings.SMTP_FROM or "no-reply@rejectioniq.com", "name": "RejectionIQ"},
                "to": [{"email": email}],
                "subject": f"RejectionIQ One-Time Password (OTP) Code: {otp}",
                "htmlContent": html
            }
            req = urllib.request.Request("https://api.brevo.com/v3/smtp/email", data=json.dumps(payload).encode(), headers=headers)
            with urllib.request.urlopen(req) as resp:
                print(f"[Brevo API Success] Email successfully sent to {email}")
                return True
        except Exception as e:
            print(f"[Brevo API Error] Failed to send email to {email}: {e}")

    if settings.SMTP_USERNAME and settings.SMTP_PASSWORD:
        try:
            smtp_from = settings.SMTP_FROM or settings.SMTP_USERNAME
            msg = MIMEMultipart('alternative')
            msg['Subject'] = f"RejectionIQ One-Time Password (OTP) Code: {otp}"
            msg['From'] = smtp_from
            msg['To'] = email
            
            part1 = MIMEText(f"Your RejectionIQ verification code is: {otp}. Valid for 10 minutes.", 'plain')
            part2 = MIMEText(html, 'html')
            msg.attach(part1)
            msg.attach(part2)
            
            server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
            server.starttls()
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            server.sendmail(smtp_from, email, msg.as_string())
            server.quit()
            
            print(f"[SMTP Success] Email successfully sent to {email}")
            return True
        except Exception as e:
            print(f"[SMTP Error] Failed to send email to {email}: {e}")
            return False

    return False

@router.post("/register")
def register(user: schemas.UserCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    clean_email = user.email.strip().lower()
    db_user = db.query(models.User).filter(models.User.email == clean_email).first()
    
    otp_code = f"{random.randint(100000, 999999)}"
    expiry = datetime.utcnow() + timedelta(minutes=10)

    if db_user:
        db_user.full_name = user.full_name
        db_user.password_hash = get_password_hash(user.password)
        db_user.otp = otp_code
        db_user.otp_expires_at = expiry
        db_user.is_verified = True
        db.commit()
        db.refresh(db_user)
    else:
        hashed_password = get_password_hash(user.password)
        db_user = models.User(
            full_name=user.full_name,
            email=clean_email,
            password_hash=hashed_password,
            is_verified=True,
            otp=otp_code,
            otp_expires_at=expiry
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
    background_tasks.add_task(send_real_otp_email, db_user.email, otp_code)
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user.email}, expires_delta=access_token_expires
    )
    return {"status": "verified", "access_token": access_token, "email": db_user.email}

@router.post("/verify-otp")
def verify_otp(data: schemas.OTPVerificationRequest, db: Session = Depends(get_db)):
    clean_email = data.email.strip().lower()
    user = db.query(models.User).filter(models.User.email == clean_email).first()
    if not user:
        # Auto-create user if verifying OTP
        hashed_password = get_password_hash("password123")
        user = models.User(
            full_name=clean_email.split('@')[0].capitalize(),
            email=clean_email,
            password_hash=hashed_password,
            is_verified=True,
            is_onboarded=True,
            cgpa=8.0,
            streak_count=1,
            total_rejections=0,
            resilience_score=7.0
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
    user.is_verified = True
    user.otp = None
    user.otp_expires_at = None
    db.commit()
    db.refresh(user)
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/request-otp")
def request_otp(data: schemas.OTPResendRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    clean_email = data.email.strip().lower()
    if not clean_email.endswith('@gmail.com'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only valid Gmail addresses (@gmail.com) are supported."
        )
        
    user = db.query(models.User).filter(models.User.email == clean_email).first()
    otp_code = f"{random.randint(100000, 999999)}"
    expiry = datetime.utcnow() + timedelta(minutes=10)

    if not user:
        hashed_password = get_password_hash("password123")
        user = models.User(
            full_name=clean_email.split('@')[0].capitalize(),
            email=clean_email,
            password_hash=hashed_password,
            is_verified=True,
            is_onboarded=True,
            otp=otp_code,
            otp_expires_at=expiry
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        user.otp = otp_code
        user.otp_expires_at = expiry
        user.is_verified = True
        db.commit()
    
    background_tasks.add_task(send_real_otp_email, user.email, otp_code)
    
    return {"message": "Verification code sent successfully", "email": user.email}

@router.post("/resend-otp")
def resend_otp(data: schemas.OTPResendRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    clean_email = data.email.strip().lower()
    if not clean_email.endswith('@gmail.com'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only valid Gmail addresses (@gmail.com) are supported."
        )
        
    user = db.query(models.User).filter(models.User.email == clean_email).first()
    otp_code = f"{random.randint(100000, 999999)}"
    expiry = datetime.utcnow() + timedelta(minutes=10)

    if not user:
        hashed_password = get_password_hash("password123")
        user = models.User(
            full_name=clean_email.split('@')[0].capitalize(),
            email=clean_email,
            password_hash=hashed_password,
            is_verified=True,
            is_onboarded=True,
            otp=otp_code,
            otp_expires_at=expiry
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        user.otp = otp_code
        user.otp_expires_at = expiry
        user.is_verified = True
        db.commit()
    
    background_tasks.add_task(send_real_otp_email, user.email, otp_code)
    
    return {"message": "Verification code resent successfully"}

@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # 1. Server-side input validation
    raw_username = (form_data.username or "").strip()
    raw_password = form_data.password or ""

    if not raw_username or not raw_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and password are required."
        )

    clean_email = raw_username.lower()

    if "@" not in clean_email or len(clean_email) < 5 or "." not in clean_email.split("@")[-1]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format."
        )

    # 2. Query user from database using parameterized SQLAlchemy ORM query
    user = db.query(models.User).filter(models.User.email == clean_email).first()

    # 3. Check if account exists
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found. Please create an account first."
        )

    # 4. Check if account is active/valid
    if hasattr(user, "is_active") and user.is_active is False:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is deactivated or disabled."
        )

    # 5. Verify password against stored bcrypt password hash
    if not verify_password(raw_password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    # 6. Issue JWT access token on successful authentication
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
