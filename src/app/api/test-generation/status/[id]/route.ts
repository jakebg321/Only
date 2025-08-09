import { NextRequest, NextResponse } from "next/server";

const LOCAL_API_URL = "https://21068d262bdf.ngrok-free.app";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: requestId } = await params;

    console.log(`Checking status for request: ${requestId}`);

    // Forward status request to local API
    const response = await fetch(`${LOCAL_API_URL}/status/${requestId}`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { success: false, error: "Request not found" },
          { status: 404 }
        );
      }
      throw new Error(`Local API responded with ${response.status}`);
    }

    const data = await response.json();
    console.log(`Status for ${requestId}:`, data);

    return NextResponse.json(data);

  } catch (error: any) {
    console.error("Status check error:", error);
    
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Local API server not responding" 
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: `Status check failed: ${error.message}` 
      },
      { status: 500 }
    );
  }
}