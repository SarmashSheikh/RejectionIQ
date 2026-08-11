import os

# Enterprise Appium Configuration
APPIUM_SERVER_URL = os.getenv("APPIUM_SERVER_URL", "http://127.0.0.1:4723")
APPIUM_COMMAND_TIMEOUT = int(os.getenv("APPIUM_COMMAND_TIMEOUT", "300"))

# Android Capabilities
DESIRED_CAPABILITIES = {
    "platformName": "Android",
    "automationName": "UiAutomator2",
    "deviceName": os.getenv("ANDROID_DEVICE_NAME", "Android Emulator"),
    "appPackage": "com.rejectioniq.app",
    "appActivity": "com.rejectioniq.app.MainActivity",
    "noReset": True,
    "fullReset": False,
    "newCommandTimeout": APPIUM_COMMAND_TIMEOUT,
    "autoGrantPermissions": True,
    "isHeadless": os.getenv("HEADLESS_MODE", "false").lower() == "true"
}

# Workspace Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WORKSPACE_DIR = os.path.dirname(BASE_DIR)
APK_PATH = os.path.join(WORKSPACE_DIR, "mobile-app", "android", "app", "build", "outputs", "apk", "debug", "app-debug.apk")

if os.path.exists(APK_PATH):
    DESIRED_CAPABILITIES["app"] = APK_PATH

# Output Paths
REPORTS_DIR = os.path.join(BASE_DIR, "reports")
SCREENSHOTS_DIR = os.path.join(REPORTS_DIR, "Screenshots")
LOGS_DIR = os.path.join(REPORTS_DIR, "Logs")
EXCEL_DIR = os.path.join(REPORTS_DIR, "Excel")
HTML_DIR = os.path.join(REPORTS_DIR, "HTML")
JSON_DIR = os.path.join(REPORTS_DIR, "JSON")
SUMMARY_DIR = os.path.join(REPORTS_DIR, "Summary")

# Ensure required directories exist
for d in [REPORTS_DIR, SCREENSHOTS_DIR, LOGS_DIR, EXCEL_DIR, HTML_DIR, JSON_DIR, SUMMARY_DIR]:
    os.makedirs(d, exist_ok=True)
