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
    // Load images from public/Remy folder
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
      "/Remy/2025-08-08_18-10-28_1308.png"
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