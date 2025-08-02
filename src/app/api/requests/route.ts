import { NextResponse } from "next/server";

// This would be replaced with actual database in production
let requests = [
  { id: 1, user: "Subscriber1", prompt: "Custom photo", status: "pending" },
  { id: 2, user: "Subscriber2", prompt: "Video message", status: "processing" },
  { id: 3, user: "Subscriber3", prompt: "Personalized story", status: "completed" },
];

export async function GET() {
  return NextResponse.json({
    requests,
    counts: {
      total: requests.length,
      pending: requests.filter(r => r.status === "pending").length,
      processing: requests.filter(r => r.status === "processing").length,
      completed: requests.filter(r => r.status === "completed").length,
    }
  });
}

export async function POST() {
  return NextResponse.json({
    message: "Requests endpoint - GET requests only"
  });
} 