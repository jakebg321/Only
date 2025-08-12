import { NextResponse } from "next/server";

// Import the shared queue from the main generate route
// This allows both endpoints to access the same queue
const getQueue = () => {
  // In production, this would use a database or Redis
  // For now, we'll use a global variable (note: this won't persist across deployments)
  if (!global.requestQueue) {
    global.requestQueue = [];
  }
  return global.requestQueue;
};

export async function GET() {
  const queue = getQueue();
  
  return NextResponse.json({
    message: "Image generation request queue",
    queue: queue,
    queueLength: queue.length,
    stats: {
      pending: queue.filter(r => r.status === 'pending').length,
      processing: queue.filter(r => r.status === 'processing').length,
      completed: queue.filter(r => r.status === 'completed').length,
      failed: queue.filter(r => r.status === 'failed').length,
    }
  });
}