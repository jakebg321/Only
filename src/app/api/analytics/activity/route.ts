import { NextRequest, NextResponse } from 'next/server';
// TEMP DISABLED - analytics files were cleaned up

export async function POST() {
  return NextResponse.json({ success: true, message: 'Activity tracking temporarily disabled' });
}

export async function GET() {
  return NextResponse.json({ activeSessions: 0, message: 'Activity tracking temporarily disabled' });
}