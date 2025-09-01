import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { 
      sessionId, 
      userMessage, 
      grokResponse,
      undertone,
      confidence,
      score,
      config,
      timestamp = Date.now()
    } = data;
    
    // Create directories
    const baseDir = path.join(process.cwd(), 'data', 'conversations');
    const cleanDir = path.join(baseDir, 'clean', sessionId);
    const detailedDir = path.join(baseDir, 'detailed', sessionId);
    
    await fs.mkdir(cleanDir, { recursive: true });
    await fs.mkdir(detailedDir, { recursive: true });
    
    // Format timestamp for filename
    const date = new Date(timestamp);
    const dateStr = date.toISOString().split('T')[0];
    const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-');
    const fileTimestamp = `${dateStr}_${timeStr}`;
    
    // SAVE CLEAN FORMAT (append to daily file)
    const cleanFile = path.join(cleanDir, `conversation_${dateStr}.txt`);
    let cleanContent = '';
    
    // Check if file exists, if not add header
    try {
      await fs.access(cleanFile);
    } catch {
      cleanContent = `=== CONVERSATION LOG ===\n`;
      cleanContent += `Session: ${sessionId}\n`;
      cleanContent += `Date: ${date.toLocaleDateString()}\n`;
      cleanContent += `${'='.repeat(50)}\n\n`;
    }
    
    // Add the message exchange
    cleanContent += `[${date.toLocaleTimeString()}]\n`;
    cleanContent += `USER: ${userMessage}\n`;
    cleanContent += `GROK: ${grokResponse}\n\n`;
    
    // Append to clean file
    await fs.appendFile(cleanFile, cleanContent);
    
    // SAVE DETAILED FORMAT (individual JSON per message)
    const detailedFile = path.join(detailedDir, `message_${fileTimestamp}_${Date.now()}.json`);
    const detailedData = {
      timestamp,
      datetime: date.toISOString(),
      sessionId,
      exchange: {
        user: userMessage,
        grok: grokResponse
      },
      analysis: {
        undertone,
        confidence,
        score
      },
      config: config || null
    };
    
    await fs.writeFile(
      detailedFile,
      JSON.stringify(detailedData, null, 2)
    );
    
    // Also save a master session file that gets updated
    const sessionFile = path.join(detailedDir, `session_master.json`);
    let sessionData = {
      sessionId,
      startTime: timestamp,
      lastUpdate: timestamp,
      messageCount: 1,
      messages: []
    };
    
    // Try to read existing session file
    try {
      const existing = await fs.readFile(sessionFile, 'utf-8');
      sessionData = JSON.parse(existing);
      sessionData.lastUpdate = timestamp;
      sessionData.messageCount++;
    } catch {
      // File doesn't exist, use new data
    }
    
    // Add this message to the session
    sessionData.messages.push({
      timestamp,
      user: userMessage,
      grok: grokResponse,
      undertone,
      confidence,
      score
    });
    
    // Save updated session file
    await fs.writeFile(
      sessionFile,
      JSON.stringify(sessionData, null, 2)
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Message saved in both formats',
      paths: {
        clean: cleanFile,
        detailed: detailedFile,
        session: sessionFile
      }
    });
  } catch (error) {
    console.error('Error saving message:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save message' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');
    const format = url.searchParams.get('format') || 'clean'; // 'clean' or 'detailed'
    
    if (!sessionId) {
      // List all sessions
      const baseDir = path.join(process.cwd(), 'data', 'conversations', 'clean');
      
      try {
        const sessions = await fs.readdir(baseDir);
        return NextResponse.json({ success: true, sessions });
      } catch {
        return NextResponse.json({ success: true, sessions: [] });
      }
    }
    
    // Get specific session
    if (format === 'clean') {
      const cleanDir = path.join(process.cwd(), 'data', 'conversations', 'clean', sessionId);
      const files = await fs.readdir(cleanDir);
      const conversations = [];
      
      for (const file of files) {
        if (file.endsWith('.txt')) {
          const content = await fs.readFile(path.join(cleanDir, file), 'utf-8');
          conversations.push({
            file,
            content
          });
        }
      }
      
      return NextResponse.json({ success: true, format: 'clean', conversations });
      
    } else {
      // Get detailed format
      const sessionFile = path.join(process.cwd(), 'data', 'conversations', 'detailed', sessionId, 'session_master.json');
      const content = await fs.readFile(sessionFile, 'utf-8');
      const data = JSON.parse(content);
      
      return NextResponse.json({ success: true, format: 'detailed', data });
    }
  } catch (error) {
    console.error('Error loading conversations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load conversations' },
      { status: 500 }
    );
  }
}