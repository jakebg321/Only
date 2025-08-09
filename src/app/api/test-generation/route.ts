import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Get the local API URL from environment variable or fallback to localhost
  const LOCAL_API_URL = process.env.LOCAL_API_URL || 'http://localhost:8000';
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: "Prompt is required" },
        { status: 400 }
      );
    }

    console.log(`Forwarding generation request to local API: ${prompt}`);

    // Forward request to your local API server
    const response = await fetch(`${LOCAL_API_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        creator_id: "test",
        user_id: "test_user"
      }),
      // Add timeout
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`Local API responded with ${response.status}`);
    }

    const data = await response.json();
    console.log("Local API response:", data);

    return NextResponse.json(data);

  } catch (error: any) {
    console.error("Test generation error:", error);
    
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Local API server not responding - make sure it's running on localhost:8000" 
        },
        { status: 503 }
      );
    }

    if (error.message.includes('ECONNREFUSED')) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Cannot connect to local API - is python api_server_fixed.py running?" 
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: `Generation service error: ${error.message}` 
      },
      { status: 500 }
    );
  }
}