import os

# Appium Mobile Testing Configuration
APPIUM_SERVER_URL = "http://localhost:4723"

# Android Desired Capabilities
DESIRED_CAPS = {
    "platformName": "Android",
    "automationName": "UiAutomator2",
    "deviceName": "Android Emulator",
    "appPackage": "com.rejectioniq.app",
    "appActivity": "com.rejectioniq.app.MainActivity",
    "noReset": True,
    "fullReset": False,
    "newCommandTimeout": 300,
    "autoGrantPermissions": True
}

# Workspace Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
WORKSPACE_DIR = os.path.dirname(BASE_DIR)
APK_PATH = os.path.join(WORKSPACE_DIR, "mobile-app", "android", "app", "build", "outputs", "apk", "debug", "app-debug.apk")
EXCEL_REPORT_PATH = os.path.join(WORKSPACE_DIR, "Appium_Mobile_E2E_Test_Report_RejectionIQ.xlsx")
LOCAL_EXCEL_REPORT_PATH = os.path.join(BASE_DIR, "Appium_Mobile_E2E_Test_Report_RejectionIQ.xlsx")

# Optional: Add APK path to capabilities if APK file exists
if os.path.exists(APK_PATH):
    DESIRED_CAPS["app"] = APK_PATH
