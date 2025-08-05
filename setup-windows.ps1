# PowerShell script to set up the Only Twins project on Windows

Write-Host "🚀 Setting up Only Twins Project..." -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

# Check if Node.js is installed
Write-Host "`n📋 Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js $nodeVersion is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this script from the project root directory." -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "`n📦 Installing npm dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green

# Generate Prisma client
Write-Host "`n🔧 Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate Prisma client" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Prisma client generated successfully" -ForegroundColor Green

# Check database connection
Write-Host "`n🗄️ Checking database connection..." -ForegroundColor Yellow
Write-Host "Please ensure PostgreSQL is running and 'onlytwins_db' exists" -ForegroundColor Cyan

# Run migrations
Write-Host "`n📊 Running database migrations..." -ForegroundColor Yellow
$migrate = Read-Host "Do you want to run database migrations? (y/n)"
if ($migrate -eq 'y') {
    npx prisma migrate dev --name add_chatbot_schema
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database migrations completed successfully" -ForegroundColor Green
        
        # Seed database
        Write-Host "`n🌱 Seeding database..." -ForegroundColor Yellow
        $seed = Read-Host "Do you want to seed the database with test data? (y/n)"
        if ($seed -eq 'y') {
            npx prisma db seed
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Database seeded successfully" -ForegroundColor Green
                Write-Host "`nTest accounts created:" -ForegroundColor Cyan
                Write-Host "  Creator: creator@example.com / password123" -ForegroundColor White
                Write-Host "  Subscriber: subscriber@example.com / password123" -ForegroundColor White
                Write-Host "  Manager: manager@example.com / password123" -ForegroundColor White
            }
        }
    } else {
        Write-Host "⚠️ Migration failed. Check your database connection in .env.local" -ForegroundColor Yellow
        Write-Host "Make sure DATABASE_URL is set correctly:" -ForegroundColor Yellow
        Write-Host 'DATABASE_URL="postgresql://postgres:admin@localhost:5432/onlytwins_db"' -ForegroundColor White
    }
}

# Start development server
Write-Host "`n🎉 Setup complete!" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "`n🚀 Starting development server..." -ForegroundColor Yellow
Write-Host "The app will be available at http://localhost:3000" -ForegroundColor Cyan
Write-Host "`nPress Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "===================================" -ForegroundColor Cyan

npm run dev