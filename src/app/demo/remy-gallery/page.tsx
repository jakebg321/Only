"use client";

import { useEffect, useState } from "react";
import ImageCarousel, { CarouselImage } from "@/components/ImageCarousel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function GalleryPage() {
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    async function fetchImages() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/images/remy");
        if (!res.ok) throw new Error("Failed to load images");
        const data: { images: string[] } = await res.json();
        setImages(data.images.map((src) => ({ src })));
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchImages();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-black/40 border-purple-500/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Gallery</CardTitle>
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

