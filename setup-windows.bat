@echo off
echo =====================================
echo   Setting up Only Twins Project
echo =====================================
echo.

REM Check if Node.js is installed
echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js is installed

REM Install dependencies
echo.
echo Installing npm dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo Dependencies installed successfully

REM Generate Prisma client
echo.
echo Generating Prisma client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ERROR: Failed to generate Prisma client
    pause
    exit /b 1
)
echo Prisma client generated successfully

REM Ask about migrations
echo.
set /p runMigrations=Run database migrations? (y/n): 
if /i "%runMigrations%"=="y" (
    echo Running database migrations...
    call npx prisma migrate dev --name add_chatbot_schema
    if %errorlevel% equ 0 (
        echo Migrations completed successfully
        
        REM Ask about seeding
        echo.
        set /p runSeed=Seed database with test data? ^(y/n^): 
        if /i "%runSeed%"=="y" (
            call npx prisma db seed
            echo.
            echo Test accounts created:
            echo   Creator: creator@example.com / password123
            echo   Subscriber: subscriber@example.com / password123
            echo   Manager: manager@example.com / password123
        )
    ) else (
        echo WARNING: Migration failed. Check your database connection.
        echo Make sure PostgreSQL is running and .env.local is configured.
    )
)

REM Start dev server
echo.
echo =====================================
echo   Setup complete!
echo =====================================
echo.
echo Starting development server...
echo The app will be available at http://localhost:3000
echo Press Ctrl+C to stop the server
echo.
call npm run dev