"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Heart, Mail, Lock, Loader2, Info } from "lucide-react";

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showTestCredentials, setShowTestCredentials] = useState(true);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/chat');
    }
  }, [isAuthenticated, router]);

  const useTestCredentials = () => {
    setEmail("test@example.com");
    setPassword("testpass123");
    setShowTestCredentials(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const data = await login(email, password);
      console.log("Login successful:", data);
      
      // useAuth will handle the authentication state
      // Redirect will be handled by useEffect above
      if (data.user.role === "SUBSCRIBER") {
        router.push("/chat");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-black/40 border-purple-500/20 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Heart className="w-12 h-12 text-pink-500" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Welcome Back
          </CardTitle>
          <p className="text-gray-400 mt-2">Login to continue to VelvetVIP</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Test Credentials Alert - Development Only */}
            {showTestCredentials && (
              <Alert className="mb-4 bg-blue-900/20 border-blue-500/30">
                <Info className="h-4 w-4 text-blue-400" />
                <AlertDescription className="text-blue-300">
                  <div className="font-semibold mb-1">Database Test Accounts</div>
                  <div className="text-sm space-y-2">
                    <div className="p-2 bg-black/30 rounded">
                      <div className="font-mono">test@example.com</div>
                      <div className="text-xs text-gray-400">Password: testpass123</div>
                    </div>
                    <div className="p-2 bg-black/30 rounded">
                      <div className="font-mono">creator@example.com</div>
                      <div className="text-xs text-gray-400">Password: password123</div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="mt-2 border-blue-500/50 text-blue-300 hover:bg-blue-900/30"
                      onClick={useTestCredentials}
                    >
                      Use Test Account
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
            
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
                  className="pl-10 bg-black/50 border-purple-500/30 focus:border-purple-400"
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
                  className="pl-10 bg-black/50 border-purple-500/30 focus:border-purple-400"
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
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-gray-400">
              Don't have an account?{" "}
              <Link href="/auth/signup" className="text-purple-400 hover:text-purple-300">
                Sign up
              </Link>
            </p>
            <p>
              <Link href="/auth/forgot-password" className="text-sm text-gray-500 hover:text-gray-400">
                Forgot your password?
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}