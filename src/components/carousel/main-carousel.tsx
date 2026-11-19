"use client";
import useEmblaCarousel from "embla-carousel-react";
import React, { useCallback } from "react";
import { ChevronRightIcon, ChevronLeftIcon } from "../svgs";

interface Props {
  children: React.ReactNode;
}

export const Carousel = ({ children }: Props) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, containScroll: "trimSnaps" }, []);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <div ref={emblaRef} className="w-full overflow-hidden relative">
      <div className="w-full h-full flex flex-row gap-5 justify-between">{children}</div>
      {/* FIX: make cheverons match */}
      <span
        onClick={scrollPrev}
        aria-label="Scroll to previous slide"
        className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 text-white rounded-full p-2 bg-light-grey"
      >
        <ChevronLeftIcon className="text-sm text-black" />
      </span>
      <span
        onClick={scrollNext}
        aria-label="Scroll to next slide"
        className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 text-white p-2 rounded-full bg-light-grey"
      >
        <ChevronRightIcon className="text-sm text-black" />
      </span>
    </div>
  );
};
