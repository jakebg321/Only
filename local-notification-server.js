const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

// Configuration for deployed app
const DEPLOYED_APP_URL = process.env.DEPLOYED_APP_URL || 'https://your-app.onrender.com';
const POLLING_INTERVAL = process.env.POLLING_INTERVAL || 15000; // 15 seconds
const LOCAL_MODE = process.env.LOCAL_MODE === 'true'; // Set to 'true' for local development

// Enable JSON parsing
app.use(express.json());

// Enable CORS for your web app
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  next();
});

// Store pending requests
let pendingRequests = [];
let processedRequestIds = new Set(); // Track which requests we've already notified about
let lastPollTime = Date.now();

// Windows notification function
function showWindowsNotification(title, message) {
  const powershellCommand = `
    Add-Type -AssemblyName System.Windows.Forms
    $notification = New-Object System.Windows.Forms.NotifyIcon
    $notification.Icon = [System.Drawing.SystemIcons]::Information
    $notification.BalloonTipTitle = "${title}"
    $notification.BalloonTipText = "${message}"
    $notification.Visible = $true
    $notification.ShowBalloonTip(5000)
    Start-Sleep -Seconds 6
    $notification.Dispose()
  `;
  
  exec(`powershell -Command "${powershellCommand}"`, (error) => {
    if (error) {
      console.error('Notification error:', error);
    }
  });
}

// Play alert sound
function playAlertSound() {
  // Play Windows system sound
  exec('powershell -c (New-Object Media.SoundPlayer "C:\\Windows\\Media\\notify.wav").PlaySync()', (error) => {
    if (error) {
      // Fallback to system beep
      exec('powershell -c "[console]::beep(800,500)"');
    }
  });
}

// Webhook endpoint for new image generation requests
app.post('/webhook', (req, res) => {
  console.log('🔔 New image generation request received!');
  console.log('Request details:', req.body);
  
  const {
    requestId,
    userId,
    userName,
    prompt,
    requestType,
    timestamp,
    urgency = 'normal'
  } = req.body;
  
  // Store the request
  const request = {
    id: requestId,
    userId,
    userName: userName || 'Anonymous User',
    prompt,
    requestType: requestType || 'custom_image',
    timestamp: timestamp || new Date().toISOString(),
    urgency,
    status: 'pending',
    receivedAt: new Date().toISOString()
  };
  
  pendingRequests.push(request);
  
  // Show notification
  const title = `🎨 New ${requestType || 'Image'} Request!`;
  const message = `From: ${request.userName}\\nPrompt: ${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}`;
  
  showWindowsNotification(title, message);
  playAlertSound();
  
  // Log to console with colors
  console.log(`\\n📋 REQUEST #${requestId}`);
  console.log(`👤 User: ${request.userName} (${userId})`);
  console.log(`📝 Prompt: ${prompt}`);
  console.log(`⏰ Time: ${new Date().toLocaleString()}`);
  console.log(`🔥 Urgency: ${urgency}`);
  console.log('\\n' + '='.repeat(50) + '\\n');
  
  // TODO: Uncomment this line when you want to auto-launch your generation program
  // launchImageGenerationProgram(request);
  
  res.json({ 
    success: true, 
    message: 'Notification sent to local computer',
    requestId: requestId
  });
});

// Function to launch your image generation program
function launchImageGenerationProgram(request) {
  // Replace this with the actual path to your image generation program
  const programPath = 'C:\\\\path\\\\to\\\\your\\\\image-generator.exe';
  const args = `"${request.prompt}" "${request.userId}" "${request.id}"`;
  
  console.log(`🚀 Launching image generation program...`);
  console.log(`Command: ${programPath} ${args}`);
  
  exec(`"${programPath}" ${args}`, (error, stdout, stderr) => {
    if (error) {
      console.error('Program launch error:', error);
      return;
    }
    console.log('Program output:', stdout);
    if (stderr) console.error('Program stderr:', stderr);
  });
}

// Function to poll the deployed app for new requests
async function pollForNewRequests() {
  if (LOCAL_MODE) {
    // In local mode, we don't need to poll - webhooks work directly
    return;
  }

  try {
    console.log(`🔍 Polling ${DEPLOYED_APP_URL}/api/generate for new requests...`);
    
    const response = await fetch(`${DEPLOYED_APP_URL}/api/generate`);
    if (!response.ok) {
      console.log(`❌ Polling failed: ${response.status} ${response.statusText}`);
      return;
    }
    
    const data = await response.json();
    console.log(`📊 Poll result: ${data.queueLength} total requests, ${data.stats?.pending || 0} pending`);
    
    if (data.queue && Array.isArray(data.queue)) {
      // Filter for new requests we haven't processed yet
      const newRequests = data.queue.filter(request => 
        request.status === 'pending' && 
        !processedRequestIds.has(request.id) &&
        new Date(request.timestamp).getTime() > (lastPollTime - POLLING_INTERVAL - 5000) // 5s buffer
      );
      
      if (newRequests.length > 0) {
        console.log(`🆕 Found ${newRequests.length} new request(s)!`);
        
        for (const request of newRequests) {
          await processNewRequest(request);
          processedRequestIds.add(request.id);
        }
      }
    }
    
    lastPollTime = Date.now();
  } catch (error) {
    console.error('❌ Polling error:', error.message);
    
    // If this is the first poll attempt and it fails, show helpful message
    if (processedRequestIds.size === 0) {
      console.log(`💡 Tip: Make sure your deployed app URL is correct: ${DEPLOYED_APP_URL}`);
      console.log(`💡 You can change it with: set DEPLOYED_APP_URL=https://your-actual-app.onrender.com`);
    }
  }
}

