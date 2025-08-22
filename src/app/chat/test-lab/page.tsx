"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Send, Play, RotateCcw, Download, Brain, DollarSign, AlertCircle, Target, Edit3, Code, Loader, TrendingUp, TrendingDown } from "lucide-react";

// Character database with diverse personalities for testing
const CHARACTER_DATABASE = {
  marcus: {
    name: "Marcus (Married/Guilty)",
    color: "border-red-500",
    emoji: "🔴",
    description: "Married man seeking discrete encounter",
    expectedType: "MARRIED_GUILTY",
    messages: [
      { text: "hey", delay: 2000, typingStops: 0 },
      { text: "idk", delay: 5000, typingStops: 3, previousPrompt: "are you being bad?" },
      { text: "it's complicated", delay: 8000, typingStops: 4, previousPrompt: "relationship status?" },
      { text: "maybe we shouldn't be talking", delay: 10000, typingStops: 5 }
    ]
  },
  david: {
    name: "David (Lonely Single)",
    color: "border-yellow-500", 
    emoji: "🟡",
    description: "Single man working from home, lonely",
    expectedType: "LONELY_SINGLE",
    messages: [
      { text: "Hi! How are you doing tonight? Hope you're having a good evening!", delay: 3000, typingStops: 1 },
      { text: "I've been working from home for months now and honestly it's getting pretty lonely. Don't really have anyone to talk to", delay: 4000, typingStops: 2 },
      { text: "What made you want to do this kind of work? You seem really nice", delay: 3500, typingStops: 1 }
    ]
  },
  jake: {
    name: "Jake (Horny Addict)",
    color: "border-orange-500",
    emoji: "🟠", 
    description: "Explicit, instant responses, escalation focused",
    expectedType: "HORNY_ADDICT",
    messages: [
      { text: "fuck ur hot", delay: 500, typingStops: 0 },
      { text: "show me more", delay: 800, typingStops: 0 },
      { text: "come on don't tease", delay: 600, typingStops: 0 },
      { text: "what else u got??", delay: 400, typingStops: 0 }
    ]
  },
  tom: {
    name: "Tom (Curious Tourist)",
    color: "border-blue-500",
    emoji: "🔵",
    description: "Just browsing, price-focused, low commitment",
    expectedType: "CURIOUS_TOURIST",
    messages: [
      { text: "hey", delay: 3000, typingStops: 0 },
      { text: "just looking around", delay: 4000, typingStops: 1, previousPrompt: "what brings you here?" },
      { text: "how much?", delay: 2000, typingStops: 0 },
      { text: "is there free stuff?", delay: 3000, typingStops: 0 }
    ]
  },
  alex: {
    name: "Alex (Ambiguous Mixed)",
    color: "border-purple-500",
    emoji: "🟣",
    description: "Mixed signals, tests detection accuracy",
    expectedType: "UNKNOWN",
    messages: [
      { text: "hi there", delay: 2500, typingStops: 1 },
      { text: "not sure what I'm looking for", delay: 4000, typingStops: 2 },
      { text: "seems interesting though", delay: 3000, typingStops: 1 },
      { text: "tell me more", delay: 2000, typingStops: 0 }
    ]
  },
  sarah: {
    name: "Sarah (Female Perspective)",
    color: "border-pink-500",
    emoji: "💕",
    description: "Different language patterns, tests gender detection",
    expectedType: "CURIOUS_TOURIST",
    messages: [
      { text: "Hey girl! Love your content ✨", delay: 2000, typingStops: 0 },
      { text: "I'm also in this space, just checking out the competition 😉", delay: 3500, typingStops: 1 },
      { text: "Your setup looks amazing! Any tips?", delay: 3000, typingStops: 1 }
    ]
  }
};

// Backwards compatibility
const TEST_SCRIPTS = {
  married: CHARACTER_DATABASE.marcus,
  lonely: CHARACTER_DATABASE.david,
  addict: CHARACTER_DATABASE.jake,
  tourist: CHARACTER_DATABASE.tom
};

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  undertone?: any;
  responseTime?: number;
  typingStops?: number;
}

