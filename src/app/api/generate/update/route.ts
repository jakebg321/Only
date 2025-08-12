import { NextResponse } from "next/server";

// Get the shared queue
const getQueue = () => {
  if (!global.requestQueue) {
    global.requestQueue = [];
  }
  return global.requestQueue;
};

export async function POST(request: Request) {
  const { requestId, status, result, workerId } = await request.json();
  
  const queue = getQueue();
  const requestIndex = queue.findIndex(r => r.id === requestId);
  
  if (requestIndex === -1) {
    return NextResponse.json(
      { error: "Request not found" },
      { status: 404 }
    );
  }
  
  // Update the request
  queue[requestIndex] = {
    ...queue[requestIndex],
    status,
    workerId,
    updatedAt: new Date().toISOString(),
    ...(result && { result })
  };
  
  console.log(`Request ${requestId} updated to ${status} by worker ${workerId}`);
  
  // If completed, you could trigger additional actions here
  // like saving to database, sending notifications, etc.
  if (status === 'completed' && result?.imageData) {
    // In production, save the image to storage (S3, Cloudinary, etc.)
    console.log(`Image generated for request ${requestId}`);
  }
  
  return NextResponse.json({
    message: "Request updated successfully",
    request: queue[requestIndex]
  });
}