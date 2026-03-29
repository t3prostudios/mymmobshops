'use client';

import { useEffect, useRef } from 'react';
import { usePrizeWheelStore } from '@/hooks/use-prize-wheel';
import { useCart } from '@/hooks/use-cart';
import { useUser } from '@/firebase';
import { sendCartReminder } from '@/ai/flows/send-cart-reminder';

const REMINDER_DELAY = 45 * 60 * 1000; // 45 minutes

export function PrizeReminder() {
  const { prize, prizeClaimedTime } = usePrizeWheelStore();
  const { cartItems, lastPurchaseTimestamp } = useCart();
  const { user } = useUser();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use refs to store the latest cart and purchase state
  // to be used inside the setTimeout callback, preventing stale closures.
  const cartItemsRef = useRef(cartItems);
  const lastPurchaseTimestampRef = useRef(lastPurchaseTimestamp);

  // Update refs on every render to ensure they have the latest values.
  useEffect(() => {
    cartItemsRef.current = cartItems;
    lastPurchaseTimestampRef.current = lastPurchaseTimestamp;
  });

  useEffect(() => {
    // Clear any previous timer when the core dependencies change.
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Conditions to set a new timer:
    // 1. A prize was claimed (prizeClaimedTime is set).
    // 2. The user is logged in.
    if (prize && prizeClaimedTime && user) {
      
      // Do not set a timer if a purchase happened *after* the prize was claimed.
      if (lastPurchaseTimestamp && lastPurchaseTimestamp > prizeClaimedTime) {
        return;
      }
      
      timeoutRef.current = setTimeout(() => {
        // This code runs after 45 minutes.
        const currentCartItems = cartItemsRef.current;
        const currentLastPurchaseTimestamp = lastPurchaseTimestampRef.current;

        // Check conditions again right before sending the email.
        const shouldSend = 
          currentCartItems.length > 0 &&
          user?.email &&
          prize &&
          !(currentLastPurchaseTimestamp && currentLastPurchaseTimestamp > prizeClaimedTime);

        if (shouldSend) {
             console.log('45-minute timer elapsed. Sending prize reminder email...');
             sendCartReminder({
                customerName: user.displayName || user.email,
                customerEmail: user.email!,
                cartItems: currentCartItems.map(item => ({ 
                    name: item.product.name, 
                    quantity: item.quantity 
                })),
                prizeLabel: prize.label,
            });
        }

      }, REMINDER_DELAY);
    }

    // Cleanup function for when the component unmounts or dependencies change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  // The dependency array now only includes the core triggers for the reminder logic,
  // preventing the timer from resetting on every cart change.
  }, [prize, prizeClaimedTime, user, lastPurchaseTimestamp]);

  // This component renders nothing to the UI.
  return null;
}
