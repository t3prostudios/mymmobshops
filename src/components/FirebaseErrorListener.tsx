'use client';

import { useState, useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';

/**
 * Listens for permission errors. 
 * In production, it shows a toast instead of crashing the app.
 */
export function FirebaseErrorListener() {
  const [error, setError] = useState<FirestorePermissionError | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (err: FirestorePermissionError) => {
      // In production, we don't want a "Client Exception" crash.
      // We show a toast and log to console for debugging.
      if (process.env.NODE_ENV === 'production') {
        console.warn('Firestore Permission Denied:', err.message);
        toast({
          variant: 'destructive',
          title: 'Permission Denied',
          description: 'You do not have access to this data. Please verify your admin login.',
        });
      } else {
        setError(err);
      }
    };

    errorEmitter.on('permission-error', handleError);
    return () => errorEmitter.off('permission-error', handleError);
  }, [toast]);

  if (error) {
    throw error;
  }

  return null;
}