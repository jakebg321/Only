import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect();
    
    // Get counts of various tables
    const userCount = await prisma.user.count();
    const creatorCount = await prisma.creator.count();
    const sessionCount = await prisma.chatSession.count();
    const messageCount = await prisma.message.count();
    
    return NextResponse.json({
      status: 'connected',
      database: {
        users: userCount,
        creators: creatorCount,
        chatSessions: sessionCount,
        messages: messageCount,
      },
      message: 'Database connection successful!',
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to connect to database',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}