import sys
import os
import datetime

# Add current directory to path
sys.path.append(os.getcwd())

from database.database import SessionLocal
from database import models
from routes.rejection import process_rejection_background

def add_analyst_rejection():
    db = SessionLocal()
    try:
        user = db.query(models.User).filter(models.User.email == "demo@rejectioniq.com").first()
        if not user:
            print("Demo user not found. Please seed first.")
            return
            
        print(f"Found user: {user.full_name}")
        
        # Insert a new rejection
        jd_text = """Company: Insight Analytics Pvt Ltd
Position: Data Analyst
Location: Bengaluru, India
Experience: 0–2 Years
Responsibilities:
Analyze datasets to identify trends and patterns.
Create dashboards and reports.
Perform data cleaning and preprocessing.
Support business decision-making with data insights.
Requirements:
Degree in Statistics, Mathematics, Data Science, or related field.
Knowledge of SQL, Excel, Python, and Power BI.
Strong analytical thinking.
Salary: ₹4,50,000 – ₹7,00,000 per annum"""

        email_body = """Dear Candidate,

Thank you for taking the time to interview with Insight Analytics Pvt Ltd for the Data Analyst position. We enjoyed speaking with you during our technical evaluations.

However, after careful review, our team has decided to move forward with candidates who have more extensive hands-on experience in building complex Power BI dashboards and advanced statistical data cleaning using Python.

We will keep your details in our active database for future cohorts.

Best regards,
Hiring Team
Insight Analytics Pvt Ltd"""

        new_rejection = models.Rejection(
            user_id=user.id,
            company_name="Insight Analytics Pvt Ltd",
            role="Data Analyst",
            application_mode="LinkedIn",
            oa_completed=True,
            recruiter_call=True,
            technical_round=True,
            hr_round=False,
            email_body=email_body,
            jd_text=jd_text,
            status="processing",
            created_at=datetime.datetime.utcnow()
        )
        
        user.total_rejections = (user.total_rejections or 0) + 1
        db.add(new_rejection)
        db.commit()
        db.refresh(new_rejection)
        print(f"Logged new rejection. ID: {new_rejection.id}")
        
        # Process background ML diagnosis
        data_dict = {
            "company_name": "Insight Analytics Pvt Ltd",
            "role": "Data Analyst",
            "application_mode": "LinkedIn",
            "oa_completed": True,
            "recruiter_call": True,
            "technical_round": True,
            "hr_round": False,
            "email_body": email_body,
            "jd_text": jd_text,
            "application_date": (datetime.datetime.utcnow() - datetime.timedelta(days=12)).strftime("%Y-%m-%d"),
            "rejection_date": datetime.datetime.utcnow().strftime("%Y-%m-%d"),
            "cgpa": user.cgpa or 0.0,
            "internship_count": user.internship_count or 0
        }
        
        print("Running hybrid ML engine analysis on new rejection...")
        process_rejection_background(
            rejection_id=new_rejection.id,
            user_id=user.id,
            data_dict=data_dict,
            resume_text=user.resume_text or ""
        )
        print("Diagnosis and 30-day recovery sprint tasks generated successfully!")
        
    finally:
        db.close()

if __name__ == "__main__":
    add_analyst_rejection()
