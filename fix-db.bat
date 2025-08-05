@echo off
echo Fixing database connection...
echo.

REM Delete the conflicting .env file
if exist .env (
    del .env
    echo Removed conflicting .env file
)

REM Copy .env.local settings to .env
copy .env.local .env
echo Created new .env from .env.local

echo.
echo Running migration with correct database...
call npx prisma migrate dev --name add_chatbot_schema

echo.
echo If migration succeeds, run: npm run dev