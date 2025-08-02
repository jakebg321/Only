"use client";

import React, { useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, Heart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

const images = [
  {
    src: '/image (33).png',
    title: 'AI Generated Content 1',
    likes: 1247,
    views: 8932
  },
  {
    src: '/image (34).png',
    title: 'AI Generated Content 2',
    likes: 2156,
    views: 12458
  },
  {
    src: '/image (35).png',
    title: 'AI Generated Content 3',
    likes: 1876,
    views: 9876
  },
  {
    src: '/image (36).png',
    title: 'AI Generated Content 4',
    likes: 3124,
    views: 15632
  },
  {
    src: '/image (37).png',
    title: 'AI Generated Content 5',
    likes: 2789,
    views: 13247
  },
  {
    src: '/image (38).png',
    title: 'AI Generated Content 6',
    likes: 1956,
    views: 11234
  }
];

export default function ImageCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    align: 'center',
    containScroll: 'trimSnaps'
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
        <div className="flex">
          {images.map((image, index) => (
            <div
              key={index}
              className="flex-none w-full md:w-1/2 lg:w-1/3 px-4"
            >
              <div className="relative group cursor-pointer">
                <div className="relative overflow-hidden rounded-xl bg-black/20 backdrop-blur-sm border border-purple-500/20">
                  <img
                    src={image.src}
                    alt={image.title}
                    className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-white font-semibold text-lg mb-2">{image.title}</h3>
                      <div className="flex items-center justify-between text-white/80">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            <span className="text-sm">{image.likes.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span className="text-sm">{image.views.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Premium badge */}
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    AI Premium
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation buttons */}
      <Button
        onClick={scrollPrev}
        variant="outline"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 border-purple-500/50 text-white hover:bg-purple-600 hover:border-purple-600 backdrop-blur-sm"
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>
      
      <Button
        onClick={scrollNext}
        variant="outline"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 border-purple-500/50 text-white hover:bg-purple-600 hover:border-purple-600 backdrop-blur-sm"
      >
        <ChevronRight className="w-5 h-5" />
      </Button>
    </div>
  );
}