interface ConversationState {
  messages: Message[];
  input: string;
  isLoading: boolean;
  userId: string;
  selectedCharacter: string; // Key from CHARACTER_DATABASE
  scriptIndex: number;
  isRunningScript: boolean;
  lastAnalysis?: any;
}

interface AnalysisData {
  userType: string;
  confidence: number;
  hiddenMeaning: string;
  strategy: string;
  revenuePotential: string;
  indicators?: string[];
  isAnalyzing?: boolean;
  previousConfidence?: number;
  changeFromPrevious?: number;
}

export default function TestLab() {
  // Script editing state
  const [showScriptEditor, setShowScriptEditor] = useState(false);
  const [editingScript, setEditingScript] = useState<string | null>(null);
  const [customScripts, setCustomScripts] = useState(TEST_SCRIPTS);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Four separate conversation states with character selection
  const [conversations, setConversations] = useState<Record<string, ConversationState>>({
    window1: {
      messages: [],
      input: "",
      isLoading: false,
      userId: `test_window1_${Date.now()}`,
      selectedCharacter: 'marcus', // Default character
      scriptIndex: 0,
      isRunningScript: false
    },
    window2: {
      messages: [],
      input: "",
      isLoading: false,
      userId: `test_window2_${Date.now()}`,
      selectedCharacter: 'david', // Default character
      scriptIndex: 0,
      isRunningScript: false
    },
    window3: {
      messages: [],
      input: "",
      isLoading: false,
      userId: `test_window3_${Date.now()}`,
      selectedCharacter: 'jake', // Default character
      scriptIndex: 0,
      isRunningScript: false
    },
    window4: {
      messages: [],
      input: "",
      isLoading: false,
      userId: `test_window4_${Date.now()}`,
      selectedCharacter: 'tom', // Default character
      scriptIndex: 0,
      isRunningScript: false
    }
  });

  // Analysis data for each conversation
  const [analyses, setAnalyses] = useState<Record<string, AnalysisData | null>>({
    window1: null,
    window2: null,
    window3: null,
    window4: null
  });
  
  // Auto-save tracking
  const [totalMessageCount, setTotalMessageCount] = useState(0);
  const [lastAutoSave, setLastAutoSave] = useState(0);
  const [saveStatus, setSaveStatus] = useState<string>('');

  // Initialize profiles and validate character assignments
  useEffect(() => {
    console.log('Test lab loaded - ready to test psychological profiling');
    
    // Validate and fix any missing character assignments
    setConversations(prev => {
      const updated = { ...prev };
      let needsUpdate = false;
      
      Object.keys(updated).forEach(windowKey => {
        const selectedChar = updated[windowKey].selectedCharacter;
        if (!selectedChar || !CHARACTER_DATABASE[selectedChar as keyof typeof CHARACTER_DATABASE]) {
          console.log(`Fixing missing character for ${windowKey}`);
          // Assign default characters based on window
          const defaultCharacters = {
            window1: 'marcus',
            window2: 'david', 
            window3: 'jake',
            window4: 'tom'
          };
          updated[windowKey].selectedCharacter = defaultCharacters[windowKey as keyof typeof defaultCharacters] || 'marcus';
          needsUpdate = true;
        }
      });
      
      if (needsUpdate) {
        console.log('Updated character assignments:', updated);
      }
      
      // Mark as initialized after validation
      setTimeout(() => {
        setIsInitialized(true);
      }, 200);
      
      return needsUpdate ? updated : prev;
    });
  }, []);

  // Send message for a specific conversation
  const sendMessage = async (convKey: string, messageText?: string, responseTime?: number, typingStops?: number) => {
    const conv = conversations[convKey];
    if ((!messageText && !conv.input.trim()) || conv.isLoading) return;

    const text = messageText || conv.input;
    
    // Add user message with unique ID
    const userMessage: Message = {
      id: `${convKey}_user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
      responseTime,
      typingStops
    };

    // Update conversation and show analyzing state
    setConversations(prev => ({
      ...prev,
      [convKey]: {
        ...prev[convKey],
        messages: [...prev[convKey].messages, userMessage],
        input: "",
        isLoading: true
      }
    }));
    
    // Set analyzing state for this window
    setAnalyses(prev => ({
      ...prev,
      [convKey]: {
        ...prev[convKey],
        isAnalyzing: true
      }
    }));

    try {
      // Get the current conversation state INCLUDING the message we just added
      const currentMessages = [...conversations[convKey].messages];
      
      // Call unified API with full conversation history
      const response = await fetch('/api/chat/unified', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: conv.userId,
          message: text,
          conversationHistory: currentMessages, // Pass the FULL updated history
          debugMode: true,
          responseTime,
          typingStops
        })
      });

      const data = await response.json();
      
      // Update analysis with indicators and change tracking
      if (data.undertoneAnalysis) {
        setAnalyses(prev => {
          const previousConfidence = prev[convKey]?.confidence || 0;
          return {
            ...prev,
            [convKey]: {
              userType: data.undertoneAnalysis.userType,
              confidence: data.undertoneAnalysis.confidence,
              hiddenMeaning: data.undertoneAnalysis.hiddenMeaning,
              strategy: data.undertoneAnalysis.suggestedStrategy,
              revenuePotential: data.undertoneAnalysis.revenuePotential,
              indicators: data.undertoneAnalysis.indicators || [],
              isAnalyzing: false,
              previousConfidence,
              changeFromPrevious: data.undertoneAnalysis.confidence - previousConfidence
            }
          };
        });
      }

      // Simulate typing delay
      const delay = data.suggestedDelay || 2000;
      await new Promise(resolve => setTimeout(resolve, delay));

      // Add bot message with unique ID
      const botMessage: Message = {
        id: `${convKey}_bot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        undertone: data.undertoneAnalysis
      };

      setConversations(prev => ({
        ...prev,
        [convKey]: {
          ...prev[convKey],
          messages: deduplicateMessages([...prev[convKey].messages, botMessage]),
          isLoading: false,
          lastAnalysis: data.undertoneAnalysis
        }
      }));
      
      // Track total message count for auto-save
      setTotalMessageCount(prevCount => {
        const newCount = prevCount + 2; // +2 for user message and bot response
        
        // Auto-save every 10 messages
        if (newCount >= lastAutoSave + 10) {
          console.log(`[TEST-LAB] 🔄 Auto-saving at ${newCount} messages`);
          autoSaveResults(newCount);
          setLastAutoSave(newCount);
        }
        
        return newCount;
      });

    } catch (error) {
      console.error('Error sending message:', error);
      setConversations(prev => ({
        ...prev,
        [convKey]: {
          ...prev[convKey],
          isLoading: false
        }
      }));
    }
  };

  // Run a test script
  const runScript = async (convKey: string) => {
    const conv = conversations[convKey];
    const character = CHARACTER_DATABASE[conv.selectedCharacter as keyof typeof CHARACTER_DATABASE];
    if (!character) return;

    // Prevent multiple scripts running simultaneously on same window
    if (conv.isRunningScript) {
      console.log(`Script already running for ${convKey}, skipping`);
      return;
    }

    // Reset conversation
    await resetConversation(convKey);
    
    setConversations(prev => ({
      ...prev,
      [convKey]: {
        ...prev[convKey],
        isRunningScript: true,
        scriptIndex: 0
      }
    }));

    // Add initial bot message with psychological trigger based on character type
    let initContent = "Hey sexy 😘 What brings you here tonight?";
    
    if (character.expectedType === 'MARRIED_GUILTY') {
      initContent = "Hey there... are you being bad tonight? 😈";
    } else if (character.expectedType === 'LONELY_SINGLE') {
      initContent = "Hi! How's your evening going? You seem like you could use some company 💕";
    } else if (character.expectedType === 'HORNY_ADDICT') {
      initContent = "Hey sexy 😘 What's got you all worked up?";
    } else if (character.expectedType === 'CURIOUS_TOURIST') {
      initContent = "Hey! What brings you here? Just curious what you're looking for 😊";
    }

    const initMessage: Message = {
      id: `${convKey}_init_${Date.now()}`,
      role: 'assistant',
      content: initContent,
      timestamp: new Date()
    };

    setConversations(prev => ({
      ...prev,
      [convKey]: {
        ...prev[convKey],
        messages: [initMessage]
      }
    }));

    // Run each message in character script
    for (let i = 0; i < character.messages.length; i++) {
      const scriptMsg = character.messages[i];
      
      // If this message has a previousPrompt, inject it as a bot message first
      if ('previousPrompt' in scriptMsg && scriptMsg.previousPrompt) {
        const probeMessage: Message = {
          id: `${convKey}_probe_${i}_${Date.now()}`,
          role: 'assistant',
          content: scriptMsg.previousPrompt,
          timestamp: new Date()
        };

        setConversations(prev => ({
          ...prev,
          [convKey]: {
            ...prev[convKey],
            messages: deduplicateMessages([...prev[convKey].messages, probeMessage])
          }
        }));
        
        // Small delay after adding probe
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Wait for delay to simulate typing
      await new Promise(resolve => setTimeout(resolve, scriptMsg.delay));
      
      // Send the message - it will now have the correct previousQuestion in history
      await sendMessage(convKey, scriptMsg.text, scriptMsg.delay, scriptMsg.typingStops);
      
      // Wait for bot response before next iteration
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    setConversations(prev => ({
      ...prev,
      [convKey]: {
        ...prev[convKey],
        isRunningScript: false,
        scriptIndex: 0 // Reset script index
      }
    }));
  };

  // Reset a conversation
  const resetConversation = async (convKey: string) => {
    const newUserId = `test_${convKey}_${Date.now()}`;
    const conv = conversations[convKey];
    
    setConversations(prev => ({
      ...prev,
      [convKey]: {
        messages: [], // Clear all messages to prevent duplicates
        input: "",
        isLoading: false,
        userId: newUserId,
        selectedCharacter: conv?.selectedCharacter || 'marcus', // Preserve character selection
        scriptIndex: 0,
        isRunningScript: false
      }
    }));
    
    setAnalyses(prev => ({
      ...prev,
      [convKey]: null
    }));
  };

  // Run all scripts
  const runAllScripts = async () => {
    const promises = Object.keys(conversations).map(key => runScript(key));
    await Promise.all(promises);
  };
  
  // Utility to deduplicate messages by ID
  const deduplicateMessages = (messages: Message[]): Message[] => {
    const seen = new Set<string>();
    return messages.filter(msg => {
      if (seen.has(msg.id)) {
        console.log(`Removing duplicate message: ${msg.id}`);
        return false;
      }
      seen.add(msg.id);
      return true;
    });
  };

  // Change character for a window
  const changeCharacter = (windowKey: string, characterKey: string) => {
    setConversations(prev => ({
      ...prev,
      [windowKey]: {
        ...prev[windowKey],
        selectedCharacter: characterKey,
        messages: [], // Reset messages when changing character
        isRunningScript: false,
        scriptIndex: 0
      }
    }));
    
    // Reset analysis for this window
    setAnalyses(prev => ({
      ...prev,
      [windowKey]: null
    }));
  };
  
  // Edit script
  const editScript = (scriptKey: string) => {
    setEditingScript(scriptKey);
    setShowScriptEditor(true);
  };
  
  // Save script
  const saveScript = (scriptKey: string, newScript: any) => {
    setCustomScripts(prev => ({
      ...prev,
      [scriptKey]: newScript
    }));
    setShowScriptEditor(false);
    setEditingScript(null);
  };
  
  // Reset scripts to default
  const resetScripts = () => {
    setCustomScripts(TEST_SCRIPTS);
    setShowScriptEditor(false);
    setEditingScript(null);
  };

  // Reset all conversations
  const resetAll = () => {
    Object.keys(conversations).forEach(key => resetConversation(key));
    setTotalMessageCount(0);
    setLastAutoSave(0);
    setSaveStatus('');
  };

  // Auto-save results to server
  const autoSaveResults = async (messageCount: number) => {
    try {
      setSaveStatus('🔄 Auto-saving...');
      
      const results = {
        timestamp: new Date().toISOString(),
        conversations: Object.keys(conversations).map(key => ({
          type: key,
          messages: conversations[key].messages,
          analysis: analyses[key],
          character: conversations[key].selectedCharacter
        })),
        messageCount,
        autoSave: true
      };
      
      const response = await fetch('/api/test-lab/save-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(results)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSaveStatus(`✅ Auto-saved (${messageCount} messages)`);
        console.log(`[TEST-LAB] ✅ Auto-saved: ${data.filename}`);
        setTimeout(() => setSaveStatus(''), 3000);
      } else {
        setSaveStatus('❌ Auto-save failed');
        setTimeout(() => setSaveStatus(''), 3000);
      }
    } catch (error) {
      console.error('[TEST-LAB] Auto-save error:', error);
      setSaveStatus('❌ Auto-save error');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };
  
  // Manual export results (enhanced)
  const exportResults = async () => {
    try {
      setSaveStatus('🔄 Saving...');
      
      const results = {
        timestamp: new Date().toISOString(),
        conversations: Object.keys(conversations).map(key => ({
          type: key,
          messages: conversations[key].messages,
          analysis: analyses[key],
          character: conversations[key].selectedCharacter,
          messageCount: conversations[key].messages.length
        })),
        messageCount: totalMessageCount,
        autoSave: false
      };
      
      // Save to server
      const serverResponse = await fetch('/api/test-lab/save-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(results)
      });
      
      const serverData = await serverResponse.json();
      
      if (serverData.success) {
        setSaveStatus(`✅ Saved: ${serverData.filename}`);
        console.log(`[TEST-LAB] ✅ Manual save: ${serverData.filename}`);
        
        // Also download locally (browser)
        const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `test-lab-results-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        setTimeout(() => setSaveStatus(''), 5000);
      } else {
        setSaveStatus('❌ Server save failed, downloading locally...');
        
        // Fallback to browser download
        const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `test-lab-results-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        setTimeout(() => setSaveStatus(''), 3000);
      }
    } catch (error) {
      console.error('[TEST-LAB] Export error:', error);
      setSaveStatus('❌ Export error, downloading locally...');
      
      // Fallback to simple export
      const results = {
        timestamp: new Date().toISOString(),
        conversations: Object.keys(conversations).map(key => ({
          type: key,
          messages: conversations[key].messages,
          analysis: analyses[key]
        }))
      };
      
      const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `test-lab-results-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  // Render a single chat window
  const renderChatWindow = (convKey: string) => {
    const conv = conversations[convKey];
    
    // Early return if conversation doesn't exist
    if (!conv) {
      return (
        <Card className="h-[550px] border-gray-500 border-2 bg-black/40">
          <CardHeader>
            <CardTitle className="text-sm text-red-400">Loading conversation...</CardTitle>
          </CardHeader>
        </Card>
      );
    }
    
    // Validate and get character
    const selectedChar = conv.selectedCharacter;
    const character = CHARACTER_DATABASE[selectedChar as keyof typeof CHARACTER_DATABASE];
    const analysis = analyses[convKey];
    
    // Debug logging
    console.log(`Rendering window ${convKey}:`, {
      conv: conv,
      selectedCharacter: selectedChar,
      character: character,
      characterExists: !!character
    });
    
    // If no character selected or character doesn't exist, show loading/error
    if (!selectedChar || !character) {
      // Try to auto-fix by assigning default character
      const defaultCharacters = {
        window1: 'marcus',
        window2: 'david', 
        window3: 'jake',
        window4: 'tom'
      };
      
      const defaultChar = defaultCharacters[convKey as keyof typeof defaultCharacters] || 'marcus';
      
      // Auto-fix the character assignment
      setTimeout(() => {
        changeCharacter(convKey, defaultChar);
      }, 100);
      
      return (
        <Card className="h-[550px] border-yellow-500 border-2 bg-black/40">
          <CardHeader>
            <CardTitle className="text-sm text-yellow-400">
              Loading character... {!selectedChar ? '(no character selected)' : '(character not found)'}
            </CardTitle>
            <p className="text-xs text-gray-400">
              Window: {convKey}, Selected: "{selectedChar || 'undefined'}", Auto-fixing to: {defaultChar}
            </p>
          </CardHeader>
        </Card>
      );
    }
    
    return (
      <Card className={`h-[550px] ${character.color} border-2 bg-black/40`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex justify-between items-center">
            <div className="flex flex-col gap-1">
              <span className="text-xs">{character.emoji} {character.name}</span>
              <select 
                value={conv.selectedCharacter}
                onChange={(e) => changeCharacter(convKey, e.target.value)}
                className="text-xs bg-gray-800 border-gray-600 rounded px-1 py-0"
              >
                {Object.entries(CHARACTER_DATABASE).map(([key, char]) => (
                  <option key={key} value={key}>
                    {char.emoji} {char.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-1">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => runScript(convKey)}
                disabled={conv.isRunningScript}
                className="p-1"
              >
                <Play className="w-3 h-3 mr-1" />
                Run
              </Button>
            </div>
          </CardTitle>
          <p className="text-xs text-gray-400 mt-1">{character.description}</p>
          <p className="text-xs text-gray-500">Expected: {character.expectedType}</p>
        </CardHeader>
        <CardContent className="flex flex-col h-[calc(100%-60px)]">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-2 mb-2 text-xs">
            {conv.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-2 rounded ${
                    msg.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-100'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {msg.responseTime && (
                    <p className="text-[10px] mt-1 opacity-50">
                      {(msg.responseTime / 1000).toFixed(1)}s | {msg.typingStops} stops
                    </p>
                  )}
                </div>
              </div>
            ))}
            {conv.isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 p-2 rounded">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse" />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse delay-75" />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse delay-150" />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Input */}
          <div className="flex gap-1">
            <Textarea
              value={conv.input}
              onChange={(e) => setConversations(prev => ({
                ...prev,
                [convKey]: { ...prev[convKey], input: e.target.value }
              }))}
              placeholder="Type..."
              className="flex-1 min-h-[40px] max-h-[40px] text-xs bg-gray-800 border-gray-600"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(convKey);
                }
              }}
            />
            <Button
              size="sm"
              onClick={() => sendMessage(convKey)}
              disabled={conv.isLoading || !conv.input.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Send className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Show loading state until initialization is complete
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-12 h-12 text-purple-400 animate-pulse mx-auto mb-4" />
          <h2 className="text-xl text-white mb-2">Initializing Test Lab...</h2>
          <p className="text-gray-400">Setting up character assignments and validation</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-400" />
          Psychological Test Lab - 4-Way Split Testing
        </h1>
        <p className="text-gray-400 text-sm">Test all personality types simultaneously</p>
      </div>

      {/* Control Panel */}
      <div className="mb-4">
        <div className="flex gap-2 flex-wrap mb-2">
          <Button onClick={runAllScripts} variant="outline" className="bg-green-600 hover:bg-green-700">
            <Play className="w-4 h-4 mr-2" />
            Run All Scripts
          </Button>
          <Button onClick={() => setShowScriptEditor(true)} variant="outline" className="bg-blue-600 hover:bg-blue-700">
            <Code className="w-4 h-4 mr-2" />
            View Scripts
          </Button>
          <Button onClick={resetScripts} variant="outline" className="bg-orange-600 hover:bg-orange-700">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Scripts
          </Button>
          <Button onClick={resetAll} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset All
          </Button>
          <Button onClick={exportResults} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Save Results
          </Button>
        </div>
        
        {/* Status Bar */}
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-400">
            📊 Messages: {totalMessageCount} | Next auto-save: {Math.max(0, lastAutoSave + 10 - totalMessageCount)} messages
          </span>
          {saveStatus && (
            <span className="px-2 py-1 rounded bg-gray-800 border border-gray-600">
              {saveStatus}
            </span>
          )}
        </div>
      </div>

      {/* Four Chat Windows */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        {Object.keys(conversations).map(key => (
          <div key={key}>
            {renderChatWindow(key)}
          </div>
        ))}
      </div>

      {/* Unified Analysis Dashboard */}
      <Card className="bg-black/60 border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Real-Time Psychological Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {Object.keys(analyses).map(key => {
              const analysis = analyses[key];
              const conv = conversations[key];
              const character = CHARACTER_DATABASE[conv?.selectedCharacter as keyof typeof CHARACTER_DATABASE];
              
              return (
                <div key={key} className={`p-3 rounded border ${character?.color} bg-black/40`}>
                  <h3 className="font-bold text-sm mb-2 flex items-center justify-between">
                    <span>{character?.emoji} {character?.name}</span>
                    {analysis?.isAnalyzing && <Loader className="w-3 h-3 animate-spin text-purple-400" />}
                  </h3>
                  {analysis ? (
                    <div className="space-y-2 text-xs">
                      {/* Confidence Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-gray-400">Confidence</span>
                          <div className="flex items-center gap-1">
                            <span className={`font-bold ${
                              analysis.confidence > 0.7 ? 'text-green-400' : 
                              analysis.confidence > 0.5 ? 'text-yellow-400' : 'text-red-400'
                            }`}>
                              {(analysis.confidence * 100).toFixed(0)}%
                            </span>
                            {analysis.changeFromPrevious !== undefined && analysis.changeFromPrevious !== 0 && (
                              <span className={`flex items-center ${
                                analysis.changeFromPrevious > 0 ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {analysis.changeFromPrevious > 0 ? (
                                  <TrendingUp className="w-3 h-3" />
                                ) : (
                                  <TrendingDown className="w-3 h-3" />
                                )}
                                <span className="text-[10px]">
                                  {Math.abs(analysis.changeFromPrevious * 100).toFixed(0)}%
                                </span>
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="relative h-2 bg-gray-700 rounded overflow-hidden">
                          <div 
                            className={`absolute h-full rounded transition-all duration-500 ${
                              analysis.confidence > 0.7 ? 'bg-green-500' : 
                              analysis.confidence > 0.5 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${analysis.confidence * 100}%` }}
                          />
                        </div>
                      </div>
                      
                      {/* Type and Indicators */}
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>Type:</span>
                          <span className="font-mono text-[11px]">{analysis.userType}</span>
                        </div>
                        {analysis.indicators && analysis.indicators.length > 0 && (
                          <div className="flex justify-between">
                            <span>Indicators:</span>
                            <span className="bg-purple-600/50 px-1.5 py-0.5 rounded text-[10px]">
                              {analysis.indicators.length} found
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Revenue */}
                      <div className="flex justify-between">
                        <span>Revenue:</span>
                        <span className={`font-bold ${
                          analysis.revenuePotential === 'HIGH' ? 'text-green-400' :
                          analysis.revenuePotential === 'MEDIUM' ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {analysis.revenuePotential}
                        </span>
                      </div>
                      
                      {/* Hidden Meaning */}
                      <div className="mt-2 pt-2 border-t border-gray-700">
                        <p className="text-[10px] text-gray-400">Hidden Meaning:</p>
                        <p className="text-[11px] italic line-clamp-2">{analysis.hiddenMeaning}</p>
                      </div>
                      
                      {/* Strategy */}
                      <div className="mt-1">
                        <p className="text-[10px] text-gray-400">Strategy:</p>
                        <p className="text-[11px] line-clamp-2">{analysis.strategy}</p>
                      </div>
                      
                      {/* Show indicators on hover */}
                      {analysis.indicators && analysis.indicators.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-700">
                          <p className="text-[10px] text-gray-400 mb-1">Detected Patterns:</p>
                          <div className="space-y-0.5">
                            {analysis.indicators.slice(0, 3).map((indicator, idx) => (
                              <p key={idx} className="text-[10px] text-gray-300 truncate">
                                • {indicator}
                              </p>
                            ))}
                            {analysis.indicators.length > 3 && (
                              <p className="text-[10px] text-gray-500">+{analysis.indicators.length - 3} more</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-xs">Waiting for input...</p>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Success Indicators */}
          <div className="mt-4 pt-4 border-t border-gray-700">
            <h4 className="text-sm font-bold mb-2">Detection Accuracy</h4>
            <div className="grid grid-cols-4 gap-4">
              {Object.keys(analyses).map(key => {
                const analysis = analyses[key];
                const conv = conversations[key];
                const character = CHARACTER_DATABASE[conv?.selectedCharacter as keyof typeof CHARACTER_DATABASE];
                const expectedType = character?.expectedType;
                
                const isCorrect = analysis?.userType === expectedType;
                
                return (
                  <div key={key} className="text-center">
                    <p className="text-xs text-gray-400 mb-1">Expected: {expectedType}</p>
                    <p className="text-xs text-gray-300 mb-2">Detected: {analysis?.userType || 'None'}</p>
                    {analysis && (
                      <div className={`text-2xl ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                        {isCorrect ? '✅' : '❌'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Script Editor Modal */}
      {showScriptEditor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="w-[90vw] h-[80vh] bg-gray-900 border-purple-500/30">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Test Scripts Editor
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowScriptEditor(false)}
                >
                  ✕
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[calc(100%-80px)] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                {Object.keys(customScripts).map(scriptKey => {
                  const script = customScripts[scriptKey as keyof typeof customScripts];
                  return (
                    <div key={scriptKey} className={`p-4 rounded border ${script.color} bg-black/40`}>
                      <h3 className="font-bold mb-3 flex items-center justify-between">
                        {script.name}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setEditingScript(editingScript === scriptKey ? null : scriptKey)}
                        >
                          <Edit3 className="w-3 h-3 mr-1" />
                          {editingScript === scriptKey ? 'Cancel' : 'Edit'}
                        </Button>
                      </h3>
                      
                      {editingScript === scriptKey ? (
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm text-gray-400">Script Name:</label>
                            <input 
                              type="text" 
                              value={script.name}
                              onChange={(e) => setCustomScripts(prev => ({
                                ...prev,
                                [scriptKey]: { ...script, name: e.target.value }
                              }))}
                              className="w-full p-2 mt-1 bg-gray-800 rounded text-sm"
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm text-gray-400">Messages:</label>
                            {script.messages.map((msg, idx) => (
                              <div key={idx} className="mt-2 p-2 bg-gray-800 rounded">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xs text-gray-500">Message {idx + 1}:</span>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      const newMessages = script.messages.filter((_, i) => i !== idx);
                                      setCustomScripts(prev => ({
                                        ...prev,
                                        [scriptKey]: { ...script, messages: newMessages }
                                      }));
                                    }}
                                    className="p-1 h-6"
                                  >
                                    ✕
                                  </Button>
                                </div>
                                <input 
                                  type="text" 
                                  value={msg.text}
                                  onChange={(e) => {
                                    const newMessages = [...script.messages];
                                    newMessages[idx] = { ...msg, text: e.target.value };
                                    setCustomScripts(prev => ({
                                      ...prev,
                                      [scriptKey]: { ...script, messages: newMessages }
                                    }));
                                  }}
                                  className="w-full p-1 bg-gray-700 rounded text-xs"
                                  placeholder="Message text"
                                />
                                <div className="flex gap-2 mt-1">
                                  <input 
                                    type="number" 
                                    value={msg.delay}
                                    onChange={(e) => {
                                      const newMessages = [...script.messages];
                                      newMessages[idx] = { ...msg, delay: parseInt(e.target.value) };
                                      setCustomScripts(prev => ({
                                        ...prev,
                                        [scriptKey]: { ...script, messages: newMessages }
                                      }));
                                    }}
                                    className="w-20 p-1 bg-gray-700 rounded text-xs"
                                    placeholder="Delay (ms)"
                                  />
                                  <input 
                                    type="number" 
                                    value={msg.typingStops || 0}
                                    onChange={(e) => {
                                      const newMessages = [...script.messages];
                                      newMessages[idx] = { ...msg, typingStops: parseInt(e.target.value) };
                                      setCustomScripts(prev => ({
                                        ...prev,
                                        [scriptKey]: { ...script, messages: newMessages }
                                      }));
                                    }}
                                    className="w-20 p-1 bg-gray-700 rounded text-xs"
                                    placeholder="Stops"
                                  />
                                </div>
                              </div>
                            ))}
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                const newMessages = [...script.messages, { text: "", delay: 2000, typingStops: 0 }];
                                setCustomScripts(prev => ({
                                  ...prev,
                                  [scriptKey]: { ...script, messages: newMessages }
                                }));
                              }}
                              className="mt-2"
                            >
                              + Add Message
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {script.messages.map((msg, idx) => (
                            <div key={idx} className="text-xs bg-gray-800 p-2 rounded">
                              <div className="font-mono text-green-400">"{msg.text}"</div>
                              <div className="text-gray-500 mt-1">
                                Delay: {msg.delay}ms | Stops: {msg.typingStops || 0}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}