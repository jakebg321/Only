"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Sparkles, User, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ChatMode = 'welcome' | 'personalize' | 'chat';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Personality {
  name: string;
  tone: string;
  flirtLevel: number;
  interests: string[];
}

const DEFAULT_PERSONALITY: Personality = {
  name: "Sophia",
  tone: "flirty",
  flirtLevel: 3,
  interests: ["fitness", "travel", "photography", "fashion"]
};

export default function Chat() {
  const [mode, setMode] = useState<ChatMode>('welcome');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [personality, setPersonality] = useState<Personality>(DEFAULT_PERSONALITY);
  const [tempPersonality, setTempPersonality] = useState<Personality>(DEFAULT_PERSONALITY);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startDemo = () => {
    setPersonality(DEFAULT_PERSONALITY);
    setMode('chat');
    // Add welcome message
    setMessages([{
      id: '1',
      role: 'assistant',
      content: `Hey there! 😘 I'm ${DEFAULT_PERSONALITY.name}. So excited to chat with you! What kind of content are you looking for today, babe?`,
      timestamp: new Date()
    }]);
  };

  const startPersonalize = () => {
    setMode('personalize');
  };

  const savePersonalization = () => {
    setPersonality(tempPersonality);
    setMode('chat');
    // Add personalized welcome message
    setMessages([{
      id: '1',
      role: 'assistant',
      content: `Hey there! 😘 I'm ${tempPersonality.name}. ${
        tempPersonality.flirtLevel > 3 
          ? "I've been waiting for you, babe! 💕" 
          : "Nice to meet you!"
      } What brings you here today?`,
      timestamp: new Date()
    }]);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          personality: {
            tone: personality.tone,
            enableEmojis: true
          }
        })
      });

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message || "Sorry babe, I didn't catch that. Try again? 💕",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Oops, something went wrong! Try again in a moment? 💕",
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
                Try Demo Chat
              </Button>
              <p className="text-sm text-gray-400">Chat with Sophia, our demo creator</p>
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
                Personalize Your Experience
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

  // Chat mode
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-4 text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Chat with {personality.name}
          </h1>
          <p className="text-gray-400">Your AI companion is here for you 24/7</p>
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
                    <p className="text-xs opacity-70 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-800 p-4 rounded-2xl">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>

          <div className="p-4 border-t border-gray-700">
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
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
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
  );
}