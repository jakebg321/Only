@echo off
echo.
echo ========================================
echo   OnlyFans Local Notification Server
echo ========================================
echo.

REM Check if we have a deployed app URL set
if "%DEPLOYED_APP_URL%"=="" (
    echo No DEPLOYED_APP_URL found - using default
    set DEPLOYED_APP_URL=https://your-app.onrender.com
    echo.
    echo 💡 To use your actual deployed app, run:
    echo    set DEPLOYED_APP_URL=https://your-actual-app.onrender.com
    echo    then run this script again
    echo.
)

echo 🌐 Deployed App URL: %DEPLOYED_APP_URL%
echo 📡 Will poll for new requests every 15 seconds
echo.

echo Installing dependencies...
npm install express --save
if errorlevel 1 (
    echo Failed to install dependencies!
    pause
    exit /b 1
)

echo.
echo 🚀 Starting notification server in DEPLOYED MODE...
echo Press Ctrl+C to stop the server
echo.

REM Set environment variables and start server
set LOCAL_MODE=false
node local-notification-server.js

pause