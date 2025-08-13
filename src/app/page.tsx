"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MessageCircle, Camera, Lock, Eye } from "lucide-react";
import LoginPromptModal from "@/components/LoginPromptModal";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
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
    "/Remy/2025-08-08_18-10-28_1308.png"
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
              <div className="absolute bottom-2 right-2 bg-green-500 w-6 h-6 rounded-full border-2 border-white"></div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                Hey babe, I'm Remy 💋
              </h1>
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

          {/* Testimonials Section */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              What My Special Fans Say 💕
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-black/40 border-purple-500/20 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                      M
                    </div>
                    <div className="ml-3">
                      <p className="font-semibold text-white">Mike_VIP</p>
                      <div className="text-yellow-400 text-sm">⭐⭐⭐⭐⭐</div>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm italic">
                    "Remy actually remembers everything about me. She asked about my work presentation that I mentioned weeks ago. That's real connection!"
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-purple-500/20 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                      J
                    </div>
                    <div className="ml-3">
                      <p className="font-semibold text-white">James_Close</p>
                      <div className="text-yellow-400 text-sm">⭐⭐⭐⭐⭐</div>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm italic">
                    "I've tried other creators but Remy responds personally within minutes. She actually cares and puts real effort into everything she sends."
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-purple-500/20 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      D
                    </div>
                    <div className="ml-3">
                      <p className="font-semibold text-white">David_Special</p>
                      <div className="text-yellow-400 text-sm">⭐⭐⭐⭐⭐</div>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm italic">
                    "The custom content is incredible. You can tell she spends real time making each request perfect. Worth every penny and more."
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Subscription Tiers */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Choose Your Connection Level 💕
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Sweet Fan Tier */}
              <Card className="bg-black/40 border-purple-500/20 backdrop-blur-sm hover:border-purple-400/40 transition-all">
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-bold text-purple-400 mb-2">Sweet Fan</h3>
                  <div className="text-3xl font-bold text-white mb-4">$25<span className="text-lg text-gray-400">/month</span></div>
                  <ul className="text-gray-300 space-y-2 text-left mb-6">
                    <li className="flex items-center gap-2"><span className="text-pink-400">💕</span> Daily personal messages</li>
                    <li className="flex items-center gap-2"><span className="text-pink-400">📸</span> Exclusive daily photos</li>
                    <li className="flex items-center gap-2"><span className="text-pink-400">💬</span> Chat access with me</li>
                    <li className="flex items-center gap-2"><span className="text-pink-400">🎁</span> Welcome gift package</li>
                  </ul>
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    Start Our Connection
                  </Button>
                </CardContent>
              </Card>

              {/* Close Friend Tier */}
              <Card className="bg-black/40 border-pink-500/40 backdrop-blur-sm hover:border-pink-400/60 transition-all transform scale-105">
                <CardContent className="p-6 text-center relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                    Most Popular 🔥
                  </div>
                  <h3 className="text-xl font-bold text-pink-400 mb-2 mt-2">Close Friend</h3>
                  <div className="text-3xl font-bold text-white mb-4">$75<span className="text-lg text-gray-400">/month</span></div>
                  <ul className="text-gray-300 space-y-2 text-left mb-6">
                    <li className="flex items-center gap-2"><span className="text-pink-400">💝</span> Everything from Sweet Fan</li>
                    <li className="flex items-center gap-2"><span className="text-pink-400">🎨</span> Custom photo requests</li>
                    <li className="flex items-center gap-2"><span className="text-pink-400">⚡</span> Priority responses</li>
                    <li className="flex items-center gap-2"><span className="text-pink-400">🌅</span> Good morning texts</li>
                    <li className="flex items-center gap-2"><span className="text-pink-400">📱</span> Behind-the-scenes content</li>
                  </ul>
                  <Button className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700">
                    Get Closer to Me
                  </Button>
                </CardContent>
              </Card>

              {/* Special Someone Tier */}
              <Card className="bg-black/40 border-yellow-500/20 backdrop-blur-sm hover:border-yellow-400/40 transition-all">
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-bold text-yellow-400 mb-2">Special Someone</h3>
                  <div className="text-3xl font-bold text-white mb-4">$150<span className="text-lg text-gray-400">/month</span></div>
                  <ul className="text-gray-300 space-y-2 text-left mb-6">
                    <li className="flex items-center gap-2"><span className="text-yellow-400">👑</span> Everything from Close Friend</li>
                    <li className="flex items-center gap-2"><span className="text-yellow-400">📹</span> Private video calls</li>
                    <li className="flex items-center gap-2"><span className="text-yellow-400">🎥</span> Custom video requests</li>
                    <li className="flex items-center gap-2"><span className="text-yellow-400">💭</span> Personal stories & secrets</li>
                    <li className="flex items-center gap-2"><span className="text-yellow-400">⭐</span> Daily check-ins</li>
                  </ul>
                  <Button className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700">
                    Be My Special One
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

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

          {/* Call to Action */}
          <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-pink-500/30 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <h3 className="text-3xl font-bold mb-4 text-white">Come get to know the real me 😈</h3>
              <p className="text-xl text-gray-200 mb-6">
                I'm online right now and would love to chat with you personally! I put so much care into every conversation... Let me show you what makes me special 💦
              </p>
              <Link href="/chat">
                <Button size="lg" className="bg-white text-purple-900 hover:bg-gray-100 font-bold px-8 py-4 text-lg">
                  <Heart className="w-6 h-6 mr-2 text-pink-500" />
                  Message Me Now 💋
                </Button>
              </Link>
            </CardContent>
          </Card>
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