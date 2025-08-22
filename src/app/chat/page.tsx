"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Check, CheckCheck } from "lucide-react";
// Removed old profiling imports - now using unified API only
import { trackUserEvent } from "@/lib/user-analytics";
import ContentDropOffer from "@/components/ContentDropOffer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useChatAnalytics } from "@/hooks/useAnalytics";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  imageData?: string;
  requestId?: number;
  generationStatus?: 'pending' | 'processing' | 'completed' | 'failed';
}


const CREATOR_NAME = "Remy";


function ChatComponent() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { trackMessage, trackTyping, trackPersonalityDetection, trackProbeResponse } = useChatAnalytics();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [awaitingImageDescription, setAwaitingImageDescription] = useState(false);
  const [imageRequestType, setImageRequestType] = useState<'image' | 'video'>('image');
  // Keep these for tracking but don't display them
  const [detectedPersonality, setDetectedPersonality] = useState<string | null>(null);
  const [personalityConfidence, setPersonalityConfidence] = useState<number>(0);
  
  // Preference tracking state
  const userId = user?.id || 'anonymous'; // Use authenticated user ID
  const [typingStartTime, setTypingStartTime] = useState<Date | null>(null);
  const [typingStops, setTypingStops] = useState(0);
  const [showContentOffer, setShowContentOffer] = useState(false);
  // Removed probe state - handled by unified API
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // All useEffect hooks MUST be declared before any conditional returns
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Add initial welcome message when component mounts
  useEffect(() => {
    setMessages([{
      id: '1',
      role: 'assistant',
      content: `Hey there 😊 I'm ${CREATOR_NAME}. What should I call you?`,
      timestamp: new Date()
    }]);
    
    // Delay session start tracking to ensure session exists
    setTimeout(() => {
      trackUserEvent(userId, 'message_sent', { sessionStart: true });
    }, 1000);
  }, []);

  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Redirect handled by middleware, this is just a safety check
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Redirecting to login...</div>
      </div>
    );
  }

  const pollForImageResult = async (requestId: number, messageId: string) => {
    const maxAttempts = 60; // Poll for up to 3 minutes
    let attempts = 0;
    
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/generate/queue');
        const data = await response.json();
        
        const request = data.queue?.find((r: any) => r.id === requestId);
        
        if (request) {
          // Update message status
          setMessages(prev => prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, generationStatus: request.status }
              : msg
          ));
          
          if (request.status === 'completed' && request.result?.imageData) {
            // Image is ready!
            clearInterval(pollInterval);
            
            // Update message with the image
            setMessages(prev => prev.map(msg => 
              msg.id === messageId 
                ? { 
                    ...msg, 
                    content: '✨ Your custom image is ready!',
                    imageData: request.result.imageData,
                    generationStatus: 'completed'
                  }
                : msg
            ));
            
            console.log('Image generation completed!');
          } else if (request.status === 'failed') {
            clearInterval(pollInterval);
            
            setMessages(prev => prev.map(msg => 
              msg.id === messageId 
                ? { 
                    ...msg, 
                    content: `Sorry, the image generation failed. ${request.result?.error || 'Please try again.'}`,
                    generationStatus: 'failed'
                  }
                : msg
            ));
          }
        }
        
        attempts++;
        if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
          console.log('Polling timeout');
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 3000); // Poll every 3 seconds
  };

  const requestCustomImage = async (type: 'image' | 'video' = 'image') => {
    // Set state to await image description
    setAwaitingImageDescription(true);
    setImageRequestType(type);
    
    // Add assistant message asking for description
    const askMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: type === 'image' 
        ? `What kind of personal photo should I create just for you? I love putting extra time and care into making something special... Tell me your vision 📸`
        : `I'm excited to create something intimate just for you! What kind of personal video experience do you want me to craft? I'll put my heart into it... 🎥`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, askMessage]);
  };

  const submitImageRequest = async (description: string) => {
    const userName = 'Jake'; // Get from user context later
    const userId = 'user_jake'; // Get from user context later
    
    // ALWAYS prefix with "Remy,"
    const prompt = `Remy, ${description}`;
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          userId,
          userName,
          requestType: imageRequestType === 'video' ? 'custom_video' : 'custom_image',
          urgency: 'normal'
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Add message to chat showing the request was submitted
        const requestMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Perfect! 😘 I'm so excited to create this ${imageRequestType} personally for you... I'm going to put all my energy into making it absolutely perfect for you 💕`,
          timestamp: new Date(),
          requestId: data.requestId,
          generationStatus: 'pending'
        };
        setMessages(prev => [...prev, requestMessage]);
        
        console.log('Custom content request submitted:', data);
        
        // Start polling for the result
        pollForImageResult(data.requestId, requestMessage.id);
      } else {
        throw new Error(data.error || 'Failed to submit request');
      }
    } catch (error) {
      console.error('Request submission error:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Sorry baby, something went wrong. Try again? 💔`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
    
    // Reset the awaiting state
    setAwaitingImageDescription(false);
  };


  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    // Calculate typing behavior for unified API
    let typingDuration = 0;
    if (typingStartTime) {
      typingDuration = new Date().getTime() - typingStartTime.getTime();
      // Track typing stop with duration
      trackTyping('stop', typingDuration);
      // Reset typing tracking
      setTypingStartTime(null);
      setTypingStops(0);
    }
    
    // Track message event with new analytics
    trackMessage(input, detectedPersonality || undefined, personalityConfidence);
    
    // Also track with old system for backward compatibility
    trackUserEvent(userId, 'message_sent', { 
      messageLength: input.length,
      timestamp: new Date() 
    });

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      status: 'sending'
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Probe analysis now handled by unified API
    
    const currentInput = input; // Save input before clearing
    setInput("");

    // Check if we're waiting for an image description
    if (awaitingImageDescription) {
      // User is providing image description
      await submitImageRequest(currentInput);
      return;
    }

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
      // Use UNIFIED chat engine - same as debug and test lab
      const response = await fetch('/api/chat/unified', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          message: currentInput,
          conversationHistory: messages.map(msg => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp
          })),
          debugMode: false, // Regular chat doesn't show debug info
          responseTime: typingDuration,
          typingStops: typingStops
        })
      });

      const data = await response.json();
      
      const aiContent = data.message || "Fuck, lost connection. Say that again?";
      const suggestedDelay = data.suggestedDelay || 2000;
      
      // Track personality detection if updated
      if (data.personalityType && data.confidence) {
        if (data.personalityType !== detectedPersonality || Math.abs(data.confidence - personalityConfidence) > 0.1) {
          setDetectedPersonality(data.personalityType);
          setPersonalityConfidence(data.confidence);
          trackPersonalityDetection(data.personalityType, data.confidence, messages.length + 1);
        }
      }
      
      // Track probe response if this was a probe
      if (data.probeId) {
        trackProbeResponse(data.probeId, currentInput, data.probePhase || 1);
      }
      
      // Simulate realistic typing delay
      await new Promise(resolve => setTimeout(resolve, suggestedDelay));
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiContent,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Mark user message as read when AI responds
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id ? { ...msg, status: 'read' } : msg
      ));
      
      // Content offers now handled by unified API strategy
      const messageCount = messages.filter(m => m.role === 'user').length;
      if (messageCount > 5 && Math.random() < 0.1) {
        // 10% chance to show offer if user is engaged
        setTimeout(() => {
          setShowContentOffer(true);
        }, 2000); // Show after 2 seconds
      }
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


  // Main chat interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Simple Chat Header */}
          <div className="mb-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Chat with {CREATOR_NAME}
            </h1>
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
                        {message.imageData && (
                          <div className="mt-3">
                            <img 
                              src={`data:image/png;base64,${message.imageData}`} 
                              alt="Generated content" 
                              className="rounded-lg max-w-full"
                            />
                          </div>
                        )}
                        {message.generationStatus === 'processing' && (
                          <div className="mt-2 text-xs opacity-70">
                            🎨 Creating your image...
                          </div>
                        )}
                        {message.generationStatus === 'pending' && (
                          <div className="mt-2 text-xs opacity-70">
                            ⏳ Waiting in queue...
                          </div>
                        )}
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

              {/* Content Drop Offer */}
              {showContentOffer && (
                <div className="p-4 border-t border-gray-700">
                  <ContentDropOffer
                    userId={userId}
                    onPurchaseComplete={(content) => {
                      setShowContentOffer(false);
                      // Add message about unlocked content
                      const unlockMessage: Message = {
                        id: Date.now().toString(),
                        role: 'assistant',
                        content: `🔓 You unlocked exclusive content! ${content.length} items are now available for you 💕`,
                        timestamp: new Date()
                      };
                      setMessages(prev => [...prev, unlockMessage]);
                    }}
                    className="mb-4"
                  />
                </div>
              )}

              <div className="p-4 border-t border-gray-700">
                {/* Quick Action Buttons */}
                <div className="flex gap-2 mb-3 flex-wrap">
                  {awaitingImageDescription ? (
                    <Button
                      onClick={() => setAwaitingImageDescription(false)}
                      size="sm"
                      variant="outline"
                      className="text-xs border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                    >
                      ❌ Cancel Request
                    </Button>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Textarea
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      
                      // Track typing behavior with new analytics
                      if (!typingStartTime && e.target.value.length > 0) {
                        setTypingStartTime(new Date());
                        trackTyping('start');
                        trackUserEvent(userId, 'typing_started', {});
                      } else if (typingStartTime && e.target.value.length === 0) {
                        setTypingStops(prev => prev + 1);
                        const duration = new Date().getTime() - typingStartTime.getTime();
                        trackTyping('stop', duration);
                        trackUserEvent(userId, 'typing_stopped', {});
                      }
                    }}
                    placeholder={awaitingImageDescription 
                      ? `Describe what you want to see... (e.g., "in a red bikini by the pool")`
                      : `Message ${CREATOR_NAME}...`}
                    className={`flex-1 bg-gray-800 border-gray-600 text-white resize-none ${
                      awaitingImageDescription ? 'border-pink-500 border-2' : ''
                    }`}
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

        </div>
      </div>
    </div>
  );
}

export default function Chat() {
  return (
    <ErrorBoundary>
      <ChatComponent />
    </ErrorBoundary>
  );
}