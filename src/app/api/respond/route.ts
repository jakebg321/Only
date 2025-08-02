import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { requestId, response, image } = await request.json();
  // Simulate updating request
  console.log(`Responding to request ${requestId} with: ${response}, image: ${image}`);
  return NextResponse.json({ message: "Response submitted successfully" });
}

export async function GET() {
  return NextResponse.json({
    message: "Respond endpoint - POST requests only"
  });
} 