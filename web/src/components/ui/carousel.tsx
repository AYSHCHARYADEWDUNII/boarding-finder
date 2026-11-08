"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type CarouselProps = {
  images: string[];
  title: string;
};

export function Carousel({ images, title }: CarouselProps) {
  const [viewportRef, emblaApi] = useEmblaCarousel({ loop: images.length > 1 });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const updateSelectedIndex = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    updateSelectedIndex();
    emblaApi.on("select", updateSelectedIndex);
    return () => {
      emblaApi.off("select", updateSelectedIndex);
    };
  }, [emblaApi]);

  return (
    <div className="relative">
      <div ref={viewportRef} className="overflow-hidden rounded-lg">
        <div className="flex touch-pan-y">
          {images.map((imageUrl, index) => (
            <div key={`${imageUrl}-${index}`} className="min-w-0 flex-[0_0_100%]">
              <img
                src={imageUrl}
                alt={`${title}, photo ${index + 1}`}
                className="aspect-[4/3] max-h-[70dvh] w-full object-contain"
              />
            </div>
          ))}
        </div>
      </div>
      {images.length > 1 && (
        <>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            aria-label="Previous photo"
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full shadow"
            onClick={scrollPrev}
          >
            <ArrowLeft />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            aria-label="Next photo"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full shadow"
            onClick={scrollNext}
          >
            <ArrowRight />
          </Button>
          <p className="mt-3 text-center text-sm text-muted-foreground" aria-live="polite">
            {selectedIndex + 1} of {images.length}
          </p>
        </>
      )}
    </div>
  );
}
