"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, Lock, Mail, Loader2, Info } from "lucide-react";

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose?: () => void;
  message?: string;
}

export default function LoginPromptModal({ isOpen, onClose, message }: LoginPromptModalProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showTestCredentials, setShowTestCredentials] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      
      // Close modal and refresh to show authenticated content
      if (onClose) onClose();
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const useTestCredentials = () => {
    setEmail("test@example.com");
    setPassword("testpass123");
    setShowTestCredentials(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <Card className="w-full max-w-md bg-black/90 border-purple-500/30 backdrop-blur-md animate-in fade-in zoom-in duration-300">
        <CardHeader className="relative">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full">
              <Lock className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Members Only Content
          </CardTitle>
          <p className="text-center text-gray-400 mt-2">
            {message || "Sign in to view exclusive content"}
          </p>
        </CardHeader>
        
        <CardContent>
          {/* Test Credentials Alert - Development Only */}
          {showTestCredentials && (
            <Alert className="mb-4 bg-blue-900/20 border-blue-500/30">
              <Info className="h-4 w-4 text-blue-400" />
              <AlertDescription className="text-blue-300">
                <div className="font-semibold mb-1">Database Test Account</div>
                <div className="text-sm space-y-1">
                  <div>Email: test@example.com</div>
                  <div>Password: testpass123</div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 border-blue-500/50 text-blue-300 hover:bg-blue-900/30"
                    onClick={useTestCredentials}
                  >
                    Use Test Credentials
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert className="bg-red-900/20 border-red-500/50 text-red-400">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-black/50 border-purple-500/30 focus:border-purple-400 text-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-black/50 border-purple-500/30 focus:border-purple-400 text-white"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In to View"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-gray-400">
              Don't have an account?{" "}
              <Link href="/auth/signup" className="text-purple-400 hover:text-purple-300">
                Sign up for free
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}