@echo off
echo ========================================================
echo        Syncing RejectionIQ Mobile Web Assets to Android
echo ========================================================
echo.

cd mobile-app
echo [1/2] Building Vite Bundle...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Web app build failed!
    pause
    exit /b %errorlevel%
)

echo.
echo [2/2] Syncing with Capacitor Android Native Project...
call npx cap sync android
if %errorlevel% neq 0 (
    echo [ERROR] Capacitor sync failed!
    pause
    exit /b %errorlevel%
)

echo.
echo ========================================================
echo SUCCESS! Web assets compiled and synced to Android project.
echo Android Studio project is ready at: mobile-app\android
echo ========================================================
pause
