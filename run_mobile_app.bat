@echo off
echo ========================================================
echo        Starting RejectionIQ - Mobile App Console
echo ========================================================
echo.

echo [1/2] Launching Shared Python Backend API...
cd backend
start cmd /k "title RejectionIQ Backend API && .\venv\Scripts\activate && uvicorn main:app --reload --host 0.0.0.0"

echo [2/2] Launching Standalone Mobile App Front-end...
cd ..\mobile-app
start cmd /k "title RejectionIQ Mobile Frontend && npm run dev"

echo.
echo ========================================================
echo  Success! Both servers are initializing in separate windows.
echo.
echo  - Mobile Console Portal: http://localhost:5180
echo  - Shared Backend API:    http://localhost:8000
echo.
echo  You can run this alongside the desktop website (port 5173).
echo  Enjoy your premium Android Mobile Console experience!
echo ========================================================
pause
