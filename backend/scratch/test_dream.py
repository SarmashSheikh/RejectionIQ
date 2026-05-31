import os
import sys

# Setup import path to absolute backend dir
scratch_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(scratch_dir)
sys.path.insert(0, backend_dir)

from database.database import SessionLocal
from database import models

def verify_dream_targets():
    print("Starting Dream Company Target Benchmarks database verification test...")
    db = SessionLocal()
    try:
        # Get demo user
        user = db.query(models.User).filter(models.User.email == "demo@rejectioniq.com").first()
        if not user:
            print("Error: Demo user not found!")
            return

        # Print current values
        print(f"\n--- Original Dream Company Details ---")
        print(f"Dream Company: {user.dream_company}")
        print(f"Dream CGPA: {user.dream_cgpa}")
        print(f"Dream Internships: {user.dream_internships}")
        print(f"Dream Projects: {user.dream_projects}")
        print(f"Dream Skills: {user.dream_skills}")

        # Update dream benchmarks
        print(f"\n--- Updating Dream Company Details ---")
        user.dream_company = "OpenAI"
        user.dream_cgpa = 9.2
        user.dream_internships = 3
        user.dream_projects = 5
        user.dream_skills = ["Python", "PyTorch", "Transformers", "Distributed Systems"]
        db.commit()

        # Re-fetch from DB
        db.refresh(user)
        print(f"\n--- Verified Saved Dream Company Details ---")
        print(f"Dream Company: {user.dream_company}")
        print(f"Dream CGPA: {user.dream_cgpa}")
        print(f"Dream Internships: {user.dream_internships}")
        print(f"Dream Projects: {user.dream_projects}")
        print(f"Dream Skills: {user.dream_skills}")

        assert user.dream_company == "OpenAI", "Dream company should be OpenAI"
        assert user.dream_cgpa == 9.2, "Dream CGPA target should be 9.2"
        assert user.dream_internships == 3, "Dream Internships target should be 3"
        assert user.dream_projects == 5, "Dream Projects target should be 5"
        assert "PyTorch" in user.dream_skills, "PyTorch should be in dream skills"
        
        print("\nSQLite Custom Dream Target Benchmarks persistence logic PASSED!")

        # Reset to defaults to keep demo DB clean
        user.dream_company = "Google"
        user.dream_cgpa = 8.5
        user.dream_internships = 2
        user.dream_projects = 3
        user.dream_skills = ["Python", "System Design", "React"]
        db.commit()
        print("Restored original defaults successfully. DB is pristine.")

    finally:
        db.close()

if __name__ == "__main__":
    verify_dream_targets()
