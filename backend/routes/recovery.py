from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.database import get_db
from database import models
from routes.auth import get_current_user
from pydantic import BaseModel

router = APIRouter()

class TaskUpdate(BaseModel):
    completed: bool

@router.get("/plan")
def get_recovery_plan(
    rejection_id: int = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Fetch all rejections to populate the available sprints selector
    rejections = db.query(models.Rejection).filter(models.Rejection.user_id == current_user.id).order_by(models.Rejection.created_at.desc()).all()
    available_sprints = [{"id": r.id, "company_name": r.company_name, "role": r.role} for r in rejections]

    # Determine active rejection sprint id
    active_rejection_id = rejection_id
    if not active_rejection_id and rejections:
        active_rejection_id = rejections[0].id

    active_rejection = None
    if active_rejection_id:
        for r in rejections:
            if r.id == active_rejection_id:
                active_rejection = {"id": r.id, "company_name": r.company_name, "role": r.role, "rejection_stage": r.rejection_stage}
                break

    # Query tasks isolated to the active sprint
    tasks = []
    if active_rejection_id:
        tasks = db.query(models.RecoveryPlan).filter(
            models.RecoveryPlan.user_id == current_user.id,
            models.RecoveryPlan.rejection_id == active_rejection_id
        ).order_by(models.RecoveryPlan.day_number).all()

    # Group tasks by week
    plan = {}
    for t in tasks:
        w = f"Week {t.week_number}"
        if w not in plan:
            plan[w] = []
        plan[w].append({
            "id": t.id,
            "day": t.day_number,
            "title": t.task_title,
            "desc": t.task_desc,
            "category": t.category,
            "completed": t.completed
        })

    return {
        "active_rejection": active_rejection,
        "available_sprints": available_sprints,
        "plan": plan
    }


@router.put("/task/{task_id}")
def update_task_status(
    task_id: int,
    status: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    task = db.query(models.RecoveryPlan).filter(
        models.RecoveryPlan.id == task_id, 
        models.RecoveryPlan.user_id == current_user.id
    ).first()
    
    if task:
        import datetime
        task.completed = status.completed
        if status.completed:
            task.completed_at = datetime.datetime.utcnow()
        else:
            task.completed_at = None
        db.commit()
        return {"success": True}
    return {"error": "Task not found"}

@router.get("/analytics")
def get_analytics(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    rejections = db.query(models.Rejection).filter(models.Rejection.user_id == current_user.id).all()
    
    # Simple Stage bottleneck
    stages = {}
    for r in rejections:
        s = r.rejection_stage or "Unknown"
        stages[s] = stages.get(s, 0) + 1
        
    bottleneck = max(stages.items(), key=lambda x: x[1])[0] if stages else "None"
    
    # Bug 4: Real peer benchmark query
    # We'll take the most recent company applied to as a reference, or aggregate all
    target_companies = [r.company_name for r in rejections if r.company_name]
    
    peer_cgpa = 8.4
    peer_projects = 3
    
    if target_companies:
        from sqlalchemy import func
        peer_stats = db.query(
            func.avg(models.PeerProfile.cgpa).label('avg_cgpa'),
            func.avg(models.PeerProfile.project_count).label('avg_projects')
        ).filter(
            models.PeerProfile.outcome == "Offer",
            models.PeerProfile.company_name.in_(target_companies)
        ).first()
        if peer_stats:
            if peer_stats.avg_cgpa is not None:
                peer_cgpa = float(peer_stats.avg_cgpa)
            if peer_stats.avg_projects is not None:
                peer_projects = int(peer_stats.avg_projects)
    
    return {
        "bottleneck_stage": bottleneck,
        "stage_distribution": stages,
        "peer_comparison": {
            "your_cgpa": current_user.cgpa or 0,
            "peer_cgpa": round(peer_cgpa, 1),
            "your_projects": current_user.project_count or 0,
            "peer_projects": peer_projects
        }
    }

class CustomTaskCreate(BaseModel):
    rejection_id: int
    title: str
    desc: str
    category: str = "Practice"

@router.post("/task")
def create_custom_task(
    task_data: CustomTaskCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Find maximum day_number to place the new task chronologically at the end
    max_task = db.query(models.RecoveryPlan).filter(
        models.RecoveryPlan.user_id == current_user.id,
        models.RecoveryPlan.rejection_id == task_data.rejection_id
    ).order_by(models.RecoveryPlan.day_number.desc()).first()
    
    new_day = (max_task.day_number + 1) if max_task else 1
    new_week = ((new_day - 1) // 7) + 1
    
    new_task = models.RecoveryPlan(
        user_id=current_user.id,
        rejection_id=task_data.rejection_id,
        day_number=new_day,
        week_number=new_week,
        task_title=task_data.title,
        task_desc=task_data.desc,
        category=task_data.category,
        priority="high"
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return {"success": True, "task_id": new_task.id}
