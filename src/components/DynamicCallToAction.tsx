"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MessageCircle, Clock, Moon } from "lucide-react";
import { getOnlineStatus, OnlineStatus } from "@/lib/online-status-v2";

export default function DynamicCallToAction() {
  const [status, setStatus] = useState<OnlineStatus>({
    isOnline: true,
    statusText: "Online now 💕",
    statusColor: "text-green-400"
  });

  useEffect(() => {
    // Update status immediately
    setStatus(getOnlineStatus());

    // Update every 30 seconds
    const interval = setInterval(() => {
      setStatus(getOnlineStatus());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Different content based on online status
  if (!status.isOnline) {
    // Offline messages
    if (status.statusText.includes("Sleeping")) {
      return (
        <Card className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border-purple-500/30 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <Moon className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-3xl font-bold mb-4 text-white">Sweet dreams time 😴</h3>
            <p className="text-xl text-gray-200 mb-6">
              I'm getting my beauty sleep right now, but leave me a message and I'll reply first thing when I wake up! 
              I love waking up to messages from you 💕
            </p>
            <Link href="/chat">
              <Button size="lg" className="bg-purple-800 hover:bg-purple-700 font-bold px-8 py-4 text-lg">
                <MessageCircle className="w-6 h-6 mr-2" />
                Leave Me a Wake-Up Message 💌
              </Button>
            </Link>
            <p className="text-sm text-gray-400 mt-4">I'll be back online at 10:00 AM EST</p>
          </CardContent>
        </Card>
      );
    } else if (status.statusText.includes("gym")) {
      return (
        <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-pink-500/30 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <h3 className="text-3xl font-bold mb-4 text-white">Getting sweaty at the gym 🏋️‍♀️</h3>
            <p className="text-xl text-gray-200 mb-6">
              Working on keeping this body tight for you! I'll be back soon and extra energized 😉 
              Drop me a message and I'll send you some post-workout pics!
            </p>
            <Link href="/chat">
              <Button size="lg" className="bg-pink-600 hover:bg-pink-700 font-bold px-8 py-4 text-lg">
                <MessageCircle className="w-6 h-6 mr-2" />
                Request Gym Pics 🔥
              </Button>
            </Link>
            <p className="text-sm text-gray-400 mt-4">Back online around 7:00 PM EST</p>
          </CardContent>
        </Card>
      );
    } else {
      // Generic offline
      return (
        <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-pink-500/30 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <Clock className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-3xl font-bold mb-4 text-white">BRB babe! 💋</h3>
            <p className="text-xl text-gray-200 mb-6">
              {status.statusText} - but I'll be back soon! Leave me something naughty to come back to 😈
            </p>
            <Link href="/chat">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 font-bold px-8 py-4 text-lg">
                <MessageCircle className="w-6 h-6 mr-2" />
                Leave a Message 💌
              </Button>
            </Link>
            {status.lastSeen && (
              <p className="text-sm text-gray-400 mt-4">Last seen: {status.lastSeen}</p>
            )}
          </CardContent>
        </Card>
      );
    }
  }

  // Online - different messages based on time
  const hour = new Date().getHours();
  let headline = "Come get to know the real me 😈";
  let subtext = "I'm online right now and would love to chat with you personally! I put so much care into every conversation... Let me show you what makes me special 💦";
  
  if (hour >= 22 || hour < 2) {
    // Late night
    headline = "Up late and feeling naughty 😈";
    subtext = "Perfect time for some intimate one-on-one chat... Just you and me, no distractions. Let's make tonight special 🔥";
  } else if (hour >= 10 && hour < 12) {
    // Morning
    headline = "Good morning sexy! ☀️";
    subtext = "Just woke up and I'm already thinking about you... Start your day right with some flirty morning chat 💕";
  } else if (hour >= 20 && hour < 22) {
    // Evening
    headline = "Perfect evening for some fun 💋";
    subtext = "I'm all yours tonight! Let's chat, flirt, and see where the conversation takes us... I'm feeling extra playful 😘";
  }

  return (
    <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-pink-500/30 backdrop-blur-sm">
      <CardContent className="p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <div className="absolute inset-0 w-4 h-4 bg-green-500 rounded-full animate-ping"></div>
          </div>
          <span className="ml-2 text-green-400 font-semibold">ONLINE NOW</span>
        </div>
        <h3 className="text-3xl font-bold mb-4 text-white">{headline}</h3>
        <p className="text-xl text-gray-200 mb-6">
          {subtext}
        </p>
        <Link href="/chat">
          <Button size="lg" className="bg-white text-purple-900 hover:bg-gray-100 font-bold px-8 py-4 text-lg animate-pulse">
            <Heart className="w-6 h-6 mr-2 text-pink-500" />
            Message Me Now 💋
          </Button>
        </Link>
        <p className="text-sm text-green-400 mt-4 font-medium">
          Average response time: &lt; 2 minutes
        </p>
      </CardContent>
    </Card>
  );
}