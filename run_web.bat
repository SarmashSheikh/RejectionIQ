@echo off
echo ========================================================
echo           Starting RejectionIQ Web Application
echo ========================================================
echo.

echo Starting Vite Frontend...
start "RejectionIQ Web App" cmd /k "cd /d %~dp0mobile-app && npm run dev"

timeout /t 3 >nul
start http://localhost:5180

echo Web app started at http://localhost:5180
pause
