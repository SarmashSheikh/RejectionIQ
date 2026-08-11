@echo off
echo ================================================================
echo   RejectionIQ - 21-Stage CI/CD Local Simulation Runner
echo ================================================================
echo.

python automation/runners/test_runner.py

echo.
echo Local CI Pipeline Simulation Complete!
if exist "automation\reports\HTML\execution-report.html" (
    start "" "automation\reports\HTML\execution-report.html"
)
pause
