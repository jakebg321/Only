/**
 * Dummy Payment System for Testing User Behavior
 * Simulates real payment flow to collect psychological data
 */

export interface PaymentRequest {
  amount: number;
  contentType: string;
  contentId: string;
  userId: string;
  urgencyLevel?: 'low' | 'medium' | 'high';
  scarcityMessage?: string;
  socialProof?: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  contentUnlocked?: string[];
  message: string;
  nextUpsell?: {
    item: string;
    price: number;
    urgencyMessage: string;
  };
}

export interface UserPaymentBehavior {
  userId: string;
  timeToDecision: number; // milliseconds from offer to payment
  hesitationCount: number; // how many times they backed out
  priceResistance: number; // 1-10 scale
  responseTo: {
    scarcity: boolean;
    socialProof: boolean;
    urgency: boolean;
    personalizedOffers: boolean;
  };
  conversionPath: string[]; // sequence of events leading to purchase
}

// Simulate payment processing
export async function processPayment(request: PaymentRequest): Promise<PaymentResponse> {
  // Track the payment attempt for analytics
  await trackPaymentAttempt(request);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
  
  // 95% success rate for testing
  const success = Math.random() > 0.05;
  
  if (success) {
    // Track successful conversion
    await trackSuccessfulPayment(request);
    
    return {
      success: true,
      transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      contentUnlocked: getContentForPayment(request),
      message: getSuccessMessage(request),
      nextUpsell: generateUpsellOffer(request)
    };
  } else {
    // Track failed payment for analytics
    await trackFailedPayment(request);
    
    return {
      success: false,
      transactionId: '',
      message: "Payment failed. Want to try again? Maybe a different amount?"
    };
  }
}

// Get content based on payment type
function getContentForPayment(request: PaymentRequest): string[] {
  const contentMap: { [key: string]: string[] } = {
    'lingerie_drop': [
      '/content/lingerie_set_1.jpg',
      '/content/lingerie_set_2.jpg', 
      '/content/lingerie_set_3.jpg',
      '/content/lingerie_set_4.jpg',
      '/content/lingerie_set_5.jpg'
    ],
    'gym_session': [
      '/content/post_workout_1.jpg',
      '/content/post_workout_2.jpg',
      '/content/post_workout_3.jpg'
    ],
    'shower_pics': [
      '/content/shower_1.jpg',
      '/content/shower_2.jpg',
      '/content/shower_3.jpg',
      '/content/shower_4.jpg'
    ],
    'bedtime_content': [
      '/content/bedtime_1.jpg',
      '/content/bedtime_2.jpg',
      '/content/bedtime_3.jpg'
    ]
  };
  
  return contentMap[request.contentType] || ['/content/default.jpg'];
}

// Generate success message based on psychology
function getSuccessMessage(request: PaymentRequest): string {
  const messages = [
    "You're the best! 😘 Enjoy these exclusive pics just for you 💕",
    "Knew you had good taste! These are some of my favorites 🔥",
    "Thanks babe! You're officially one of my VIPs now 👑",
    "Perfect choice! Wait until you see what I have planned next... 😈",
    "You always know how to make me smile! Hope you love these 💋"
  ];
  
  return messages[Math.floor(Math.random() * messages.length)];
}

// Generate next upsell based on user behavior
function generateUpsellOffer(request: PaymentRequest): PaymentResponse['nextUpsell'] {
  const upsells = [
    {
      item: "Behind-the-scenes video of this shoot",
      price: 8,
      urgencyMessage: "Only available for the next hour!"
    },
    {
      item: "Voice message telling you what I was thinking", 
      price: 12,
      urgencyMessage: "Limited to first 10 buyers only!"
    },
    {
      item: "Custom photo with your name written on me",
      price: 25,
      urgencyMessage: "Only doing 3 of these today!"
    }
  ];
  
  return upsells[Math.floor(Math.random() * upsells.length)];
}

// Track payment attempt for behavioral analysis
async function trackPaymentAttempt(request: PaymentRequest) {
  // This would go to analytics DB
  console.log('Payment Attempt Tracked:', {
    userId: request.userId,
    amount: request.amount,
    contentType: request.contentType,
    timestamp: new Date(),
    psychological_triggers: {
      urgency: request.urgencyLevel,
      scarcity: !!request.scarcityMessage,
      social_proof: !!request.socialProof
    }
  });
}

// Track successful payment for conversion analysis
async function trackSuccessfulPayment(request: PaymentRequest) {
  console.log('Successful Payment Tracked:', {
    userId: request.userId,
    amount: request.amount,
    contentType: request.contentType,
    conversion_factors: {
      urgency: request.urgencyLevel,
      scarcity: request.scarcityMessage,
      social_proof: request.socialProof
    },
    timestamp: new Date()
  });
}

// Track failed payment for optimization
async function trackFailedPayment(request: PaymentRequest) {
  console.log('Failed Payment Tracked:', {
    userId: request.userId,
    amount: request.amount,
    contentType: request.contentType,
    failed_despite: {
      urgency: request.urgencyLevel,
      scarcity: request.scarcityMessage,
      social_proof: request.socialProof
    },
    timestamp: new Date()
  });
}

// Content drop configurations with psychology
export const CONTENT_DROPS = {
  lingerie_new: {
    title: "New Lingerie Set 🔥",
    description: "Just got this gorgeous new set... want to see me model it?",
    price: 3,
    urgency: "Only available for 24 hours",
    scarcity: "Limited to first 50 fans",
    socialProof: "{count} people have already unlocked this",
    contentType: "lingerie_drop"
  },
  
  post_workout: {
    title: "Post-Gym Glow ✨", 
    description: "Just finished an intense workout... feeling so good right now",
    price: 2,
    urgency: "Fresh content - next 6 hours only",
    scarcity: "Only sharing with my closest fans",
    socialProof: "{count} fans loved my last gym content",
    contentType: "gym_session"
  },
  
  shower_time: {
    title: "Shower Fresh 🚿",
    description: "About to hop in the shower... want to see the before and after?",
    price: 4,
    urgency: "Available while I'm getting ready",
    scarcity: "Private content for VIPs only", 
    socialProof: "My highest spenders always get this type of content",
    contentType: "shower_pics"
  },
  
  bedtime_vibes: {
    title: "Getting Ready for Bed 🌙",
    description: "Putting on my favorite pajamas... or maybe not wearing them at all 😉",
    price: 3,
    urgency: "Night owl special - limited time",
    scarcity: "Only 25 spots available",
    socialProof: "{count} people are viewing this right now",
    contentType: "bedtime_content"
  }
};

// Generate dynamic content offer based on time/context
export function generateContentOffer(context: {
  timeOfDay: number;
  userSpendingLevel: 'low' | 'medium' | 'high';
  lastPurchase?: Date;
  userPreferences?: string[];
}): any {
  const hour = context.timeOfDay;
  
  // Time-based content suggestions
  if (hour >= 6 && hour < 12) {
    return CONTENT_DROPS.post_workout;
  } else if (hour >= 17 && hour < 20) {
    return CONTENT_DROPS.shower_time;
  } else if (hour >= 22 || hour < 2) {
    return CONTENT_DROPS.bedtime_vibes;
  } else {
    return CONTENT_DROPS.lingerie_new;
  }
}