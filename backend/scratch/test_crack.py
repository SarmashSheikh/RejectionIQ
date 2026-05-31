import os
import sys

# Setup standard output to use UTF-8 encoding to support emojis on Windows terminals
if sys.version_info >= (3, 7):
    sys.stdout.reconfigure(encoding='utf-8')

# Setup import path to absolute backend dir
scratch_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(scratch_dir)
sys.path.insert(0, backend_dir)

from database.database import SessionLocal
from database import models
from routes.rejection import log_successful_offer, get_user_milestones

def verify_crack_feature():
    print("Starting Successful Job Offer Cracking & Milestones verification test...")
    db = SessionLocal()
    try:
        # Get demo user
        user = db.query(models.User).filter(models.User.email == "demo@rejectioniq.com").first()
        if not user:
            print("Error: Demo user 'demo@rejectioniq.com' not found!")
            return

        # Prepare crack data
        crack_data = {
            "company_name": "Antigravity Inc.",
            "role": "Super Agentic AI Engineer",
            "salary": "$250,000 / 2.5 Crore LPA",
            "notes": "Cracked using advanced reasoning and flawless execution!"
        }

        print("\n--- Testing Log Successful Offer Endpoint Logic ---")
        result = log_successful_offer(crack_data, db, user)
        print(f"Crack result response: {result}")
        assert result["success"] is True, "Cracking job response should have success = True"

        # Verify Milestone is inserted
        milestone = db.query(models.Milestone).filter(
            models.Milestone.user_id == user.id, 
            models.Milestone.title.like("%Antigravity Inc.%")
        ).first()
        assert milestone is not None, "Milestone for Antigravity Inc. should exist in database!"
        print(f"Verified Milestone: {milestone.title} | Desc: {milestone.description}")

        # Verify PeerProfile is added for other candidates
        peer = db.query(models.PeerProfile).filter(
            models.PeerProfile.company_name == "Antigravity Inc.",
            models.PeerProfile.outcome == "Offer"
        ).first()
        assert peer is not None, "Community peer profile should have been logged automatically!"
        print(f"Verified Peer Benchmark logged: Company: {peer.company_name} | Role: {peer.role} | Outcome: {peer.outcome}")

        # Verify Notification is sent
        notif = db.query(models.Notification).filter(
            models.Notification.user_id == user.id,
            models.Notification.title.like("%Congratulations%")
        ).first()
        assert notif is not None, "Congratulations Notification should have been sent!"
        print(f"Verified Notification sent: Title: {notif.title} | Msg: {notif.message}")

        # Test GET milestones logic
        print("\n--- Testing Milestones Retrieval Logic ---")
        milestones_list = get_user_milestones(db, user)
        print(f"Fetched milestones count: {len(milestones_list)}")
        assert len(milestones_list) > 0, "Milestones list should not be empty"
        assert any(m.title == milestone.title for m in milestones_list), "Log target should appear in the milestones list"
        print("Milestones list retrieval PASSED!")

        # Clean up database to keep it pristine
        db.delete(milestone)
        db.delete(peer)
        db.delete(notif)
        db.commit()
        print("\nCleaned up all test entries. Database is pristine.")
        print("Success Offer Cracking Features Verified successfully!")

    except Exception as err:
        # Clean up database just in case the assertion failed
        db.rollback()
        # Search and clean if they were created
        try:
            milestone = db.query(models.Milestone).filter(models.Milestone.user_id == user.id, models.Milestone.title.like("%Antigravity Inc.%")).first()
            if milestone: db.delete(milestone)
            peer = db.query(models.PeerProfile).filter(models.PeerProfile.company_name == "Antigravity Inc.", models.PeerProfile.outcome == "Offer").first()
            if peer: db.delete(peer)
            notif = db.query(models.Notification).filter(models.Notification.user_id == user.id, models.Notification.title.like("%Congratulations%")).first()
            if notif: db.delete(notif)
            db.commit()
        except:
            pass
        raise err
    finally:
        db.close()

if __name__ == "__main__":
    verify_crack_feature()
