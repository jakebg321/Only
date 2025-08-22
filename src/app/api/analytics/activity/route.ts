import { NextRequest, NextResponse } from 'next/server';
// TEMP DISABLED - analytics files were cleaned up

export async function POST(request: NextRequest) {
  return NextResponse.json({ success: true, message: 'Activity tracking temporarily disabled' });
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ activeSessions: 0, message: 'Activity tracking temporarily disabled' });
}