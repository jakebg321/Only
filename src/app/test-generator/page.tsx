"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestGenerator() {
  const [prompt, setPrompt] = useState("remy, a woman in a short dress sitting on a bed");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testGeneration = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log("Sending generation request...");
      
      // Call your local API server (we'll update this URL later)
      const response = await fetch('/api/test-generation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      const data = await response.json();
      console.log("Response:", data);

      if (data.success) {
        setResult(data);
        // If we got a request_id, poll for status
        if (data.request_id) {
          pollForResult(data.request_id);
        }
      } else {
        setError(data.error || "Generation failed");
      }
    } catch (error) {
      console.error("Generation error:", error);
      setError("Failed to connect to generation service");
    } finally {
      setIsLoading(false);
    }
  };

  const pollForResult = async (requestId: string) => {
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/test-generation/status/${requestId}`);
        const data = await response.json();

        if (data.success && data.local_path) {
          // Generation complete!
          setResult(data);
          return;
        }

        if (data.status === 'generating' || data.status === 'queued') {
          // Still processing, check again in 5 seconds
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(checkStatus, 5000);
          } else {
            setError("Generation timed out");
          }
        } else {
          setError(data.error || "Generation failed");
        }
      } catch (error) {
        console.error("Status check error:", error);
        setError("Failed to check generation status");
      }
    };

    // Start polling
    setTimeout(checkStatus, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent text-center">
          🧪 SDXL Generator Test
        </h1>

        <Card className="mb-8 bg-black/40 border-purple-500/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Test Image Generation</CardTitle>
            <p className="text-gray-400">Test your local SDXL generator</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Prompt</label>
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your image prompt..."
                className="bg-gray-800 border-gray-600"
                disabled={isLoading}
              />
            </div>

            <Button
              onClick={testGeneration}
              disabled={isLoading || !prompt.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isLoading ? "🎨 Generating..." : "🚀 Generate Image"}
            </Button>

            {/* Status Display */}
            {isLoading && (
              <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-4">
                <p className="text-blue-300">⏳ Processing your request...</p>
                <div className="mt-2 bg-blue-900/20 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full animate-pulse w-1/3"></div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-4">
                <p className="text-red-300">❌ {error}</p>
                <Button
                  onClick={() => setError(null)}
                  size="sm"
                  variant="outline"
                  className="mt-2"
                >
                  Dismiss
                </Button>
              </div>
            )}

            {/* Result Display */}
            {result && result.local_path && (
              <div className="bg-green-900/20 border border-green-500/20 rounded-lg p-4">
                <p className="text-green-300 mb-2">✅ Generation Complete!</p>
                
                {/* Show the generated image */}
                {result.image_url && (
                  <div className="mb-4">
                    <img 
                      src={`https://21068d262bdf.ngrok-free.app${result.image_url}`}
                      alt="Generated image"
                      className="max-w-full h-auto rounded-lg border border-gray-600"
                      onError={(e) => {
                        console.error("Image failed to load:", e);
                        e.currentTarget.src = "";
                        e.currentTarget.alt = "Image failed to load";
                      }}
                    />
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Time:</strong> {result.generation_time}s
                  </div>
                  <div>
                    <strong>Request ID:</strong> {result.request_id}
                  </div>
                </div>
                <div className="mt-2">
                  <strong>Image URL:</strong> 
                  <code className="bg-gray-800 px-2 py-1 rounded ml-2 text-xs">
                    {result.image_url}
                  </code>
                </div>
              </div>
            )}

            {/* Raw Response (for debugging) */}
            {result && (
              <details className="bg-gray-900/40 border border-gray-600/20 rounded-lg p-4">
                <summary className="cursor-pointer text-gray-400">🔍 Raw Response (Debug)</summary>
                <pre className="mt-2 text-xs text-gray-300 overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-black/40 border-purple-500/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>📋 Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-gray-300">
            <div>
              <strong>1. Start Local API Server:</strong>
              <code className="block bg-gray-800 px-3 py-2 rounded mt-1">
                python api_server_fixed.py
              </code>
            </div>
            
            <div>
              <strong>2. Setup ngrok Tunnel:</strong>
              <code className="block bg-gray-800 px-3 py-2 rounded mt-1">
                ngrok http 8000
              </code>
            </div>
            
            <div>
              <strong>3. Update API Route:</strong>
              <p>Copy the ngrok URL to your Next.js API route</p>
            </div>
            
            <div className="bg-yellow-900/20 border border-yellow-500/20 rounded p-3">
              <p className="text-yellow-300">
                ⚠️ This test page calls <code>/api/test-generation</code> which we need to create next.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}