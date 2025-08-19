/**
 * Online Status System for Remy
 * Creates realistic online/offline patterns based on Eastern Time
 */

export interface OnlineStatus {
  isOnline: boolean;
  statusText: string;
  statusColor: string;
  lastSeen?: string;
}

// Store the last status decision to maintain consistency
let lastStatusDecision: { 
  activity: string; 
  startTime: Date; 
  duration: number; // in minutes
} | null = null;

/**
 * Get current Eastern Time hour (0-23)
 */
function getEasternHour(): number {
  const now = new Date();
  // Convert to Eastern Time (UTC-5 or UTC-4 for DST)
  const easternTime = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  return easternTime.getHours();
}

/**
 * Get current Eastern Time in readable format (e.g., "7:52 PM EST")
 */
function getEasternTimeString(): string {
  const now = new Date();
  const easternTime = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  
  let hours = easternTime.getHours();
  const minutes = easternTime.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12
  
  const minutesStr = minutes < 10 ? '0' + minutes : minutes;
  
  return `${hours}:${minutesStr} ${ampm} EST`;
}

/**
 * Get a specific time in Eastern format with realistic minutes (e.g., "10:17 AM EST")
 */
function formatEasternTime(hour: number, minute?: number): string {
  // If no minute provided, generate a realistic one (not ending in 0 or 5)
  if (minute === undefined) {
    const minuteOptions = [7, 12, 17, 22, 27, 32, 37, 42, 47, 52, 57, 3, 8, 13, 18, 23, 28, 33, 38, 43, 48, 53, 58];
    minute = minuteOptions[Math.floor(Math.random() * minuteOptions.length)];
  }
  
  let displayHour = hour % 12;
  displayHour = displayHour ? displayHour : 12;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const minutesStr = minute < 10 ? '0' + minute : minute;
  return `${displayHour}:${minutesStr} ${ampm} EST`;
}

/**
 * Get current day of week (0 = Sunday, 6 = Saturday)
 */
function getDayOfWeek(): number {
  const now = new Date();
  const easternTime = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  return easternTime.getDay();
}

/**
 * Determine if Remy should be online based on realistic patterns
 * Sleep schedule: Usually sleeps 3 AM - 10 AM Eastern
 * Active hours: Most active 10 AM - 2 AM with breaks
 */
