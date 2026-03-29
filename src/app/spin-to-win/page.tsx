
'use client';

import React, { useEffect } from 'react';
import { usePrizeWheelStore, type Prize } from '@/hooks/use-prize-wheel';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore } from '@/firebase';
import Link from 'next/link';

const prizes: Prize[] = [
  {
    label: '15% Off $75+',
    discount: { type: 'percentage', value: 0.15, minimumPurchase: 75 },
  },
  {
    label: 'BOGO 50% Off',
    discount: { type: 'bogo', value: 0.5, bogoCategories: ['hat', 't-shirt'] },
  },
  {
    label: '5$ Off',
    discount: { type: 'fixed', value: 5 },
  },
  { label: 'Mystery Prize' },
  { label: 'Spin Again' },
];

const colors = [
  '#8A2BE2', // accent
  '#4B0082', // primary
  '#E6E6FA', // a light lavender
  '#DDA0DD', // a plum
  '#BA55D3', // a medium orchid
];

const SPIN_DURATION_S = 4;

const PrizeWheel = () => {
  const {
    prize,
    hasActivePrize,
    isSpinning,
    rotation,
    spin,
    claimPrize,
    resetVisuals,
    useTransition,
    initialize,
  } = usePrizeWheelStore();

  const { applyDiscount } = useCart();
  const { user } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    initialize();
    resetVisuals();
  }, [initialize, resetVisuals]);

  const handleSpin = () => {
    spin(prizes);
  };
  
  const handleClaim = () => {
    if (prize && firestore && user) {
        claimPrize(applyDiscount, firestore, user.uid);
    }
  };

  const areLabelsVisible = !isSpinning && !hasActivePrize;

  const segmentAngle = 360 / prizes.length;
  const conicGradient = `conic-gradient(from -${segmentAngle / 2}deg at 50% 50%, ${prizes
    .map((_, i) => `${colors[i % colors.length]} ${i * segmentAngle}deg, ${colors[i % colors.length]} ${(i + 1) * segmentAngle}deg`)
    .join(', ')}
  )`;

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-8 bg-background">
      <h1 className="font-headline text-4xl md:text-5xl font-bold text-center mb-4">Spin-to-Win!</h1>
      <p className="text-muted-foreground text-center mb-8 max-w-md">Spin the wheel to win an exclusive prize. Good luck!</p>

      <div className="relative w-80 h-80 md:w-96 md:h-96 mb-8 flex items-center justify-center">
        {/* Pointer/Arrow */}
        <div 
          className="absolute top-[-25px] left-1/2 -translate-x-1/2 w-0 h-0 z-20"
          style={{
            borderLeft: '20px solid transparent',
            borderRight: '20px solid transparent',
            borderTop: '30px solid black',
          }}
        />
        
        {/* Wheel container */}
        <div
          className="relative w-full h-full rounded-full border-8 border-primary shadow-2xl overflow-hidden"
          style={{
            transition: useTransition ? `transform ${SPIN_DURATION_S}s cubic-bezier(0.25, 0.1, 0.25, 1)` : 'none',
            transform: `rotate(${rotation}deg)`,
            background: conicGradient,
          }}
        >
          {/* Labels and Images */}
          {prizes.map((p, i) => {
            const labelAngle = segmentAngle * i + segmentAngle / 2;
            return (
              <div
                key={i}
                className="absolute w-full h-full"
                style={{ transform: `rotate(${labelAngle}deg)`}}
              >
                <div
                  className="absolute w-1/2 h-1/2 left-1/2 top-0 origin-bottom-left flex items-center justify-center"
                >
                  <span 
                    className="text-center text-sm font-bold [text-shadow:_1px_1px_2px_rgb(0_0_0_/_40%)]"
                    style={{ 
                      display: 'inline-block',
                      transform: 'translate(10px, -20px) rotate(38deg)', // Position label within segment
                      color: ['#8A2BE2', '#4B0082', '#BA55D3'].includes(colors[i % colors.length]) ? 'white' : 'black',
                      opacity: areLabelsVisible ? 1 : 0,
                      transition: 'opacity 0.5s ease-in-out',
                    }}
                  >
                    {p.label}
                  </span>
                  <img 
                    src={i % 2 === 0 ? '/images/present-1.png' : '/images/present-2.png'}
                    alt="present"
                    className="w-12 h-12"
                    style={{
                        display: 'inline-block',
                        transform: 'translate(-50px, -10px) rotate(45deg)',
                        opacity: areLabelsVisible ? 0 : 1,
                        transition: 'opacity 0.5s ease-in-out',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
         {/* Center circle */}
         <div className="absolute w-24 h-24 bg-background rounded-full border-4 border-primary flex items-center justify-center z-10">
        </div>
      </div>
      
      <Button 
          onClick={handleSpin} 
          disabled={isSpinning || hasActivePrize} 
          className="text-lg font-bold"
          size="lg"
      >
        {isSpinning ? 'Spinning...' : (hasActivePrize ? 'Prize Active' : 'Spin the Wheel')}
      </Button>

      {/* Result Display */}
      {prize && (
        <div className="mt-8 text-center p-6 bg-secondary rounded-lg shadow-md animate-in fade-in zoom-in-95 max-w-md mx-auto">
          <h2 className="text-2xl font-bold">Congratulations!</h2>
          <p className="text-xl mt-2">You won: <span className="text-primary font-semibold">{prize.label}</span></p>
          
          {user ? (
            <Button onClick={handleClaim} className="mt-4">Claim Prize</Button>
          ) : (
            <div className="mt-4 space-y-2">
              <p className="text-muted-foreground">Sign in or create an account to claim your prize! It's valid for 24 hours.</p>
              <div className="flex gap-4 justify-center">
                <Button asChild>
                  <Link href="/login">Log In</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PrizeWheel;
