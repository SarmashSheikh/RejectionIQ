@echo off
echo =========================================================
echo   RejectionIQ - Launching Node.js Selenium Web E2E Tests
echo =========================================================
echo.

node selenium-web-tests/selenium_tester.js

echo.
echo Test Execution finished. Opening Excel Report...
if exist "Selenium_Web_E2E_Test_Report_RejectionIQ.xlsx" (
    start "" "Selenium_Web_E2E_Test_Report_RejectionIQ.xlsx"
)
pause
