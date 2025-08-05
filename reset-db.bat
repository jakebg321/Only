@echo off
echo Resetting database and creating new schema...
echo.

echo This will DELETE all existing data. Continue? (Press Ctrl+C to cancel)
pause

echo.
echo Resetting database...
call npx prisma migrate reset --force

echo.
echo Creating initial migration...
call npx prisma migrate dev --name initial_schema

echo.
echo Seeding database with test data...
call npx prisma db seed

echo.
echo ===============================================
echo Database setup complete!
echo ===============================================
echo.
echo Test accounts created:
echo   Creator: creator@example.com / password123
echo   Subscriber: subscriber@example.com / password123
echo   Manager: manager@example.com / password123
echo.
echo Run 'npm run dev' to start the application!