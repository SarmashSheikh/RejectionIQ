import os

class Environment:
    BASE_URL = os.getenv("BASE_URL", "https://SarmashSheikh.github.io/RejectionIQ/").rstrip('/') + '/'
    BROWSER = os.getenv("BROWSER", "chrome")
    HEADLESS = os.getenv("HEADLESS", "true").lower() == "true"
    EXPLICIT_WAIT_TIMEOUT = int(os.getenv("EXPLICIT_WAIT_TIMEOUT", "15"))
    MAX_RETRIES = int(os.getenv("MAX_RETRIES", "2"))
