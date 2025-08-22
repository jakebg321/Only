import { NextResponse } from 'next/server';
import { AggregationService } from '@/lib/analytics/aggregation';

// This endpoint should be called by a cron job (e.g., Vercel Cron, GitHub Actions, or external service)
// Recommended frequency: Every hour for user metrics, daily for cleanup

export async function GET(request: Request) {
  try {
    // Verify cron secret to prevent unauthorized calls
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    
    // In production, use environment variable for secret
    const CRON_SECRET = process.env.CRON_SECRET || 'your-cron-secret';
    
    if (secret !== CRON_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const task = searchParams.get('task') || 'all';
    
    console.log(`[Cron] Running aggregation task: ${task}`);
    
    switch (task) {
      case 'metrics':
        await AggregationService.aggregateUserMetrics();
        break;
      
      case 'cleanup':
        await AggregationService.cleanupOldData();
        break;
      
      case 'benchmark':
        await AggregationService.benchmarkPerformance();
        break;
      
      case 'all':
      default:
        // Run optimized aggregation and cleanup
        await AggregationService.aggregateUserMetrics();
        await AggregationService.cleanupOldData();
        break;
    }
    
    return NextResponse.json({ 
      success: true,
      task,
      timestamp: new Date().toISOString(),
      message: `Aggregation task ${task} completed successfully`
    });
  } catch (error) {
    console.error('Aggregation cron error:', error);
    return NextResponse.json(
      { 
        error: 'Aggregation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Manual trigger for testing
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { task = 'all' } = body;
    
    console.log(`[Cron] Manual trigger for task: ${task}`);
    
    switch (task) {
      case 'metrics':
        await AggregationService.aggregateUserMetrics();
        break;
      
      case 'cleanup':
        await AggregationService.cleanupOldData();
        break;
      
      case 'benchmark':
        await AggregationService.benchmarkPerformance();
        break;
      
      case 'all':
      default:
        // Run optimized aggregation and cleanup
        await AggregationService.aggregateUserMetrics();
        await AggregationService.cleanupOldData();
        break;
    }
    
    return NextResponse.json({
      success: true,
      task,
      timestamp: new Date().toISOString(),
      message: `Manual aggregation task ${task} completed`
    });
  } catch (error) {
    console.error('Manual aggregation error:', error);
    return NextResponse.json(
      { 
        error: 'Manual aggregation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}