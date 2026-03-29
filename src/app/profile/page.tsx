
'use client';

import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, BarChart, Gift, Zap } from 'lucide-react';
import Link from 'next/link';
import type { UserAccount } from '@/types';
import { doc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import Image from 'next/image';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserAccount>(userDocRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };
  
  const getTier = (points: number | undefined) => {
    const p = points || 0;
    if (p >= 750) return { name: 'Trendsetter', bgUrl: 'https://picsum.photos/seed/gold/600/400', hint: 'gold metal' };
    if (p >= 250) return { name: 'Style Scout', bgUrl: 'https://picsum.photos/seed/silver/600/400', hint: 'silver metal' };
    return { name: 'Bronze', bgUrl: 'https://picsum.photos/seed/bronze/600/400', hint: 'bronze metal' };
  };

  const loyaltyTier = getTier(userProfile?.loyaltyPoints);

  if (isUserLoading || isProfileLoading || !user) {
    return (
      <div className="container mx-auto py-12">
        <div className="mx-auto max-w-lg">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
          <Skeleton className="mt-8 h-10 w-full" />
          <Skeleton className="mt-8 h-32 w-full" />
        </div>
      </div>
    );
  }
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('');
  }

  return (
    <div className="container mx-auto py-12">
      <div className="mx-auto max-w-lg space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-headline">My Profile</h1>
        </div>
        <div className="relative bg-background p-6 sm:p-8 rounded-xl shadow-lg border flex flex-col items-center overflow-hidden">
          <Image
            src={loyaltyTier.bgUrl}
            alt={`${loyaltyTier.name} tier background`}
            fill
            objectFit="cover"
            className="absolute inset-0 z-0 opacity-20"
            data-ai-hint={loyaltyTier.hint}
          />
          <div className="relative z-10 flex flex-col items-center">
            <Avatar className="h-24 w-24 mb-4 border-4 border-background">
                <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? "User"} />
                <AvatarFallback>{getInitials(user.displayName || user.email)}</AvatarFallback>
            </Avatar>
            <div className="text-center">
                <h2 className="text-2xl font-semibold">{user.displayName || 'No display name'}</h2>
                <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Loyalty Program - {loyaltyTier.name} Tier
            </CardTitle>
            <CardDescription>
              Your rewards dashboard for being a valued member.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center bg-muted p-6 rounded-lg">
              <p className="text-sm text-muted-foreground">Your Points Balance</p>
              <p className="text-4xl font-bold text-primary">{userProfile?.loyaltyPoints || 0}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-muted-foreground" />
                    <span>1 point per $1</span>
                </div>
                <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-muted-foreground" />
                    <span>Birthday Rewards</span>
                </div>
                <div className="flex items-center gap-2">
                    <BarChart className="w-4 h-4 text-muted-foreground" />
                    <span>Tier Progression</span>
                </div>
                 <div className="flex items-center gap-2">
                    <Link href="/loyalty-program" className="text-primary hover:underline flex items-center gap-2">
                        View Program Details
                    </Link>
                </div>
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleLogout} className="w-full" variant="outline">
            Logout
        </Button>
      </div>
    </div>
  );
}
