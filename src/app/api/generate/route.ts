import { NextResponse } from "next/server";

const requestQueue: { 
  id: number; 
  userId: string; 
  userName?: string;
  prompt: string; 
  requestType?: string;
  urgency?: string;
  status: string;
  timestamp: string;
}[] = [];

// Function to send webhook notification to local computer
async function sendLocalNotification(requestData: any) {
  // Check if we're running locally or deployed
  const isLocal = process.env.NODE_ENV === 'development' || 
                  process.env.VERCEL_ENV === undefined && 
                  process.env.RENDER === undefined;
  
  if (!isLocal) {
    // When deployed, don't try to send webhooks - the local server will poll instead
    console.log('🌐 Running on deployed server - local polling will handle notifications');
    return { 
      success: true, 
      message: 'Deployed mode - notifications via polling',
      mode: 'polling'
    };
  }
  
  try {
    const webhookUrl = 'http://localhost:3001/webhook';
    
    console.log('Sending webhook to local notification server:', webhookUrl);
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
      // Add timeout to prevent hanging if local server is down
    });

    if (response.ok) {
      console.log('✅ Local notification sent successfully');
      return { success: true, message: 'Local notification sent', mode: 'webhook' };
    } else {
      console.log('❌ Local notification failed:', response.status);
      return { success: false, message: 'Local server not responding', mode: 'webhook' };
    }
  } catch (error: unknown) {
    console.log('❌ Local notification error:', error);
    // Local server is probably not running - this is expected sometimes
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, message: 'Local server offline', error: errorMessage, mode: 'webhook' };
  }
}

export async function POST(request: Request) {
  const { 
    prompt, 
    userId, 
    userName = 'Anonymous User',
    requestType = 'custom_image',
    urgency = 'normal'
  } = await request.json();
  
  const timestamp = new Date().toISOString();
  const requestId = Date.now();
  
  const newRequest = { 
    id: requestId,
    userId, 
    userName,
    prompt, 
    requestType,
    urgency,
    status: "pending",
    timestamp
  };
  
  // Add to queue
  requestQueue.push(newRequest);
  
  // Send notification to local computer
  const notificationResult = await sendLocalNotification({
    requestId: newRequest.id,
    userId: newRequest.userId,
    userName: newRequest.userName,
    prompt: newRequest.prompt,
    requestType: newRequest.requestType,
    urgency: newRequest.urgency,
    timestamp: newRequest.timestamp
  });
  
  console.log('New image generation request:', {
    id: requestId,
    user: userName,
    prompt: prompt.substring(0, 50) + '...',
    notification: notificationResult.success ? 'sent' : 'failed'
  });
  
  return NextResponse.json({ 
    message: "Request submitted", 
    requestId: newRequest.id, 
    status: "pending",
    localNotification: notificationResult
  });
}

export async function GET() {
  return NextResponse.json({
    message: "Image generation request queue",
    queue: requestQueue,
    queueLength: requestQueue.length,
    stats: {
      pending: requestQueue.filter(r => r.status === 'pending').length,
      processing: requestQueue.filter(r => r.status === 'processing').length,
      completed: requestQueue.filter(r => r.status === 'completed').length,
    }
  });
} 