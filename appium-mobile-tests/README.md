# RejectionIQ - Appium Mobile E2E Automation Test Suite

This directory (`appium-mobile-tests/`) contains the complete **Appium Mobile End-to-End (E2E) Test Suite** for the **RejectionIQ Android Application**.

---

## 📱 Features & Modules Covered

The suite executes **80 automated E2E test cases** spanning **7 core mobile modules**:

1. **Mobile Authentication & Security** (`TC_MOB_001` - `TC_MOB_015`): Login UI, Gmail domain validation, empty field toasts, password visibility toggles, registration flow, 6-digit OTP verification screen.
2. **Mobile Onboarding** (`TC_MOB_016` - `TC_MOB_025`): Profile details, CGPA range validation, Skill tag selection chips, custom skill additions, target company multi-select cards.
3. **Mobile Dashboard & Metrics** (`TC_MOB_026` - `TC_MOB_035`): Mobile header, Resilience Score radial gauge, Daily Streak counter, recent rejections feed, pull-to-refresh gestures, bottom navigation tab bar.
4. **Mobile Rejection Submission & AI Diagnosis** (`TC_MOB_036` - `TC_MOB_050`): New rejection log form, AI diagnosis calculation, root cause classification, weakness breakdown scores, recommended action plan items.
5. **Mobile Recovery Sprint & Roadmap** (`TC_MOB_051` - `TC_MOB_060`): 7-Day recovery roadmap timeline, daily task completion checkboxes, percentage progress bar updates, custom task additions, celebration rewards.
6. **Mobile Analytics & Intelligence** (`TC_MOB_061` - `TC_MOB_070`): Stage distribution donut chart, company type breakdown, skill gap vulnerability list, time period filtering, export analytics.
7. **Mobile Profile & Settings** (`TC_MOB_071` - `TC_MOB_080`): Profile info card, edit profile details, edit target companies, dark/light theme mode, password change, user logout.

---

## 🚀 How to Run the Appium Mobile Tests

### 1. Simple Command Line Execution
From the root project folder or inside `appium-mobile-tests/`, run:

```bash
python appium-mobile-tests/appium_tester.py
```

Or execute via Windows Batch file:
```cmd
run_mobile_appium.bat
```

### 2. Live Appium Server & Android Device Execution
To run against a live Android Emulator or physical Android device:
1. Start Appium Server:
   ```bash
   appium --port 4723
   ```
2. Launch your Android Emulator or connect a physical device via ADB (`adb devices`).
3. Run `python appium-mobile-tests/appium_tester.py`. The suite automatically detects Appium Server at `http://localhost:4723` and connects via `UiAutomator2`.

> **Note**: If Appium server or an Android device is offline, the suite automatically falls back to **Simulated Mobile Driver Mode**, ensuring all E2E test scenarios complete and output the full Excel report.

---

## 📊 Excel Analysis Report Generation

Upon execution, the suite automatically generates a styled Excel report:
- **Workspace File**: `Appium_Mobile_E2E_Test_Report_RejectionIQ.xlsx`
- **Local Folder File**: `appium-mobile-tests/Appium_Mobile_E2E_Test_Report_RejectionIQ.xlsx`

### Report Structure:
1. **Executive Dashboard Sheet**: High-level KPI summary cards (Total Tests, Passed, Failed, Pass Rate %), Module breakdown table with color-coded pass/fail indicators.
2. **Detailed Test Log Sheet**: Granular log of all 80 test cases including Test ID, Module, Scenario, Step-by-Step execution details, Expected Results, Actual Results, Status, and Execution Durations (ms).
