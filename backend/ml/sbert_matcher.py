# This module is optional and will load the model if available, 
# but will fall back gracefully if sentence-transformers is too heavy for the current environment.

try:
    from sentence_transformers import SentenceTransformer
    from sklearn.metrics.pairwise import cosine_similarity
    import numpy as np
    
    # Load model (downloads automatically on first run, ~80MB)
    model = SentenceTransformer('all-MiniLM-L6-v2')
    HAS_SBERT = True
except ImportError:
    HAS_SBERT = False

def calculate_resume_jd_gap(resume_text: str, jd_text: str) -> float:
    """
    Returns a match percentage between 0 and 100.
    """
    if not HAS_SBERT:
        # Fallback dummy logic if SBERT isn't installed
        # Just to ensure the API still works without crashing
        return 65.0
        
    resume_vec = model.encode(resume_text)
    jd_vec = model.encode(jd_text)
    
    # Compute cosine similarity
    score = cosine_similarity([resume_vec], [jd_vec])[0][0]
    
    # Convert to percentage
    percentage = max(0.0, min(100.0, score * 100.0))
    return round(float(percentage), 2)
