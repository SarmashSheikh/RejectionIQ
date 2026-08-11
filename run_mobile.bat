@echo off
echo ========================================================
echo        Starting RejectionIQ - Mobile App (Wi-Fi Enabled)
echo ========================================================
echo.

echo [1/2] Starting Python Backend API (Listening on all interfaces)...
cd backend
start cmd /k "title RejectionIQ Backend && .\venv\Scripts\activate && uvicorn main:app --reload --host 0.0.0.0 --port 8000"

echo [2/2] Starting Mobile App Frontend...
cd ..\mobile-app
start cmd /k "title RejectionIQ Mobile Frontend && npm run dev"

echo.
echo ========================================================
echo  Success! Both servers are starting up in separate windows.
echo.
echo  To access on this computer:
echo  - Mobile Front-end: http://localhost:5180
echo  - Backend API:      http://localhost:8000
echo.
echo  To access on your phone:
echo  1. Connect your phone to the SAME Wi-Fi network as this PC.
echo  2. Open your phone's browser and type the IP address shown
echo     in the "Mobile Frontend" command window (e.g. http://192.168.x.x:5180).
echo ========================================================
pause
