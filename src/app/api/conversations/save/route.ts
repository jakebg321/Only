import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { sessionId, conversations, timestamp } = data;
    
    // Create conversations directory if it doesn't exist
    const conversationsDir = path.join(process.cwd(), 'data', 'conversations');
    await fs.mkdir(conversationsDir, { recursive: true });
    
    // Save conversation data with timestamp
    const fileName = `session_${sessionId}_${timestamp}.json`;
    const filePath = path.join(conversationsDir, fileName);
    
    await fs.writeFile(
      filePath,
      JSON.stringify({ sessionId, timestamp, conversations }, null, 2)
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Conversations saved successfully',
      path: filePath
    });
  } catch (error) {
    console.error('Error saving conversations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save conversations' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const conversationsDir = path.join(process.cwd(), 'data', 'conversations');
    
    // Check if directory exists
    try {
      await fs.access(conversationsDir);
    } catch {
      return NextResponse.json({ success: true, sessions: [] });
    }
    
    // Read all conversation files
    const files = await fs.readdir(conversationsDir);
    const sessions = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(conversationsDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const data = JSON.parse(content);
        sessions.push({
          fileName: file,
          sessionId: data.sessionId,
          timestamp: data.timestamp,
          conversationCount: data.conversations?.length || 0
        });
      }
    }
    
    // Sort by timestamp (newest first)
    sessions.sort((a, b) => b.timestamp - a.timestamp);
    
    return NextResponse.json({ success: true, sessions });
  } catch (error) {
    console.error('Error loading conversations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load conversations' },
      { status: 500 }
    );
  }
}