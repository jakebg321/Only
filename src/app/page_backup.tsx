// BACKUP OF ORIGINAL HOME PAGE - DO NOT DELETE
// This is the original home page with all the content creation features
// Keeping this in case we need to restore later

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, DollarSign, Star, TrendingUp } from "lucide-react";

export default function HomeBackup() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
              Only Twins Platform
            </h1>
            <p className="text-2xl md:text-3xl font-semibold text-gray-300 mb-4">
              The Future of Content Creation is Here
            </p>
            <p className="text-xl text-gray-400 max-w-4xl mx-auto leading-relaxed">
              Deploy your AI twin to generate personalized content 24/7. Scale your OnlyFans empire 
              while you sleep. Earn 10x more with zero extra effort.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/auth">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/manager">
              <Button size="lg" variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300">
                See Demo
              </Button>
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">$2.5M+</div>
              <div className="text-gray-400">Revenue Generated</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">50,000+</div>
              <div className="text-gray-400">AI Messages Sent</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-pink-400 mb-2">High</div>
              <div className="text-gray-400">Creator Satisfaction</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}