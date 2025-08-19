"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, RefreshCw, Download, Activity, Brain, Target, TrendingUp, AlertCircle } from "lucide-react";
import { initProfile, getNextProbe, analyzeResponse, trackBehavior, getProfile, getStrategy } from "@/lib/database-profiler";
import { trackUserEvent, userAnalytics } from "@/lib/user-analytics";
import DebugPanel from "@/components/DebugPanel";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  probeId?: string;
}

export default function DebugChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userId] = useState(`debug_user_${Date.now()}`);
  
  // Debug state
  const [currentProfile, setCurrentProfile] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [probeQueue, setProbeQueue] = useState<any[]>([]);
  const [typingMetrics, setTypingMetrics] = useState({
    startTime: null as Date | null,
    stops: 0,
    currentLength: 0
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const updateInterval = useRef<NodeJS.Timeout | null>(null);

  const updateDebugData = useCallback(async () => {
    // Get latest profile
    const profile = await getProfile(userId);
    if (profile) {
      setCurrentProfile(profile);
    }
    
    // Get strategy
    const strategy = await getStrategy(userId);
    if (strategy) {
      setCurrentProfile((prev: any) => ({
        ...prev,
        strategy
      }));
    }
    
    // Update probe queue
    const messageCount = messages.filter(m => m.role === 'user').length;
    const nextProbe = await getNextProbe(userId, messageCount);
    if (nextProbe) {
      setProbeQueue([nextProbe]);
    }
  }, [userId, messages]);

  useEffect(() => {
    // Initialize profile
    const initializeProfile = async () => {
      const profile = await initProfile(userId);
      setCurrentProfile(profile);
    };
    
    initializeProfile();
    
    // Add welcome message
    setMessages([{
      id: '1',
      role: 'assistant',
      content: `Hey sexy 😘 I'm Remy. This is debug mode - you can see everything happening in real-time on the right. What should I call you?`,
      timestamp: new Date()
    }]);
    
    // Start real-time updates
    updateInterval.current = setInterval(() => {
      updateDebugData();
    }, 2000); // Update every 2 seconds (slower for database)
    
    return () => {
      if (updateInterval.current) {
        clearInterval(updateInterval.current);
      }
    };
  }, [userId, updateDebugData]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleTyping = (value: string) => {
    setInput(value);
    
    // Track typing behavior
    if (!typingMetrics.startTime && value.length > 0) {
      setTypingMetrics(prev => ({
        ...prev,
        startTime: new Date(),
        currentLength: value.length
      }));
      
      const event = {
        type: 'typing_started',
        timestamp: new Date(),
        data: { length: value.length }
      };
      setEvents(prev => [event, ...prev].slice(0, 50)); // Keep last 50 events
      trackUserEvent(userId, 'typing_started', {});
      
    } else if (typingMetrics.startTime && value.length === 0) {
      setTypingMetrics(prev => ({
        ...prev,
        stops: prev.stops + 1
      }));
      
      const event = {
        type: 'typing_stopped',
        timestamp: new Date(),
        data: { stops: typingMetrics.stops + 1 }
      };
      setEvents(prev => [event, ...prev].slice(0, 50));
      trackUserEvent(userId, 'typing_stopped', {});
      
    } else if (value.length !== typingMetrics.currentLength) {
      setTypingMetrics(prev => ({
        ...prev,
        currentLength: value.length
      }));
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    // Calculate typing metrics
    let typingDuration = 0;
    if (typingMetrics.startTime) {
      typingDuration = new Date().getTime() - typingMetrics.startTime.getTime();
      
      // Track behavior
      await trackBehavior(userId, {
        responseTime: typingDuration,
        messageLength: input.length,
        typingStops: typingMetrics.stops,
        timeOfDay: new Date().getHours()
      });
      
      // Add to event stream
      const behaviorEvent = {
        type: 'behavior_tracked',
        timestamp: new Date(),
        data: {
          responseTime: `${(typingDuration / 1000).toFixed(1)}s`,
          length: input.length,
          hesitation: typingMetrics.stops
        }
      };
      setEvents(prev => [behaviorEvent, ...prev].slice(0, 50));
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Add message event
    const msgEvent = {
      type: 'message_sent',
      timestamp: new Date(),
      data: { 
        content: input.substring(0, 30) + (input.length > 30 ? '...' : ''),
        length: input.length 
      }
    };
    setEvents(prev => [msgEvent, ...prev].slice(0, 50));
    trackUserEvent(userId, 'message_sent', { messageLength: input.length });

    // Check if this was a probe response
    const lastAssistantMsg = messages.filter(m => m.role === 'assistant').pop();
    if (lastAssistantMsg?.probeId) {
      await analyzeResponse(userId, lastAssistantMsg.probeId, input);
      
      const probeEvent = {
        type: 'probe_response_analyzed',
        timestamp: new Date(),
        data: {
          probeId: lastAssistantMsg.probeId,
          response: input.substring(0, 50)
        }
      };
      setEvents(prev => [probeEvent, ...prev].slice(0, 50));
    }

    const currentInput = input;
    setInput("");
    setTypingMetrics({ startTime: null, stops: 0, currentLength: 0 });
    setIsLoading(true);

    try {
      // Get AI response
      const response = await fetch('/api/chat/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentInput,
          conversationHistory: messages.slice(-6).map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          personality: {
            name: "Remy",
            tone: "FLIRTY",
            enableEmojis: true,
            flirtLevel: 4,
            explicitLevel: 2,
            responseLength: 'medium',
            emojiFrequency: 'moderate'
          }
        })
      });

      const data = await response.json();
      let aiContent = data.message || "Connection issues... try again?";
      
      // Check if we should inject a probe
      const messageCount = messages.filter(m => m.role === 'user').length;
      const probe = await getNextProbe(userId, messageCount);
      let probeId = undefined;
      
      if (probe && Math.random() < 0.5) { // 50% chance in debug mode
        aiContent = `${aiContent}\n\n${probe.question}`;
        probeId = probe.id;
        
        const probeEvent = {
          type: 'probe_injected',
          timestamp: new Date(),
          data: {
            probeId: probe.id,
            category: probe.category,
            phase: probe.phase
          }
        };
        setEvents(prev => [probeEvent, ...prev].slice(0, 50));
      }
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiContent,
        timestamp: new Date(),
        probeId
      };

      setMessages(prev => [...prev, aiMessage]);
      
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetProfile = () => {
    const newProfile = initProfile(userId);
    setCurrentProfile(newProfile);
    setEvents([{
      type: 'profile_reset',
      timestamp: new Date(),
      data: {}
    }]);
    setMessages([{
      id: '1',
      role: 'assistant',
      content: `Profile reset! Let's start fresh. Hey there, I'm Remy 😘`,
      timestamp: new Date()
    }]);
  };

  const exportData = () => {
    const debugData = {
      userId,
      profile: currentProfile,
      messages,
      events: events.slice(0, 20),
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(debugData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug_session_${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-900 pt-20">
      <div className="container mx-auto px-4 py-4">
        {/* Header */}
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-400" />
              Debug Chat - Preference Tracking Validation
            </h1>
            <p className="text-gray-400 text-sm">Real-time view of all tracking and profiling</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={resetProfile} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset Profile
            </Button>
            <Button onClick={exportData} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>

        {/* Main Content - Split Screen */}
        <div className="grid grid-cols-5 gap-4">
          {/* Chat Interface - Left Side */}
          <div className="col-span-2">
            <Card className="bg-black/40 border-purple-500/20 h-[calc(100vh-140px)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Chat Interface
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col h-[calc(100%-80px)]">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-800 text-gray-100'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        {message.probeId && (
                          <p className="text-xs mt-1 opacity-50">
                            [PROBE: {message.probeId}]
                          </p>
                        )}
                        <p className="text-xs mt-1 opacity-50">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-800 p-3 rounded-lg">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="flex gap-2">
                  <Textarea
                    value={input}
                    onChange={(e) => handleTyping(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-800 border-gray-600 text-white resize-none"
                    rows={2}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={isLoading || !input.trim()}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
                
                {/* Typing Metrics */}
                {typingMetrics.startTime && (
                  <div className="mt-2 text-xs text-gray-400 flex gap-4">
                    <span>Typing: {((new Date().getTime() - typingMetrics.startTime.getTime()) / 1000).toFixed(1)}s</span>
                    <span>Hesitations: {typingMetrics.stops}</span>
                    <span>Length: {typingMetrics.currentLength}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Debug Panel - Right Side */}
          <div className="col-span-3">
            <DebugPanel
              userId={userId}
              profile={currentProfile}
              events={events}
              probeQueue={probeQueue}
              messageCount={messages.filter(m => m.role === 'user').length}
            />
          </div>
        </div>
      </div>
    </div>
  );
}