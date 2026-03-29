"use client";

import { useAuth, useFirestore } from "@/firebase";
import { GoogleAuthProvider, signInWithPopup, getAdditionalUserInfo } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function GoogleSignInButton({ action = "Sign in" }: { action?: "Sign in" | "Sign up" }) {
    const auth = useAuth();
    const firestore = useFirestore();
    const { toast } = useToast();
    const router = useRouter();

    const handleGoogleSignIn = async () => {
        if (!firestore) {
            toast({ title: 'Error', description: 'Could not connect to the database.', variant: 'destructive' });
            return;
        }
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const additionalUserInfo = getAdditionalUserInfo(result);
            const isNewUser = additionalUserInfo?.isNewUser;

            if (isNewUser) {
                const userDocRef = doc(firestore, 'users', user.uid);
                const displayName = user.displayName || '';
                const [firstName, ...lastNameParts] = displayName.split(' ');
                const lastName = lastNameParts.join(' ');

                await setDoc(userDocRef, {
                    id: user.uid,
                    email: user.email,
                    firstName: firstName || '',
                    lastName: lastName || '',
                    registrationDate: new Date().toISOString(),
                    loyaltyPoints: 0,
                });

                toast({
                    title: "Account Created",
                    description: "Welcome to VogueVerse! You are now signed in.",
                });
            } else {
                 // For returning users, we might want to ensure their profile exists
                // just in case it wasn't created before.
                const userDocRef = doc(firestore, 'users', user.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (!userDocSnap.exists()) {
                    const displayName = user.displayName || '';
                    const [firstName, ...lastNameParts] = displayName.split(' ');
                    const lastName = lastNameParts.join(' ');
                    
                    await setDoc(userDocRef, {
                        id: user.uid,
                        email: user.email,
                        firstName: firstName || '',
                        lastName: lastName || '',
                        registrationDate: new Date().toISOString(),
                        loyaltyPoints: 0,
                    });
                }

                toast({
                    title: "Logged In",
                    description: "Welcome back! You are successfully logged in.",
                });
            }
            router.push("/profile");
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: `${action} Failed`,
                description: error.message,
            });
        }
    };

    return (
        <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
            {action} with Google
        </Button>
    );
}
