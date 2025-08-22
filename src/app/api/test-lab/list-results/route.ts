import { NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import path from 'path';

interface ResultFile {
  name: string;
  date: string;
  size: number;
  type: 'auto' | 'manual';
  messageCount?: number;
  relativePath: string;
}

export async function GET() {
  try {
    const baseDir = path.join(process.cwd(), 'test-lab-results');
    
    let results: ResultFile[] = [];
    
    try {
      // Get all date directories
      const dateDirs = await readdir(baseDir);
      
      for (const dateDir of dateDirs) {
        const dateDirPath = path.join(baseDir, dateDir);
        const dateStat = await stat(dateDirPath);
        
        if (dateStat.isDirectory()) {
          // Get files in this date directory
          const files = await readdir(dateDirPath);
          
          for (const file of files) {
            if (file.endsWith('.json')) {
              const filePath = path.join(dateDirPath, file);
              const fileStat = await stat(filePath);
              
              // Parse filename for metadata
              const isAutoSave = file.startsWith('auto-save');
              const messageMatch = file.match(/-(\d+)msg-/);
              const messageCount = messageMatch ? parseInt(messageMatch[1]) : undefined;
              
              results.push({
                name: file,
                date: dateDir,
                size: fileStat.size,
                type: isAutoSave ? 'auto' : 'manual',
                messageCount,
                relativePath: `/test-lab-results/${dateDir}/${file}`
              });
            }
          }
        }
      }
      
      // Sort by date/time (newest first)
      results.sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.name.match(/(\d+)\.json$/)?.[1] || '0'}`);
        const dateB = new Date(`${b.date} ${b.name.match(/(\d+)\.json$/)?.[1] || '0'}`);
        return dateB.getTime() - dateA.getTime();
      });
      
    } catch (error) {
      console.log('[TEST-LAB] No results directory yet, creating...');
      // Directory doesn't exist yet - that's okay
    }
    
    return NextResponse.json({
      success: true,
      resultsDirectory: '/test-lab-results',
      totalFiles: results.length,
      results: results.slice(0, 50), // Limit to most recent 50 files
      summary: {
        autoSaves: results.filter(r => r.type === 'auto').length,
        manualSaves: results.filter(r => r.type === 'manual').length,
        totalSize: results.reduce((sum, r) => sum + r.size, 0)
      }
    });
    
  } catch (error) {
    console.error('[TEST-LAB] ❌ Failed to list results:', error);
    return NextResponse.json(
      { error: 'Failed to list results', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}