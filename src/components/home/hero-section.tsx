
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

const STATIC_IMAGE_URL = "/images/hero-101.png";
const VIDEO_URL = "/images/hero-video.mp4";
const SWITCH_INTERVAL = 35000; // 35 seconds

export default function HeroSection() {
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startCycle = () => {
    // Set a timeout to switch to video
    timeoutRef.current = setTimeout(() => {
      setIsVideoVisible(true);
      videoRef.current?.play().catch(error => {
        console.warn("Hero video autoplay was prevented:", error);
      });
    }, SWITCH_INTERVAL);
  };
  
  useEffect(() => {
    startCycle();
    
    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleVideoEnd = () => {
    setIsVideoVisible(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
    // Restart the cycle
    startCycle();
  };

  return (
    <section className="relative h-screen min-h-[600px] w-full text-primary-foreground flex items-center justify-center text-center">
      {/* Static Image */}
      <Image
        src={STATIC_IMAGE_URL}
        alt="Hero image of a model wearing the Fall collection"
        fill
        className={cn(
          "absolute inset-0 w-full h-full object-cover transition-opacity duration-1000",
          isVideoVisible ? "opacity-0" : "opacity-100"
        )}
        priority
      />
      
      {/* Video */}
      <video
        ref={videoRef}
        src={VIDEO_URL}
        muted
        playsInline
        onEnded={handleVideoEnd}
        className={cn(
          "absolute inset-0 w-full h-full object-cover transition-opacity duration-1000",
           isVideoVisible ? "opacity-100" : "opacity-0"
        )}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 p-4">
        <h1 className="text-4xl font-headline tracking-tight sm:text-6xl md:text-7xl">
          The Fall '25 Collection
        </h1>
        <p className="mt-4 max-w-2xl text-lg sm:text-xl font-body">
          Timeless silhouettes, reimagined for the modern muse.
        </p>
        <div className="mt-8 flex justify-center">
          <Button asChild size="lg" variant="accent" className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="/products">Shop New Arrivals</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
