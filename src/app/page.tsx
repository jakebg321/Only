"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Users, DollarSign, BarChart, Star, TrendingUp, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
              AI Twins Platform
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
              <div className="text-4xl font-bold text-pink-400 mb-2">98%</div>
              <div className="text-gray-400">Creator Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-5xl font-bold mb-4 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Why Top Creators Choose AI Twins
          </h2>
          <p className="text-xl text-gray-400 text-center mb-16 max-w-3xl mx-auto">
            Join the revolution. Stop trading time for money. Start scaling with AI.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="bg-black/40 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <DollarSign className="w-8 h-8 mr-3 text-green-400" />
                  10x Your Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Your AI twin works 24/7, engaging subscribers with personalized content. 
                  Top creators report 300-1000% revenue increases within 30 days.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Zap className="w-8 h-8 mr-3 text-yellow-400" />
                  Reclaim Your Life
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Stop being glued to your phone. Your AI handles 95% of subscriber interactions 
                  while maintaining your authentic voice and personality.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <TrendingUp className="w-8 h-8 mr-3 text-purple-400" />
                  Scale Infinitely
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Manage unlimited subscribers without hiring assistants. 
                  Your AI twin scales perfectly from 100 to 100,000 fans.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Social Proof */}
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold mb-8 text-white">Trusted by Top Performers</h3>
            <div className="flex justify-center items-center gap-8 mb-8">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-8 h-8 text-yellow-400 fill-current" />
              ))}
            </div>
            <p className="text-xl text-gray-300 mb-4">"Increased my monthly revenue from $15K to $75K in just 6 weeks"</p>
            <p className="text-purple-400 font-semibold">- Sarah M., Top 0.1% Creator</p>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-2xl p-12 text-center backdrop-blur-sm border border-purple-500/20">
            <h3 className="text-4xl font-bold mb-4 text-white">Ready to 10x Your OnlyFans?</h3>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join 500+ creators already earning more while working less. 
              Start your free trial today - no credit card required.
            </p>
            <Link href="/auth">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-12 py-6 text-xl font-bold rounded-xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300">
                Start Free Trial Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gray-800">
        <div className="container mx-auto text-center">
          <p className="text-gray-400">&copy; 2024 AI Twins Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
