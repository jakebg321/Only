"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Header() {
  const router = useRouter();
  
  const handleLogout = () => {
    localStorage.clear();
    router.push('/auth');
  };

  return (
    <header className="fixed top-0 w-full bg-black/90 p-4 flex justify-between items-center z-50 backdrop-blur-sm">
      <Link href="/" className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent hover:from-purple-500 hover:to-pink-500 transition-all">
        Only Twins
      </Link>
      <nav className="flex gap-2 md:gap-4">
        <Link href="/manager">
          <Button variant="ghost" className="hover:bg-purple-900/50 transition-colors">
            Manager
          </Button>
        </Link>
        <Link href="/creator">
          <Button variant="ghost" className="hover:bg-purple-900/50 transition-colors">
            Creator
          </Button>
        </Link>
        <Link href="/gallery">
          <Button variant="ghost" className="hover:bg-purple-900/50 transition-colors">
            Gallery
          </Button>
        </Link>
        <Link href="/creator/personality">
          <Button variant="ghost" className="hover:bg-purple-900/50 transition-colors">
            AI Setup
          </Button>
        </Link>
        <Link href="/chat">
          <Button variant="ghost" className="hover:bg-purple-900/50 transition-colors">
            Chat
          </Button>
        </Link>
        <Button 
          variant="ghost" 
          onClick={handleLogout}
          className="hover:bg-red-900/50 transition-colors"
        >
          Logout
        </Button>
      </nav>
    </header>
  );
} 