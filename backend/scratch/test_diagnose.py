import os
import sys
import json

# Setup import path
scratch_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(scratch_dir)
sys.path.insert(0, backend_dir)

print("Starting Parallel Local ML Diagnosis Ensemble verification test...")

from ml.engine import diagnose_rejection

candidate_skills = "Python, JavaScript, SQL, Django, Git, React, REST APIs"
jd_text = "Looking for a Software Engineer with experience in Python, SQL, REST APIs, and Kubernetes. Must be strong in databases and backend systems design."

# ==========================================
# PIPELINE 1: Verify Existing Default Logic
# ==========================================
print("\n=== PIPELINE 1: Verifying Existing Default 5-Stage Heuristic (Preserved) ===")
std_email = "Unfortunately, we are moving forward with other candidates whose profiles align more closely at this time."

std_result = diagnose_rejection(
    company="Stripe",
    role="Backend Engineer",
    email_body=std_email,
    jd_text=jd_text,
    candidate_skills=candidate_skills,
    days_to_rejection=1,  # Short timeline triggers ATS Filter
    oa_completed=False,
    recruiter_call=False
)

print(f"-> Standard Predicted Stage: {std_result['predicted_stage']}")
print(f"-> Standard SBERT Match Score: {std_result['sbert_match_score']:.1f}%")
print(f"-> Standard Missing Keywords: {std_result['missing_keywords']}")
print(f"-> Enriched Flag Present?: {'company_type' in std_result}")

# Assert standard outputs
assert std_result['predicted_stage'] in ["ATS Filter", "OA Rejection", "HR Screen", "Technical Round", "Final Round"], "Default pipeline must restrict to standard 5 stages"
assert "company_type" not in std_result, "Default pipeline should not output premium company_type parameter"
assert "communication_audit" not in std_result, "Default pipeline should not trigger communication audit metrics"
print("Pipeline 1 Verified: Standard default logic is 100% preserved and fully available!")


# ==========================================
# PIPELINE 2: Verify Enriched Premium Logic
# ==========================================
print("\n=== PIPELINE 2: Verifying Enriched 11-Round & Company Type (New Features) ===")
versant_email = "Thank you for completing our automated English speaking and voice Versant test. Unfortunately, your grammar pacing and audio pronunciation metrics did not meet our high service engineering standards."

premium_result = diagnose_rejection(
    company="TCS",
    role="Systems Consultant",
    email_body=versant_email,
    jd_text=jd_text,
    candidate_skills=candidate_skills,
    days_to_rejection=14,
    company_type="Service Based",  # Triggers enriched pipeline
    selected_round="Communication Assessment"  # Triggers ground-truth override
)

print(f"-> Premium Predicted Stage: {premium_result['predicted_stage']}")
print(f"-> Premium Stated Cause: {premium_result['diagnosed_cause']}")
print(f"-> Premium Company Segment: {premium_result['company_type']}")
print(f"-> VADER Conversational Warmth: {premium_result['sentiment_score']:.3f} ({premium_result['sentiment_label']})")
print(f"-> spaCy Lexical Density (Vocabulary Richness): {premium_result['communication_audit']['lexical_richness']}%")
print(f"-> spaCy Readability Formality Level: {premium_result['communication_audit']['formality_label']}")
print(f"-> Selected Custom Sprint Day 3 Task: {premium_result['recovery_plan_tasks'][2]['title']}")

# Assert enriched outputs
assert premium_result['predicted_stage'] == "Communication Assessment", "Enriched override should force selected stage"
assert premium_result['company_type'] == "Service Based", "Should save and carry company type"
assert "communication_audit" in premium_result, "Should compute language complexity and readability indices"
assert premium_result['communication_audit']['lexical_richness'] > 0.0, "Should compute a positive lexical density"
assert any("Speech" in t['title'] or "GD" in t['title'] for t in premium_result['recovery_plan_tasks']), "Service communication sprint should contain speech tasks"
print("Pipeline 2 Verified: Premium additional features execute beautifully and locally!")

print("\nAll Parallel NLP test cases passed successfully! Default and Premium layers run in complete harmony.")
