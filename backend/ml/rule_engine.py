def diagnose_rejection(email_body: str, days_to_rejection: int, oa_completed: bool, recruiter_call: bool):
    """
    Rule-based diagnosis engine that avoids relying on external ML APIs.
    Classifies rejection stage based on application timeline and signals.
    """
    
    # Check for keywords in email body to boost confidence (simple NLP)
    body_lower = email_body.lower()
    volume_keywords = ["large volume", "many applications", "competitive process", "high volume"]
    has_volume_lang = any(word in body_lower for word in volume_keywords)
    
    # Rule 1 — ATS Filter
    if days_to_rejection <= 3 and not oa_completed and not recruiter_call:
        confidence = 92 if has_volume_lang else 85
        return {
            "stage": "ATS Filter",
            "confidence": confidence,
            "cause": "Resume keywords did not match job description. Likely rejected by automated screening.",
            "fix": "Add missing keywords from JD to your resume"
        }

    # Rule 2 — OA Rejection
    if oa_completed and not recruiter_call:
        return {
            "stage": "Online Assessment Rejection",
            "confidence": 88,
            "cause": "OA score fell below company cutoff threshold.",
            "fix": "Practice more DSA problems on LeetCode"
        }

    # Rule 3 — HR Screen Rejection
    if recruiter_call and days_to_rejection <= 14:
        return {
            "stage": "HR Screen Rejection",
            "confidence": 80,
            "cause": "Basic eligibility criteria or salary expectations not met during HR screening.",
            "fix": "Review basic requirements and communicate expectations clearly"
        }

    # Rule 4 — Technical Round Rejection
    if recruiter_call and days_to_rejection > 14 and days_to_rejection <= 30:
        return {
            "stage": "Technical Round Rejection",
            "confidence": 78,
            "cause": "Technical skills gap identified during interview rounds.",
            "fix": "Strengthen DSA, system design, and core subject knowledge"
        }

    # Rule 5 — Final Round Rejection
    if days_to_rejection > 30:
        return {
            "stage": "Final Round Rejection",
            "confidence": 75,
            "cause": "Cultural fit or leadership assessment below expectations, or another candidate was slightly stronger.",
            "fix": "Practice behavioural interviews and improve communication clarity"
        }
    
    # Fallback
    return {
        "stage": "Unknown/Generic Rejection",
        "confidence": 50,
        "cause": "Insufficient timeline data to determine exact rejection stage.",
        "fix": "Focus on overall profile building and applying to well-matched roles."
    }

def generate_recovery_plan(stage: str):
    plans = {
        "ATS Filter": [
            "Day 1-3: Identify 3 target roles and collect their Job Descriptions.",
            "Day 4-7: Extract top missing keywords and add to your resume bullet points.",
            "Day 8-14: Reformat resume to a single-column, ATS-friendly template.",
            "Day 15-30: Apply to 10 similar roles with the optimized resume."
        ],
        "Online Assessment Rejection": [
            "Day 1-3: Note down the exact topics asked in the OA (e.g. DP, Graphs).",
            "Day 4-14: Practice 20 targeted LeetCode problems in those weak areas.",
            "Day 15-21: Take 2 timed mock assessments on HackerRank.",
            "Day 22-30: Apply to companies with known OA patterns and re-test."
        ],
        "HR Screen Rejection": [
            "Day 1-3: Review your 30-second elevator pitch.",
            "Day 4-7: Practice answering standard behavioral questions (strengths, weakness).",
            "Day 8-14: Align your salary expectations with market standards.",
            "Day 15-30: Schedule 2 mock HR interviews with peers or mentors."
        ],
        "Technical Round Rejection": [
            "Day 1-3: Write down all questions you couldn't answer in the interview.",
            "Day 4-14: Deep dive into core CS fundamentals (OS, DBMS, Networks).",
            "Day 15-21: Do 3 mock technical interviews on Pramp or with seniors.",
            "Day 22-30: Build 1 small project demonstrating the missing technical skill."
        ],
        "Final Round Rejection": [
            "Day 1-3: Read about the STAR method for behavioral interviews.",
            "Day 4-14: Write out 5 stories covering leadership, conflict, and failure.",
            "Day 15-21: Research company culture and values for your next targets.",
            "Day 22-30: Continue applying; you are very close to an offer."
        ]
    }
    return plans.get(stage, plans["ATS Filter"])
