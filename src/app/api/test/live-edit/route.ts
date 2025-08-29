/**
 * Live Testing API - Test and analyze responses in real-time
 * Returns both the response and detailed scoring/analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { UnifiedChatEngine } from '@/lib/unified-chat-engine';
import { ResponseScorer } from '@/lib/response-scorer';
import { ConfigManager } from '@/lib/config-manager';

const chatEngine = new UnifiedChatEngine();
const scorer = new ResponseScorer();
const configManager = new ConfigManager();

// Initialize chat engine with Grok API key
(async () => {
  const grokApiKey = process.env.GROK_API_KEY;
  if (grokApiKey) {
    await chatEngine.initialize(grokApiKey);
    console.log('[LIVE-EDIT] ✅ Chat engine initialized with Grok API');
  } else {
    console.warn('[LIVE-EDIT] ⚠️ No GROK_API_KEY found - using fallback responses');
  }
})();

export async function GET(req: NextRequest) {
  return NextResponse.json({
    status: 'Live Edit API Active',
    message: 'Use POST to test responses, PUT to update config, DELETE to reset config',
    endpoints: {
      'POST /api/test/live-edit': 'Test a message and get response + analysis',
      'PUT /api/test/live-edit': 'Update human variation config',
      'DELETE /api/test/live-edit': 'Reset config to defaults'
    },
    example: {
      method: 'POST',
      body: {
        message: 'hey whats up',
        userId: 'test-user',
        sessionId: 'test-session'
      }
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      message, 
      userId = 'test-user',
      sessionId = 'test-session',
      testMode = true
    } = body;
    
    const conversationHistory = Array.isArray(body.conversationHistory) ? body.conversationHistory : [];
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }
    
    // Get current config for display
    const currentConfig = configManager.getConfig();
    
    // Process message through chat engine
    const response = await chatEngine.processMessage(
      userId,
      message,
      conversationHistory,
      { debugMode: true }
    );
    
    // Analyze the response
    const analysis = scorer.scoreResponse(
      response.message,
      message,
      {
        userType: response.undertoneAnalysis?.userType,
        isSexual: /fuck|sex|bend|horny|cock|pussy/i.test(message),
        isNervous: message.includes('😅') || message.includes('😬')
      }
    );
    
    // Generate improvement suggestions based on score
    let improvementConfig = null;
    if (analysis.overall < 8) {
      improvementConfig = generateImprovementConfig(analysis, currentConfig);
    }
    
    return NextResponse.json({
      success: true,
      response: response.message,
      followUp: response.followUp,
      analysis: {
        score: analysis.overall,
        breakdown: {
          typos: analysis.typos,
          personality: analysis.personality,
          context: analysis.context,
          flow: analysis.flow,
          punctuation: analysis.punctuation
        },
        issues: analysis.issues,
        suggestions: analysis.suggestions,
        details: analysis.details
      },
      currentConfig: {
        typoFrequency: currentConfig.typoFrequency,
        lowercaseChance: currentConfig.lowercaseChance,
        fillerChances: currentConfig.fillers,
        personality: currentConfig.personality
      },
      suggestedConfig: improvementConfig,
      undertone: response.undertoneAnalysis
    });
    
  } catch (error) {
    console.error('Live test error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process test',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Generate config improvements based on analysis
 */
function generateImprovementConfig(analysis: any, currentConfig: any) {
  const improvements = { ...currentConfig };
  
  // Adjust typo frequency based on score
  if (analysis.typos < 7) {
    if (!analysis.details.hasTypos) {
      improvements.typoFrequency = Math.min(0.4, currentConfig.typoFrequency + 0.1);
    } else {
      improvements.typoFrequency = Math.max(0.15, currentConfig.typoFrequency - 0.05);
    }
  }
  
  // Adjust personality settings
  if (analysis.personality < 7) {
    improvements.fillers.startChance = Math.min(0.8, currentConfig.fillers.startChance + 0.1);
    improvements.personality.catchphraseChance = Math.min(0.6, currentConfig.personality.catchphraseChance + 0.1);
  }
  
  // Adjust lowercase chance
  if (!analysis.details.isLowercase && analysis.flow < 8) {
    improvements.lowercaseChance = Math.min(0.8, currentConfig.lowercaseChance + 0.1);
  }
  
  return improvements;
}

/**
 * Update config endpoint
 */
export async function PUT(req: NextRequest) {
  try {
    const updates = await req.json();
    
    configManager.updateConfig(updates);
    
    return NextResponse.json({
      success: true,
      message: 'Config updated successfully',
      newConfig: configManager.getConfig()
    });
    
  } catch (error) {
    console.error('Config update error:', error);
    return NextResponse.json(
      { error: 'Failed to update config' },
      { status: 500 }
    );
  }
}

/**
 * Reset config endpoint
 */
export async function DELETE(req: NextRequest) {
  try {
    configManager.resetToDefault();
    
    return NextResponse.json({
      success: true,
      message: 'Config reset to defaults',
      config: configManager.getConfig()
    });
    
  } catch (error) {
    console.error('Config reset error:', error);
    return NextResponse.json(
      { error: 'Failed to reset config' },
      { status: 500 }
    );
  }
}