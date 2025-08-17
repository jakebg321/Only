"use client";

import { useEffect, useState } from "react";
import ImageCarousel, { CarouselImage } from "@/components/ImageCarousel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LoginPromptModal from "@/components/LoginPromptModal";
import { useAuth } from "@/hooks/useAuth";
import { Lock, Eye } from "lucide-react";

export default function GalleryPage() {
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    // Load ALL images from public/Remy folder - 57 total images
    const remyImages = [
      "/Remy/2025-08-08_17-13-44_4613.png",
      "/Remy/2025-08-08_17-16-07_7611.png",
      "/Remy/2025-08-08_17-17-46_1630.png",
      "/Remy/2025-08-08_17-18-07_9564.png",
      "/Remy/2025-08-08_17-19-29_2534.png",
      "/Remy/2025-08-08_17-51-26_7687.png",
      "/Remy/2025-08-08_17-51-59_8602.png",
      "/Remy/2025-08-08_17-54-29_4725.png",
      "/Remy/2025-08-08_17-55-01_4208.png",
      "/Remy/2025-08-08_17-55-18_7285.png",
      "/Remy/2025-08-08_17-55-34_9355.png",
      "/Remy/2025-08-08_17-55-51_2971.png",
      "/Remy/2025-08-08_18-00-27_8511.png",
      "/Remy/2025-08-08_18-05-32_6162.png",
      "/Remy/2025-08-08_18-06-06_1789.png",
      "/Remy/2025-08-08_18-06-24_3963.png",
      "/Remy/2025-08-08_18-09-53_1543.png",
      "/Remy/2025-08-08_18-10-28_1308.png",
      // New images added
      "/Remy/2025-08-13_19-22-59_5721.png",
      "/Remy/2025-08-13_19-24-59_9457.png",
      "/Remy/2025-08-13_19-26-23_8508.png",
      "/Remy/2025-08-13_19-27-58_8508.png",
      "/Remy/2025-08-13_19-31-33_4308.png",
      "/Remy/2025-08-13_19-37-30_5055.png",
      "/Remy/2025-08-13_21-17-04_3570.png",
      "/Remy/2025-08-13_21-17-51_3637.png",
      "/Remy/2025-08-13_21-25-56_7008.png",
      "/Remy/2025-08-13_21-30-30_9686.png",
      "/Remy/2025-08-13_21-36-18_6515.png",
      "/Remy/2025-08-13_21-37-53_2082.png",
      "/Remy/2025-08-13_21-42-56_3224.png",
      "/Remy/2025-08-13_21-53-53_8275.png",
      "/Remy/2025-08-13_21-56-01_6112.png",
      "/Remy/2025-08-13_22-12-07_2974.png",
      "/Remy/2025-08-13_22-12-39_6690.png",
      "/Remy/2025-08-13_22-13-14_1988.png",
      "/Remy/2025-08-13_22-14-02_5846.png",
      "/Remy/2025-08-13_22-17-09_4261.png",
      "/Remy/2025-08-13_22-36-24_9314.png",
      "/Remy/2025-08-13_22-37-52_9741.png",
      "/Remy/2025-08-13_22-38-59_2378.png",
      "/Remy/2025-08-13_22-39-46_1184.png",
      "/Remy/2025-08-13_22-44-20_7784.png",
      "/Remy/2025-08-13_22-44-52_6553.png",
      "/Remy/2025-08-13_22-50-25_4099.png",
      "/Remy/2025-08-13_22-53-05_1776.png",
      "/Remy/2025-08-13_22-53-53_1776.png",
      "/Remy/2025-08-13_23-05-22_5708.png",
      "/Remy/2025-08-13_23-11-06_2203.png",
      "/Remy/2025-08-13_23-17-33_7452.png",
      "/Remy/2025-08-13_23-22-18_1954.png",
      "/Remy/2025-08-13_23-24-03_9234.png",
      "/Remy/2025-08-13_23-28-00_9739.png",
      "/Remy/2025-08-13_23-38-22_6693.png",
      "/Remy/2025-08-13_23-49-18_3743.png",
      "/Remy/2025-08-13_23-58-49_9615.png"
    ];
    
    setImages(remyImages.map((src) => ({ src })));
    setIsLoading(false);
  }, []);

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20 flex items-center justify-center">
        <div className="text-white">Checking access...</div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20">
        <div className="container mx-auto px-4 py-8">
          <Card className="bg-black/40 border-purple-500/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center justify-between">
                <span>My Exclusive Content 🔥</span>
                {!isAuthenticated && (
                  <div className="flex items-center gap-2 text-sm text-yellow-400">
                    <Lock className="w-4 h-4" />
                    Members Only
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-gray-400">Loading images...</div>
              ) : (
                <div className="relative">
                  {/* Blur overlay for non-authenticated users */}
                  {!isAuthenticated && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-xl rounded-lg">
                      <div className="text-center space-y-4 p-8">
                        <Lock className="w-16 h-16 text-purple-400 mx-auto" />
                        <h3 className="text-2xl font-bold text-white">
                          Exclusive Content
                        </h3>
                        <p className="text-gray-300 max-w-sm">
                          Sign in to unlock Remy's exclusive gallery with 1,200+ personal photos
                        </p>
                        <Button
                          onClick={() => setShowLoginModal(true)}
                          size="lg"
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        >
                          <Eye className="w-5 h-5 mr-2" />
                          Unlock Gallery
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Actual carousel - blurred if not authenticated */}
                  <div className={!isAuthenticated ? "blur-2xl select-none pointer-events-none" : ""}>
                    <ImageCarousel images={images} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Login Modal */}
      <LoginPromptModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message="Sign in to view Remy's exclusive gallery"
      />
    </>
  );
}