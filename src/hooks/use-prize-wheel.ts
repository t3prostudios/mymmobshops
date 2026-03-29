
'use client';

import { create } from 'zustand';
import { toast } from './use-toast';
import type { Discount } from '@/context/cart-provider';
import type { Firestore } from 'firebase/firestore';
import { doc, updateDoc } from 'firebase/firestore';


export interface Prize {
  label: string;
  discount?: Omit<Discount, 'label'>;
}

const SPIN_DURATION_S = 4;

interface PrizeWheelState {
  prize: Prize | null;
  hasActivePrize: boolean;
  isSpinning: boolean;
  rotation: number;
  useTransition: boolean;
  prizeClaimedTime: number | null;
  initialize: () => void;
  spin: (prizes: Prize[]) => void;
  claimPrize: (
    applyDiscount: (discount: Discount) => void,
    firestore: Firestore,
    userId: string
  ) => void;
  resetVisuals: () => void;
}

export const usePrizeWheelStore = create<PrizeWheelState>((set, get) => ({
  prize: null,
  hasActivePrize: false,
  isSpinning: false,
  rotation: 0,
  useTransition: false,
  prizeClaimedTime: null,
  
  initialize: () => {
    const storedPrize = localStorage.getItem('prize');
    const storedExpiry = localStorage.getItem('prizeExpiry');
    if (storedPrize && storedExpiry) {
      const expiry = parseInt(storedExpiry, 10);
      if (Date.now() < expiry) {
        set({
          prize: JSON.parse(storedPrize),
          hasActivePrize: true,
        });
      } else {
        localStorage.removeItem('prize');
        localStorage.removeItem('prizeExpiry');
        localStorage.removeItem('vogueverse-discount');
      }
    }
  },

  spin: (prizes: Prize[]) => {
    if (get().isSpinning || get().hasActivePrize) return;

    set({ isSpinning: true, prize: null, useTransition: true });
    
    const totalPrizes = prizes.length;
    let prizeIndex = Math.floor(Math.random() * totalPrizes);
    const segmentAngle = 360 / totalPrizes;
    const prizeAngle = prizeIndex * segmentAngle;

    const randomOffset = (Math.random() - 0.5) * segmentAngle * 0.8;
    const finalAngle = prizeAngle + randomOffset;
    
    const totalRotation = 360 * 5 + finalAngle;

    set({ rotation: -totalRotation });

    setTimeout(() => {
      let finalPrize = prizes[prizeIndex];

      if (finalPrize.label === 'Mystery Prize') {
        const concretePrizes = prizes.filter(p => p.discount);
        const randomPrizeIndex = Math.floor(Math.random() * concretePrizes.length);
        finalPrize = concretePrizes[randomPrizeIndex];
      }

      set({ prize: finalPrize, isSpinning: false });
      
      if (finalPrize.label === 'Spin Again') {
        toast({
          title: "So close!",
          description: "You get to spin again. Good luck!",
        });
        setTimeout(() => {
            set({ prize: null });
        }, 1500)
      } else {
        const expiryTime = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
        localStorage.setItem('prize', JSON.stringify(finalPrize));
        localStorage.setItem('prizeExpiry', expiryTime.toString());
        set({ hasActivePrize: true });
      }
    }, SPIN_DURATION_S * 1000); 
  },

  claimPrize: (applyDiscount, firestore, userId) => {
    const { prize } = get();
    if (prize && prize.discount) {
      toast({
        title: "Prize Claimed!",
        description: `Your prize "${prize.label}" has been applied.`,
      });
      applyDiscount({ label: prize.label, ...prize.discount });
      
      const prizeExpiry = Date.now() + 24 * 60 * 60 * 1000;
      
      set({ prizeClaimedTime: Date.now(), hasActivePrize: true });

      // Update user document in Firestore
      if (firestore && userId) {
          const userRef = doc(firestore, 'users', userId);
          updateDoc(userRef, {
              prizeLabel: prize.label,
              prizeExpiry: prizeExpiry
          }).catch(error => {
              console.error("Failed to save prize to user profile:", error);
          });
      }
    }
  },

  resetVisuals: () => {
    set({
      rotation: 0,
      useTransition: false,
    });
  },
}));
