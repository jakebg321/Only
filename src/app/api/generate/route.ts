import { NextResponse } from "next/server";

let requestQueue: any[] = [];

export async function POST(request: Request) {
  const { prompt, userId } = await request.json();
  const newRequest = { id: Date.now(), userId, prompt, status: "pending" };
  requestQueue.push(newRequest);
  return NextResponse.json({ message: "Request submitted", requestId: newRequest.id, status: "pending" });
}

export async function GET() {
  return NextResponse.json({
    message: "Generate endpoint - POST requests only",
    queueLength: requestQueue.length
  });
} 