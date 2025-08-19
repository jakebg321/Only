"use client";

import { useEffect, useState } from "react";
import { getOnlineStatus, OnlineStatus, getEasternTimeString } from "@/lib/online-status-v2";


export default function OnlineStatusIndicator() {
  const [status, setStatus] = useState<OnlineStatus>({
    isOnline: true,
    statusText: "Online now 💕",
    statusColor: "text-green-400"
  });
  const [currentTime, setCurrentTime] = useState(getEasternTimeString());

  useEffect(() => {
    // Update status immediately
    setStatus(getOnlineStatus());
    setCurrentTime(getEasternTimeString());

    // Update status every 30 seconds for realism
    const interval = setInterval(() => {
      setStatus(getOnlineStatus());
      setCurrentTime(getEasternTimeString());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2">
      {/* Animated status dot */}
      <div className="relative">
        <div
          className={`w-3 h-3 rounded-full ${
            status.isOnline ? "bg-green-500" : "bg-gray-400"
          }`}
        />
        {status.isOnline && (
          <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping opacity-75" />
        )}
      </div>
      
      {/* Status text */}
      <span className={`text-sm ${status.statusColor}`}>
        {status.statusText}
      </span>
      
      {/* Last seen if offline */}
      {!status.isOnline && status.lastSeen && (
        <span className="text-xs text-gray-500">
          (last seen: {status.lastSeen})
        </span>
      )}
      
      {/* Current Eastern Time - subtle display */}
      <span className="text-xs text-gray-500 ml-auto">
        {currentTime}
      </span>
    </div>
  );
}

// Compact version for smaller spaces
export function OnlineStatusBadge() {
  const [status, setStatus] = useState<OnlineStatus>({
    isOnline: true,
    statusText: "Online",
    statusColor: "text-green-400"
  });

  useEffect(() => {
    setStatus(getOnlineStatus());
    const interval = setInterval(() => {
      setStatus(getOnlineStatus());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!status.isOnline) return null;

  return (
    <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded-full">
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      <span className="text-xs text-green-400 font-medium">Online</span>
    </div>
  );
}