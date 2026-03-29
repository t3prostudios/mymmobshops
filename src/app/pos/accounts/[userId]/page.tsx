
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { UserAccount } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Tag } from 'lucide-react';
import Link from 'next/link';
import { Textarea } from '@/components/ui/textarea';

const userAccountFormSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
    loyaltyPoints: z.coerce.number().min(0, 'Loyalty points cannot be negative'),
});

function UserProfilePageSkeleton() {
    return (
        <div className="container mx-auto max-w-2xl py-12">
            <Skeleton className="h-8 w-48 mb-8" />
            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-4 w-3/4" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/3" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
                <div className="flex justify-end gap-2">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                </div>
            </div>
        </div>
    )
}

export default function UserAccountPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const firestore = useFirestore();
    const userId = params.userId as string;

    const userDocRef = useMemoFirebase(() => (firestore && userId) ? doc(firestore, 'users', userId) : null, [firestore, userId]);
    const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserAccount>(userDocRef);
    
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<z.infer<typeof userAccountFormSchema>>({
        resolver: zodResolver(userAccountFormSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            phone: '',
            address: '',
            city: '',
            state: '',
            postalCode: '',
            country: '',
            loyaltyPoints: 0,
        },
    });

    useEffect(() => {
        if (userProfile) {
            form.reset({
                firstName: userProfile.firstName || '',
                lastName: userProfile.lastName || '',
                phone: userProfile.phone || '',
                address: userProfile.address || '',
                city: userProfile.city || '',
                state: userProfile.state || '',
                postalCode: userProfile.postalCode || '',
                country: userProfile.country || '',
                loyaltyPoints: userProfile.loyaltyPoints || 0,
            });
        }
    }, [userProfile, form]);

    const handleSave = async (values: z.infer<typeof userAccountFormSchema>) => {
        if (!firestore || !userId) return;
        setIsSaving(true);
        try {
            const userRef = doc(firestore, 'users', userId);
            await updateDoc(userRef, { ...values });
            toast({ title: "Success", description: "User profile updated." });
        } catch (error) {
            console.error("Error updating user:", error);
            toast({ variant: "destructive", title: "Error", description: "Failed to update user profile." });
        } finally {
            setIsSaving(false);
        }
    };
    
    if (isProfileLoading) {
        return <UserProfilePageSkeleton />;
    }

    if (!userProfile) {
        return (
            <div className="container text-center py-20">
                <h1 className="text-2xl font-bold">User Not Found</h1>
                <p className="text-muted-foreground mt-2">The requested user profile could not be found.</p>
                <Button asChild className="mt-6">
                    <Link href="/pos"><ArrowLeft className="mr-2 h-4 w-4" /> Back to POS</Link>
                </Button>
            </div>
        )
    }

    const isPrizeActive = userProfile.prizeExpiry && userProfile.prizeExpiry > Date.now();

    return (
        <div className="container mx-auto max-w-2xl py-8">
            <Button variant="ghost" className="mb-4" asChild>
                <Link href="/pos">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to POS
                </Link>
            </Button>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSave)} className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Edit Customer: {userProfile.firstName} {userProfile.lastName}</CardTitle>
                            <CardDescription>Update profile and contact information below.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="firstName" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>First Name</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="lastName" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Last Name</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl><Input value={userProfile.email || ''} disabled /></FormControl>
                            </FormItem>
                            <FormField control={form.control} name="phone" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone</FormLabel>
                                    <FormControl><Input {...field} placeholder="Enter phone number" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="address" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address</FormLabel>
                                    <FormControl><Input {...field} placeholder="Enter street address" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <FormField control={form.control} name="city" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>City</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="state" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>State</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="postalCode" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Postal Code</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                             <FormField control={form.control} name="country" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Country</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Loyalty</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <FormField control={form.control} name="loyaltyPoints" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Loyalty Points</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Tag className="h-5 w-5 text-primary" /> Active Promo
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isPrizeActive ? (
                                    <div>
                                        <p className="font-semibold text-primary">{userProfile.prizeLabel}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Expires: {new Date(userProfile.prizeExpiry!).toLocaleString()}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground">No promo applied.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={isSaving}>
                            <Save className="mr-2 h-4 w-4" />
                            {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
