"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Camera, Lock, Eye } from "lucide-react";
import LoginPromptModal from "@/components/LoginPromptModal";
import { useAuth } from "@/hooks/useAuth";
import OnlineStatusIndicator from "@/components/OnlineStatusIndicator";
import DynamicCallToAction from "@/components/DynamicCallToAction";

export default function Home() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { isAuthenticated } = useAuth();
  // Gallery images from public/Remy folder
  const galleryImages = [
    "/Remy/2025-08-08_17-13-44_4613.png",
    "/Remy/2025-08-08_17-16-07_7611.png",
    "/Remy/2025-08-08_17-17-46_1630.png",
    "/Remy/2025-08-08_17-18-07_9564.png",
    "/Remy/2025-08-08_17-19-29_2534.png",
    "/Remy/2025-08-08_17-51-26_7687.png",
    "/Remy/2025-08-08_17-51-59_8602.png",
    "/Remy/2025-08-08_17-54-29_4725.png",
    "/Remy/2025-08-08_17-55-01_4208.png",
    "/Remy/2025-08-08_17-55-18_7285.png",
    "/Remy/2025-08-08_17-55-34_9355.png",
    "/Remy/2025-08-08_17-55-51_2971.png",
    "/Remy/2025-08-08_18-00-27_8511.png",
    "/Remy/2025-08-08_18-05-32_6162.png",
    "/Remy/2025-08-08_18-06-06_1789.png",
    "/Remy/2025-08-08_18-06-24_3963.png",
    "/Remy/2025-08-08_18-09-53_1543.png",
    "/Remy/2025-08-08_18-10-28_1308.png",
    // New images added
    "/Remy/2025-08-13_19-22-59_5721.png",
    "/Remy/2025-08-13_19-24-59_9457.png",
    "/Remy/2025-08-13_19-26-23_8508.png",
    "/Remy/2025-08-13_19-27-58_8508.png",
    "/Remy/2025-08-13_19-31-33_4308.png",
    "/Remy/2025-08-13_19-37-30_5055.png",
    "/Remy/2025-08-13_21-17-04_3570.png",
    "/Remy/2025-08-13_21-17-51_3637.png",
    "/Remy/2025-08-13_21-25-56_7008.png",
    "/Remy/2025-08-13_21-30-30_9686.png",
    "/Remy/2025-08-13_21-36-18_6515.png",
    "/Remy/2025-08-13_21-37-53_2082.png",
    "/Remy/2025-08-13_21-42-56_3224.png",
    "/Remy/2025-08-13_21-53-53_8275.png",
    "/Remy/2025-08-13_21-56-01_6112.png",
    "/Remy/2025-08-13_22-12-07_2974.png",
    "/Remy/2025-08-13_22-12-39_6690.png",
    "/Remy/2025-08-13_22-13-14_1988.png",
    "/Remy/2025-08-13_22-14-02_5846.png",
    "/Remy/2025-08-13_22-17-09_4261.png",
    "/Remy/2025-08-13_22-36-24_9314.png",
    "/Remy/2025-08-13_22-37-52_9741.png",
    "/Remy/2025-08-13_22-38-59_2378.png",
    "/Remy/2025-08-13_22-39-46_1184.png",
    "/Remy/2025-08-13_22-44-20_7784.png",
    "/Remy/2025-08-13_22-44-52_6553.png",
    "/Remy/2025-08-13_22-50-25_4099.png",
    "/Remy/2025-08-13_22-53-05_1776.png",
    "/Remy/2025-08-13_22-53-53_1776.png",
    "/Remy/2025-08-13_23-05-22_5708.png",
    "/Remy/2025-08-13_23-11-06_2203.png",
    "/Remy/2025-08-13_23-17-33_7452.png",
    "/Remy/2025-08-13_23-22-18_1954.png",
    "/Remy/2025-08-13_23-24-03_9234.png",
    "/Remy/2025-08-13_23-28-00_9739.png",
    "/Remy/2025-08-13_23-38-22_6693.png",
    "/Remy/2025-08-13_23-49-18_3743.png",
    "/Remy/2025-08-13_23-58-49_9615.png"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section with Profile */}
      <section className="relative pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
            {/* Profile Image */}
            <div className="relative">
              <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-pink-500 shadow-2xl">
                <img 
                  src="/Remy/2025-08-08_17-13-44_4613.png" 
                  alt="Remy" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                Hey babe, I'm Remy 💋
              </h1>
              <div className="mb-3">
                <OnlineStatusIndicator />
              </div>
              <p className="text-xl text-gray-300 mb-2">
                Welcome to my exclusive world 💕
              </p>
              <p className="text-lg text-pink-300 mb-4 font-medium">
                My schedule is getting so busy... but I always make time for my special fans
              </p>
              <div className="flex gap-4 justify-center md:justify-start mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-pink-400">1.2K</div>
                  <div className="text-sm text-gray-400">Personal Photos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">&lt; 2min</div>
                  <div className="text-sm text-gray-400">Response Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">⭐⭐⭐⭐⭐</div>
                  <div className="text-sm text-gray-400">Top 0.1% Creator</div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-4 justify-center md:justify-start">
                <Link href="/chat">
                  <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Chat With Me Personally
                  </Button>
                </Link>
                <Link href="/gallery">
                  <Button size="lg" variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white">
                    <Camera className="w-5 h-5 mr-2" />
                    See My Private Collection 🔥
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Bio Section */}
          <Card className="bg-black/40 border-purple-500/20 backdrop-blur-sm mb-12">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-pink-400">About Me</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Hey there! Welcome to my world 😘 I'm Remy, a 24-year-old content creator who genuinely loves connecting with my fans. 
                I handle all my own messages because I actually enjoy getting to know the people who support me. 
                Drop me a message - I'm usually pretty quick to respond and I love hearing from you! 
                Let me be your fun escape from the everyday 💕
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-purple-900/50 rounded-full text-sm text-purple-300">🏋️‍♀️ Gym Selfies</span>
                <span className="px-3 py-1 bg-purple-900/50 rounded-full text-sm text-purple-300">👙 Lingerie</span>
                <span className="px-3 py-1 bg-purple-900/50 rounded-full text-sm text-purple-300">🎥 Custom Videos</span>
                <span className="px-3 py-1 bg-purple-900/50 rounded-full text-sm text-purple-300">💬 Sexting</span>
                <span className="px-3 py-1 bg-purple-900/50 rounded-full text-sm text-purple-300">🔥 Daily Content</span>
              </div>
            </CardContent>
          </Card>


          {/* Featured Content Preview */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              My Latest Content 🔥
            </h2>
            <div className="relative">
              {/* Lock overlay for non-authenticated users */}
              {!isAuthenticated && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-xl rounded-lg">
                  <div className="text-center space-y-4 p-8">
                    <Lock className="w-16 h-16 text-purple-400 mx-auto" />
                    <h3 className="text-2xl font-bold text-white">
                      Members Only Content
                    </h3>
                    <p className="text-gray-300 max-w-sm">
                      Sign in to preview my exclusive content
                    </p>
                    <Button
                      onClick={() => setShowLoginModal(true)}
                      size="lg"
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      <Eye className="w-5 h-5 mr-2" />
                      Unlock Preview
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Gallery grid - blurred if not authenticated */}
              <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${!isAuthenticated ? 'blur-2xl select-none pointer-events-none' : ''}`}>
                {galleryImages.slice(0, 8).map((image, index) => (
                  <div key={index} className="relative group cursor-pointer">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-800">
                      <img 
                        src={image} 
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        draggable={false}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                        <Link href="/gallery">
                          <Button size="sm" className="bg-pink-600 hover:bg-pink-700">
                            View More
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center mt-8">
              <Link href="/gallery">
                <Button size="lg" variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white">
                  <Camera className="w-5 h-5 mr-2" />
                  Enter My Private Gallery (1,200+ Personal Photos)
                </Button>
              </Link>
            </div>
          </div>

          {/* Dynamic Call to Action based on online status */}
          <DynamicCallToAction />
        </div>
      </section>
      
      {/* Login Modal */}
      <LoginPromptModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message="Sign in to view exclusive content"
      />
    </div>
  );
}