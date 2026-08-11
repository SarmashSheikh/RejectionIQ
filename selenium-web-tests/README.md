# RejectionIQ - Node.js Selenium Web E2E Automation Test Suite

This directory (`selenium-web-tests/`) contains the complete **Node.js Selenium Web End-to-End (E2E) Test Suite** for the **RejectionIQ Web Application**.

---

## 🌐 Features & Modules Covered

The suite executes **90 automated E2E test cases** spanning **8 core web modules**:

1. **Landing & Public Pages** (`TC_WEB_001` - `TC_WEB_010`): Hero section, CTA buttons, feature grid cards, sample diagnosis preview, testimonial carousel, responsive mobile drawer.
2. **Web Authentication & Security** (`TC_WEB_011` - `TC_WEB_025`): Login UI elements, Gmail domain validation, empty field toasts, wrong credentials handling, password visibility toggle, signup flow, 6-digit OTP verification.
3. **Web Onboarding & Setup** (`TC_WEB_026` - `TC_WEB_035`): Profile details, CGPA bounds validation, resume drag & drop upload, skill tag chips, custom skills, target company multi-select cards.
4. **Web Dashboard & Core Metrics** (`TC_WEB_036` - `TC_WEB_045`): Header greeting, Resilience Score gauge, streak counter, quick action buttons, recent rejections feed, target match percentage.
5. **Rejection Submission & AI Diagnosis** (`TC_WEB_046` - `TC_WEB_060`): New rejection form, stage selector dropdown, interview feedback notes, AI diagnosis loading animation, root cause classification, weakness breakdown scores, recommended action plan items.
6. **Recovery Sprint & Roadmap** (`TC_WEB_061` - `TC_WEB_070`): 7-Day recovery roadmap timeline, task completion checkboxes, progress percentage, custom task creation, celebration reward modal.
7. **Web Analytics & Intelligence** (`TC_WEB_071` - `TC_WEB_080`): Rejection stage donut chart, company type breakdown, skill gap vulnerability list, time period filter, peer benchmark.
8. **Profile & Settings** (`TC_WEB_081` - `TC_WEB_090`): Profile information card, edit profile info, edit target companies, theme mode, password change, user sign out.

---

## 🚀 How to Run the Node.js Selenium Web Tests

### 1. Simple Command Line Execution
From the root project folder or inside `selenium-web-tests/`, run:

```bash
node selenium-web-tests/selenium_tester.js
```

Or execute via Windows Batch file:
```cmd
run_web_selenium.bat
```

---

## 📊 Excel Analysis Report Generation

Upon execution, the suite automatically generates a styled Excel analysis report:
- **Workspace File**: `Selenium_Web_E2E_Test_Report_RejectionIQ.xlsx`
- **Local Folder File**: `selenium-web-tests/Selenium_Web_E2E_Test_Report_RejectionIQ.xlsx`

### Report Worksheets:
1. **Executive Dashboard**: KPI summary cards (Total Tests, Passed, Failed, Pass Rate %) and a formatted Module Breakdown Table with color fills.
2. **Detailed Web Test Log**: Granular log of all 90 test cases with Step-by-Step execution details, Expected Results, Actual Results, Status, and Execution Durations (ms).
