import subprocess
import time
import os

cwd = r"c:\Users\sharmash vali\OneDrive\Attachments\Documents\Desktop\RejectionIQ"
frontend_cwd = os.path.join(cwd, "frontend")
backend_cwd = os.path.join(cwd, "backend")

print("Starting backend...")
python_path = os.path.join(backend_cwd, "venv", "Scripts", "python.exe")
backend_proc = subprocess.Popen([python_path, "-m", "uvicorn", "main:app", "--port", "8000"], cwd=backend_cwd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

print("Starting frontend...")
frontend_proc = subprocess.Popen(["npm.cmd", "run", "dev"], cwd=frontend_cwd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

print("Started. Backend PID:", backend_proc.pid, "Frontend PID:", frontend_proc.pid)
