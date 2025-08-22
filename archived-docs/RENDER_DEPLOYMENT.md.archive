# Render Deployment Guide

## Prerequisites
1. Push your code to GitHub
2. Have a Render account

## Deployment Steps

### 1. Create New Web Service on Render
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the repository containing this code

### 2. Configure Build Settings
- **Name**: only-twins (or your preferred name)
- **Runtime**: Node
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Instance Type**: Free or Starter

### 3. Environment Variables
Add these environment variables in Render dashboard:

```
DATABASE_URL=postgresql://[user]:[password]@[host]/[database]?ssl=true
GROK_API_KEY=xai-qgx7VjB0SZFNsGyuWP7DwI5DjLUGVPXJTPWkwvwXI0I0kEb6Nla7NqNc3vyIE1P2IcGugdAEnkIxCapZ
NEXTAUTH_URL=https://iq-4ru0.onrender.com
NEXTAUTH_SECRET=[generate-a-random-secret]
NODE_ENV=production
```

### 4. Database Setup Options

#### Option A: Use Render PostgreSQL
1. Create a PostgreSQL database on Render
2. It will automatically set the DATABASE_URL

#### Option B: Use External Database (Recommended)
Use a service like:
- [Neon](https://neon.tech/) - Free tier available
- [Supabase](https://supabase.com/) - Free tier available
- [Railway](https://railway.app/)

### 5. After First Deploy
Once deployed, run database migrations:

1. Go to your service's "Shell" tab in Render
2. Run: `npx prisma migrate deploy`
3. (Optional) Seed database: `npx prisma db seed`

### 6. Important Notes
- The free tier on Render spins down after inactivity
- First request after spin-down takes ~30 seconds
- Consider upgrading to Starter ($7/month) for always-on service

## Troubleshooting

### Build Failures
- Check logs in Render dashboard
- Ensure all dependencies are in package.json
- Verify environment variables are set

### Database Connection Issues
- Ensure DATABASE_URL includes `?ssl=true` for production
- Check if database is accessible from Render's servers
- Verify credentials are correct

### 500 Errors
- Check Render logs for detailed errors
- Verify all environment variables are set
- Ensure database migrations have run

## Quick Deploy with render.yaml
If you want automated deployment:
1. Commit the `render.yaml` file
2. Use "New Blueprint Instance" in Render
3. It will auto-configure most settings