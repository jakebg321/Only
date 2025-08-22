import { NextRequest, NextResponse } from 'next/server';
// TEMP DISABLED - analytics files were cleaned up

export async function POST() {
  return NextResponse.json({ message: 'Lifecycle analytics temporarily disabled due to analytics cleanup' });
}

export async function GET() {
  return NextResponse.json({ message: 'Lifecycle analytics temporarily disabled due to analytics cleanup' });
}