export function getOnlineStatus(): OnlineStatus {
  const hour = getEasternHour();
  const day = getDayOfWeek();
  const minute = new Date().getMinutes();
  const now = new Date();
  
  // Check if we have an ongoing activity
  if (lastStatusDecision) {
    const elapsed = (now.getTime() - lastStatusDecision.startTime.getTime()) / (1000 * 60); // minutes
    if (elapsed < lastStatusDecision.duration) {
      // Still in the same activity, return consistent status
      return getStatusForActivity(lastStatusDecision.activity, hour, minute);
    }
    // Activity finished, clear it
    lastStatusDecision = null;
  }
  
  // Sleep hours (3 AM - 10 AM Eastern) - definitely offline
  if (hour >= 3 && hour < 10) {
    const wakeUpTime = formatEasternTime(10, 17); // More realistic time like 10:17
    return {
      isOnline: false,
      statusText: `Sleeping 😴 Back at ${wakeUpTime}`,
      statusColor: "text-gray-400",
      lastSeen: formatEasternTime(2, 47) // Last seen at like 2:47 AM
    };
  }
  
  // Late night hours (2 AM - 3 AM) - sometimes still up
  if (hour >= 2 && hour < 3) {
    const stillUp = Math.random() < 0.3; // 30% chance still online
    if (stillUp) {
      return {
        isOnline: true,
        statusText: "Still up for you night owls 🦉",
        statusColor: "text-green-400"
      };
    } else {
      return {
        isOnline: false,
        statusText: "Getting sleepy... 😴",
        statusColor: "text-yellow-400",
        lastSeen: formatEasternTime(2, Math.floor(Math.random() * 30))
      };
    }
  }
  
  // Morning routine (10 AM - 12 PM) - getting ready, intermittent
  if (hour >= 10 && hour < 12) {
    const gettingReady = Math.random() < 0.4; // 40% offline for morning routine
    if (gettingReady) {
      const minutesAgo = Math.floor(Math.random() * 30) + 5;
      const lastSeenTime = new Date();
      lastSeenTime.setMinutes(lastSeenTime.getMinutes() - minutesAgo);
      return {
        isOnline: false,
        statusText: "Getting ready 💄 Back soon!",
        statusColor: "text-yellow-400",
        lastSeen: getEasternTimeString()
      };
    }
    return {
      isOnline: true,
      statusText: "Good morning babe! ☀️",
      statusColor: "text-green-400"
    };
  }
  
  // Lunch break (1 PM - 2 PM) - often away
  if (hour >= 13 && hour < 14) {
    const onLunch = Math.random() < 0.6; // 60% chance on lunch
    if (onLunch) {
      return {
        isOnline: false,
        statusText: "Grabbing lunch 🥗 Back by 2!",
        statusColor: "text-yellow-400",
        lastSeen: formatEasternTime(13, Math.floor(Math.random() * 30))
      };
    }
    return {
      isOnline: true,
      statusText: "Online now 💕",
      statusColor: "text-green-400"
    };
  }
  
  // Gym time (5 PM - 7 PM on weekdays) - usually offline
  if (day >= 1 && day <= 5 && hour >= 17 && hour < 19) {
    const atGym = Math.random() < 0.75; // 75% chance at gym on weekdays
    if (atGym) {
      return {
        isOnline: false,
        statusText: `At the gym 🏋️‍♀️ Back by ${formatEasternTime(19, 0)}`,
        statusColor: "text-yellow-400",
        lastSeen: formatEasternTime(17, Math.floor(Math.random() * 30))
      };
    }
    return {
      isOnline: true,
      statusText: "Quick break from gym 💪",
      statusColor: "text-green-400"
    };
  }
  
  // Dinner time (7 PM - 8 PM) - sometimes away
  if (hour >= 19 && hour < 20) {
    const onDinner = Math.random() < 0.5; // 50% chance having dinner
    if (onDinner) {
      return {
        isOnline: false,
        statusText: "Having dinner 🍽️",
        statusColor: "text-yellow-400",
        lastSeen: formatEasternTime(hour, minute < 30 ? 0 : 30)
      };
    }
    return {
      isOnline: true,
      statusText: "Online & chatty tonight 😘",
      statusColor: "text-green-400"
    };
  }
  
  // Peak evening hours (8 PM - 12 AM) - mostly online
  if (hour >= 20 || hour < 1) {
    const takingBreak = Math.random() < 0.15; // 15% chance on break
    if (takingBreak) {
      return {
        isOnline: false,
        statusText: "Quick shower 🚿 BRB!",
        statusColor: "text-yellow-400",
        lastSeen: `15 mins ago`
      };
    }
    
    // Different flirty messages for peak hours
    const messages = [
      "Online now 💋 Let's chat!",
      "Available for you 💕",
      "Feeling chatty tonight 😈",
      "Online & thinking of you 💭",
      "Here for you babe 🔥",
      "Ready to play 😘"
    ];
    
    return {
      isOnline: true,
      statusText: messages[Math.floor(Math.random() * messages.length)],
      statusColor: "text-green-400"
    };
  }
  
  // Afternoon hours (12 PM - 5 PM) - mostly online with occasional breaks
  const randomBreak = Math.random() < 0.25; // 25% chance on break
  if (randomBreak) {
    const breakReasons = [
      { text: "Making content 📸", time: "20 mins ago" },
      { text: "Quick snack break 🍓", time: "5 mins ago" },
      { text: "Shooting new pics 📷", time: "10 mins ago" },
      { text: "Quick call, BRB! 📱", time: "2 mins ago" }
    ];
    const reason = breakReasons[Math.floor(Math.random() * breakReasons.length)];
    
    return {
      isOnline: false,
      statusText: reason.text,
      statusColor: "text-yellow-400",
      lastSeen: reason.time
    };
  }
  
  // Default online status for remaining times
  return {
    isOnline: true,
    statusText: "Online now 💕",
    statusColor: "text-green-400"
  };
}

/**
 * Get a "last seen" time that feels realistic
 */
export function getLastSeenTime(hoursAgo: number = 1): string {
  if (hoursAgo < 1) {
    const mins = Math.floor(hoursAgo * 60);
    return `${mins} mins ago`;
  } else if (hoursAgo === 1) {
    return "1 hour ago";
  } else if (hoursAgo < 24) {
    return `${Math.floor(hoursAgo)} hours ago`;
  } else {
    return "Yesterday";
  }
}

/**
 * Check if it's a good time to send a "good morning" message
 */
export function isGoodMorningTime(): boolean {
  const hour = getEasternHour();
  return hour >= 10 && hour < 11; // 10 AM - 11 AM Eastern
}

/**
 * Check if it's late night flirty hours
 */
export function isLateNightTime(): boolean {
  const hour = getEasternHour();
  return hour >= 22 || hour < 2; // 10 PM - 2 AM Eastern
}