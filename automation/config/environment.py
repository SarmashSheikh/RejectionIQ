import os

class Environment:
    ENV_NAME = os.getenv("TEST_ENV", "staging")
    BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:8000")
    API_TIMEOUT = int(os.getenv("API_TIMEOUT", "10"))
    MAX_RETRIES = int(os.getenv("MAX_RETRIES", "2"))
    PARALLEL_WORKERS = int(os.getenv("PARALLEL_WORKERS", "4"))
    SIMULATED_MODE_FALLBACK = os.getenv("SIMULATED_MODE_FALLBACK", "true").lower() == "true"
