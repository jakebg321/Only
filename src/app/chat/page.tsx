"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Image as ImageIcon, Video, Loader2 } from "lucide-react";

export default function Chat() {
  const router = useRouter();
  const [messages, setMessages] = useState<{ text: string; sender: "user" | "ai"; status?: "pending" | "processing" | "completed"; image?: string }[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userType = localStorage.getItem("userType");
    if (!userType) {
      router.push("/auth");
    }
  }, [router]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, sender: "user" }]);
      const userInput = input;
      setInput("");
      setIsLoading(true);

      // Simulate AI response
      setTimeout(() => {
        setMessages((prev) => [...prev, { text: "Processing your request...", sender: "ai", status: "processing" }]);
      }, 1000);

      setTimeout(() => {
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { 
            ...newMessages[newMessages.length - 1], 
            text: "Here's your personalized content! 🎉", 
            status: "completed", 
            image: "https://placehold.co/400x300/8B5CF6/FFFFFF?text=AI+Generated+Content" 
          };
          return newMessages;
        });
        setIsLoading(false);
      }, 3000);
    }
  };

  const handleQuickRequest = (requestType: string) => {
    setInput(`Create a ${requestType} for me`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center gradient-text">AI Content Chat</h1>
        
        <Card className="mb-6 bg-black/40 border-purple-500/20 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="h-96 overflow-y-auto mb-6 space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-gray-400 py-12">
                  <p className="text-xl mb-4">👋 Hi! I'm your AI twin.</p>
                  <p>Ask me to create custom photos, videos, or messages for your subscribers!</p>
                </div>
              )}
              
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-xs lg:max-w-md p-4 rounded-2xl ${
                    msg.sender === "user" 
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white" 
                      : "bg-gray-800 text-gray-100"
                  }`}>
                    <p className="mb-2">{msg.text}</p>
                    {msg.image && (
                      <img src={msg.image} alt="Generated content" className="mt-3 rounded-lg max-w-full h-auto" />
                    )}
                    {msg.status && (
                      <p className="text-sm opacity-75 mt-2">
                        {msg.status === "processing" && <Loader2 className="w-4 h-4 animate-spin inline mr-2" />}
                        Status: {msg.status}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="flex gap-3">
              <Textarea 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                placeholder="Type your request..." 
                className="flex-grow bg-gray-800 border-gray-600 text-white placeholder-gray-400 resize-none"
                rows={2}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <Button 
                onClick={handleSend} 
                disabled={isLoading || !input.trim()}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex flex-wrap gap-3 justify-center">
          <Button 
            variant="outline" 
            onClick={() => handleQuickRequest("custom photo")}
            className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white"
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            Request Photo
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleQuickRequest("personalized video")}
            className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white"
          >
            <Video className="w-4 h-4 mr-2" />
            Request Video
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleQuickRequest("flirty message")}
            className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white"
          >
            💋 Flirty Message
          </Button>
        </div>
      </div>
    </div>
  );
}
