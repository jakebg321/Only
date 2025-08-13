"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, MessageCircle, Camera } from "lucide-react";

export default function Header() {
  return (
    <header className="fixed top-0 w-full bg-black/90 p-4 flex justify-between items-center z-50 backdrop-blur-sm">
      <Link href="/" className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent hover:from-purple-500 hover:to-pink-500 transition-all">
        Remy's VelvetVIP 💕
      </Link>
      <nav className="flex gap-2 md:gap-4">
        <Link href="/">
          <Button variant="ghost" className="hover:bg-purple-900/50 transition-colors">
            <Home className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Home</span>
          </Button>
        </Link>
        <Link href="/gallery">
          <Button variant="ghost" className="hover:bg-purple-900/50 transition-colors">
            <Camera className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Gallery</span>
          </Button>
        </Link>
        <Link href="/chat">
          <Button variant="ghost" className="hover:bg-purple-900/50 transition-colors bg-gradient-to-r from-purple-600/20 to-pink-600/20">
            <MessageCircle className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Chat</span>
          </Button>
        </Link>
      </nav>
    </header>
  );
}