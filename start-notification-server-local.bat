@echo off
echo.
echo ========================================
echo   OnlyFans Local Notification Server
echo        (LOCAL DEVELOPMENT MODE)
echo ========================================
echo.
echo 🏠 Running in LOCAL MODE - using direct webhooks
echo 📡 Will receive webhooks from localhost:3000
echo.

echo Installing dependencies...
npm install express --save
if errorlevel 1 (
    echo Failed to install dependencies!
    pause
    exit /b 1
)

echo.
echo 🚀 Starting notification server in LOCAL MODE...
echo Press Ctrl+C to stop the server
echo.

REM Set environment variables for local mode
set LOCAL_MODE=true
set DEPLOYED_APP_URL=http://localhost:3000
node local-notification-server.js

pause