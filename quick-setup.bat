@echo off
echo Setting up Only Twins Project...
echo.

echo Installing dependencies...
call npm install

echo.
echo Generating Prisma client...
call npx prisma generate

echo.
echo Running database migration...
call npx prisma migrate dev --name add_chatbot_schema

echo.
echo Starting development server...
echo App will be available at http://localhost:3000
echo.
call npm run dev