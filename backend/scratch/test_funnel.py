import os
import sys

# Setup import path
scratch_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(scratch_dir)
sys.path.insert(0, backend_dir)

from database.database import SessionLocal
from database import models
from sqlalchemy import func

def test_funnel():
    db = SessionLocal()
    try:
        # Fetch a user (we know demo@rejectioniq.com is Arjun Shaik, let's find him)
        user = db.query(models.User).filter(models.User.email == "demo@rejectioniq.com").first()
        if not user:
            print("Demo user not found!")
            return
            
        rejections = db.query(models.Rejection).filter(models.Rejection.user_id == user.id).all()
        print(f"Total rejections for {user.full_name}: {len(rejections)}")
        
        # 3. DYNAMIC REJECTION FUNNEL progress tracking for all 11 stages
        STAGE_ORDER = [
            "Resume Screening",
            "Online Assessment / Aptitude",
            "Communication Assessment",
            "Coding Challenge",
            "Technical Interview Round 1",
            "Technical Interview Round 2",
            "Group Discussion (Optional)",
            "Managerial Interview",
            "HR Interview",
            "Background Verification",
            "Offer Approval / Final Selection"
        ]

        STAGE_RANKS = {stage: idx + 1 for idx, stage in enumerate(STAGE_ORDER)}
        # Add mapped legacy variants for backward compatibility
        STAGE_RANKS["ATS Filter"] = 1
        STAGE_RANKS["OA Rejection"] = 2
        STAGE_RANKS["Technical Round"] = 5
        STAGE_RANKS["HR Screen"] = 9
        STAGE_RANKS["Final Round"] = 11

        total_rejections = len(rejections)
        rejection_funnel = {}
        if total_rejections > 0:
            # Determine reached rank for each rejection
            reached_ranks = []
            for r in rejections:
                stage = r.rejection_stage or "Resume Screening"
                rank = STAGE_RANKS.get(stage, 1)
                reached_ranks.append(rank)
                print(f"  Rejection ID: {r.id} | Stage: {stage} | Rank: {rank}")
                
            # Calculate percentage for each of the 11 stages
            last_pct = 100
            for idx, stage_name in enumerate(STAGE_ORDER):
                rank_val = idx + 1
                reached_count = sum(1 for r_rank in reached_ranks if r_rank >= rank_val)
                pct = round((reached_count / total_rejections) * 100)
                
                # Funnel stages must be non-increasing
                pct = min(pct, last_pct)
                
                # Set a small non-zero base visual percent for active visual presentation
                min_visual = max(11 - idx, 0)
                rejection_funnel[stage_name] = max(pct, min_visual)
                last_pct = pct
        else:
            rejection_funnel = {stage: 0 for stage in STAGE_ORDER}
            
        print("\n--- CALCULATED REJECTION FUNNEL ---")
        for stage, pct in rejection_funnel.items():
            print(f"{stage:40} | {pct}%")
            
    finally:
        db.close()

if __name__ == "__main__":
    test_funnel()
