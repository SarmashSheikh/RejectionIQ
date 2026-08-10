@echo off
echo ========================================================
echo        Building RejectionIQ Android APK Package
echo ========================================================
echo.

echo [1/3] Building Web App Bundle (Vite)...
cd mobile-app
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Web app build failed!
    pause
    exit /b %errorlevel%
)

echo.
echo [2/3] Syncing Capacitor Web Assets to Android Native...
call npx cap sync android
if %errorlevel% neq 0 (
    echo [ERROR] Capacitor sync failed!
    pause
    exit /b %errorlevel%
)

echo.
echo [3/3] Compiling Android Debug APK (Gradle)...
cd android
call gradlew.bat assembleDebug
if %errorlevel% neq 0 (
    echo [ERROR] Android APK build failed!
    pause
    exit /b %errorlevel%
)

echo.
echo ========================================================
echo SUCCESS! APK successfully generated at:
echo mobile-app\android\app\build\outputs\apk\debug\app-debug.apk
echo ========================================================
pause
