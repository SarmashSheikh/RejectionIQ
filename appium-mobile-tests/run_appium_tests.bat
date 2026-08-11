@echo off
echo =========================================================
echo   RejectionIQ - Appium Mobile Android E2E Test Suite
echo =========================================================
echo.

cd /d "%~dp0"
python appium_tester.py

echo.
echo Appium Mobile E2E Test Execution complete!
echo Report saved: Appium_Mobile_E2E_Test_Report_RejectionIQ.xlsx
pause
