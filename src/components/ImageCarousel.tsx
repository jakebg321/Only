"use client";

import React, { useCallback, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, Heart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

export type CarouselImage = {
  src: string;
  title?: string;
  likes?: number;
  views?: number;
};

type ImageCarouselProps = {
  images: CarouselImage[];
};

export default function ImageCarousel({ images }: ImageCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
    containScroll: 'trimSnaps'
  });

  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  if (!images || images.length === 0) {
    return (
      <div className="w-full text-center text-gray-400 py-10">
        No images available.
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
        <div className="flex">
          {images.map((image, index) => (
            <div
              key={index}
              className="flex-none w-full md:w-1/2 lg:w-1/3 px-4"
            >
              <div
                className="relative group cursor-pointer"
                onClick={() => { setLightboxIndex(index); setIsLightboxOpen(true); }}
              >
                <div className="relative overflow-hidden rounded-xl bg-black/20 backdrop-blur-sm border border-purple-500/20">
                  <img
                    src={image.src}
                    alt={image.title || `Image ${index + 1}`}
                    className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      {image.title && (
                        <h3 className="text-white font-semibold text-lg mb-2">{image.title}</h3>
                      )}
                      {(image.likes !== undefined || image.views !== undefined) && (
                        <div className="flex items-center justify-between text-white/80">
                          <div className="flex items-center gap-4">
                            {image.likes !== undefined && (
                              <div className="flex items-center gap-1">
                                <Heart className="w-4 h-4" />
                                <span className="text-sm">{image.likes.toLocaleString()}</span>
                              </div>
                            )}
                            {image.views !== undefined && (
                              <div className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                <span className="text-sm">{image.views.toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pointer-events-none absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    AI Premium
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

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

      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent
          className="max-w-none w-[96vw] h-[92vh] p-0 bg-black/80 border-none shadow-none"
        >
          <DialogTitle className="sr-only">Image viewer</DialogTitle>
          {images[lightboxIndex] && (
            <div className="w-full h-full flex items-center justify-center">
              <img
                src={images[lightboxIndex].src}
                alt={images[lightboxIndex].title || `Image ${lightboxIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}