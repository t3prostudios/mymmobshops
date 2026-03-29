"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem('announcementDismissed') === 'true';
    if (!isDismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('announcementDismissed', 'true');
  };

  return (
    <div
      className={cn(
        "bg-accent text-accent-foreground transition-all duration-300 ease-in-out overflow-hidden",
        isVisible ? "h-10" : "h-0"
      )}
    >
      <div className="container mx-auto px-4 h-full">
        <div className="relative flex items-center justify-center h-full">
          <p className="text-sm font-medium flex items-center gap-2">
            <Gift className="h-4 w-4" />
            <span>Free local shipping on orders over $100!</span>
          </p>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-accent-foreground hover:bg-accent/80 hover:text-accent-foreground absolute right-0 top-1/2 -translate-y-1/2"
            onClick={handleDismiss}
            aria-label="Dismiss announcement"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
