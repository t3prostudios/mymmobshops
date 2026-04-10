
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { fetchProductsAction } from "@/lib/actions";
import { formatPrice, cn } from "@/lib/utils";
import type { Product, Order, UserAccount, Complaint, Review, Stock } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingCart, CreditCard, Wifi, WifiOff, LogIn, Bell, Archive, Send, Search, Users, Pencil, MessageSquare, Star as StarIcon, Trash2, Mail, PlusCircle, Settings2, Weight, RefreshCw, XCircle } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  loadStripeTerminal,
  type Terminal,
  type Reader,
} from '@stripe/terminal-js';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFirebase, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, doc, updateDoc, deleteDoc, serverTimestamp, getDocs, increment, setDoc, where } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { handleShippingNotification, handleEscalateComplaint, handleSendPosEmail } from './actions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type CartItem = {
  id: string; 
  name: string;
  price: number;
  quantity: number;
  productId: string;
  color: string;
  size: string;
  expiresAt?: number;
  customerEmail?: string;
};

type ReaderStatus = 'idle' | 'discovering' | 'connecting' | 'connected';

function TabBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
      {count > 9 ? '9+' : count}
    </span>
  );
}

function ManageProductDialog({ product, isOpen, onOpenChange, onUpdate }: { product: Product, isOpen: boolean, onOpenChange: (open: boolean) => void, onUpdate: () => void }) {
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [stockState, setStockState] = useState<Stock[]>(product.stock);

    useEffect(() => {
        setStockState(product.stock);
    }, [product]);

    const handleUpdateChange = (index: number, value: string) => {
        const newState = [...stockState];
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue)) {
            newState[index] = { ...newState[index], quantity: numValue };
            setStockState(newState);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updates = stockState.map(s => ({
                productId: product.id,
                color: s.color,
                size: s.size,
                quantity: s.quantity
            }));

            const response = await fetch('/api/inventory', {
                method: 'POST',
                body: JSON.stringify({ updates, operation: 'set' }),
            });

            if (!response.ok) throw new Error('Failed to update product inventory');

            toast({ title: "Success", description: "Product inventory updated in Stripe." });
            onUpdate();
            onOpenChange(false);
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Error", description: error.message });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Manage Inventory: {product.name}</DialogTitle>
                    <DialogDescription>Update stock quantities. Changes sync directly to Stripe Metadata.</DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh] pr-4">
                    <div className="space-y-4">
                        {stockState.length > 0 ? stockState.map((s, index) => (
                            <div key={`${s.color}-${s.size}`} className="grid grid-cols-2 gap-4 items-end border-b pb-4">
                                <div>
                                    <Label className="text-xs">{s.color} / {s.size}</Label>
                                    <div className="text-sm font-medium mt-1">Weight: {s.weight || product.weight} oz</div>
                                </div>
                                <div>
                                    <Label htmlFor={`stock-${index}`} className="text-xs">Stock Level</Label>
                                    <Input 
                                        id={`stock-${index}`}
                                        type="number" 
                                        value={s.quantity} 
                                        onChange={(e) => handleUpdateChange(index, e.target.value)} 
                                    />
                                </div>
                            </div>
                        )) : (
                          <div className="text-center py-8">
                            <p className="text-sm text-muted-foreground">No metadata found for variants.</p>
                            <p className="text-xs text-muted-foreground mt-2">Add metadata keys in Stripe to track stock.</p>
                          </div>
                        )}
                    </div>
                </ScrollArea>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isSaving || stockState.length === 0}>
                        {isSaving ? "Saving..." : "Save to Stripe"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function AddToCartDialog({ 
  product, 
  isOpen, 
  onOpenChange, 
  onAdd 
}: { 
  product: Product | null, 
  isOpen: boolean, 
  onOpenChange: (open: boolean) => void, 
  onAdd: (product: Product, color: string, size: string) => void 
}) {
    const [selectedColor, setSelectedColor] = useState<string>('');
    const [selectedSize, setSelectedSize] = useState<string>('');

    const allColors = useMemo(() => {
        if (!product) return [];
        return Array.from(new Set(product.stock.map(s => s.color)));
    }, [product]);

    const getColorTotalStock = (color: string) => {
        if (!product) return 0;
        return product.stock
            .filter(s => s.color === color)
            .reduce((sum, s) => sum + s.quantity, 0);
    };

    const availableSizes = useMemo(() => {
        if (!product || !selectedColor) return [];
        return product.stock
            .filter(s => s.color === selectedColor)
            .map(s => ({ 
                size: s.size, 
                qty: s.quantity, 
                weight: s.weight || product.weight 
            }));
    }, [product, selectedColor]);

    useEffect(() => {
        if (isOpen) {
            setSelectedColor('');
            setSelectedSize('');
        }
    }, [isOpen]);

    if (!product) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Select Variant: {product.name}</DialogTitle>
                    <DialogDescription>Choose the color and size for this in-store sale.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Color / Logo Option</Label>
                        <Select value={selectedColor} onValueChange={(val) => { setSelectedColor(val); setSelectedSize(''); }}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select color" />
                            </SelectTrigger>
                            <SelectContent>
                                {allColors.map(c => {
                                    const totalQty = getColorTotalStock(c);
                                    const isOutOfStock = totalQty <= 0;
                                    return (
                                        <SelectItem key={c} value={c} disabled={isOutOfStock}>
                                            {c} {isOutOfStock ? "(Out of Stock)" : `(${totalQty} total)`}
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    </div>
                    {selectedColor && (
                        <div className="space-y-2">
                            <Label>Size Availability & Weights</Label>
                            <div className="grid grid-cols-3 gap-2">
                                {availableSizes.map(s => (
                                    <Button 
                                        key={s.size} 
                                        variant={selectedSize === s.size ? "default" : "outline"}
                                        className={cn(
                                            "text-xs py-3 h-auto flex flex-col items-center justify-center gap-1",
                                            s.qty <= 0 && "opacity-50 grayscale bg-muted border-dashed"
                                        )}
                                        onClick={() => setSelectedSize(s.size)}
                                        disabled={s.qty <= 0}
                                    >
                                        <span className="font-bold">{s.size}</span>
                                        <span className="text-[10px] font-medium text-primary/80">{s.weight} oz</span>
                                        <span className={cn("text-[9px] italic", s.qty <= 0 ? "text-destructive" : "opacity-70")}>
                                            {s.qty <= 0 ? "Sold Out" : `${s.qty} in stock`}
                                        </span>
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button 
                        disabled={!selectedColor || !selectedSize}
                        onClick={() => {
                            onAdd(product, selectedColor, selectedSize);
                            onOpenChange(false);
                        }}
                    >
                        Add to Cart
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function NotificationsTab({ orders, isLoading }: { orders: Order[] | null, isLoading: boolean}) {
    const { firestore } = useFirebase();
    const [fulfilledOrderSearch, setFulfilledOrderSearch] = useState('');
    
    const handleMarkAsFulfilled = async (orderId: string) => {
        if (!firestore) return;
        const orderRef = doc(firestore, "orders", orderId);
        await updateDoc(orderRef, { status: "fulfilled" });
    };

    const newOrders = useMemo(() => orders?.filter(o => o.status === 'new') || [], [orders]);
    
    const fulfilledOrders = useMemo(() => {
        const sorted = orders?.filter(o => o.status === 'fulfilled') || [];
        if (!fulfilledOrderSearch) return sorted;
        return sorted.filter(order =>
          (order.customerName?.toLowerCase().includes(fulfilledOrderSearch.toLowerCase()) || 
           order.customerEmail?.toLowerCase().includes(fulfilledOrderSearch.toLowerCase()))
        );
    }, [orders, fulfilledOrderSearch]);


    if (isLoading) {
        return <div className="text-center p-8">Loading orders...</div>
    }

    return (
        <div className="p-4">
             <div className="mb-8">
                <h2 className="text-xl font-semibold mb-3 flex items-center gap-2"><Bell className="h-5 w-5" />New Orders</h2>
                <div className="space-y-3">
                {newOrders.length > 0 ? (
                    newOrders.map(order => (
                    <div key={order.id} className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
                        <div className="flex justify-between items-start">
                        <div>
                            <p className="font-semibold">{order.customerName}</p>
                            <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
                            <p className="text-sm font-bold mt-1 capitalize text-blue-600 dark:text-blue-400">{order.deliveryMethod}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-lg">{formatPrice(order.total)}</p>
                            <p className="text-xs text-muted-foreground">{order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleString() : 'Just now'}</p>
                        </div>
                        </div>
                        <ul className="text-sm mt-2 space-y-1">
                        {order.orderItems.map((item, index) => (
                            <li key={index}>- {item.name} (x{item.quantity})</li>
                        ))}
                        </ul>
                         <Button size="sm" className="mt-3" onClick={() => handleMarkAsFulfilled(order.id)}>Mark as Fulfilled</Button>
                    </div>
                    ))
                ) : (
                    <p className="text-muted-foreground text-sm">No new online orders.</p>
                )}
                </div>
            </div>

            <div>
                 <div className="flex justify-between items-center mb-3">
                    <h2 className="text-xl font-semibold flex items-center gap-2"><Archive className="h-5 w-5" />Fulfilled Orders</h2>
                    <div className="relative w-full max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Filter by name or email..."
                            value={fulfilledOrderSearch}
                            onChange={(e) => setFulfilledOrderSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>
                <ScrollArea className="h-[calc(100vh-600px)]">
                <div className="space-y-3 pr-4">
                {fulfilledOrders.length > 0 ? (
                    fulfilledOrders.map(order => (
                    <div key={order.id} className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-800/20 dark:border-gray-700 opacity-70">
                         <div className="flex justify-between items-start">
                        <div>
                            <p className="font-semibold">{order.customerName}</p>
                            <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
                            <p className="text-xs text-muted-foreground mt-1">{order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</p>
                        </div>
                        <p className="font-medium">{formatPrice(order.total)}</p>
                        </div>
                    </div>
                    ))
                ) : (
                    <p className="text-muted-foreground text-sm text-center py-8">{fulfilledOrderSearch ? 'No matching orders found.' : 'No orders have been fulfilled yet.'}</p>
                )}
                </div>
                </ScrollArea>
            </div>
        </div>
    )
}

const shippingFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  trackingNumber: z.string().min(1, 'Tracking number is required.'),
});

function ShippingTab() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof shippingFormSchema>>({
    resolver: zodResolver(shippingFormSchema),
    defaultValues: {
      email: '',
      trackingNumber: '',
    },
  });

  async function onSubmit(values: z.infer<typeof shippingFormSchema>) {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('email', values.email);
    formData.append('trackingNumber', values.trackingNumber);

    try {
      const result = await handleShippingNotification(formData);
      if (result?.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        });
      } else {
        toast({
          title: 'Success!',
          description: `Tracking number sent to ${values.email}.`,
        });
        form.reset();
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'An unexpected error occurred.',
        description: 'Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
     <div className="p-4">
        <div className="mx-auto max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-headline">Send Shipping Notification</h1>
              <p className="text-muted-foreground mt-2 text-sm">
                Enter the customer's email and tracking number to send a shipping update.
              </p>
            </div>
            <div className="bg-background dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg border">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Customer Email</FormLabel>
                            <FormControl>
                                <Input
                                type="email"
                                placeholder="customer@example.com"
                                {...field}
                                />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="trackingNumber"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>USPS Tracking Number</FormLabel>
                            <FormControl>
                                <Input placeholder="9400111202555842673259" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <Button type="submit" disabled={isSubmitting} className="w-full">
                           <Send className="mr-2 h-4 w-4" />
                           {isSubmitting ? 'Sending...' : 'Send Notification'}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    </div>
  );
}

const emailFormSchema = z.object({
  subject: z.string().min(1, 'Subject is required.'),
  message: z.string().min(1, 'Message is required.'),
});

function SendEmailDialog({ user, isOpen, onOpenChange }: { user: UserAccount | null, isOpen: boolean, onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);
  
  const form = useForm<z.infer<typeof emailFormSchema>>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: { subject: '', message: '' },
  });

  useEffect(() => {
    if (!isOpen) {
      form.reset();
    }
  }, [isOpen, form]);

  async function onSubmit(values: z.infer<typeof emailFormSchema>) {
    if (!user) return;
    setIsSending(true);
    const formData = new FormData();
    formData.append("customerEmail", user.email);
    formData.append("subject", values.subject);
    formData.append("message", values.message);
    
    const result = await handleSendPosEmail(formData);
    
    if (result.error) {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    } else {
      toast({ title: 'Success', description: 'Email sent successfully.' });
      onOpenChange(false);
    }
    setIsSending(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Email to {user?.firstName} {user?.lastName}</DialogTitle>
          <DialogDescription>Compose your message below. It will be sent from shopmmob@gmail.com.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormItem>
              <FormLabel>To</FormLabel>
              <FormControl>
                <Input value={user?.email || ''} disabled />
              </FormControl>
            </FormItem>
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl><Input {...field} placeholder="A message from Minding My Own Business" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl><Textarea {...field} placeholder="Your message here..." className="min-h-[150px]" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isSending}>
                <Send className="mr-2 h-4 w-4" />
                {isSending ? "Sending..." : "Send Email"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function AccountsTab({ users, isLoading }: { users: UserAccount[] | null, isLoading: boolean }) {
    const { firestore } = useFirebase();
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [emailingUser, setEmailingUser] = useState<UserAccount | null>(null);
    const [userToDelete, setUserToDelete] = useState<UserAccount | null>(null);

    const handleDeleteUser = async () => {
        if (!firestore || !userToDelete) return;
        try {
            await deleteDoc(doc(firestore, 'users', userToDelete.id));
            toast({
                title: "Account Deleted",
                description: `The account for ${userToDelete.firstName} ${userToDelete.lastName} has been deleted.`,
            });
        } catch (error) {
            console.error("Error deleting user:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete account.",
            });
        } finally {
            setUserToDelete(null);
        }
    };

    const filteredUsers = useMemo(() => {
        if (!users) return [];
        if (!searchTerm) return users;
        return users.filter(user =>
            (user.firstName && user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (user.lastName && user.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [users, searchTerm]);

    if (isLoading) {
        return <div className="text-center p-8">Loading accounts...</div>
    }

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2"><Users className="h-5 w-5" />Customer Accounts</h2>
            </div>
             <div className="relative w-full max-w-sm mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                />
            </div>
            <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="space-y-3 pr-4">
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map(user => (
                            <div key={user.id} className="p-4 border rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">{user.firstName} {user.lastName}</p>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                    {user.phone && <p className="text-sm text-muted-foreground">{user.phone}</p>}
                                    {user.address && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {user.address}, {user.city}, {user.state} {user.postalCode}, {user.country}
                                        </p>
                                    )}
                                    <p className="text-xs text-muted-foreground mt-1">Joined: {user.registrationDate ? new Date(user.registrationDate).toLocaleDateString() : 'N/A'}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="text-right">
                                    <p className="font-bold text-lg text-primary">{user.loyaltyPoints || 0}</p>
                                    <p className="text-xs text-muted-foreground">Loyalty Points</p>
                                  </div>
                                  <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setEmailingUser(user)}>
                                    <Mail className="h-4 w-4" />
                                  </Button>
                                  <Button size="icon" variant="outline" className="h-8 w-8" asChild>
                                    <Link href={`/pos/accounts/${user.id}`}>
                                      <Pencil className="h-4 w-4" />
                                    </Link>
                                  </Button>
                                  <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => setUserToDelete(user)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-muted-foreground py-10">No users found.</p>
                    )}
                </div>
            </ScrollArea>

            <SendEmailDialog user={emailingUser} isOpen={!!emailingUser} onOpenChange={(open) => !open && setEmailingUser(null)} />
             <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the account for {userToDelete?.firstName} {userToDelete?.lastName}.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setUserToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteUser} className={buttonVariants({ variant: "destructive" })}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

function ComplaintsTab({ complaints, isLoading }: { complaints: Complaint[] | null, isLoading: boolean }) {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [complaintToResolve, setComplaintToResolve] = useState<Complaint | null>(null);
  const [complaintToDelete, setComplaintToDelete] = useState<Complaint | null>(null);
  const [password, setPassword] = useState('');
  const [isEscalating, setIsEscalating] = useState<string | null>(null);
  const [hasCleanedUp, setHasCleanedUp] = useState(false);

  useEffect(() => {
    if (isLoading || !complaints || !firestore || hasCleanedUp) return;

    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
    
    complaints.forEach(c => {
        if (c.status === 'resolved' && c.resolvedAt?.seconds) {
            const resolvedTime = new Date(c.resolvedAt.seconds * 1000);
            if (resolvedTime < twelveHoursAgo) {
                const docRef = doc(firestore, 'complaints', c.id);
                deleteDoc(docRef).catch(error => console.error("Error auto-delete complaint:", error));
            }
        }
    });

    setHasCleanedUp(true);
  }, [complaints, isLoading, firestore, hasCleanedUp]);
  
  const handleUpdateStatus = async (complaintId: string, status: Complaint['status']) => {
    if (!firestore) return;
    const complaintRef = doc(firestore, "complaints", complaintId);
    const updateData: { status: Complaint['status'], resolvedAt?: any } = { status: status };
    if (status === 'resolved') {
      updateData.resolvedAt = serverTimestamp();
    }
    await updateDoc(complaintRef, updateData);
  };
  
  const onEscalateClick = async (complaint: Complaint) => {
    setIsEscalating(complaint.id);
    try {
        const result = await handleEscalateComplaint({
            name: complaint.name,
            email: complaint.email,
            issue: complaint.issue,
            createdAt: complaint.createdAt?.seconds ? new Date(complaint.createdAt.seconds * 1000).toLocaleString() : 'N/A',
        });

        if (result.error) {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        } else {
            await handleUpdateStatus(complaint.id, 'escalated');
            toast({ title: 'Success', description: 'Complaint has been escalated.' });
        }
    } catch (e) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to escalate complaint.' });
    } finally {
        setIsEscalating(null);
    }
  }

  const handleResolve = async () => {
    if (password !== 'Murder11500') {
        toast({ variant: 'destructive', title: 'Incorrect Password' });
        return;
    }
    if (complaintToResolve) {
        await handleUpdateStatus(complaintToResolve.id, 'resolved');
        toast({ title: "Success", description: "Complaint marked as resolved." });
        setComplaintToResolve(null);
        setPassword('');
    }
  };

  const handleDeleteComplaint = async () => {
    if (!firestore || !complaintToDelete) return;
    try {
      await deleteDoc(doc(firestore, "complaints", complaintToDelete.id));
      toast({
        title: "Complaint Deleted",
        description: "The complaint has been permanently removed.",
      });
    } catch (error) {
        console.error("Error deleting complaint: ", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not delete the complaint.",
        });
    } finally {
        setComplaintToDelete(null);
    }
  };
  
  if (isLoading) {
    return <div className="text-center p-8">Loading complaints...</div>
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-3 flex items-center gap-2"><MessageSquare className="h-5 w-5" />Customer Complaints</h2>
      <ScrollArea className="h-[calc(100vh-250px)]">
        <div className="space-y-3 pr-4">
          {complaints && complaints.length > 0 ? (
            complaints.map(complaint => (
              <div key={complaint.id} className={cn("p-4 border rounded-lg", complaint.status === 'resolved' && 'bg-gray-100 dark:bg-gray-800 opacity-50')}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{complaint.name} <span className="text-sm text-muted-foreground">- {complaint.email}</span></p>
                    <p className="text-xs text-muted-foreground mt-1">{complaint.createdAt?.seconds ? new Date(complaint.createdAt.seconds * 1000).toLocaleString() : 'Just now'}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setComplaintToDelete(complaint)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <p className="text-sm mt-3">{complaint.issue}</p>
                <div className="flex justify-between items-center mt-3">
                    <Select value={complaint.status} onValueChange={(value) => handleUpdateStatus(complaint.id, value as any)} disabled={['escalated', 'resolved'].includes(complaint.status)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="escalated" disabled>Escalated</SelectItem>
                        <SelectItem value="resolved" disabled>Resolved</SelectItem>
                      </SelectContent>
                    </Select>

                    {complaint.status === 'resolved' ? (
                        <Button size="sm" disabled>Resolved</Button>
                    ) : complaint.status === 'escalated' ? (
                        <Button size="sm" onClick={() => setComplaintToResolve(complaint)}>Escalated</Button>
                    ) : (
                        <Button size="sm" onClick={() => onEscalateClick(complaint)} disabled={isEscalating === complaint.id}>
                            {isEscalating === complaint.id ? 'Escalating...' : 'Escalate'}
                        </Button>
                    )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-sm text-center py-10">No complaints have been submitted yet.</p>
          )}
        </div>
      </ScrollArea>
       <AlertDialog open={!!complaintToResolve} onOpenChange={(open) => !open && setComplaintToResolve(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Resolve Complaint</AlertDialogTitle>
                <AlertDialogDescription>
                    Enter the password to mark this complaint as resolved.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <Input 
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleResolve()}
            />
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => { setComplaintToResolve(null); setPassword(''); }}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleResolve}>Submit</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    <AlertDialog open={!!complaintToDelete} onOpenChange={(open) => !open && setComplaintToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the complaint.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={setComplaintToDelete.bind(null, null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteComplaint} className={buttonVariants({ variant: "destructive" })}>Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </div>
  )
}

function ReviewsTab({ reviews, isLoading }: { reviews: Review[] | null, isLoading: boolean }) {
  
  if (isLoading) {
    return <div className="text-center p-8">Loading reviews...</div>
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-3 flex items-center gap-2"><StarIcon className="h-5 w-5" />Product Reviews</h2>
       <ScrollArea className="h-[calc(100vh-250px)]">
        <div className="space-y-3 pr-4">
          {reviews && reviews.length > 0 ? (
            reviews.map(review => (
              <div key={review.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{review.productName}</p>
                    <p className="text-sm text-muted-foreground">by {review.authorName}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} className={cn("h-4 w-4", i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300")} />
                    ))}
                  </div>
                </div>
                <p className="text-sm mt-3 italic">"{review.comment}"</p>
                 <p className="text-xs text-muted-foreground mt-2 text-right">{review.createdAt?.seconds ? new Date(review.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</p>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-sm text-center py-10">No reviews have been submitted yet.</p>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

const manualItemSchema = z.object({
  name: z.string().min(1, 'Item name is required.'),
  customerEmail: z.string().email({ message: "Invalid email format."}).optional().or(z.literal('')),
  price: z.coerce.number().min(0.01, 'Price must be greater than 0.'),
  duration: z.string().optional(),
});

function ManualEntryDialog({
  isOpen,
  onOpenChange,
  onManualItemSubmit,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onManualItemSubmit: (itemData: z.infer<typeof manualItemSchema>) => void;
}) {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);
  const [emailCheck, setEmailCheck] = useState<{
    status: 'idle' | 'checking' | 'verified' | 'not_found';
    message?: string;
  }>({ status: 'idle' });

  const form = useForm<z.infer<typeof manualItemSchema>>({
    resolver: zodResolver(manualItemSchema),
    defaultValues: {
      name: '',
      customerEmail: '',
      price: undefined,
      duration: '5',
    },
  });

  const handleCheckEmail = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const email = form.getValues('customerEmail');
    if (!email) {
      form.setError('customerEmail', { message: 'Email is required to check.' });
      return;
    }
    
    setIsVerifying(true);
    setEmailCheck({ status: 'checking' });
    if (!firestore) {
      setEmailCheck({ status: 'idle', message: 'Database not connected.' });
      setIsVerifying(false);
      return;
    }
    
    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      setEmailCheck({ status: 'verified', message: 'Customer found.' });
    } else {
      setEmailCheck({ status: 'not_found', message: 'No account found.' });
    }
    setIsVerifying(false);
  };

  const handleAddAccountInstructions = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    toast({
        title: "Instructions",
        description: "Ask the customer to go to the website on their phone and sign up to create an account.",
    });
  };

  function onSubmit(values: z.infer<typeof manualItemSchema>) {
    const finalValues = {
        ...values,
        customerEmail: emailCheck.status === 'verified' ? values.customerEmail : ''
    };
    onManualItemSubmit(finalValues);
    onOpenChange(false);
  }
  
  const customerEmailValue = form.watch('customerEmail');
  useEffect(() => {
    if (emailCheck.status !== 'idle') {
      setEmailCheck({ status: 'idle' });
    }
  }, [customerEmailValue]);

  useEffect(() => {
    if (isOpen) {
        form.reset({
            name: '',
            customerEmail: '',
            price: undefined,
            duration: '5',
        });
        setEmailCheck({ status: 'idle' });
    }
  }, [isOpen, form]);


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Manual Item</DialogTitle>
          <DialogDescription>
            Enter a name and price for a custom item to add to the cart.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Custom T-Shirt" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="customerEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Email (Optional)</FormLabel>
                  <div className="flex items-end gap-2">
                    <FormControl className="flex-grow">
                        <Input
                            type="email"
                            placeholder="customer@example.com"
                            {...field}
                        />
                    </FormControl>
                    {emailCheck.status === 'idle' && (
                        <Button type="button" variant="outline" size="sm" onClick={handleCheckEmail} disabled={isVerifying}>
                            {isVerifying ? 'Checking...' : 'Check'}
                        </Button>
                    )}
                    {emailCheck.status === 'checking' && (
                        <Button type="button" variant="outline" size="sm" disabled>Checking...</Button>
                    )}
                    {emailCheck.status === 'verified' && (
                       <Button type="button" variant="ghost" size="icon" className="text-green-500" disabled><Users className="h-4 w-4" /></Button>
                    )}
                    {emailCheck.status === 'not_found' && (
                        <Button type="button" variant="secondary" size="sm" onClick={handleAddAccountInstructions}>Add</Button>
                    )}
                  </div>
                  <FormDescription>
                    {emailCheck.status === 'idle' && "Assign loyalty points for this sale."}
                    {emailCheck.status === 'verified' && <span className="text-green-600">{emailCheck.message}</span>}
                    {emailCheck.status === 'not_found' && <span className="text-destructive">{emailCheck.message}</span>}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Auto-delete after</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Set expiration time" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="1440">24 hours</SelectItem>
                      <SelectItem value="2880">48 hours</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">
                Add to Cart
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function ExpirationTimer({ expiresAt }: { expiresAt: number }) {
  const [timeLeft, setTimeLeft] = useState(expiresAt - Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(expiresAt - Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt]);

  if (timeLeft <= 0) {
    return <p className="text-xs text-red-500">Expired</p>;
  }

  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);
  
  return (
    <p className="text-xs text-muted-foreground">
      Expires in: {hours > 0 && `${hours}h `}{minutes > 0 && `${minutes}m `}{seconds < 10 ? `0${seconds}`: seconds}s
    </p>
  );
}

export default function PosPage() {
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentTab, setCurrentTab] = useState("pos");
  const isMobile = useIsMobile();
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
  const [managingProduct, setManagingProduct] = useState<Product | null>(null);
  const [selectingProduct, setSelectingProduct] = useState<Product | null>(null);

  // Stripe Terminal State
  const [terminal, setTerminal] = useState<Terminal | null>(null);
  const [reader, setReader] = useState<Reader | null>(null);
  const [readers, setReaders] = useState<Reader[]>([]);
  const [readerStatus, setReaderStatus] = useState<ReaderStatus>('idle');
  const [checkoutStep, setCheckoutStep] = useState<'idle' | 'collecting' | 'processing'>('idle');
  const [isDiscovering, setIsDiscovering] = useState(false);
  
  const { firestore, auth, user, isUserLoading } = useFirebase();

  // Queries
  const ordersQuery = useMemoFirebase(() => (firestore && user) ? query(collection(firestore, "orders"), orderBy("createdAt", "desc")) : null, [firestore, user]);
  const usersQuery = useMemoFirebase(() => (firestore && user) ? query(collection(firestore, "users")) : null, [firestore, user]);
  const complaintsQuery = useMemoFirebase(() => (firestore && user) ? query(collection(firestore, "complaints"), orderBy("createdAt", "desc")) : null, [firestore, user]);
  const reviewsQuery = useMemoFirebase(() => (firestore && user) ? query(collection(firestore, "reviews"), orderBy("createdAt", "desc")) : null, [firestore, user]);

  // Data fetching
  const { data: orders, isLoading: ordersLoading } = useCollection<Order>(ordersQuery);
  const { data: users, isLoading: usersLoading } = useCollection<UserAccount>(usersQuery);
  const { data: complaints, isLoading: complaintsLoading } = useCollection<Complaint>(complaintsQuery);
  const { data: reviews, isLoading: reviewsLoading } = useCollection<Review>(reviewsQuery);
  
  const newOrdersCount = useMemo(() => orders?.filter(o => o.status === 'new').length || 0, [orders]);

  const [twentyFourHoursAgo, setTwentyFourHoursAgo] = useState<Date | null>(null);

  useEffect(() => {
    const d = new Date();
    d.setHours(d.getHours() - 24);
    setTwentyFourHoursAgo(d);
  }, []);

  const newAccountsCount = useMemo(() => {
    if (!users || !twentyFourHoursAgo) return 0;
    return users.filter(user => {
      try {
        if (!user.registrationDate) return false;
        const regDate = new Date(user.registrationDate);
        return regDate > twentyFourHoursAgo;
      } catch (e) {
        return false;
      }
    }).length;
  }, [users, twentyFourHoursAgo]);

  const newComplaintsCount = useMemo(() => complaints?.filter(c => c.status === 'new').length || 0, [complaints]);

  const newReviewsCount = useMemo(() => {
      if (!reviews || !twentyFourHoursAgo) return 0;
      return reviews.filter(review => {
          try {
              const reviewDate = review.createdAt?.seconds ? new Date(review.createdAt.seconds * 1000) : null;
              return reviewDate && reviewDate > twentyFourHoursAgo;
          } catch(e) {
              return false;
          }
      }).length;
  }, [reviews, twentyFourHoursAgo]);

  const tabs = [
    { value: 'pos', label: 'Point of Sale', count: 0, icon: ShoppingCart },
    { value: 'notifications', label: 'Notifications', count: newOrdersCount, icon: Bell },
    { value: 'shipping', label: 'Shipping', count: 0, icon: Send },
    { value: 'accounts', label: 'Accounts', count: newAccountsCount, icon: Users },
    { value: 'complaints', label: 'Complaints', count: newComplaintsCount, icon: MessageSquare },
    { value: 'reviews', label: 'Reviews', count: newReviewsCount, icon: StarIcon },
  ];


  // Initialize Stripe Terminal
  useEffect(() => {
    if (user) {
      const initialize = async () => {
        const StripeTerminal = await loadStripeTerminal();
        if (!StripeTerminal) {
            console.error("Stripe Terminal failed to load");
            return;
        }
        const term = StripeTerminal.create({
          onFetchConnectionToken: async () => {
            const response = await fetch('/api/terminal', { method: 'POST', body: JSON.stringify({pathname: '/connection-token'}) });
            const { secret } = await response.json();
            return secret;
          },
          onUnexpectedReaderDisconnect: () => {
            setReader(null);
            setReaderStatus('idle');
            toast({ variant: 'destructive', title: 'Reader Disconnected', description: 'The card reader was disconnected unexpectedly.' });
          },
        });
        setTerminal(term);
      };
      initialize();
    }
  }, [user, toast]);

  useEffect(() => {
    const interval = setInterval(() => {
        setCart(currentCart => {
            const now = Date.now();
            let itemsRemoved = false;
            const removedItemNames: string[] = [];
            
            const newCart = currentCart.filter(item => {
                if (item.expiresAt && now > item.expiresAt) {
                    removedItemNames.push(item.name);
                    itemsRemoved = true;
                    return false;
                }
                return true;
            });

            if (itemsRemoved) {
                 toast({
                    variant: "destructive",
                    title: "Item Expired",
                    description: `Manually added item(s) "${removedItemNames.join(', ')}" expired and were removed from the cart.`,
                });
            }

            return newCart;
        });
    }, 5000); 

    return () => clearInterval(interval);
  }, [toast]);

  const discoverReaders = async () => {
    if (!terminal) return;
    setIsDiscovering(true);
    setReaderStatus('discovering');
    try {
      const discoverResult = await terminal.discoverReaders();
      if (discoverResult.error) {
        throw new Error(discoverResult.error.message);
      }
      setReaders(discoverResult.discoveredReaders);
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Reader Discovery Failed', description: e.message });
    } finally {
      setIsDiscovering(false);
    }
  };

  const connectToReader = async (selectedReader: Reader) => {
    if (!terminal) return;
    setReaderStatus('connecting');
    try {
      const connectResult = await terminal.connectReader(selectedReader);
      if (connectResult.error) {
        throw new Error(connectResult.error.message);
      }
      setReader(connectResult.reader);
      setReaderStatus('connected');
      toast({ title: 'Reader Connected', description: `Connected to ${connectResult.reader.label}` });
      setReaders([]); 
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Connection Failed', description: e.message });
      setReaderStatus('idle');
    }
  };

  async function loadProducts(silent = false) {
    if (!silent) setIsSyncing(true);
    setIsLoadingProducts(true);
    try {
      const fetchedProducts = await fetchProductsAction();
      setProducts(fetchedProducts);
      if (!silent) toast({ title: "Sync Complete", description: "Product catalog updated from Stripe." });
    } catch (e) {
      if (!silent) toast({ variant: "destructive", title: "Sync Failed", description: "Could not fetch latest products." });
    } finally {
      setIsLoadingProducts(false);
      setIsSyncing(false);
    }
  }

  useEffect(() => {
    if (user) {
      loadProducts(true);
    }
  }, [user]);


  const handleLogin = async () => {
    if (password === "080808" && auth) {
      try {
        await signInAnonymously(auth);
        toast({ title: "Access Granted", description: "Welcome to the POS system." });
      } catch (error) {
        console.error("Anonymous sign-in failed:", error);
        toast({ variant: "destructive", title: "Authentication Failed", description: "Could not sign in." });
      }
    } else {
      toast({ variant: "destructive", title: "Access Denied", description: "Incorrect password." });
    }
  };

  const handleManualItemSubmit = (values: z.infer<typeof manualItemSchema>) => {
    const { name, price, duration, customerEmail } = values;
    const cartItemId = `manual-${name}-${Date.now()}`;
    
    const durationMinutes = parseInt(duration || '5', 10);
    const expiresAt = Date.now() + durationMinutes * 60 * 1000;

    const durationLabelMap: { [key: string]: string } = {
        '5': '5 minutes',
        '30': '30 minutes',
        '1440': '24 hours',
        '2880': '48 hours',
    };

    setCart((prevCart) => [
      ...prevCart,
      {
        id: cartItemId,
        name,
        price,
        quantity: 1,
        productId: 'manual', 
        color: 'N/A',
        size: 'N/A',
        expiresAt,
        customerEmail: customerEmail || undefined,
      },
    ]);
    toast({
        title: "Manual Item Added",
        description: `${name} will be removed from cart in ${durationLabelMap[duration || '5']}.`,
    });
  };

  const addToCart = (product: Product, color: string, size: string) => {
    const cartItemId = `${product.id}-${color}-${size}`;
    const cartItemName = `${product.name} (${color} / ${size})`;

    setCart((prevCart) => {
        const existingItem = prevCart.find(item => item.id === cartItemId);
        if (existingItem) {
            return prevCart.map(item =>
                item.id === cartItemId
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            );
        }
        return [
            ...prevCart,
            {
                id: cartItemId,
                name: cartItemName,
                price: product.price,
                quantity: 1,
                productId: product.id,
                color: color,
                size: size,
            },
        ];
    });
    toast({ title: "Added to cart", description: `${cartItemName} added.` });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prevCart) => prevCart.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
    toast({ title: "Cart Cleared" });
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleTerminalCheckout = async () => {
    if (!terminal || !reader || total === 0 || !firestore) return;
  
    setCheckoutStep('collecting');
    try {
      const intentRes = await fetch('/api/terminal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Math.round(total * 100), pathname: '/payment-intent' }),
      });
      const { client_secret, error: intentError } = await intentRes.json();
      if (intentError) throw new Error(intentError);
  
      const collectResult = await terminal.collectPaymentMethod(client_secret);
      if (collectResult.error) throw new Error(collectResult.error.message);
  
      setCheckoutStep('processing');
      const processResult = await terminal.processPayment(collectResult.paymentIntent);
      if (processResult.error) throw new Error(processResult.error.message);
  
      if (processResult.paymentIntent.status === 'succeeded') {
        
        for (const item of cart) {
          if (item.productId === 'manual' && item.customerEmail) {
            const pointsEarned = Math.floor(item.price * item.quantity);
            const usersRef = collection(firestore, 'users');
            const q = query(usersRef, where("email", "==", item.customerEmail));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
              querySnapshot.forEach(async (userDoc) => {
                const userRef = doc(firestore, 'users', userDoc.id);
                await updateDoc(userRef, {
                  loyaltyPoints: increment(pointsEarned)
                });
                toast({
                  title: "Loyalty Points Awarded",
                  description: `${pointsEarned} points awarded to ${item.customerEmail}.`
                });
              });
            }
          }
        }

        const inventoryUpdates = cart
          .filter(item => item.productId !== 'manual') 
          .map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
        }));
        
        await fetch('/api/inventory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ updates: inventoryUpdates, operation: 'decrement' }),
        });
        
        toast({ title: "Payment Successful", description: `Total: ${formatPrice(total)}` });
        setCart([]);
        loadProducts(true); 
      }
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Payment Failed', description: e.message });
    } finally {
      setCheckoutStep('idle');
    }
  };

  const pageIsLoading = isLoadingProducts || ordersLoading || usersLoading || complaintsLoading || reviewsLoading;

  if (isUserLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading POS...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-gray-100 dark:bg-gray-900 flex min-h-[calc(100vh-200px)] items-center justify-center">
        <div className="w-full max-sm space-y-6 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
          <h1 className="text-center text-2xl font-bold text-gray-800 dark:text-gray-200">POS Admin Access</h1>
          <Input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            className="dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
          />
          <Button onClick={handleLogin} className="w-full">
            <LogIn className="mr-2 h-4 w-4" />
            Login
          </Button>
        </div>
      </div>
    );
  }


  if (pageIsLoading && !isSyncing) {
    return (
        <div className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-4 lg:p-8">
            <div className="flex justify-between items-center mb-6">
                <Skeleton className="h-9 w-64 bg-gray-200 dark:bg-gray-700" />
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                <div className="md:col-span-2 space-y-4">
                    <Skeleton className="h-12 w-full bg-gray-200 dark:bg-gray-700" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
                        {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-36 w-full bg-gray-200 dark:bg-gray-700" />)}
                    </div>
                </div>
                <div>
                    <Skeleton className="h-12 w-1/2 mb-4 bg-gray-200 dark:bg-gray-700" />
                    <Skeleton className="h-96 w-full bg-gray-200 dark:bg-gray-700" />
                </div>
            </div>
        </div>
    )
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-[calc(100vh-148px)]">
      <Tabs defaultValue="pos" value={currentTab} onValueChange={setCurrentTab} className="h-full">
        <div className="p-4 lg:px-8 border-b border-gray-200 dark:border-gray-700">
          <header className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl lg:text-3xl font-bold">In-Store Point of Sale</h1>
              <Button size="sm" variant="outline" onClick={() => loadProducts()} disabled={isSyncing} className={cn(isSyncing && "animate-pulse")}>
                <RefreshCw className={cn("h-4 w-4 mr-2", isSyncing && "animate-spin")} /> {isSyncing ? "Syncing..." : "Sync Stripe"}
              </Button>
            </div>
            <div className="flex items-center gap-4 text-sm">
                <span className={cn("font-semibold", readerStatus === 'connected' ? 'text-green-600' : 'text-gray-500 dark:text-gray-400')}>
                  {reader ? reader.label : 'No Reader'}
                </span>
                {readerStatus === 'connected' ? <Wifi className="h-5 w-5 text-green-600" /> : <WifiOff className="h-5 w-5 text-gray-500 dark:text-gray-400" />}
            </div>
          </header>
          {isMobile ? (
             <Select value={currentTab} onValueChange={setCurrentTab}>
               <SelectTrigger className="w-full mt-4">
                 <SelectValue placeholder="Select a page" />
               </SelectTrigger>
               <SelectContent>
                 {tabs.map((tab) => (
                   <SelectItem key={tab.value} value={tab.value}>
                     <div className="flex items-center gap-2">
                       <tab.icon className="h-4 w-4" />
                       <span>{tab.label}</span>
                       {tab.count > 0 && <TabBadge count={tab.count} />}
                     </div>
                   </SelectItem>
                 ))}
               </SelectContent>
             </Select>
          ) : (
            <ScrollArea orientation="horizontal" className="w-full">
                <TabsList className="mt-4">
                    {tabs.map((tab) => (
                        <TabsTrigger key={tab.value} value={tab.value} className="flex items-center">
                            <tab.icon className="mr-2 h-4 w-4" />
                            {tab.label}
                            <TabBadge count={tab.count} />
                        </TabsTrigger>
                    ))}
                </TabsList>
            </ScrollArea>
          )}
        </div>

        <TabsContent value="pos" className="m-0">
          <div className="p-4 lg:p-8 pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <main className="lg:col-span-2 rounded-lg border bg-white dark:bg-gray-800 shadow-sm">
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold">Products</h2>
                    <Button onClick={() => setIsManualEntryOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Manual Item
                    </Button>
                </div>
                <ScrollArea className="h-[calc(100vh-420px)]">
                  {products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
                      {products.map((product) => {
                        const totalStock = product.stock.reduce((sum, item) => sum + item.quantity, 0);
                        const isOutOfStock = totalStock <= 0;
                        const weights = Array.from(new Set(product.stock.map(s => s.weight || product.weight)));
                        const weightDisplay = weights.length > 1 
                            ? `${Math.min(...weights)}-${Math.max(...weights)}` 
                            : weights[0]?.toFixed(1) || (product.weight ? product.weight.toFixed(1) : '0.0');

                        return (
                          <div key={product.id} className="rounded-lg border bg-gray-50 dark:bg-gray-700 p-3 flex flex-col justify-between transition-shadow hover:shadow-md relative group">
                            <button 
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"
                              onClick={() => setManagingProduct(product)}
                              title="Manage stock levels"
                            >
                              <Settings2 className="h-4 w-4 text-muted-foreground" />
                            </button>
                            <div className="pr-6">
                              <h3 className="font-semibold truncate">{product.name}</h3>
                              <div className="space-y-1 mt-1">
                                  <p className="text-xs">
                                  <span className={cn("font-medium", isOutOfStock ? "text-red-500" : "text-gray-500 dark:text-gray-400")}>
                                      {totalStock} in stock
                                  </span>
                                  </p>
                                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                      <Weight className="h-3 w-3" /> {weightDisplay} oz
                                  </p>
                              </div>
                            </div>
                            <Button
                              onClick={() => setSelectingProduct(product)}
                              size="sm"
                              className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white"
                              disabled={isOutOfStock}
                            >
                              {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <Search className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold">No Products Found in Stripe</h3>
                      <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                        Ensure your Stripe Secret Key is correct and you have products with active prices in your dashboard.
                      </p>
                    </div>
                  )}
                </ScrollArea>
              </main>
              <aside>
                <div className="rounded-lg border bg-white dark:bg-gray-800 shadow-sm">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Cart</h2>
                    {cart.length > 0 && (
                      <Button variant="ghost" size="sm" onClick={clearCart} className="text-muted-foreground hover:text-destructive h-8 px-2">
                        <XCircle className="h-4 w-4 mr-1" /> Clear
                      </Button>
                    )}
                  </div>
                  <div className="p-4">
                    {cart.length === 0 ? (
                      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <ShoppingCart className="mx-auto h-12 w-12" />
                        <p className="mt-2">No items in cart</p>
                      </div>
                    ) : (
                      <ScrollArea className="h-[calc(100vh-600px)]">
                        <ul className="space-y-3 pr-4">
                          {cart.map((item) => (
                            <li key={item.id} className="flex justify-between items-center text-sm gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="truncate font-medium">{item.name} x{item.quantity}</p>
                                {item.expiresAt && <ExpirationTimer expiresAt={item.expiresAt} />}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium whitespace-nowrap">{formatPrice(item.price * item.quantity)}</span>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => removeFromCart(item.id)}
                                  title="Remove item"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </ScrollArea>
                    )}
                  </div>
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between font-bold text-lg mb-4">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                    <div className="space-y-2">
                      <Button onClick={handleTerminalCheckout} className="w-full" disabled={cart.length === 0 || !reader || checkoutStep !== 'idle'}>
                         <CreditCard className="mr-2 h-4 w-4" />
                         {checkoutStep === 'idle' && 'Charge Customer'}
                         {checkoutStep === 'collecting' && 'Waiting for card...'}
                         {checkoutStep === 'processing' && 'Processing...'}
                      </Button>
                      <Button onClick={discoverReaders} variant="outline" className="w-full dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700" disabled={isDiscovering}>
                        {isDiscovering ? 'Discovering...' : 'Discover Readers'}
                      </Button>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="m-0">
          <NotificationsTab orders={orders} isLoading={ordersLoading}/>
        </TabsContent>
         <TabsContent value="shipping" className="m-0">
          <ShippingTab />
        </TabsContent>
         <TabsContent value="accounts" className="m-0">
          <AccountsTab users={users} isLoading={usersLoading} />
        </TabsContent>
        <TabsContent value="complaints" className="m-0">
          <ComplaintsTab complaints={complaints} isLoading={complaintsLoading} />
        </TabsContent>
        <TabsContent value="reviews" className="m-0">
          <ReviewsTab reviews={reviews} isLoading={reviewsLoading} />
        </TabsContent>
      </Tabs>
      
      <AlertDialog open={readers.length > 0} onOpenChange={() => setReaders([])}>
        <AlertDialogContent className="dark:bg-gray-800 dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="dark:text-gray-200">Discovered Readers</AlertDialogTitle>
            <AlertDialogDescription className="dark:text-gray-400">
              Select a reader to connect to for this transaction.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="max-h-60 overflow-y-auto">
            {readers.map(r => (
              <div
                key={r.id}
                onClick={() => connectToReader(r)}
                className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer"
              >
                {r.label} ({r.id})
              </div>
            ))}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

       <ManualEntryDialog
        isOpen={isManualEntryOpen}
        onOpenChange={setIsManualEntryOpen}
        onManualItemSubmit={handleManualItemSubmit}
      />

      {managingProduct && (
          <ManageProductDialog 
            product={managingProduct} 
            isOpen={!!managingProduct} 
            onOpenChange={(open) => !open && setManagingProduct(null)}
            onUpdate={() => loadProducts(true)}
          />
      )}

      {selectingProduct && (
          <AddToCartDialog 
            product={selectingProduct} 
            isOpen={!!selectingProduct} 
            onOpenChange={(open) => !open && setSelectingProduct(null)}
            onAdd={addToCart}
          />
      )}
    </div>
  );
}
