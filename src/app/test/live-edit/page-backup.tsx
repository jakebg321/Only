'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
// Tabs component removed - using simple display instead
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface TestResult {
  response: string;
  followUp?: string;
  analysis: {
    score: number;
    breakdown: {
      typos: number;
      personality: number;
      context: number;
      flow: number;
      punctuation: number;
    };
    issues: string[];
    suggestions: string[];
  };
  undertone: {
    userType: string;
    confidence: number;
  };
}

interface Config {
  typoFrequency: number;
  lowercaseChance: number;
  fillers: {
    startChance: number;
    middleChance: number;
    endChance: number;
  };
  personality: {
    followUpChance: number;
    capsEmphasisChance: number;
    catchphraseChance: number;
  };
}

export default function LiveEditPage() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [config, setConfig] = useState<Config | null>(null);
  const [testing, setTesting] = useState(false);
  const [testProgress, setTestProgress] = useState(0);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [showReview, setShowReview] = useState(false);
  const [userFeedback, setUserFeedback] = useState<Record<string, any>>({});
  const [reviewSessions, setReviewSessions] = useState<any[]>([]);
  
  // Live mode state
  const [liveMode, setLiveMode] = useState(true);
  const [messageDelay, setMessageDelay] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const [currentlyRunning, setCurrentlyRunning] = useState<any>(null);
  const [liveMessages, setLiveMessages] = useState<any[]>([]);
  const [showLiveDisplay, setShowLiveDisplay] = useState(false);
  
  // Notepad state
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(true);

  // Blind test conversations - no personality bias, natural message flows
  const testConversations = [
    {
      id: 1,
      messages: [
        "hey",
        "what are you up to tonight",
        "sounds fun",
        "I should probably get going soon"
      ]
    },
    {
      id: 2, 
      messages: [
        "hi there",
        "been having a rough day", 
        "yeah just feeling lonely",
        "nobody really talks to me anymore"
      ]
    },
    {
      id: 3,
      messages: [
        "whats up",
        "you look amazing",
        "damn",
        "show me more"
      ]
    },
    {
      id: 4,
      messages: [
        "hello",
        "just checking this out",
        "how much do you charge",
        "ok let me think about it"
      ]
    }
  ];

  // Load notes from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem('live-edit-notes');
    if (savedNotes) {
      setNotes(savedNotes);
    }
  }, []);

  // Auto-save notes to localStorage
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      localStorage.setItem('live-edit-notes', notes);
    }, 500); // Debounce saves by 500ms

    return () => clearTimeout(saveTimeout);
  }, [notes]);

  // Load current config and review sessions on mount
  useEffect(() => {
    fetchConfig();
    loadReviewSessions();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/test/live-edit');
      const data = await res.json();
      // Fetch actual config from a POST test
      testMessage('test', true);
    } catch (error) {
      console.error('Failed to fetch config:', error);
    }
  };

  const testMessage = async (text: string = message, silent: boolean = false) => {
    if (!text.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/test/live-edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          userId: `user-${Date.now()}`,
          sessionId: `session-${Date.now()}`
        })
      });
      
      const data = await res.json();
      
      if (!silent) {
        setResult(data);
      }
      
      if (data.currentConfig) {
        setConfig(data.currentConfig);
      }
      
      return data;
    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (updates: Partial<Config>) => {
    try {
      const res = await fetch('/api/test/live-edit', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      const data = await res.json();
      if (data.newConfig) {
        setConfig(data.newConfig);
      }
    } catch (error) {
      console.error('Config update failed:', error);
    }
  };

  const runConversationTest = async (conversationData: any, config: any, isLiveMode: boolean = false) => {
    const conversationResults = {
      conversationId: conversationData.id,
      messages: [],
      fullConversation: [],
      averageScore: 0
    };

    let conversationHistory: any[] = [];
    let totalScore = 0;
    
    for (let i = 0; i < conversationData.messages.length; i++) {
      const userMessage = conversationData.messages[i];
      
      // Check if paused in live mode
      while (isPaused && isLiveMode) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      if (isLiveMode) {
        // Add user message to live display
        setLiveMessages(prev => [...prev, { 
          role: 'user', 
          content: userMessage,
          timestamp: new Date()
        }]);
        
        // Show typing indicator for AI response
        setLiveMessages(prev => [...prev, {
          role: 'assistant',
          content: '',
          isTyping: true,
          timestamp: new Date()
        }]);
      }
      
      try {
        const result = await testMessage(userMessage, true);
        if (result) {
          if (isLiveMode) {
            // Remove typing indicator and add actual response
            setLiveMessages(prev => {
              const newMessages = [...prev];
              newMessages[newMessages.length - 1] = {
                role: 'assistant',
                content: result.response,
                timestamp: new Date()
              };
              return newMessages;
            });
          }
          
          const messageResult = {
            userMessage,
            aiResponse: result.response,
            followUp: result.followUp,
            detectedType: result.undertone?.userType,
            confidence: result.undertone?.confidence,
            score: result.analysis?.score || 0,
            breakdown: result.analysis?.breakdown,
            issues: result.analysis?.issues || [],
            turn: i + 1
          };
          
          conversationResults.messages.push(messageResult);
          conversationResults.fullConversation.push(
            { role: 'user', content: userMessage },
            { role: 'assistant', content: result.response }
          );
          
          if (result.analysis?.score) {
            totalScore += result.analysis.score;
          }
          
          // Add to conversation history for context in next message
          conversationHistory.push(
            { role: 'user', content: userMessage, id: `user-${i}`, timestamp: new Date() },
            { role: 'assistant', content: result.response, id: `ai-${i}`, timestamp: new Date() }
          );
          
          // Add delay before next message in live mode
          if (isLiveMode && i < conversationData.messages.length - 1) {
            // Show countdown
            for (let countdown = messageDelay; countdown > 0; countdown--) {
              setCurrentlyRunning(prev => ({
                ...prev,
                delayCountdown: countdown
              }));
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              // Check if paused during countdown
              while (isPaused && isLiveMode) {
                await new Promise(resolve => setTimeout(resolve, 100));
              }
            }
            
            // Clear countdown
            setCurrentlyRunning(prev => ({
              ...prev,
              delayCountdown: null
            }));
          }
        }
      } catch (error) {
        console.error('Test failed for message:', userMessage, error);
        
        if (isLiveMode) {
          // Show error in live display
          setLiveMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = {
              role: 'assistant',
              content: '❌ Error generating response',
              timestamp: new Date()
            };
            return newMessages;
          });
        }
      }
    }
    
    conversationResults.averageScore = conversationResults.messages.length > 0 
      ? totalScore / conversationResults.messages.length 
      : 0;
    
    return conversationResults;
  };

  const runBatchTest = async () => {
    setTesting(true);
    setTestProgress(0);
    setTestResults([]);
    setShowReview(false);
    setIsPaused(false);
    
    const iterations = 8; // Fewer iterations since we're running full conversations
    const allResults: any[] = [];
    
    const baseConfig = config || {
      typoFrequency: 0.3,
      lowercaseChance: 0.5,
      fillers: { startChance: 0.6, middleChance: 0.4, endChance: 0.7 },
      personality: { followUpChance: 0.15, capsEmphasisChance: 0.3, catchphraseChance: 0.4 }
    };
    
    for (let i = 0; i < iterations; i++) {
      // Generate test config (mix of current + mutations)
      const testConfig = i === 0 ? baseConfig : mutateConfig(baseConfig);
      await updateConfig(testConfig);
      
      // Run all 4 conversations with this config
      const configResults = {
        iteration: i + 1,
        config: { ...testConfig },
        conversations: [],
        averageScore: 0,
        timestamp: new Date().toISOString()
      };
      
      let totalScore = 0;
      let conversationCount = 0;
      
      if (liveMode) {
        // Live mode - sequential execution with real-time display
        setShowLiveDisplay(true);
        
        for (let convIndex = 0; convIndex < testConversations.length; convIndex++) {
          const conv = testConversations[convIndex];
          
          // Set up current conversation context
          setCurrentlyRunning({
            iteration: i + 1,
            conversationId: conv.id,
            config: testConfig
          });
          
          setLiveMessages([]);
          
          const convResult = await runConversationTest(conv, testConfig, true); // Live mode
          configResults.conversations.push(convResult);
          totalScore += convResult.averageScore;
          conversationCount++;
          
          // Brief pause between conversations
          if (convIndex < testConversations.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        setShowLiveDisplay(false);
      } else {
        // Batch mode - parallel execution (original behavior)
        const conversationPromises = testConversations.map(conv => runConversationTest(conv, testConfig, false));
        const conversationResults = await Promise.all(conversationPromises);
        
        for (const convResult of conversationResults) {
          configResults.conversations.push(convResult);
          totalScore += convResult.averageScore;
          conversationCount++;
        }
      }
      
      configResults.averageScore = conversationCount > 0 ? totalScore / conversationCount : 0;
      allResults.push(configResults);
      setTestProgress(((i + 1) / iterations) * 100);
    }
    
    setTestResults(allResults);
    setTestProgress(100);
    setTesting(false);
    setCurrentlyRunning(null);
    
    // Show clear prompt for feedback
    setTimeout(() => {
      alert('🎯 Testing Complete!\n\nNow review the 4 conversations from each test and rate which responses feel most natural and engaging.\n\nClick "Review Results" to start rating!');
      setShowReview(true);
    }, 500);
  };

  const mutateConfig = (cfg: any) => {
    // Ensure config has all required properties
    const safeConfig = {
      typoFrequency: cfg?.typoFrequency || 0.3,
      lowercaseChance: cfg?.lowercaseChance || 0.5,
      fillers: {
        startChance: cfg?.fillers?.startChance || 0.6,
        middleChance: cfg?.fillers?.middleChance || 0.4,
        endChance: cfg?.fillers?.endChance || 0.7
      },
      personality: {
        followUpChance: cfg?.personality?.followUpChance || 0.15,
        capsEmphasisChance: cfg?.personality?.capsEmphasisChance || 0.3,
        catchphraseChance: cfg?.personality?.catchphraseChance || 0.4
      }
    };
    
    const mutated = JSON.parse(JSON.stringify(safeConfig));
    
    // Random mutations
    const mutations = [
      () => mutated.typoFrequency = Math.min(0.4, Math.max(0.15, mutated.typoFrequency + (Math.random() - 0.5) * 0.1)),
      () => mutated.lowercaseChance = Math.min(0.8, Math.max(0.4, mutated.lowercaseChance + (Math.random() - 0.5) * 0.2)),
      () => mutated.fillers.startChance = Math.min(0.8, Math.max(0.3, mutated.fillers.startChance + (Math.random() - 0.5) * 0.2)),
      () => mutated.fillers.endChance = Math.min(0.8, Math.max(0.5, mutated.fillers.endChance + (Math.random() - 0.5) * 0.1)),
      () => mutated.personality.catchphraseChance = Math.min(0.6, Math.max(0.3, mutated.personality.catchphraseChance + (Math.random() - 0.5) * 0.1))
    ];
    
    // Apply 1-2 random mutations
    const numMutations = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < numMutations; i++) {
      const mutation = mutations[Math.floor(Math.random() * mutations.length)];
      mutation();
    }
    
    return mutated;
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-500';
    if (score >= 6) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getUserTypeColor = (type: string) => {
    switch(type) {
      case 'MARRIED_GUILTY': return 'bg-purple-500';
      case 'LONELY_SINGLE': return 'bg-blue-500';
      case 'HORNY_ADDICT': return 'bg-red-500';
      case 'CURIOUS_TOURIST': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const rateResponse = (iteration: number, responseIndex: number, rating: 'good' | 'bad' | 'excellent') => {
    const key = `${iteration}-${responseIndex}`;
    setUserFeedback(prev => ({
      ...prev,
      [key]: { ...prev[key], rating }
    }));
  };

  const addNote = (iteration: number, responseIndex: number, note: string) => {
    const key = `${iteration}-${responseIndex}`;
    setUserFeedback(prev => ({
      ...prev,
      [key]: { ...prev[key], note }
    }));
  };

  const applyFeedback = async () => {
    // Find conversations user rated as "excellent" or "good"  
    const goodConversations = Object.entries(userFeedback)
      .filter(([_, feedback]: [string, any]) => feedback.rating === 'excellent' || feedback.rating === 'good');
    
    if (goodConversations.length === 0) {
      alert('Please rate at least one conversation as good or excellent before applying feedback.');
      return;
    }

    // Extract config patterns from highly rated conversations
    const preferredConfigs = goodConversations.map(([key, _]) => {
      const [iteration, convPart, convIndex] = key.split('-');
      return testResults[parseInt(iteration) - 1]?.config;
    }).filter(Boolean);

    // Average the preferred configs to create optimized config
    if (preferredConfigs.length > 0) {
      const optimizedConfig = {
        typoFrequency: preferredConfigs.reduce((sum, cfg) => sum + (cfg.typoFrequency || 0), 0) / preferredConfigs.length,
        lowercaseChance: preferredConfigs.reduce((sum, cfg) => sum + (cfg.lowercaseChance || 0), 0) / preferredConfigs.length,
        fillers: {
          startChance: preferredConfigs.reduce((sum, cfg) => sum + (cfg.fillers?.startChance || 0), 0) / preferredConfigs.length,
          middleChance: preferredConfigs.reduce((sum, cfg) => sum + (cfg.fillers?.middleChance || 0), 0) / preferredConfigs.length,
          endChance: preferredConfigs.reduce((sum, cfg) => sum + (cfg.fillers?.endChance || 0), 0) / preferredConfigs.length
        },
        personality: {
          followUpChance: preferredConfigs.reduce((sum, cfg) => sum + (cfg.personality?.followUpChance || 0), 0) / preferredConfigs.length,
          capsEmphasisChance: preferredConfigs.reduce((sum, cfg) => sum + (cfg.personality?.capsEmphasisChance || 0), 0) / preferredConfigs.length,
          catchphraseChance: preferredConfigs.reduce((sum, cfg) => sum + (cfg.personality?.catchphraseChance || 0), 0) / preferredConfigs.length
        }
      };

      await updateConfig(optimizedConfig);
      
      // Save this review session to history
      const reviewSession = {
        timestamp: new Date().toISOString(),
        testResults: testResults,
        userFeedback: userFeedback,
        appliedConfig: optimizedConfig,
        goodConversationsCount: goodConversations.length
      };
      
      setReviewSessions(prev => [reviewSession, ...prev]);
      
      // Also save to localStorage for persistence
      const existingSessions = JSON.parse(localStorage.getItem('reviewSessions') || '[]');
      const updatedSessions = [reviewSession, ...existingSessions].slice(0, 10); // Keep last 10 sessions
      localStorage.setItem('reviewSessions', JSON.stringify(updatedSessions));
      
      alert(`Applied feedback! Updated config based on ${goodConversations.length} preferred conversations. Session saved to history.`);
    }
  };

  const loadReviewSessions = () => {
    const sessions = JSON.parse(localStorage.getItem('reviewSessions') || '[]');
    setReviewSessions(sessions);
  };

  const loadPreviousSession = (session: any) => {
    setTestResults(session.testResults);
    setUserFeedback(session.userFeedback);
    setShowReview(true);
  };

  return (
    <div className="flex min-h-screen">
      {/* Main Content */}
      <div className="flex-1">
        <div className="container mx-auto p-6 max-w-6xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Human-Guided Response Optimization</h1>
            <p className="text-gray-600 text-sm max-w-4xl">
              Test different AI configurations with blind conversations, then rate which responses feel most natural and engaging. 
              The system learns from your feedback to optimize parameters based on your business expertise.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Testing */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Type a message to test..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[100px]"
              />
              
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={() => setMessage('hey')}>Casual</Button>
                <Button variant="outline" size="sm" onClick={() => setMessage('feeling lonely tonight')}>Lonely</Button>
                <Button variant="outline" size="sm" onClick={() => setMessage('show me more')}>Sexual</Button>
                <Button variant="outline" size="sm" onClick={() => setMessage('how much do you charge')}>Tourist</Button>
              </div>
              
              <Button 
                onClick={() => testMessage()}
                disabled={loading || !message.trim()}
                className="w-full"
              >
                {loading ? 'Processing...' : 'Test Response'}
              </Button>
            </CardContent>
          </Card>

          {/* Response Result */}
          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Response</span>
                  <Badge className={getUserTypeColor(result.undertone.userType)}>
                    {result.undertone.userType} ({(result.undertone.confidence * 100).toFixed(0)}%)
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <p className="italic">"{result.response}"</p>
                  {result.followUp && (
                    <p className="text-sm text-gray-600 mt-2">Follow-up: "{result.followUp}"</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Overall Score:</span>
                    <span className={`text-2xl font-bold ${getScoreColor(result.analysis.score)}`}>
                      {result.analysis.score.toFixed(1)}/10
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    {Object.entries(result.analysis.breakdown).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between text-sm">
                        <span className="capitalize">{key}:</span>
                        <Progress value={value * 10} className="w-32 h-2" />
                        <span className="w-12 text-right">{value}/10</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {result.analysis.issues.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-1">Issues:</h4>
                    <ul className="text-sm text-red-600 list-disc list-inside">
                      {result.analysis.issues.map((issue, i) => (
                        <li key={i}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Configuration & Optimization */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              {config && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Typo Frequency</label>
                    <input
                      type="range"
                      min="0.15"
                      max="0.4"
                      step="0.05"
                      value={config.typoFrequency || 0.3}
                      onChange={(e) => updateConfig({ typoFrequency: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                    <span className="text-sm text-gray-600">{config.typoFrequency?.toFixed(2) || '0.30'}</span>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Lowercase Chance</label>
                    <input
                      type="range"
                      min="0.4"
                      max="0.8"
                      step="0.1"
                      value={config.lowercaseChance || 0.5}
                      onChange={(e) => updateConfig({ lowercaseChance: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                    <span className="text-sm text-gray-600">{config.lowercaseChance?.toFixed(2) || '0.50'}</span>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <h4 className="text-sm font-medium mb-2">Advanced Settings</h4>
                    <div className="text-sm space-y-1 text-gray-600">
                      <div>Start Fillers: {config.fillers?.startChance?.toFixed(2) || '0.60'}</div>
                      <div>Middle Fillers: {config.fillers?.middleChance?.toFixed(2) || '0.40'}</div>
                      <div>End Fillers: {config.fillers?.endChance?.toFixed(2) || '0.70'}</div>
                      <div>Follow-up Chance: {config.personality?.followUpChance?.toFixed(2) || '0.15'}</div>
                      <div>Catchphrase Chance: {config.personality?.catchphraseChance?.toFixed(2) || '0.40'}</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Batch Testing */}
          <Card>
            <CardHeader>
              <CardTitle>Testing Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Live Mode Toggle */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <div className="font-medium text-sm">Testing Mode</div>
                  <div className="text-xs text-gray-600">
                    {liveMode ? 'Watch conversations in real-time' : 'Run all tests quickly in background'}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={liveMode ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setLiveMode(true)}
                  >
                    🎬 Live
                  </Button>
                  <Button
                    variant={!liveMode ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setLiveMode(false)}
                  >
                    ⚡ Batch
                  </Button>
                </div>
              </div>

              {/* Message Delay Control (only for live mode) */}
              {liveMode && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <label className="text-sm font-medium block mb-2">
                    Message Delay: {messageDelay}s
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">1s</span>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={messageDelay}
                      onChange={(e) => setMessageDelay(parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-xs text-gray-600">10s</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Time to pause between each message so you can read and analyze responses
                  </div>
                </div>
              )}

              <Button 
                onClick={runBatchTest}
                disabled={testing}
                className="w-full"
                variant={testing ? 'secondary' : 'default'}
              >
                {testing 
                  ? (liveMode ? '🎬 Running Live Tests...' : '⚡ Running Batch Tests...') 
                  : `${liveMode ? '🎬 Start Live Testing' : '⚡ Run 8 Conversation Tests'}`
                }
              </Button>
              
              {testing && (
                <div className="space-y-2">
                  <Progress value={testProgress} />
                  <p className="text-sm text-center">
                    Progress: {testProgress.toFixed(0)}%
                  </p>
                  <p className="text-xs text-center text-gray-600">
                    Running 4 full conversations with different parameter settings
                  </p>
                </div>
              )}
              
              {testResults.length > 0 && !showReview && (
                <Button 
                  onClick={() => setShowReview(true)}
                  className="w-full"
                  variant="outline"
                >
                  Review {testResults.length} Test Results
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Review History */}
          {reviewSessions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Review History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {reviewSessions.slice(0, 5).map((session, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <div className="text-sm font-medium">
                        {new Date(session.timestamp).toLocaleDateString()} {new Date(session.timestamp).toLocaleTimeString()}
                      </div>
                      <div className="text-xs text-gray-600">
                        {session.goodConversationsCount || session.goodResponsesCount || 0} conversations rated good/excellent
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => loadPreviousSession(session)}
                    >
                      Review
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Notepad Sidebar */}
      <div className={`w-80 bg-gray-50 dark:bg-gray-900 border-l transition-all duration-300 ${showNotes ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Notes & Rules</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNotes(!showNotes)}
              className="shrink-0"
            >
              {showNotes ? '→' : '←'}
            </Button>
          </div>
          
          <div className="flex-1">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={`Add your notes here...

Examples:
• Can't have similar responses twice in a row
• Avoid formal language
• Must match user's energy level
• No double-texting unless natural
• Keep responses under 20 words
• Use more 'ur', 'u', 'prolly' for casualness`}
              className="w-full h-full p-3 text-sm border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ minHeight: '400px' }}
            />
          </div>
          
          <div className="mt-4 text-xs text-gray-500">
            <div className="flex items-center justify-between">
              <span>Auto-saves as you type</span>
              <span>{notes.length} characters</span>
            </div>
            <div className="mt-2 text-green-600">
              ✓ Notes saved locally
            </div>
          </div>
        </div>
      </div>
      
      {/* Toggle button when sidebar is hidden */}
      {!showNotes && (
        <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-40">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNotes(true)}
            className="bg-white dark:bg-gray-800 shadow-lg"
          >
            📝 Notes
          </Button>
        </div>
      )}
    </div>
      
      {/* Review Interface */}
      {showReview && testResults.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-6xl max-h-[90vh] overflow-y-auto w-full">
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Review Test Results</h2>
                <div className="flex gap-2">
                  <Button onClick={applyFeedback} variant="default">
                    Apply Feedback
                  </Button>
                  <Button onClick={() => setShowReview(false)} variant="outline">
                    Close
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Rate responses and add notes. The system will learn from your feedback.
              </p>
            </div>
            
            <div className="p-4 space-y-6">
              {testResults.map((result, resultIndex) => (
                <Card key={resultIndex}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Configuration {result.iteration}</span>
                      <div className="flex items-center gap-4">
                        <Badge variant="secondary">
                          Avg Score: {result.averageScore.toFixed(2)}/10
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(result.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Config Summary */}
                    <div className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded">
                      <strong>Config:</strong> Typos: {result.config.typoFrequency?.toFixed(2)}, 
                      Lowercase: {result.config.lowercaseChance?.toFixed(2)}, 
                      Fillers: {result.config.fillers?.startChance?.toFixed(2)}
                    </div>
                    
                    {/* Conversations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {result.conversations?.map((conversation: any, convIndex: number) => {
                        const feedbackKey = `${result.iteration}-conv-${convIndex}`;
                        const feedback = userFeedback[feedbackKey] || {};
                        
                        return (
                          <div key={convIndex} className="border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-sm">Conversation {conversation.conversationId}</h4>
                              <span className={`text-sm font-semibold ${getScoreColor(conversation.averageScore)}`}>
                                {conversation.averageScore.toFixed(1)}/10
                              </span>
                            </div>
                            
                            {/* Full Conversation Display */}
                            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded mb-3 max-h-48 overflow-y-auto">
                              {conversation.fullConversation?.map((msg: any, msgIndex: number) => (
                                <div key={msgIndex} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                  <div className={`inline-block p-2 rounded text-sm ${
                                    msg.role === 'user' 
                                      ? 'bg-blue-500 text-white' 
                                      : 'bg-white dark:bg-gray-700 border'
                                  }`}>
                                    {msg.content}
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            {/* Big Rating Buttons */}
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-sm font-medium">Rate this conversation:</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 mb-3">
                              {[
                                { rating: 'bad', label: '👎 Bad', color: 'bg-red-100 hover:bg-red-200 text-red-700' },
                                { rating: 'good', label: '👍 Good', color: 'bg-blue-100 hover:bg-blue-200 text-blue-700' },
                                { rating: 'excellent', label: '⭐ Excellent', color: 'bg-green-100 hover:bg-green-200 text-green-700' }
                              ].map(({ rating, label, color }) => (
                                <Button
                                  key={rating}
                                  size="sm"
                                  variant={feedback.rating === rating ? 'default' : 'outline'}
                                  onClick={() => rateResponse(result.iteration, `conv-${convIndex}`, rating as any)}
                                  className={`${color} ${feedback.rating === rating ? 'ring-2 ring-offset-1' : ''}`}
                                >
                                  {label}
                                </Button>
                              ))}
                            </div>
                            
                            {/* Notes */}
                            <textarea
                              placeholder="Why is this conversation good/bad? (e.g., 'too formal', 'perfect tone', 'responses don't flow naturally')"
                              value={feedback.note || ''}
                              onChange={(e) => addNote(result.iteration, `conv-${convIndex}`, e.target.value)}
                              className="w-full text-xs p-2 border rounded resize-none"
                              rows={3}
                            />
                            
                            {/* Show detected types for context but not as bias */}
                            <div className="flex gap-1 mt-2 text-xs">
                              {conversation.messages?.map((msg: any, msgIdx: number) => (
                                <Badge key={msgIdx} variant="secondary" className="text-xs">
                                  T{msg.turn}: {msg.detectedType}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Live Conversation Display */}
      {showLiveDisplay && currentlyRunning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl max-h-[80vh] overflow-hidden w-full">
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold">Live Testing - Config {currentlyRunning.iteration}</h2>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setIsPaused(!isPaused)}
                    variant="outline"
                    size="sm"
                  >
                    {isPaused ? '▶️ Resume' : '⏸️ Pause'}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowLiveDisplay(false);
                      setTesting(false);
                      setCurrentlyRunning(null);
                    }}
                    variant="outline" 
                    size="sm"
                  >
                    🛑 Stop
                  </Button>
                </div>
              </div>
              
              <div className="text-sm text-gray-600 space-y-1">
                <div>Conversation {currentlyRunning.conversationId} / 4</div>
                <div>Message Delay: {messageDelay}s</div>
                <div className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded">
                  Config: Typos: {currentlyRunning.config?.typoFrequency?.toFixed(2)}, 
                  Lowercase: {currentlyRunning.config?.lowercaseChance?.toFixed(2)}
                </div>
              </div>
            </div>
            
            <div className="p-4 max-h-96 overflow-y-auto">
              <div className="space-y-3">
                {liveMessages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs p-3 rounded-lg text-sm ${
                      msg.role === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 dark:bg-gray-800 border'
                    }`}>
                      {msg.content}
                      {msg.isTyping && (
                        <div className="flex items-center mt-1">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {currentlyRunning?.delayCountdown && (
                  <div className="text-center text-gray-500 text-sm">
                    Next message in {currentlyRunning.delayCountdown}s...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
