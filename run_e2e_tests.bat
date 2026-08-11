@echo off
echo ===================================================
echo Running RejectionIQ E2E Test Suite (100+ Test Cases)
echo ===================================================
echo.
cd /d "c:\Users\sharmash vali\OneDrive\Attachments\Documents\Desktop\RejectionIQ"
call .\backend\venv\Scripts\activate
python e2e_tester.py
echo.
echo ===================================================
echo Done! Excel report is generated at:
echo E2E_Test_Report_RejectionIQ.xlsx
echo ===================================================
pause
