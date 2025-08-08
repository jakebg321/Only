"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Sparkles, User, Settings, Heart, Shield, Zap, Check, CheckCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ChatMode = 'welcome' | 'personalize' | 'chat';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}

interface Personality {
  name: string;
  tone: string;
  flirtLevel: number;
  explicitLevel?: number;
  interests: string[];
  responseLength: 'short' | 'medium' | 'long';
  enableEmojis: boolean;
  emojiFrequency: 'minimal' | 'moderate' | 'frequent';
  fantasyFocus?: string[];
}

const DEFAULT_PERSONALITY: Personality = {
  name: "Sophia",
  tone: "FLIRTY",
  flirtLevel: 5,
  explicitLevel: 2,
  interests: ["fitness", "lingerie", "photography", "dancing"],
  responseLength: 'medium',
  enableEmojis: true,
  emojiFrequency: 'frequent',
  fantasyFocus: ['teasing', 'roleplay', 'sensual chat']
};

const PRESET_PERSONALITIES = {
  flirty: {
    name: "Sophia",
    tone: "FLIRTY",
    flirtLevel: 5,
    explicitLevel: 2,
    interests: ["fitness", "lingerie", "photography", "dancing"],
    responseLength: 'medium' as const,
    enableEmojis: true,
    emojiFrequency: 'frequent' as const,
    fantasyFocus: ['teasing', 'roleplay', 'GFE (Girlfriend Experience)']
  },
  dominant: {
    name: "Mistress V",
    tone: "DOMINANT",
    flirtLevel: 5,
    explicitLevel: 3,
    interests: ["BDSM", "leather", "control", "discipline"],
    responseLength: 'medium' as const,
    enableEmojis: true,
    emojiFrequency: 'moderate' as const,
    fantasyFocus: ['Dominant', 'BDSM', 'Findom', 'Humiliation']
  },
  submissive: {
    name: "Kitten",
    tone: "SUBMISSIVE",
    flirtLevel: 5,
    explicitLevel: 2,
    interests: ["pleasing", "cuddles", "praise", "obedience"],
    responseLength: 'short' as const,
    enableEmojis: true,
    emojiFrequency: 'frequent' as const,
    fantasyFocus: ['Submissive', 'Worship', 'Roleplay']
  },
  mysterious: {
    name: "Luna",
    tone: "MYSTERIOUS",
    flirtLevel: 4,
    explicitLevel: 1,
    interests: ["astrology", "tantra", "sensuality", "mysticism"],
    responseLength: 'short' as const,
    enableEmojis: true,
    emojiFrequency: 'minimal' as const,
    fantasyFocus: ['teasing', 'voyeur', 'slow burn']
  }
};

