from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from database.database import get_db, SessionLocal
from database import models
from routes.auth import get_current_user
import schemas
from ml.engine import diagnose_rejection, score_gap, generate_recovery_plan
import datetime

router = APIRouter()

def process_rejection_background(rejection_id: int, user_id: int, data_dict: dict, resume_text: str):
    db = SessionLocal()
    try:
        rejection = db.query(models.Rejection).filter(models.Rejection.id == rejection_id).first()
        if not rejection:
            return

        user = db.query(models.User).filter(models.User.id == user_id).first()
        user_skills = ", ".join(user.skills) if user and user.skills else ""

        # 1. Calculate days
        days_to_rejection = 14
        if data_dict.get('application_date') and data_dict.get('rejection_date'):
            try:
                d1 = datetime.datetime.strptime(data_dict['application_date'], "%Y-%m-%d")
                d2 = datetime.datetime.strptime(data_dict['rejection_date'], "%Y-%m-%d")
                days_to_rejection = max((d2 - d1).days, 0)
            except Exception:
                pass

        # 2. Diagnose
        diagnosis = diagnose_rejection(
            company=rejection.company_name,
            role=rejection.role,
            email_body=data_dict.get('email_body') or "",
            jd_text=data_dict.get('jd_text') or "",
            candidate_skills=user_skills,
            days_to_rejection=days_to_rejection,
            oa_completed=data_dict.get('oa_completed', False),
            recruiter_call=data_dict.get('recruiter_call', False),
            hr_round=data_dict.get('hr_round', False),
            technical_round=data_dict.get('technical_round', False),
            company_type=data_dict.get('company_type'),
            selected_round=data_dict.get('selected_round')
        )

        rejection.company_type = data_dict.get('company_type')
        rejection.selected_round = data_dict.get('selected_round')
        rejection.days_to_rejection = days_to_rejection
        rejection.rejection_stage = diagnosis['predicted_stage']
        rejection.diagnosed_cause = diagnosis['ai_insight']
        rejection.confidence_score = float(diagnosis['stage_probabilities'][diagnosis['predicted_stage']])
        rejection.gap_score = float(diagnosis['sbert_match_score'])
        rejection.missing_keywords = diagnosis['missing_keywords']
        rejection.matching_keywords = diagnosis['present_keywords']
        rejection.diagnosis_data = diagnosis
        rejection.status = "completed"

        db.commit()

        # Generate recovery plan tasks (Non-breaking premium checklist overlay)
        if diagnosis.get('recovery_plan_tasks'):
            plan_tasks = diagnosis['recovery_plan_tasks']
        else:
            plan_tasks = []
            for idx, task_title in enumerate(diagnosis['recovery_priority']):
                plan_tasks.append({
                    "day": (idx * 5) + 1,
                    "week": 1,
                    "title": task_title[:195],
                    "desc": f"Primary recovery action targeting your {diagnosis['predicted_stage']} bottleneck.",
                    "category": "Practice" if "leetcode" in task_title.lower() or "practice" in task_title.lower() else "Resume"
                })
                
            for day in range(16, 31):
                if day % 5 == 0:
                    plan_tasks.append({
                        "day": day,
                        "week": (day // 7) + 1,
                        "title": "Continuous outreach & applications",
                        "desc": "Submit 2 optimized applications leveraging the newly adjusted resume keywords.",
                        "category": "Application"
                    })

        for task in plan_tasks:
            rp = models.RecoveryPlan(
                user_id=user_id,
                rejection_id=rejection.id,
                day_number=task['day'],
                week_number=task['week'],
                task_title=task['title'],
                task_desc=task['desc'],
                category=task['category']
            )
            db.add(rp)
        db.commit()

    except Exception as e:
        db.rollback()
        import traceback
        traceback.print_exc()
        rejection = db.query(models.Rejection).filter(models.Rejection.id == rejection_id).first()
        if rejection:
            rejection.status = "failed"
            db.commit()
    finally:
        db.close()


@router.post("/submit", response_model=schemas.RejectionResponse)
def submit_rejection(
    rejection_data: schemas.RejectionCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Initial save to DB
    new_rejection = models.Rejection(
        user_id=current_user.id,
        company_name=rejection_data.company_name,
        role=rejection_data.role,
        application_mode=rejection_data.application_mode,
        oa_completed=rejection_data.oa_completed,
        recruiter_call=rejection_data.recruiter_call,
        technical_round=rejection_data.technical_round,
        hr_round=rejection_data.hr_round,
        email_body=rejection_data.email_body,
        jd_text=rejection_data.jd_text,
        company_type=rejection_data.company_type,
        selected_round=rejection_data.selected_round,
        status="processing"
    )
    
    current_user.total_rejections = (current_user.total_rejections or 0) + 1
    db.add(new_rejection)
    db.commit()
    db.refresh(new_rejection)

    # Queue background processing
    data_dict = rejection_data.dict()
    data_dict['cgpa'] = current_user.cgpa or 0.0
    data_dict['internship_count'] = current_user.internship_count or 0
    
    background_tasks.add_task(
        process_rejection_background,
        rejection_id=new_rejection.id,
        user_id=current_user.id,
        data_dict=data_dict,
        resume_text=current_user.resume_text
    )

    return new_rejection


@router.get("/{rejection_id}/status")
def get_rejection_status(
    rejection_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    rejection = db.query(models.Rejection).filter(
        models.Rejection.id == rejection_id,
        models.Rejection.user_id == current_user.id
    ).first()
    
    if not rejection:
        raise HTTPException(status_code=404, detail="Rejection not found")
        
    res = {
        "id": rejection.id,
        "status": rejection.status,
        "company_name": rejection.company_name,
        "role": rejection.role,
        "rejection_stage": rejection.rejection_stage,
        "diagnosed_cause": rejection.diagnosed_cause,
        "confidence_score": rejection.confidence_score,
        "gap_score": rejection.gap_score,
        "missing_keywords": rejection.missing_keywords,
        "matching_keywords": rejection.matching_keywords or []
    }
    
    if rejection.diagnosis_data:
        # Merge all rich keys from diagnosis_data directly to the root for ease of use in frontend
        for k, v in rejection.diagnosis_data.items():
            if k not in res:
                res[k] = v
        res["diagnosis_data"] = rejection.diagnosis_data
        
    # Query successful peers (Offer) at this specific company dynamically
    peers = db.query(models.PeerProfile).filter(
        models.PeerProfile.company_name.ilike(rejection.company_name),
        models.PeerProfile.outcome == "Offer"
    ).all()
    
    if not peers:
        # Fallback to general company type or default benchmarks
        is_service = "service" in (rejection.company_type or "").lower() or rejection.company_name.lower() in ["tcs", "infosys", "cognizant", "wipro", "capgemini", "accenture", "cognizent"]
        is_startup = "start" in (rejection.company_type or "").lower()
        
        if is_service:
            avg_cgpa = 7.8
            avg_internships = 1.2
            top_skills = ["Spring Boot", "REST APIs", "Agile"]
        elif is_startup:
            avg_cgpa = 7.5
            avg_internships = 1.5
            top_skills = ["React", "Node.js", "Git"]
        else: # Product Based default
            avg_cgpa = 8.5
            avg_internships = 2.0
            top_skills = ["Python", "DSA", "System Design"]
    else:
        avg_cgpa = sum(p.cgpa or 0 for p in peers) / len(peers)
        avg_cgpa = round(avg_cgpa, 1) if avg_cgpa > 0 else 7.8
        
        avg_internships = sum(p.internship_count or 0 for p in peers) / len(peers)
        avg_internships = round(avg_internships, 1) if avg_internships > 0 else 1.2
        
        # Skills aggregation
        all_skills = []
        for p in peers:
            if p.skills:
                all_skills.extend(p.skills)
        from collections import Counter
        top_skills = [k for k, v in Counter(all_skills).most_common(3)]
        if not top_skills:
            top_skills = ["Spring Boot", "REST APIs", "Agile"]

    res["peer_benchmarks"] = {
        "avg_cgpa": avg_cgpa,
        "avg_internships": avg_internships,
        "top_skills": top_skills,
        "user_cgpa": current_user.cgpa or None
    }
        
    return res



@router.get("/", response_model=list[schemas.RejectionListItem])
def get_all_rejections(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Returns all rejections for the current user, newest first."""
    rejections = (
        db.query(models.Rejection)
        .filter(models.Rejection.user_id == current_user.id)
        .order_by(models.Rejection.created_at.desc())
        .all()
    )
    return rejections


@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    import datetime
    from sqlalchemy import func

    rejections = db.query(models.Rejection).filter(models.Rejection.user_id == current_user.id).all()
    tasks_done = db.query(models.RecoveryPlan).filter(
        models.RecoveryPlan.user_id == current_user.id,
        models.RecoveryPlan.completed == True
    ).count()
    tasks_total = db.query(models.RecoveryPlan).filter(
        models.RecoveryPlan.user_id == current_user.id
    ).count()

    interviews = sum(1 for r in rejections if r.hr_round or r.technical_round)

    # 1. DYNAMIC ACTIVE STREAK CALCULATION
    active_dates = set()
    
    # Track mood log activity
    r_logs = db.query(models.ResilienceLog.logged_at).filter(models.ResilienceLog.user_id == current_user.id).all()
    for rl in r_logs:
        if rl[0]:
            active_dates.add(rl[0].date())
            
    # Track rejection logging activity
    rejections_dates = db.query(models.Rejection.created_at, models.Rejection.rejection_date).filter(models.Rejection.user_id == current_user.id).all()
    for rd in rejections_dates:
        if rd[0]:
            active_dates.add(rd[0].date())
        if rd[1]:
            active_dates.add(rd[1])
            
    # Track recovery plan completion activity
    rp_dates = db.query(models.RecoveryPlan.completed_at).filter(models.RecoveryPlan.user_id == current_user.id, models.RecoveryPlan.completed == True).all()
    for rpd in rp_dates:
        if rpd[0]:
            active_dates.add(rpd[0].date())

    # Add user profile creation date as base
    if current_user.created_at:
        active_dates.add(current_user.created_at.date())

    streak = 0
    today = datetime.date.today()
    yesterday = today - datetime.timedelta(days=1)
    
    start_date = None
    if today in active_dates:
        start_date = today
    elif yesterday in active_dates:
        start_date = yesterday
        
    if start_date:
        streak = 1
        current_date = start_date - datetime.timedelta(days=1)
        while current_date in active_dates:
            streak += 1
            current_date -= datetime.timedelta(days=1)

    # Persist the calculated streak to user
    current_user.streak_count = streak

    # 2. DYNAMIC RESILIENCE SCORE CALCULATION
    task_rate = (tasks_done / tasks_total * 100) if tasks_total > 0 else 0
    avg_mood = db.query(func.avg(models.ResilienceLog.mood_score)).filter(models.ResilienceLog.user_id == current_user.id).scalar()
    avg_mood_score = float(avg_mood) * 10 if avg_mood else 70.0  # Scale mood to 0-100

    # Composite resilience logic: 40% task completion, 30% habit streak, 30% mood stability
    resilience_score = (task_rate * 0.4) + min(streak * 5.0, 30.0) + (avg_mood_score * 0.3)
    resilience_score = max(min(round(resilience_score), 100), 10)
    
    # Save resilience out of 10
    current_user.resilience_score = round(resilience_score / 10, 1)
    db.commit()

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

    # 4. ACTIVE SPRINT PROGRESS
    latest_rejection = db.query(models.Rejection).filter(models.Rejection.user_id == current_user.id).order_by(models.Rejection.created_at.desc()).first()
    sprint_progress = 0
    if latest_rejection:
        s_total = db.query(models.RecoveryPlan).filter(models.RecoveryPlan.rejection_id == latest_rejection.id).count()
        s_done = db.query(models.RecoveryPlan).filter(models.RecoveryPlan.rejection_id == latest_rejection.id, models.RecoveryPlan.completed == True).count()
        sprint_progress = round((s_done / s_total) * 100) if s_total > 0 else 0

    # 5. 7-DAY ACTIVITY MATRIX
    activity_logs = []
    for d in range(6, -1, -1):
        target_date = today - datetime.timedelta(days=d)
        activity_logs.append(target_date in active_dates)

    # 6. TODAY'S LATEST MOOD TEXT
    latest_log = db.query(models.ResilienceLog).filter(models.ResilienceLog.user_id == current_user.id).order_by(models.ResilienceLog.logged_at.desc()).first()
    today_mood_label = "N/A"
    if latest_log:
        if latest_log.mood_score >= 8: today_mood_label = "Excellent"
        elif latest_log.mood_score >= 6: today_mood_label = "Good"
        elif latest_log.mood_score >= 4: today_mood_label = "Average"
        else: today_mood_label = "Low"

    # Query logged milestones (cracked offers) to increment total applied applications
    milestones_count = db.query(models.Milestone).filter(models.Milestone.user_id == current_user.id).count()

    return {
        "total_rejections": total_rejections,
        "interviews_reached": interviews,
        "tasks_done": tasks_done,
        "tasks_total": tasks_total,
        "total_applied": total_rejections + interviews + milestones_count,
        "rebound_streak": streak,
        "resilience_score": int(resilience_score),
        "task_rate": int(task_rate),
        "today_mood": today_mood_label,
        "rejection_funnel": rejection_funnel,
        "sprint_progress": sprint_progress,
        "activity_logs": activity_logs,
        "recent": [
            {
                "id": r.id,
                "company": r.company_name,
                "role": r.role,
                "stage": r.rejection_stage,
                "confidence": r.confidence_score
            }
            for r in rejections[-5:]
        ]
    }



@router.get("/summary")
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Feature 10: Returns total rejections, stage distribution, last 5 rejections, recovery progress, and streak count."""
    rejections = db.query(models.Rejection).filter(models.Rejection.user_id == current_user.id).all()
    
    # Stage distribution
    stages = {}
    for r in rejections:
        s = r.rejection_stage or "Unknown"
        stages[s] = stages.get(s, 0) + 1
        
    # Last 5 rejections
    recent = (
        db.query(models.Rejection)
        .filter(models.Rejection.user_id == current_user.id)
        .order_by(models.Rejection.created_at.desc())
        .limit(5)
        .all()
    )
    
    # Recovery progress
    tasks_done = db.query(models.RecoveryPlan).filter(
        models.RecoveryPlan.user_id == current_user.id,
        models.RecoveryPlan.completed == True
    ).count()
    tasks_total = db.query(models.RecoveryPlan).filter(
        models.RecoveryPlan.user_id == current_user.id
    ).count()
    
    recovery_progress = (tasks_done / tasks_total * 100) if tasks_total > 0 else 0
    
    return {
        "total_rejections": len(rejections),
        "stage_distribution": stages,
        "recent_rejections": [
            {
                "id": r.id,
                "company": r.company_name,
                "role": r.role,
                "stage": r.rejection_stage,
                "date": r.created_at.strftime("%Y-%m-%d") if r.created_at else None
            }
            for r in recent
        ],
        "recovery_progress": round(recovery_progress, 1),
        "streak_count": current_user.streak_count or 0
    }


@router.delete("/{rejection_id}")
def delete_rejection(
    rejection_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    rejection = db.query(models.Rejection).filter(
        models.Rejection.id == rejection_id,
        models.Rejection.user_id == current_user.id
    ).first()

    if not rejection:
        raise HTTPException(status_code=404, detail="Rejection not found")

    db.delete(rejection)
    current_user.total_rejections = max((current_user.total_rejections or 1) - 1, 0)
    db.commit()
    return {"success": True}


@router.post("/crack")
def log_successful_offer(
    crack_data: dict,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Logs a successful job offer / cracked job, creating an offer milestone."""
    company = crack_data.get("company_name", "Dream Company")
    role = crack_data.get("role", "Software Engineer")
    salary = crack_data.get("salary", "Competitive")
    notes = crack_data.get("notes", "Job Cracked Successfully!")
    
    # 1. Create a Milestone
    milestone = models.Milestone(
        user_id=current_user.id,
        title=f"Cracked {company}! 🎉",
        description=f"Offered {role} role with {salary} package! Notes: {notes}",
        badge_icon="Award"
    )
    db.add(milestone)
    
    # 2. Add to successful peer profiles to help other candidates dynamically
    peer_profile = models.PeerProfile(
        company_name=company,
        role=role,
        outcome="Offer",
        cgpa=current_user.cgpa or 7.8,
        internship_count=current_user.internship_count or 1,
        project_count=current_user.project_count or 2,
        skills=current_user.skills or ["Python", "Java", "React"],
        source="user_logged"
    )
    db.add(peer_profile)
    
    # 3. Create a notification
    notification = models.Notification(
        user_id=current_user.id,
        type="success",
        title="Congratulations! 🥳",
        message=f"You successfully cracked {company} as a {role}! Your resilience has paid off!"
    )
    db.add(notification)
    
    db.commit()
    return {"success": True, "message": f"Successfully logged your offer at {company}!"}


@router.get("/milestones")
def get_user_milestones(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Retrieves all achievements/milestones for the logged in user."""
    milestones = (
        db.query(models.Milestone)
        .filter(models.Milestone.user_id == current_user.id)
        .order_by(models.Milestone.achieved_at.desc())
        .all()
    )
    return milestones