// Process a new request (same logic as webhook, but from polling)
async function processNewRequest(request) {
  console.log('🔔 New image generation request found via polling!');
  console.log('Request details:', request);
  
  const processedRequest = {
    id: request.id,
    userId: request.userId,
    userName: request.userName || 'Anonymous User',
    prompt: request.prompt,
    requestType: request.requestType || 'custom_image',
    timestamp: request.timestamp,
    urgency: request.urgency || 'normal',
    status: 'pending',
    receivedAt: new Date().toISOString(),
    source: 'polling' // Mark as coming from polling vs webhook
  };
  
  // Store the request
  pendingRequests.push(processedRequest);
  
  // Show notification
  const title = `🎨 New ${processedRequest.requestType.replace('_', ' ')} Request!`;
  const message = `From: ${processedRequest.userName}\\nPrompt: ${request.prompt.substring(0, 100)}${request.prompt.length > 100 ? '...' : ''}`;
  
  showWindowsNotification(title, message);
  playAlertSound();
  
  // Log to console with colors
  console.log(`\\n📋 REQUEST #${request.id} (via polling)`);
  console.log(`👤 User: ${processedRequest.userName} (${request.userId})`);
  console.log(`📝 Prompt: ${request.prompt}`);
  console.log(`⏰ Time: ${new Date(request.timestamp).toLocaleString()}`);
  console.log(`🔥 Urgency: ${processedRequest.urgency}`);
  console.log('\\n' + '='.repeat(50) + '\\n');
  
  // TODO: Uncomment this line when you want to auto-launch your generation program
  // launchImageGenerationProgram(processedRequest);
}

// Get all pending requests
app.get('/requests', (req, res) => {
  res.json({
    requests: pendingRequests,
    count: pendingRequests.length
  });
});

// Mark request as processing
app.post('/requests/:id/processing', (req, res) => {
  const requestId = req.params.id;
  const request = pendingRequests.find(r => r.id == requestId);
  
  if (request) {
    request.status = 'processing';
    request.processingStarted = new Date().toISOString();
    console.log(`📝 Request #${requestId} marked as processing`);
    res.json({ success: true, request });
  } else {
    res.status(404).json({ error: 'Request not found' });
  }
});

// Mark request as completed
app.post('/requests/:id/completed', (req, res) => {
  const requestId = req.params.id;
  const requestIndex = pendingRequests.findIndex(r => r.id == requestId);
  
  if (requestIndex !== -1) {
    const request = pendingRequests[requestIndex];
    request.status = 'completed';
    request.completedAt = new Date().toISOString();
    
    console.log(`✅ Request #${requestId} completed and removed from queue`);
    
    // Remove from pending requests
    pendingRequests.splice(requestIndex, 1);
    
    res.json({ success: true, request });
  } else {
    res.status(404).json({ error: 'Request not found' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'running',
    uptime: process.uptime(),
    pendingRequests: pendingRequests.length,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, 'localhost', () => {
  console.log(`\\n🖥️  Local Notification Server Started!`);
  console.log(`📡 Listening on: http://localhost:${PORT}`);
  
  if (LOCAL_MODE) {
    console.log(`🏠 Running in LOCAL MODE - using webhooks`);
    console.log(`🔔 Ready to receive direct webhook requests`);
  } else {
    console.log(`☁️  Running in DEPLOYED MODE - using polling`);
    console.log(`🔔 Polling deployed app: ${DEPLOYED_APP_URL}`);
    console.log(`⏱️  Polling interval: ${POLLING_INTERVAL}ms (${POLLING_INTERVAL/1000}s)`);
  }
  
  console.log(`\\n⚡ Available endpoints:`);
  console.log(`   POST /webhook - Receive new requests (local mode)`);
  console.log(`   GET  /requests - View all pending requests`);
  console.log(`   POST /requests/:id/processing - Mark as processing`);
  console.log(`   POST /requests/:id/completed - Mark as completed`);
  console.log(`   GET  /health - Check server status`);
  console.log('\\n' + '='.repeat(50));
  
  // Show startup notification
  const mode = LOCAL_MODE ? 'Local Mode' : 'Deployed Mode';
  showWindowsNotification(
    `🖥️ Notification Server Started (${mode})`, 
    LOCAL_MODE ? 'Ready for direct webhooks!' : `Polling ${DEPLOYED_APP_URL}`
  );
  
  // Start polling if not in local mode
  if (!LOCAL_MODE) {
    console.log(`\\n🚀 Starting polling system...`);
    
    // Do initial poll after 5 seconds
    setTimeout(pollForNewRequests, 5000);
    
    // Then poll at regular intervals
    setInterval(pollForNewRequests, POLLING_INTERVAL);
    
    console.log(`✅ Polling system active - checking every ${POLLING_INTERVAL/1000} seconds`);
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\\n🛑 Shutting down notification server...');
  showWindowsNotification(
    '🛑 Server Stopped', 
    'Notification server has been shut down'
  );
  process.exit(0);
});