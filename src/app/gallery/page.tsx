"use client";

import { useEffect, useState } from "react";
import ImageCarousel, { CarouselImage } from "@/components/ImageCarousel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function GalleryPage() {
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-black/40 border-purple-500/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl">My Exclusive Content 🔥</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-gray-400">Loading images...</div>
            ) : (
              <ImageCarousel images={images} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

