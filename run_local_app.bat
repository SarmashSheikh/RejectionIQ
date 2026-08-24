@echo off
echo ========================================================
echo           Starting RejectionIQ Local Application
echo ========================================================
echo.

echo 1. Starting FastAPI Backend (Port 8000)...
start "RejectionIQ Backend" cmd /k "cd /d %~dp0backend && venv\Scripts\python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000"

echo 2. Starting Vite Desktop Web App (Port 5173)...
start "RejectionIQ Web App" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Waiting for servers to initialize...
timeout /t 4 >nul

echo 3. Opening Application in Web Browser...
start http://localhost:5173

echo.
echo ========================================================
echo RejectionIQ local servers are now running!
echo  - Backend API:  http://127.0.0.1:8000/docs
echo  - Web App:      http://localhost:5173
echo ========================================================
echo Press any key to close this launcher window (servers will remain running).
pause >nul
