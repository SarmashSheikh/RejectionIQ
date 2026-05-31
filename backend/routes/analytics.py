from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import models
from database.database import get_db
from routes.auth import get_current_user
from ml.engine import analyse_patterns

router = APIRouter()

@router.get("/pattern")
def get_rejection_pattern(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Feature 8: Analyzes rejection patterns for the current user."""
    rejections = db.query(models.Rejection).filter(models.Rejection.user_id == current_user.id).all()
    
    if not rejections:
        return {
            "pattern_type": "None",
            "dominant_stage": "N/A",
            "avg_days": 0,
            "recommendation": "Submit your first rejection to see patterns!"
        }
    
    # Convert to list of dicts for the engine
    rejections_list = [
        {
            "rejection_stage": r.rejection_stage,
            "days_to_rejection": r.days_to_rejection
        }
        for r in rejections
    ]
    
    analysis = analyse_patterns(rejections_list)
    return analysis

@router.get("/company/{name}")
def get_company_benchmarks(
    name: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Feature 8: Real company benchmarks from peer data."""
    # Query successful peers (Offer)
    offers = db.query(models.PeerProfile).filter(
        models.PeerProfile.company_name.ilike(name),
        models.PeerProfile.outcome == "Offer"
    ).all()
    
    if not offers:
        return {
            "company": name,
            "message": "Limited peer data for this company.",
            "average_cgpa": 8.5,  # Fallback demo values
            "average_projects": 3,
            "common_skills": ["Python", "DSA", "System Design"]
        }
    
    avg_cgpa = sum(o.cgpa or 0 for o in offers) / len(offers)
    avg_projects = sum(o.project_count or 0 for o in offers) / len(offers)
    
    # Extract most common skills
    all_skills = []
    for o in offers:
        if o.skills:
            all_skills.extend(o.skills)
            
    from collections import Counter
    common_skills = [k for k, v in Counter(all_skills).most_common(5)]
    
    return {
        "company": name,
        "average_cgpa": round(avg_cgpa, 2),
        "average_projects": round(avg_projects, 1),
        "common_skills": common_skills,
        "sample_size": len(offers)
    }

@router.get("/dashboard")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Legacy/Helper route for general stats."""
    total_rejections = db.query(models.Rejection).filter(models.Rejection.user_id == current_user.id).count()
    
    common_stage = db.query(
        models.Rejection.rejection_stage, 
        func.count(models.Rejection.id).label('count')
    ).filter(
        models.Rejection.user_id == current_user.id
    ).group_by(
        models.Rejection.rejection_stage
    ).order_by(
        func.count(models.Rejection.id).desc()
    ).first()

    return {
        "total_rejections": total_rejections,
        "most_common_stage": common_stage[0] if common_stage else "None",
    }
