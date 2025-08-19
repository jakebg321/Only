"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestLogin() {
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const testLogin = async () => {
    setIsLoading(true);
    setStatus("Testing login...");
    
    try {
      const response = await fetch("/api/auth/test-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          password: "test123"
        }),
      });

      const text = await response.text();
      console.log("Response text:", text);
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        setStatus(`Failed to parse JSON: ${text.substring(0, 100)}`);
        return;
      }

      if (response.ok && data.success) {
        setStatus("✅ Login successful! Redirecting...");
        localStorage.setItem("user", JSON.stringify(data.user));
        setTimeout(() => {
          window.location.href = "/chat/debug";
        }, 1000);
      } else {
        setStatus(`❌ Login failed: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Login error:", error);
      setStatus(`❌ Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20 flex items-center justify-center">
      <Card className="max-w-md w-full mx-4 bg-black/40 border-purple-500/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Test Login Debug</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-gray-800 rounded">
            <p className="text-sm text-gray-300">This will test login with:</p>
            <p className="text-white font-mono">test@example.com / test123</p>
          </div>
          
          <Button 
            onClick={testLogin}
            disabled={isLoading}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {isLoading ? "Testing..." : "Test Login"}
          </Button>
          
          {status && (
            <div className="p-4 bg-gray-900 rounded">
              <pre className="text-xs text-white whitespace-pre-wrap">{status}</pre>
            </div>
          )}
          
          <div className="text-center text-sm text-gray-400">
            <p>Check browser console for detailed logs</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}