export default function Chat() {
  const [mode, setMode] = useState<ChatMode>('welcome');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [personality, setPersonality] = useState<Personality>(DEFAULT_PERSONALITY);
  const [tempPersonality, setTempPersonality] = useState<Personality>(DEFAULT_PERSONALITY);
  const [showSettings, setShowSettings] = useState(false);
  const [customPersonalities, setCustomPersonalities] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load custom personalities when component mounts
  useEffect(() => {
    loadCustomPersonalities();
    
    // Listen for personality updates from the setup page
    const handlePersonalityUpdate = () => {
      loadCustomPersonalities();
    };
    
    // Listen for page visibility changes to reload personalities when returning to chat
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadCustomPersonalities();
      }
    };
    
    // Listen for window focus to catch navigation between pages
    const handleFocus = () => {
      loadCustomPersonalities();
    };
    
    window.addEventListener('personalityUpdated', handlePersonalityUpdate);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('personalityUpdated', handlePersonalityUpdate);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const loadCustomPersonalities = async () => {
    try {
      console.log('Loading custom personalities...');
      const response = await fetch('/api/creator/personality');
      const data = await response.json();
      console.log('Custom personalities API response:', data);
      
      if (data.personalities) {
        console.log('Setting custom personalities:', data.personalities);
        setCustomPersonalities(data.personalities);
      } else {
        console.log('No personalities found in response');
        setCustomPersonalities([]);
      }
    } catch (error) {
      console.error('Failed to load custom personalities:', error);
      setCustomPersonalities([]);
    }
  };

  const requestCustomImage = async (type = 'image') => {
    const userName = 'Jake'; // Get from user context later
    const userId = 'user_jake'; // Get from user context later
    
    let prompt = '';
    if (type === 'image') {
      prompt = window.prompt('What kind of custom photo would you like? Describe it:') || '';
    } else if (type === 'video') {
      prompt = window.prompt('What kind of custom video would you like? Describe it:') || '';
    }
    
    if (!prompt.trim()) return;
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          userId,
          userName,
          requestType: type === 'video' ? 'custom_video' : 'custom_image',
          urgency: 'normal'
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Add message to chat showing the request was submitted
        const requestMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Got your request! 📋 I'll work on your custom ${type} and send it to you soon. Request #${data.requestId}${data.localNotification?.success ? ' (Creator notified!)' : ' (Will notify creator when available)'}`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, requestMessage]);
        
        console.log('Custom content request submitted:', data);
      } else {
        throw new Error(data.error || 'Failed to submit request');
      }
    } catch (error) {
      console.error('Request submission error:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Sorry, there was an issue submitting your request. Try again?`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const startDemo = () => {
    setPersonality(DEFAULT_PERSONALITY);
    setMode('chat');
    setShowSettings(true);
    // Add welcome message
    setMessages([{
      id: '1',
      role: 'assistant',
      content: `Hey you 😊 I'm ${DEFAULT_PERSONALITY.name}. What should I call you?`,
      timestamp: new Date()
    }]);
  };

  const startPersonalize = () => {
    setMode('personalize');
  };

  const savePersonalization = () => {
    setPersonality(tempPersonality);
    setMode('chat');
    setShowSettings(false);
    // Add personalized welcome message
    setMessages([{
      id: '1',
      role: 'assistant',
      content: `Hey there 😊 I'm ${tempPersonality.name}. What should I call you?`,
      timestamp: new Date()
    }]);
  };

  const applyPreset = (preset: keyof typeof PRESET_PERSONALITIES | string) => {
    let newPersonality: any;
    
    // Check if it's a preset or custom personality
    if (preset in PRESET_PERSONALITIES) {
      newPersonality = PRESET_PERSONALITIES[preset as keyof typeof PRESET_PERSONALITIES];
    } else {
      // Find custom personality by ID
      const customPersonality = customPersonalities.find(p => p.id === preset);
      if (customPersonality) {
        newPersonality = customPersonality;
      } else {
        console.error('Personality not found:', preset);
        return;
      }
    }
    
    // Normalize into our strict Personality shape
    setPersonality({
      name: newPersonality.displayName || newPersonality.name,
      tone: newPersonality.tone,
      flirtLevel: newPersonality.flirtLevel,
      explicitLevel: newPersonality.explicitLevel,
      interests: newPersonality.interests || [],
      responseLength: newPersonality.responseLength || 'medium',
      enableEmojis: newPersonality.enableEmojis ?? true,
      emojiFrequency: newPersonality.emojiFrequency || 'moderate',
      fantasyFocus: newPersonality.fantasyFocus || []
    });
    
    // Add transition message - acknowledge if we already know their name
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    const userName = lastUserMessage?.content?.match(/jake|daddy|sir|master|babe/i)?.[0] || '';
    
    // Get the personality name (presets use 'name', custom use 'displayName')
    const personalityName = newPersonality.name || newPersonality.displayName || 'your creator';
    
    const transitionMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: userName 
        ? `*Switching to ${personalityName}* Hey ${userName} 😊 I'm in a different mood now...`
        : `*Switching to ${personalityName}* Hey you 😊 What should I call you?`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, transitionMessage]);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      status: 'sending'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    // Update message status to sent after a brief delay
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg
      ));
    }, 300);
    
    // Update to delivered after another delay
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id ? { ...msg, status: 'delivered' } : msg
      ));
    }, 800);

    try {
      // Send recent conversation history to maintain context
      const conversationHistory = messages.slice(-6).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch('/api/chat/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          conversationHistory,
          personality: {
            name: personality.name,
            tone: personality.tone,
            enableEmojis: personality.enableEmojis,
            flirtLevel: personality.flirtLevel,
            explicitLevel: personality.explicitLevel || 2,
            responseLength: personality.responseLength,
            emojiFrequency: personality.emojiFrequency,
            fantasyFocus: personality.fantasyFocus || []
          }
        })
      });

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message || "Fuck, lost connection. Say that again?",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Mark user message as read when AI responds
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id ? { ...msg, status: 'read' } : msg
      ));
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Shit, something's wrong with my connection. Try again?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (mode === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20 flex items-center justify-center">
        <Card className="max-w-2xl w-full mx-4 bg-black/40 border-purple-500/20 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI Chat Experience
            </CardTitle>
            <p className="text-gray-300 mt-4 text-lg">
              Experience the future of personalized content creation
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <Button 
                onClick={startDemo}
                size="lg"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Sparkles className="mr-2" />
                Try Demo Chat (with controls)
              </Button>
              <p className="text-sm text-gray-400">Chat with Sophia and adjust personality in real-time</p>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-600" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gray-900 px-2 text-gray-400">or</span>
              </div>
            </div>

            <div className="text-center space-y-4">
              <Button 
                onClick={startPersonalize}
                size="lg"
                variant="outline"
                className="w-full border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white"
              >
                <User className="mr-2" />
                Quick Setup Your Own
              </Button>
              <p className="text-sm text-gray-400">Create your own AI personality</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (mode === 'personalize') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20 flex items-center justify-center">
        <Card className="max-w-2xl w-full mx-4 bg-black/40 border-purple-500/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Quick Personality Setup</CardTitle>
            <p className="text-gray-400">Set up your AI chat personality</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Creator Name</Label>
              <Input
                value={tempPersonality.name}
                onChange={(e) => setTempPersonality({...tempPersonality, name: e.target.value})}
                placeholder="Enter a name..."
                className="bg-gray-800 border-gray-600"
              />
            </div>

            <div>
              <Label>Personality Tone</Label>
              <select 
                className="w-full bg-gray-800 border-gray-600 rounded p-2"
                value={tempPersonality.tone}
                onChange={(e) => setTempPersonality({...tempPersonality, tone: e.target.value})}
              >
                <option value="flirty">Flirty & Playful</option>
                <option value="friendly">Warm & Friendly</option>
                <option value="mysterious">Mysterious & Intriguing</option>
                <option value="professional">Professional & Sophisticated</option>
              </select>
            </div>

            <div>
              <Label>Flirtation Level</Label>
              <input 
                type="range" 
                min="1" 
                max="5" 
                value={tempPersonality.flirtLevel}
                onChange={(e) => setTempPersonality({...tempPersonality, flirtLevel: parseInt(e.target.value)})}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-400 mt-1">
                <span>Friendly</span>
                <span>Very Flirty</span>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={() => setMode('welcome')}
                variant="outline"
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                onClick={savePersonalization}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Start Chatting
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Chat mode with settings panel
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {/* Settings Panel */}
          {showSettings && (
            <div className="lg:col-span-1">
              <Card className="bg-black/40 border-purple-500/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Settings className="w-5 h-5" />
                    Personality
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Preset Buttons */}
                  <div>
                    <Label className="text-sm">Mood</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {/* Preset personalities */}
                      <Button
                        onClick={() => applyPreset('flirty')}
                        variant={personality.tone === 'FLIRTY' ? 'default' : 'outline'}
                        size="sm"
                        className="text-xs"
                      >
                        <Heart className="w-3 h-3 mr-1" />
                        Flirty
                      </Button>
                      <Button
                        onClick={() => applyPreset('dominant')}
                        variant={personality.tone === 'DOMINANT' ? 'default' : 'outline'}
                        size="sm"
                        className="text-xs"
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                        Dom
                      </Button>
                      <Button
                        onClick={() => applyPreset('submissive')}
                        variant={personality.tone === 'SUBMISSIVE' ? 'default' : 'outline'}
                        size="sm"
                        className="text-xs"
                      >
                        <Shield className="w-3 h-3 mr-1" />
                        Sub
                      </Button>
                      <Button
                        onClick={() => applyPreset('mysterious')}
                        variant={personality.tone === 'MYSTERIOUS' ? 'default' : 'outline'}
                        size="sm"
                        className="text-xs"
                      >
                        <Zap className="w-3 h-3 mr-1" />
                        Mystery
                      </Button>
                      
                      {/* Custom personalities */}
                      {customPersonalities.map((customPersonality) => (
                        <Button
                          key={customPersonality.id}
                          onClick={() => applyPreset(customPersonality.id)}
                          variant={personality.name === (customPersonality.displayName || customPersonality.name) ? 'default' : 'outline'}
                          size="sm"
                          className="text-xs"
                        >
                          <User className="w-3 h-3 mr-1" />
                          {customPersonality.displayName || customPersonality.name}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Flirt Level */}
                  <div>
                    <Label className="text-sm">Intensity: {personality.flirtLevel}</Label>
                    <input 
                      type="range" 
                      min="0" 
                      max="5" 
                      value={personality.flirtLevel}
                      onChange={(e) => setPersonality({...personality, flirtLevel: parseInt(e.target.value)})}
                      className="w-full mt-2"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>Mild</span>
                      <span>Wild 🔥</span>
                    </div>
                  </div>

                  {/* Explicit Level */}
                  <div>
                    <Label className="text-sm">Explicit Level: {personality.explicitLevel || 2}</Label>
                    <input 
                      type="range" 
                      min="0" 
                      max="3" 
                      value={personality.explicitLevel || 2}
                      onChange={(e) => setPersonality({...personality, explicitLevel: parseInt(e.target.value)})}
                      className="w-full mt-2"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>Tease</span>
                      <span>XXX 🔥</span>
                    </div>
                  </div>

                  {/* Response Length */}
                  <div>
                    <Label className="text-sm">Message Length</Label>
                    <select 
                      className="w-full bg-gray-800 border-gray-600 rounded p-2 mt-2 text-sm"
                      value={personality.responseLength}
                      onChange={(e) => setPersonality({...personality, responseLength: e.target.value as any})}
                    >
                      <option value="short">Quick & Teasing</option>
                      <option value="medium">Playful Chat</option>
                      <option value="long">Deep & Intimate</option>
                    </select>
                  </div>

                  {/* Current Settings */}
                  <div className="bg-purple-900/20 p-3 rounded-lg">
                    <p className="text-xs font-semibold mb-1">Current Vibe:</p>
                    <p className="text-xs text-gray-300">{personality.name}</p>
                    <p className="text-xs text-gray-300">{personality.tone === 'FLIRTY' ? '💕 Flirty' : personality.tone === 'DOMINANT' ? '⛓️ Dominant' : personality.tone === 'SUBMISSIVE' ? '🎀 Submissive' : '🌙 Mysterious'}</p>
                    <p className="text-xs text-gray-300">Level {personality.flirtLevel} • {personality.explicitLevel === 0 ? 'Teasing' : personality.explicitLevel === 1 ? 'Suggestive' : personality.explicitLevel === 2 ? 'Explicit' : 'XXX'}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Chat Panel */}
          <div className={showSettings ? 'lg:col-span-3' : 'lg:col-span-4'}>
            <div className="mb-4 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Chat with {personality.name}
                </h1>
                <p className="text-gray-400">
                  {showSettings && `${personality.tone} mode • Level ${personality.flirtLevel}`}
                </p>
              </div>
              <Button
                onClick={() => setShowSettings(!showSettings)}
                variant="outline"
                size="sm"
                className="border-purple-500 text-purple-400"
              >
                <Settings className="w-4 h-4 mr-2" />
                {showSettings ? 'Hide' : 'Show'} Personality
              </Button>
            </div>

            <Card className="bg-black/40 border-purple-500/20 backdrop-blur-sm h-[600px] flex flex-col">
              <CardContent className="flex-1 overflow-hidden p-0">
                <div className="h-full overflow-y-auto p-6 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] p-4 rounded-2xl ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                            : 'bg-gray-800 text-gray-100'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs opacity-70">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                          {message.role === 'user' && message.status && (
                            <div className="ml-2">
                              {message.status === 'sending' && (
                                <Check className="w-3 h-3 opacity-50" />
                              )}
                              {message.status === 'sent' && (
                                <Check className="w-3 h-3" />
                              )}
                              {message.status === 'delivered' && (
                                <CheckCheck className="w-3 h-3" />
                              )}
                              {message.status === 'read' && (
                                <CheckCheck className="w-3 h-3 text-blue-400" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-800 p-4 rounded-2xl flex items-center gap-2">
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
              </CardContent>

              <div className="p-4 border-t border-gray-700">
                {/* Quick Action Buttons */}
                <div className="flex gap-2 mb-3 flex-wrap">
                  <Button
                    onClick={() => requestCustomImage()}
                    size="sm"
                    variant="outline"
                    className="text-xs border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white"
                  >
                    📸 Request Custom Pic
                  </Button>
                  <Button
                    onClick={() => requestCustomImage('video')}
                    size="sm"
                    variant="outline"
                    className="text-xs border-pink-500 text-pink-400 hover:bg-pink-500 hover:text-white"
                  >
                    🎥 Request Video
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Message ${personality.name}...`}
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
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </Card>

            <div className="mt-4 text-center">
              <Button 
                onClick={() => {
                  setMode('welcome');
                  setMessages([]);
                }}
                variant="outline"
                className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white"
              >
                Start New Chat
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}