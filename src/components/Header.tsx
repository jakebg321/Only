"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="fixed top-0 w-full bg-black/90 p-4 flex justify-between items-center">
      <Link href="/" className="text-xl font-bold gradient-text">AI Twins</Link>
      <nav className="flex gap-4">
        <Link href="/manager"><Button variant="ghost">Manager Tools</Button></Link>
        <Link href="/creator"><Button variant="ghost">Creator Dashboard</Button></Link>
        <Link href="/chat"><Button variant="ghost">Chat</Button></Link>
        <Button variant="ghost" onClick={() => localStorage.clear()}>Logout</Button>
      </nav>
    </header>
  );
} 