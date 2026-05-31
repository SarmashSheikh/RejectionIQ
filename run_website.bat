@echo off
echo Starting RejectionIQ Servers...

echo Starting Backend...
cd backend
start cmd /k ".\venv\Scripts\activate && uvicorn main:app --reload"

echo Starting Frontend...
cd ..\frontend
start cmd /k "npm run dev"

echo Both servers are starting up!
echo Frontend will be available at: http://localhost:5173
echo Backend API will be available at: http://localhost:8000
