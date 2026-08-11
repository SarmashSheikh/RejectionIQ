@echo off
echo =========================================================
echo   RejectionIQ - Node.js Selenium Web E2E Test Suite
echo =========================================================
echo.

cd /d "%~dp0"
node selenium_tester.js

echo.
echo Node.js Selenium Web E2E Test Execution complete!
echo Report saved: Selenium_Web_E2E_Test_Report_RejectionIQ.xlsx
pause
