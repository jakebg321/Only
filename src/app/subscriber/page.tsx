"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import ImageCarousel, { CarouselImage } from "@/components/ImageCarousel";

export default function SubscriberDemo() {
  const router = useRouter();
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const userType = localStorage.getItem("userType");
    if (userType !== "subscriber") {
      router.push("/auth");
    }
  }, [router]);

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
          <h1 className="text-4xl font-bold mb-8 gradient-text">Experience Personalized AI Content</h1>
          
          <Card className="mb-8 bg-black/40 border-purple-500/20 backdrop-blur-sm">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4 text-center text-white">Premium AI Content Gallery</h2>
              <p className="text-gray-300 text-center mb-6">See what our AI can create just for you</p>
              {isLoading ? (
                <div className="text-gray-400 text-center py-8">Loading images...</div>
              ) : (
                <ImageCarousel images={images} />
              )}
            </CardContent>
          </Card>

          <div className="text-center">
            <Card className="inline-block bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-500/20 backdrop-blur-sm">
              <CardContent className="p-8">
                <h3 className="text-3xl font-bold mb-4 text-white">Ready for Your Personal AI?</h3>
                <p className="text-gray-300 mb-6 max-w-md">Subscribe now to get unlimited access to personalized AI-generated content created just for you.</p>
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg font-semibold rounded-xl">
                  Subscribe Now - $29/month
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
} 