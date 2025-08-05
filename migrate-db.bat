@echo off
echo ===============================================
echo Database Migration Options
echo ===============================================
echo.
echo Your database has existing tables that don't match the Prisma schema.
echo.
echo 1. Reset database and create new schema (RECOMMENDED)
echo    - This will DELETE all existing data
echo    - Creates all the new tables for chatbot features
echo    - Includes personality settings, analytics, etc.
echo.
echo 2. Exit and keep existing tables
echo    - You'll need to modify the schema manually
echo.
set /p choice=Enter your choice (1 or 2): 

if "%choice%"=="1" (
    echo.
    echo Resetting database and creating new schema...
    call npx prisma migrate reset --force
    
    echo.
    echo Database reset complete. Creating new tables...
    call npx prisma migrate dev --name initial_schema
    
    echo.
    set /p seed=Would you like to add test data? (y/n): 
    if /i "%seed%"=="y" (
        echo Seeding database...
        call npx prisma db seed
    )
    
    echo.
    echo Migration complete!
    echo.
    echo You can now run: npm run dev
) else (
    echo.
    echo Keeping existing database.
    echo You'll need to modify the Prisma schema to match your existing tables.
)