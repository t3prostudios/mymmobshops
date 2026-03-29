'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '../ui/button';

export default function SpinToWinSection() {
  return (
    <section className="relative bg-secondary py-16 sm:py-20 text-center">
      <Image
        src="/images/gift-wrap1.jpg"
        alt="Colorful gift wrap pattern"
        fill
        className="object-cover"
        data-ai-hint="gift wrap"
      />
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 text-primary-foreground">
        <h2 className="font-headline text-3xl sm:text-4xl md:text-5xl">Feeling Lucky?</h2>
        <p className="mt-2 max-w-xl mx-auto text-lg">
          You're one spin away from an exclusive discount. What will you win?
        </p>
        <Button asChild size="lg" variant="accent" className="mt-6 bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href="/spin-to-win">
            Spin the Wheel
          </Link>
        </Button>
      </div>
    </section>
  );
}
