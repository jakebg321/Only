"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Users, Eye, Lock, Zap, Star } from "lucide-react";
import { processPayment, CONTENT_DROPS, generateContentOffer } from "@/lib/dummy-payment";
import { trackPaymentOffer, trackPaymentAttempt, trackPaymentSuccess } from "@/lib/user-analytics";

interface ContentDropOfferProps {
  userId: string;
  contentType?: string;
  onPurchaseComplete?: (content: string[]) => void;
  className?: string;
}

export default function ContentDropOffer({ 
  userId, 
  contentType, 
  onPurchaseComplete,
  className = "" 
}: ContentDropOfferProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [hasViewed, setHasViewed] = useState(false);
  const [offer, setOffer] = useState<any>(null);

  useEffect(() => {
    // Generate dynamic offer based on context
    const currentOffer = contentType 
      ? CONTENT_DROPS[contentType as keyof typeof CONTENT_DROPS]
      : generateContentOffer({
          timeOfDay: new Date().getHours(),
          userSpendingLevel: 'medium' // Would come from user profile
        });

    setOffer({
      ...currentOffer,
      id: `offer_${Date.now()}`,
      psychologicalTriggers: {
        scarcity: true,
        social_proof: true,
        urgency: true
      }
    });

    // Simulate dynamic counters
    setViewCount(15 + Math.floor(Math.random() * 25)); // 15-40 viewers
    setTimeLeft(3600 + Math.floor(Math.random() * 7200)); // 1-3 hours left

    // Track that offer was shown
    if (!hasViewed) {
      trackPaymentOffer(userId, currentOffer);
      setHasViewed(true);
    }
  }, [contentType, userId, hasViewed]);

  // Update countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
      
      // Randomly update view count for psychological effect
      if (Math.random() < 0.1) { // 10% chance each second
        setViewCount(prev => prev + (Math.random() > 0.5 ? 1 : -1));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${mins}m ${secs}s`;
  };

  const handlePurchase = async () => {
    if (!offer) return;
    
    setIsProcessing(true);
    
    // Track payment attempt
    trackPaymentAttempt(userId, offer.id);
    
    try {
      const result = await processPayment({
        amount: offer.price,
        contentType: offer.contentType,
        contentId: offer.id,
        userId,
        urgencyLevel: 'high',
        scarcityMessage: offer.scarcity,
        socialProof: offer.socialProof.replace('{count}', viewCount.toString())
      });

      if (result.success) {
        // Track successful conversion
        trackPaymentSuccess(userId, offer.id, offer.psychologicalTriggers);
        
        // Notify parent component
        if (onPurchaseComplete && result.contentUnlocked) {
          onPurchaseComplete(result.contentUnlocked);
        }
        
        // Show success state briefly
        setTimeout(() => {
          setIsProcessing(false);
        }, 2000);
      } else {
        setIsProcessing(false);
        // Handle failed payment
        alert("Payment failed. Want to try again?");
      }
    } catch (error) {
      setIsProcessing(false);
      console.error('Payment error:', error);
    }
  };

  if (!offer) return null;

  return (
    <Card className={`bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-pink-500/30 backdrop-blur-sm ${className}`}>
      <CardContent className="p-6">
        {/* Header with urgency */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400 font-semibold text-sm">LIMITED TIME</span>
          </div>
          <div className="flex items-center gap-2 text-red-400">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-mono">{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Content preview */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-white mb-2">{offer.title}</h3>
          <p className="text-gray-300 text-sm mb-3">{offer.description}</p>
          
          {/* Psychological triggers */}
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="flex items-center gap-1 px-2 py-1 bg-red-900/30 rounded-full">
              <Users className="w-3 h-3 text-red-400" />
              <span className="text-xs text-red-400">{viewCount} viewing</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 bg-orange-900/30 rounded-full">
              <Eye className="w-3 h-3 text-orange-400" />
              <span className="text-xs text-orange-400">{offer.scarcity}</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 bg-green-900/30 rounded-full">
              <Star className="w-3 h-3 text-green-400" />
              <span className="text-xs text-green-400">VIP Exclusive</span>
            </div>
          </div>
        </div>

        {/* Pricing with anchoring */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">${offer.price}</span>
              <span className="text-sm text-gray-400 line-through">${offer.price + 2}</span>
              <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">SAVE ${2}</span>
            </div>
            <p className="text-xs text-gray-400">Usually ${offer.price + 2} • Special price for you</p>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-400">What you get:</div>
            <div className="text-sm font-semibold text-green-400">5-8 exclusive photos</div>
          </div>
        </div>

        {/* Social proof */}
        <div className="mb-4 p-3 bg-black/20 rounded-lg border border-purple-500/20">
          <p className="text-sm text-gray-300 italic">
            "{offer.socialProof.replace('{count}', viewCount.toString())}"
          </p>
        </div>

        {/* Purchase button */}
        <Button
          onClick={handlePurchase}
          disabled={isProcessing}
          className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold py-3 text-lg"
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Unlock Now - ${offer.price}
            </div>
          )}
        </Button>

        {/* Additional psychological pressure */}
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-400">
            {Math.floor(viewCount * 0.7)} people unlocked this in the last hour
          </p>
        </div>
      </CardContent>
    </Card>
  );
}