import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

interface TestResult {
  timestamp: string;
  conversations: Array<{
    type: string;
    messages: any[];
    analysis: any;
  }>;
  messageCount?: number;
  autoSave?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const results: TestResult = await request.json();
    
    // Create organized folder structure
    const baseDir = path.join(process.cwd(), 'test-lab-results');
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const todayDir = path.join(baseDir, today);
    
    // Ensure directories exist
    await mkdir(baseDir, { recursive: true });
    await mkdir(todayDir, { recursive: true });
    
    // Generate filename with timestamp
    const timestamp = Date.now();
    const prefix = results.autoSave ? 'auto' : 'manual';
    const messageInfo = results.messageCount ? `-${results.messageCount}msg` : '';
    const filename = `${prefix}-save-${timestamp}${messageInfo}.json`;
    const filePath = path.join(todayDir, filename);
    
    // Add metadata to results
    const enhancedResults = {
      ...results,
      metadata: {
        savedAt: new Date().toISOString(),
        saveType: results.autoSave ? 'auto' : 'manual',
        messageCount: results.messageCount || 0,
        filename,
        totalConversations: results.conversations.length
      }
    };
    
    // Save to file
    await writeFile(filePath, JSON.stringify(enhancedResults, null, 2));
    
    console.log(`[TEST-LAB] Saved results to: ${filePath}`);
    
    return NextResponse.json({
      success: true,
      filePath: filePath.replace(process.cwd(), '').replace(/\\/g, '/'),
      filename,
      message: `Results saved to ${todayDir}`
    });
    
  } catch (error) {
    console.error('[TEST-LAB] ❌ Failed to save results:', error);
    return NextResponse.json(
      { error: 'Failed to save results', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET endpoint to list saved results
export async function GET() {
  try {
    const baseDir = path.join(process.cwd(), 'test-lab-results');
    
    // This is a simple implementation - in production you might want to use fs.readdir
    // For now, just return the directory path for user reference
    const relativePath = baseDir.replace(process.cwd(), '').replace(/\\/g, '/');
    
    return NextResponse.json({
      success: true,
      resultsDirectory: relativePath,
      message: 'Check the test-lab-results folder in your project root'
    });
    
  } catch (error) {
    console.error('[TEST-LAB] ❌ Failed to list results:', error);
    return NextResponse.json(
      { error: 'Failed to list results' },
      { status: 500 }
    );
  }
}