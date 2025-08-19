/**
 * Online Status System for Remy - Version 2
 * More realistic with consistent status periods
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
  isOnline: boolean;
} | null = null;

/**
 * Get current Eastern Time hour (0-23)
 */
function getEasternHour(): number {
  const now = new Date();
  const easternTime = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  return easternTime.getHours();
}

/**
 * Get current Eastern Time minutes
 */
function getEasternMinute(): number {
  const now = new Date();
  const easternTime = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  return easternTime.getMinutes();
}

/**
 * Get current Eastern Time in readable format (e.g., "7:52 PM EST")
 */
export function getEasternTimeString(): string {
  const now = new Date();
  const easternTime = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  
  let hours = easternTime.getHours();
  const minutes = easternTime.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  hours = hours % 12;
  hours = hours ? hours : 12;
  
  const minutesStr = minutes < 10 ? '0' + minutes : minutes;
  
  return `${hours}:${minutesStr} ${ampm} EST`;
}

/**
 * Generate a realistic time with non-round minutes
 */
function formatRealisticTime(hour: number, minuteOffset?: number): string {
  // Generate realistic minutes that don't end in 0 or 5
  const realisticMinutes = [7, 12, 17, 22, 27, 32, 37, 42, 47, 52, 57, 3, 8, 13, 18, 23, 28, 33, 38, 43, 48, 53, 58];
  const minute = minuteOffset !== undefined ? minuteOffset : realisticMinutes[Math.floor(Math.random() * realisticMinutes.length)];
  
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
 * Main function to get Remy's online status
 */
export function getOnlineStatus(): OnlineStatus {
  const hour = getEasternHour();
  const minute = getEasternMinute();
  const day = getDayOfWeek();
  const now = new Date();
  
  // Check if we're still in a previous activity period
  if (lastStatusDecision) {
    const elapsedMinutes = (now.getTime() - lastStatusDecision.startTime.getTime()) / (1000 * 60);
    
    // If still within the activity duration, return the same status
    if (elapsedMinutes < lastStatusDecision.duration) {
      if (!lastStatusDecision.isOnline) {
        // Still offline for this activity
        return getOfflineStatus(lastStatusDecision.activity);
      }
      // Continue being online
    } else {
      // Activity period ended, clear it
      lastStatusDecision = null;
    }
  }
  
  // SLEEP TIME: 3:17 AM - 10:22 AM (always offline)
  if ((hour === 3 && minute >= 17) || (hour > 3 && hour < 10) || (hour === 10 && minute < 22)) {
    return {
      isOnline: false,
      statusText: `Sleeping 😴 Back at ${formatRealisticTime(10, 22)}`,
      statusColor: "text-gray-400",
      lastSeen: formatRealisticTime(3, 17)
    };
  }
  
  // LATE NIGHT: 2:00 AM - 3:17 AM (getting sleepy)
  if (hour === 2 || (hour === 3 && minute < 17)) {
    if (!lastStatusDecision) {
      const stayUp = Math.random() < 0.2; // 20% chance still up
      if (!stayUp) {
        setActivity('getting_sleepy', 15); // Will be sleepy for 15 mins before bed
      }
    }
    
    if (lastStatusDecision?.activity === 'getting_sleepy') {
      return {
        isOnline: false,
        statusText: "Getting sleepy... 😴 One more message?",
        statusColor: "text-yellow-400",
        lastSeen: formatRealisticTime(hour, minute - 5)
      };
    }
    
    return {
      isOnline: true,
      statusText: "Still up for my night owls 🦉",
      statusColor: "text-green-400"
    };
  }
  
  // MORNING ROUTINE: 10:22 AM - 11:47 AM
  if ((hour === 10 && minute >= 22) || (hour === 11 && minute < 47)) {
    if (!lastStatusDecision && Math.random() < 0.4) {
      setActivity('morning_routine', 15 + Math.random() * 20); // 15-35 mins
    }
    
    if (lastStatusDecision?.activity === 'morning_routine') {
      return {
        isOnline: false,
        statusText: "Getting ready 💄 Back soon!",
        statusColor: "text-yellow-400",
        lastSeen: formatRealisticTime(hour, minute - 10)
      };
    }
    
    return {
      isOnline: true,
      statusText: "Good morning babe! ☀️ Fresh out of bed",
      statusColor: "text-green-400"
    };
  }
  
  // LUNCH: 12:47 PM - 1:52 PM (weekdays more likely)
  if ((hour === 12 && minute >= 47) || (hour === 13 && minute < 52)) {
    const lunchChance = day >= 1 && day <= 5 ? 0.7 : 0.4; // Higher chance on weekdays
    
    if (!lastStatusDecision && Math.random() < lunchChance) {
      setActivity('lunch', 30 + Math.random() * 25); // 30-55 mins
    }
    
    if (lastStatusDecision?.activity === 'lunch') {
      return {
        isOnline: false,
        statusText: `Grabbing lunch 🥗 Back around ${formatRealisticTime(13, 52)}`,
        statusColor: "text-yellow-400",
        lastSeen: formatRealisticTime(12, 47)
      };
    }
    
    return {
      isOnline: true,
      statusText: "Online and chatty 💕",
      statusColor: "text-green-400"
    };
  }
  
  // GYM TIME: 5:17 PM - 7:08 PM (weekdays only)
  if (day >= 1 && day <= 5 && ((hour === 17 && minute >= 17) || hour === 18 || (hour === 19 && minute < 8))) {
    if (!lastStatusDecision && Math.random() < 0.8) {
      setActivity('gym', 90 + Math.random() * 20); // 90-110 mins
    }
    
    if (lastStatusDecision?.activity === 'gym') {
      return {
        isOnline: false,
        statusText: `At the gym 🏋️‍♀️ Back by ${formatRealisticTime(19, 8)}`,
        statusColor: "text-yellow-400",
        lastSeen: formatRealisticTime(17, 17)
      };
    }
    
    return {
      isOnline: true,
      statusText: "Skipping gym today, here for you 💕",
      statusColor: "text-green-400"
    };
  }
  
  // DINNER: 7:32 PM - 8:23 PM
  if ((hour === 19 && minute >= 32) || (hour === 20 && minute < 23)) {
    if (!lastStatusDecision && Math.random() < 0.5) {
      setActivity('dinner', 35 + Math.random() * 20); // 35-55 mins
    }
    
    if (lastStatusDecision?.activity === 'dinner') {
      return {
        isOnline: false,
        statusText: "Having dinner 🍽️ Miss me?",
        statusColor: "text-yellow-400",
        lastSeen: formatRealisticTime(19, 32)
      };
    }
  }
  
  // PEAK EVENING: 8:23 PM - 2:00 AM (mostly online with occasional breaks)
  if ((hour === 20 && minute >= 23) || hour === 21 || hour === 22 || hour === 23 || hour === 0 || hour === 1) {
    // Random short breaks (shower, snack, etc)
    if (!lastStatusDecision && Math.random() < 0.1) { // 10% chance of break
      const breakTypes = [
        { activity: 'shower', text: 'Quick shower 🚿 BRB!', duration: 15 },
        { activity: 'snack', text: 'Grabbing a snack 🍓', duration: 10 },
        { activity: 'content', text: 'Taking some pics 📸', duration: 20 },
        { activity: 'call', text: 'Quick call 📱 Back soon!', duration: 12 }
      ];
      
      const breakType = breakTypes[Math.floor(Math.random() * breakTypes.length)];
      setActivity(breakType.activity, breakType.duration + Math.random() * 10);
      
      return {
        isOnline: false,
        statusText: breakType.text,
        statusColor: "text-yellow-400",
        lastSeen: formatRealisticTime(hour, minute - 3)
      };
    }
    
    // Online with various flirty messages
    const messages = [
      "Online now 💋 Let's chat!",
      "Available for you 💕",
      "Feeling chatty tonight 😈",
      "Miss me? I'm here now 💭",
      "All yours tonight 🔥",
      "Ready to play 😘"
    ];
    
    return {
      isOnline: true,
      statusText: messages[Math.floor(Math.random() * messages.length)],
      statusColor: "text-green-400"
    };
  }
  
  // DEFAULT AFTERNOON (all other times)
  // Random breaks throughout the day
  if (!lastStatusDecision && Math.random() < 0.2) { // 20% chance of being away
    const activities = [
      { activity: 'errands', text: 'Running errands 🚗', duration: 45 },
      { activity: 'content_creation', text: 'Shooting content 📷', duration: 30 },
      { activity: 'coffee', text: 'Coffee run ☕', duration: 15 },
      { activity: 'friend_time', text: 'Quick brunch 🥂', duration: 60 }
    ];
    
    const activity = activities[Math.floor(Math.random() * activities.length)];
    setActivity(activity.activity, activity.duration + Math.random() * 15);
    
    return {
      isOnline: false,
      statusText: activity.text,
      statusColor: "text-yellow-400",
      lastSeen: formatRealisticTime(hour, minute - 8)
    };
  }
  
  // Default online status
  return {
    isOnline: true,
    statusText: "Online now 💕",
    statusColor: "text-green-400"
  };
}

/**
 * Set a new activity period
 */
function setActivity(activity: string, duration: number) {
  lastStatusDecision = {
    activity,
    startTime: new Date(),
    duration,
    isOnline: false
  };
}

/**
 * Get offline status for a specific activity
 */
function getOfflineStatus(activity: string): OnlineStatus {
  const hour = getEasternHour();
  const minute = getEasternMinute();
  
  const activityMessages: { [key: string]: string } = {
    'getting_sleepy': 'Getting sleepy... 😴',
    'morning_routine': 'Getting ready 💄 Back soon!',
    'lunch': `Having lunch 🥗 Back around ${formatRealisticTime(13, 52)}`,
    'gym': `At the gym 🏋️‍♀️ Back by ${formatRealisticTime(19, 8)}`,
    'dinner': 'Having dinner 🍽️ Miss me?',
    'shower': 'Quick shower 🚿 BRB!',
    'snack': 'Grabbing a snack 🍓',
    'content': 'Taking some pics 📸',
    'call': 'Quick call 📱 Back soon!',
    'errands': 'Running errands 🚗',
    'content_creation': 'Shooting content 📷',
    'coffee': 'Coffee run ☕',
    'friend_time': 'Quick brunch 🥂'
  };
  
  return {
    isOnline: false,
    statusText: activityMessages[activity] || 'Be right back!',
    statusColor: "text-yellow-400",
    lastSeen: formatRealisticTime(hour, minute - Math.floor(Math.random() * 10 + 3))
  };
}