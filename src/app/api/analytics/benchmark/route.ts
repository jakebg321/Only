import { NextResponse } from 'next/server';
import { AggregationService } from '@/lib/analytics/aggregation';
import { AdvancedAnalyticsEngine } from '@/lib/analytics/advanced-analytics-engine';

/**
 * Performance Benchmark API
 * Compare legacy vs optimized analytics approaches
 */
export async function GET() {
  try {
    console.log('[Benchmark] Starting comprehensive performance analysis...');
    
    const results = {
      timestamp: new Date().toISOString(),
      tests: {} as any,
      summary: {} as any
    };

    // Test 1: Aggregation Performance
    console.log('[Benchmark] Testing aggregation performance...');
    const aggregationStart = Date.now();
    const aggregationBenchmark = await AggregationService.benchmarkPerformance();
    const aggregationTime = Date.now() - aggregationStart;
    
    results.tests.aggregation = {
      ...aggregationBenchmark,
      totalTestTime: aggregationTime
    };

    // Test 2: Session Stats Performance
    console.log('[Benchmark] Testing session stats performance...');
    
    // Legacy approach simulation
    const legacySessionStart = Date.now();
    const legacySessionResponse = await fetch(new URL('/api/analytics/sessions?optimized=false', process.env.VERCEL_URL || 'http://localhost:3000'));
    const legacySessionTime = Date.now() - legacySessionStart;
    
    // Optimized approach
    const optimizedSessionStart = Date.now();
    const optimizedSessionResponse = await fetch(new URL('/api/analytics/sessions?optimized=true', process.env.VERCEL_URL || 'http://localhost:3000'));
    const optimizedSessionTime = Date.now() - optimizedSessionStart;
    
    results.tests.sessionStats = {
      legacy: {
        time: legacySessionTime,
        success: legacySessionResponse.ok
      },
      optimized: {
        time: optimizedSessionTime,
        success: optimizedSessionResponse.ok
      },
      improvement: `${((legacySessionTime - optimizedSessionTime) / legacySessionTime * 100).toFixed(1)}% faster`
    };

    // Test 3: Advanced Analytics Engine
    console.log('[Benchmark] Testing advanced analytics engine...');
    const advancedStart = Date.now();
    try {
      const advancedResults = await AdvancedAnalyticsEngine.generateUserAnalytics();
      const advancedTime = Date.now() - advancedStart;
      
      results.tests.advancedEngine = {
        time: advancedTime,
        usersAnalyzed: advancedResults.length,
        avgTimePerUser: advancedResults.length > 0 ? (advancedTime / advancedResults.length).toFixed(2) : 0,
        success: true,
        features: [
          'RFM Analysis',
          'Churn Prediction',
          'CLV Prediction', 
          'Engagement Trending',
          'Personality-based Segmentation'
        ]
      };
    } catch (error) {
      results.tests.advancedEngine = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Generate Summary
    const totalTestTime = Date.now() - Date.parse(results.timestamp);
    
    results.summary = {
      totalTestTime,
      overallAssessment: generateAssessment(results.tests),
      recommendations: generateRecommendations(results.tests),
      performanceGrade: calculatePerformanceGrade(results.tests),
      nextSteps: [
        'Implement database indexes for heavy queries',
        'Add Redis caching for expensive calculations',
        'Set up background job processing',
        'Monitor query performance in production'
      ]
    };

    console.log('[Benchmark] Performance analysis completed');
    console.log('[Benchmark] Overall Grade:', results.summary.performanceGrade);

    return NextResponse.json(results);

  } catch (error) {
    console.error('[Benchmark] Error during performance analysis:', error);
    return NextResponse.json(
      { 
        error: 'Benchmark failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

function generateAssessment(tests: any): string {
  const issues = [];
  
  if (tests.aggregation?.legacy?.time > 5000) {
    issues.push('Legacy aggregation is dangerously slow (>5s)');
  }
  
  if (tests.sessionStats?.legacy?.time > 2000) {
    issues.push('Session stats queries need optimization');
  }
  
  if (!tests.advancedEngine?.success) {
    issues.push('Advanced analytics engine is not functional');
  }
  
  if (issues.length === 0) {
    return '✅ Performance is within acceptable ranges. System is production-ready.';
  } else if (issues.length <= 2) {
    return `⚠️ Minor performance issues detected: ${issues.join(', ')}`;
  } else {
    return `🚨 Critical performance issues: ${issues.join(', ')}. Immediate optimization required.`;
  }
}

function generateRecommendations(tests: any): string[] {
  const recommendations = [];
  
  if (tests.aggregation?.legacy?.time > tests.aggregation?.optimized?.time) {
    recommendations.push('✅ Switch to optimized aggregation (proven faster)');
  }
  
  if (tests.sessionStats?.optimized?.time < tests.sessionStats?.legacy?.time) {
    recommendations.push('✅ Use optimized session stats by default');
  }
  
  if (tests.advancedEngine?.success) {
    recommendations.push('✅ Deploy advanced analytics engine for ML-based insights');
  }
  
  recommendations.push('🔧 Add composite database indexes for analytics queries');
  recommendations.push('⚡ Implement Redis caching for expensive calculations');
  recommendations.push('📊 Set up query performance monitoring');
  
  return recommendations;
}

function calculatePerformanceGrade(tests: any): string {
  let score = 100;
  
  // Deduct points for slow operations
  if (tests.aggregation?.legacy?.time > 5000) score -= 30;
  if (tests.sessionStats?.legacy?.time > 2000) score -= 20;
  
  // Add points for optimizations
  if (tests.aggregation?.optimized?.time < tests.aggregation?.legacy?.time) score += 10;
  if (tests.advancedEngine?.success) score += 20;
  
  if (score >= 90) return 'A+ (Enterprise Ready)';
  if (score >= 80) return 'A (Production Ready)';
  if (score >= 70) return 'B (Needs Minor Optimization)';
  if (score >= 60) return 'C (Needs Major Optimization)';
  return 'F (Critical Issues - Not Production Ready)';
}

/**
 * POST endpoint to run specific performance tests
 */
export async function POST(request: Request) {
  try {
    const { testType } = await request.json();
    
    let result;
    
    switch (testType) {
      case 'aggregation':
        result = await AggregationService.benchmarkPerformance();
        break;
      case 'advanced_analytics':
        const start = Date.now();
        const analytics = await AdvancedAnalyticsEngine.generateUserAnalytics();
        result = {
          time: Date.now() - start,
          users: analytics.length,
          features: analytics[0] ? Object.keys(analytics[0]) : []
        };
        break;
      default:
        throw new Error(`Unknown test type: ${testType}`);
    }
    
    return NextResponse.json({
      testType,
      result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 400 }
    );
  }
}