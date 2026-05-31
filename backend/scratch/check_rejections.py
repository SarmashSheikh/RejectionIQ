import os
import sys

sys.path.append(os.getcwd())

from database.database import SessionLocal
from database import models

def print_rejections():
    db = SessionLocal()
    try:
        rejections = db.query(models.Rejection).order_by(models.Rejection.id.desc()).limit(10).all()
        print("--- LAST 10 REJECTIONS IN DATABASE ---")
        for r in rejections:
            print(f"ID: {r.id} | UserID: {r.user_id} | Company: {r.company_name} | Role: {r.role} | Status: {r.status} | Stage: {r.rejection_stage} | Score: {r.gap_score}")
    finally:
        db.close()

if __name__ == "__main__":
    print_rejections()
