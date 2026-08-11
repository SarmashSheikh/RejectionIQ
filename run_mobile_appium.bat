@echo off
echo =========================================================
echo   RejectionIQ - Launching Appium Mobile E2E Tests
echo =========================================================
echo.

python appium-mobile-tests/appium_tester.py

echo.
echo Test Execution finished. Opening Excel Report...
if exist "Appium_Mobile_E2E_Test_Report_RejectionIQ.xlsx" (
    start "" "Appium_Mobile_E2E_Test_Report_RejectionIQ.xlsx"
)
pause
