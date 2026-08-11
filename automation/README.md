# RejectionIQ - Enterprise Android Appium E2E Automation Framework & CI/CD Pipeline

This repository directory (`automation/`) contains the enterprise-grade **Android Appium Mobile E2E Automation Framework**, **21-Stage GitHub Actions CI/CD Pipeline**, and **GitHub Pages Reporting Engine**.

---

## 📱 Framework Architecture (`automation/`)

```
automation/
├── config/
│   ├── appium_config.py          # Capabilities, server URL, timeouts, paths
│   └── environment.py            # Environment flags & runtime parameters
├── drivers/
│   └── driver_factory.py         # Appium Driver Manager (UiAutomator2 + Simulated Engine)
├── pages/                        # Page Object Model (POM) Classes
│   ├── base_page.py              # Base Page Object with element interaction utilities
│   ├── auth_page.py              # Authentication POM
│   ├── onboarding_page.py        # Setup wizard POM
│   ├── dashboard_page.py         # Dashboard metrics POM
│   ├── rejection_page.py         # AI Diagnosis POM
│   ├── recovery_page.py          # Recovery Sprint POM
│   ├── analytics_page.py         # Analytics POM
│   └── profile_page.py           # Profile & Settings POM
├── tests/                        # 420 Executable Test Cases Repository
│   └── test_repository.py       # 420 E2E Test Cases across 20 Modules
├── data/
│   └── test_data.json            # Data fixtures & payload providers
├── utils/                        # Reporting & Utility Suite
│   ├── excel_generator.py        # 4 Excel reports generator
│   ├── html_generator.py         # Responsive HTML reports generator
│   ├── json_generator.py         # execution-results.json builder
│   ├── markdown_generator.py     # summary.md GitHub Step Summary builder
│   ├── screenshot_util.py        # Failure screenshot capturer
│   └── logger_util.py            # Framework logger
├── listeners/
│   └── test_listener.py          # Retry & execution listener
├── runners/
│   └── test_runner.py            # Main runner executing 420 Test Cases
└── reports/                      # Output directory for all generated reports & artifacts
    ├── Excel/                    # Automation_Test_Report.xlsx, Passed/Failed/Summary
    ├── HTML/                     # execution-report.html, dashboard.html, trends.html
    ├── JSON/                     # execution-results.json
    ├── Screenshots/              # Failure screenshots
    ├── Logs/                     # Execution logs
    └── Summary/                  # summary.md
```

---

## 🎯 Test Case Distribution (420 Executable Test Cases)

- **Authentication**: 40 Test Cases (`TC_AUTH_001` - `TC_AUTH_040`)
- **Authorization**: 30 Test Cases (`TC_AUTHZ_001` - `TC_AUTHZ_030`)
- **Registration**: 20 Test Cases (`TC_REG_001` - `TC_REG_020`)
- **Profile Management**: 20 Test Cases (`TC_PROF_001` - `TC_PROF_020`)
- **Navigation**: 30 Test Cases (`TC_NAV_001` - `TC_NAV_030`)
- **Dashboard**: 20 Test Cases (`TC_DASH_001` - `TC_DASH_020`)
- **Forms**: 40 Test Cases (`TC_FORM_001` - `TC_FORM_040`)
- **CRUD Operations**: 40 Test Cases (`TC_CRUD_001` - `TC_CRUD_040`)
- **Search**: 20 Test Cases (`TC_SRCH_001` - `TC_SRCH_020`)
- **Filters**: 20 Test Cases (`TC_FLTR_001` - `TC_FLTR_020`)
- **Input Validation**: 40 Test Cases (`TC_VAL_001` - `TC_VAL_040`)
- **Error Handling**: 20 Test Cases (`TC_ERR_001` - `TC_ERR_020`)
- **Session Management**: 20 Test Cases (`TC_SESS_001` - `TC_SESS_020`)
- **Notifications**: 20 Test Cases (`TC_NOTIF_001` - `TC_NOTIF_020`)
- **File Upload**: 20 Test Cases (`TC_FILE_001` - `TC_FILE_020`)
- **Offline Handling**: 10 Test Cases (`TC_OFF_001` - `TC_OFF_010`)
- **Accessibility**: 20 Test Cases (`TC_ACC_001` - `TC_ACC_020`)
- **Responsive UI**: 10 Test Cases (`TC_RESP_001` - `TC_RESP_010`)
- **Performance Smoke Tests**: 20 Test Cases (`TC_PERF_001` - `TC_PERF_020`)
- **Regression Suite**: 50 Test Cases (`TC_REGRESS_001` - `TC_REGRESS_050`)
- **TOTAL**: **420 EXECUTABLE TEST CASES**

---

## ⚙️ 21-Stage CI/CD Pipeline Order (`.github/workflows/android-e2e.yml`)

1. Stage 1: Checkout Repository
2. Stage 2: Setup Java JDK 17
3. Stage 3: Setup Android SDK
4. Stage 4: Install Android Dependencies
5. Stage 5: Build Debug APK (`./gradlew assembleDebug`)
6. Stage 6: Start Android Emulator (`reactivecircus/android-emulator-runner@v2`)
7. Stage 7: Verify Emulator Readiness (`adb wait-for-device`)
8. Stage 8: Install APK (`adb install`)
9. Stage 9: Start Appium Server (`appium &`)
10. Stage 10: Verify Appium Health (`/status`)
11. Stage 11: Execute Appium 420+ E2E Test Suite (`python automation/runners/test_runner.py`)
12. Stage 12: Capture Screenshots
13. Stage 13: Capture Device Logs (`adb logcat`)
14. Stage 14: Generate Excel Reports (`Automation_Test_Report.xlsx`, `Passed_Test_Cases.xlsx`, `Failed_Test_Cases.xlsx`, `Execution_Summary.xlsx`)
15. Stage 15: Generate HTML Reports (`execution-report.html`, `dashboard.html`, `trends.html`)
16. Stage 16: Generate JSON Report (`execution-results.json`)
17. Stage 17: Generate Markdown Summary (`summary.md`)
18. Stage 18: Upload Artifacts (`actions/upload-artifact@v4` with 30-day retention)
19. Stage 19: Publish Reports to GitHub Pages (`gh-pages` deployment into `/reports/latest/`)
20. Stage 20: Archive Execution History (`gh-pages` deployment into `/reports/history/build-N/`)
21. Stage 21: Publish GitHub Action Summary (`$GITHUB_STEP_SUMMARY`)

---

## 🌐 Live GitHub Pages Report URL

After pushing to `main`, GitHub Actions automatically publishes reports to:
- **Latest Report**: `https://<github-username>.github.io/<repository-name>/reports/latest/execution-report.html`
- **Dashboard**: `https://<github-username>.github.io/<repository-name>/reports/latest/dashboard.html`
- **Build History**: `https://<github-username>.github.io/<repository-name>/reports/history/build-N/execution-report.html`

---

## 🚀 Local Execution Guide

Run from terminal:
```cmd
python automation/runners/test_runner.py
```
Or double-click:
```cmd
run_automation.bat
```
