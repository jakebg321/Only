"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Crown, Heart } from "lucide-react";

export default function Auth() {
  const router = useRouter();

  const loginAs = (type: string) => {
    localStorage.setItem("userType", type);
    router.push(`/${type}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 gradient-text">Welcome to AI Twins</h1>
          <p className="text-xl text-gray-300">Choose your role to get started</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Card className="bg-black/40 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 backdrop-blur-sm cursor-pointer" onClick={() => loginAs("manager")}>
            <CardHeader className="text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-blue-400" />
              <CardTitle className="text-2xl">Agency Manager</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-300 mb-6">Manage multiple creators, track revenue, and scale your agency</p>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Login as Manager
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 backdrop-blur-sm cursor-pointer" onClick={() => loginAs("creator")}>
            <CardHeader className="text-center">
              <Crown className="w-16 h-16 mx-auto mb-4 text-purple-400" />
              <CardTitle className="text-2xl">Content Creator</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-300 mb-6">Create AI content, grow your audience, and maximize earnings</p>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Login as Creator
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 backdrop-blur-sm cursor-pointer" onClick={() => loginAs("subscriber")}>
            <CardHeader className="text-center">
              <Heart className="w-16 h-16 mx-auto mb-4 text-pink-400" />
              <CardTitle className="text-2xl">Subscriber</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-300 mb-6">Enjoy personalized AI content from your favorite creators</p>
              <Button className="w-full bg-pink-600 hover:bg-pink-700">
                Login as Subscriber
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
