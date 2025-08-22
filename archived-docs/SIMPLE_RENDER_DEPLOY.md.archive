# Simple Render Deployment (No Database)

## Quick Deploy Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Deploy to Render"
   git push
   ```

2. **Deploy on Render**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repo
   - Use these settings:
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`

3. **Add Environment Variable**
   In Render dashboard, add:
   ```
   GROK_API_KEY = xai-qgx7VjB0SZFNsGyuWP7DwI5DjLUGVPXJTPWkwvwXI0I0kEb6Nla7NqNc3vyIE1P2IcGugdAEnkIxCapZ
   ```

4. **Deploy!**
   Click "Create Web Service"

## What Works Without Database
- ✅ Landing page
- ✅ Chat with AI (using Grok)
- ✅ Basic navigation

## What Won't Work
- ❌ Login/Auth (needs database)
- ❌ Saving chat history
- ❌ Creator personality persistence

Your site will be live at: https://iq-4ru0.onrender.com