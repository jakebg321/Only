# Local Notification System for Image Generation

## Overview
This system sends notifications to your computer when users request custom images/videos, allowing you to generate them locally and save on server costs. Works with both local development and deployed apps!

## Setup Instructions

### 1. Start the Local Notification Server

#### For Deployed App (Render/Vercel/etc.):
```bash
# Set your deployed app URL first:
set DEPLOYED_APP_URL=https://your-app.onrender.com

# Then start the server:
double-click: start-notification-server.bat

# Or manually:
npm install express
set LOCAL_MODE=false
node local-notification-server.js
```

#### For Local Development:
```bash
# Use the local development script:
double-click: start-notification-server-local.bat

# Or manually:
npm install express
set LOCAL_MODE=true
node local-notification-server.js
```

### 2. Server will start on http://localhost:3001
- You'll see a Windows notification when it starts
- Console will show all incoming requests with details
- Server stays running until you close it

### 3. Test the System
1. Go to your chat at http://localhost:3000/chat
2. Click "📸 Request Custom Pic" or "🎥 Request Video"
3. Enter a description (e.g., "Sexy lingerie photo in red")
4. You should immediately get:
   - Windows toast notification
   - Sound alert
   - Console log with request details

## How It Works

### Deployed App Flow (Polling):
1. User visits your deployed site (e.g., https://your-app.onrender.com/chat)
2. User clicks request button and enters description
3. Request is stored in deployed app's queue
4. Your local server polls the deployed API every 15 seconds
5. When new request found → instant Windows notification + sound
6. You generate the content locally and mark as completed

### Local Development Flow (Webhooks):
1. User visits localhost:3000/chat
2. User clicks request button and enters description  
3. Request triggers direct webhook to your local server
4. Instant notification (no polling delay)
5. You generate the content locally and mark as completed

### Notification Details Include:
- User name (Jake)
- Request type (image/video)
- Detailed prompt/description
- Timestamp
- Unique request ID
- Urgency level

## API Endpoints

### Local Server (localhost:3001)
- `POST /webhook` - Receives new requests from web app
- `GET /requests` - View all pending requests
- `POST /requests/:id/processing` - Mark request as being worked on
- `POST /requests/:id/completed` - Mark request as finished
- `GET /health` - Check if server is running

### Web App API
- `POST /api/generate` - Submit new generation request
- `GET /api/generate` - View request queue and stats

## Integration with Your Image Generation Program

### Option 1: Manual Process
1. Get notification
2. See request details in console
3. Manually run your generation program
4. Upload result to chat/platform

### Option 2: Auto-Launch (Advanced)
Uncomment line in `local-notification-server.js`:
```javascript
// launchImageGenerationProgram(request);
```

Update the path to your program:
```javascript
const programPath = 'C:\\path\\to\\your\\image-generator.exe';
```

## Status Updates

### Mark as Processing:
```bash
curl -X POST http://localhost:3001/requests/REQUEST_ID/processing
```

### Mark as Completed:
```bash
curl -X POST http://localhost:3001/requests/REQUEST_ID/completed
```

## Troubleshooting

### No Notifications?
- Check if local server is running (look for console output)
- Verify Windows notifications are enabled
- Check firewall isn't blocking localhost:3001

### Server Won't Start?
- Make sure port 3001 isn't in use
- Install Node.js if not installed
- Run `npm install express` first

### Web App Can't Connect?
- Local server must be running before making requests
- Check console logs for connection errors
- Verify localhost:3001 is accessible

## Advanced Features

### Custom Notification Sounds
Replace the sound file path in the server:
```javascript
exec('powershell -c (New-Object Media.SoundPlayer "YOUR_SOUND_FILE.wav").PlaySync()')
```

### Email Backup Notifications
Add email integration for when your computer is off:
- Use SendGrid, Nodemailer, or similar
- Send email if webhook fails to local server

### Remote Access
- Use ngrok to expose local server to internet
- Set up VPN for remote notifications
- Use cloud webhooks as backup

## Security Notes
- Server only accepts connections from localhost by default
- No authentication required (safe for local use only)
- Don't expose this server to the internet without authentication

## Next Steps
1. Test the basic notification flow
2. Integrate with your existing image generation setup  
3. Add status update calls when you complete requests
4. Consider automating the launch of your generation program