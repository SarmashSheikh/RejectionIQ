import os
import sys

# Setup import path
scratch_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(scratch_dir)
sys.path.insert(0, backend_dir)

from database.database import SessionLocal
from database import models
from routes.recovery import CustomTaskCreate, create_custom_task
from routes.rejection import get_rejection_status
from ml.engine import _filter_skill_keywords

def verify_upgrades():
    print("Starting Premium Upgrades verification test...")
    
    # 1. Verify Upgrade 3: Vague Keyword Filter
    vague_phrases = [
        "write efficient python code",
        "based enterprise applications",
        "spring boot framework microservices",
        "closely align requirements",
        "hands on docker containers"
    ]
    cleaned = _filter_skill_keywords(vague_phrases)
    print("\n--- Upgrade 3: Vague Keyword Cleaner ---")
    print(f"Original Phrases: {vague_phrases}")
    print(f"Cleaned Keywords: {cleaned}")
    assert "Python" in cleaned, "Should map write efficient phrase containing python to Python skill"
    assert "Spring Boot" in cleaned, "Should extract Spring Boot skill"
    assert "Docker" in cleaned, "Should extract Docker skill"
    assert "based enterprise applications" not in cleaned, "Should successfully filter generic fragments"
    print("Upgrade 3 PASSED!")
    
    db = SessionLocal()
    try:
        # Get demo user
        user = db.query(models.User).filter(models.User.email == "demo@rejectioniq.com").first()
        if not user:
            print("Demo user not found!")
            return
            
        rejection = db.query(models.Rejection).filter(models.Rejection.user_id == user.id).first()
        if not rejection:
            print("No rejections found to test benchmarks!")
            return
            
        # 2. Verify Upgrade 5: Peer Benchmarks dynamic extraction
        print("\n--- Upgrade 5: Database-Driven Peer Benchmarks ---")
        status_res = get_rejection_status(rejection.id, db, user)
        benchmarks = status_res.get("peer_benchmarks")
        print(f"Company: {rejection.company_name}")
        print(f"Peer Benchmarks: {benchmarks}")
        assert benchmarks is not None, "Benchmarks dictionary must be calculated and returned"
        assert "avg_cgpa" in benchmarks, "Benchmarks should contain avg_cgpa"
        assert "avg_internships" in benchmarks, "Benchmarks should contain avg_internships"
        assert "top_skills" in benchmarks, "Benchmarks should contain top_skills list"
        print("Upgrade 5 PASSED!")
        
        # 3. Verify Upgrade 4: Actionable Task Creation
        print("\n--- Upgrade 4: Actionable Learn This task injection ---")
        task_data = CustomTaskCreate(
            rejection_id=rejection.id,
            title="Master skill: suppport vector machines",
            desc="Add deep learning modeling practice to bridge the skill gap."
        )
        task_res = create_custom_task(task_data, db, user)
        print(f"Insertion result: {task_res}")
        assert task_res["success"] is True, "Custom task insertion should succeed"
        
        # Check task exists
        inserted = db.query(models.RecoveryPlan).filter(models.RecoveryPlan.id == task_res["task_id"]).first()
        assert inserted is not None, "Inserted task must exist in SQLite database"
        print(f"Verified inserted task: {inserted.task_title} | Day {inserted.day_number}")
        
        # Clean up test task to keep db pristine
        db.delete(inserted)
        db.commit()
        print("Upgrade 4 PASSED!")
        
        print("\nAll Backend Premium Upgrades verified successfully!")
        
    finally:
        db.close()

if __name__ == "__main__":
    verify_upgrades()
