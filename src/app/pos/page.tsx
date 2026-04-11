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

// --- HELPERS ---

/**
 * Prevents hydration mismatch by only rendering content after component has mounted on client.
 */
function SafeClientRender({ children, fallback = null }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return fallback;
  return <>{children}</>;
}

function TabBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
      {count > 9 ? '9+' : count}
    </span>
  );
}

// --- DIALOGS ---

function ManageProductDialog({ product, isOpen, onOpenChange, onUpdate }: { product: Product, isOpen: boolean, onOpenChange: (open: boolean) => void, onUpdate: () => void }) {
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [stockState, setStockState] = useState<Stock[]>(product.stock || []);

    useEffect(() => {
        setStockState(product.stock || []);
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
        if (!product || !product.stock) return [];
        return Array.from(new Set(product.stock.map(s => s.color)));
    }, [product]);

    const getColorTotalStock = (color: string) => {
        if (!product || !product.stock) return 0;
        return product.stock
            .filter(s => s.color === color)
            .reduce((sum, s) => sum + s.quantity, 0);
    };

    const availableSizes = useMemo(() => {
        if (!product || !selectedColor || !product.stock) return [];
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

// --- TABS ---

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
                            <p className="font-semibold">{order.customerName || 'Customer'}</p>
                            <p className="text-sm text-muted-foreground">{order.customerEmail || 'No email'}</p>
                            <p className="text-sm font-bold mt-1 capitalize text-blue-600 dark:text-blue-400">{order.deliveryMethod}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-lg">{formatPrice(order.total || 0)}</p>
                            <p className="text-xs text-muted-foreground">
                                <SafeClientRender fallback="...">
                                    {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleString() : 'Just now'}
                                </SafeClientRender>
                            </p>
                        </div>
                        </div>
                        <ul className="text-sm mt-2 space-y-1">
                        {order.orderItems?.map((item, index) => (
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
                            <p className="font-semibold">{order.customerName || 'Customer'}</p>
                            <p className="text-sm text-muted-foreground">{order.customerEmail || 'No email'}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                <SafeClientRender fallback="...">
                                    {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                                </SafeClientRender>
                            </p>
                        </div>
                        <p className="font-medium">{formatPrice(order.total || 0)}</p>
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

function ShippingTab() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(z.object({
        email: z.string().email({ message: 'Please enter a valid email address.' }),
        trackingNumber: z.string().min(1, 'Tracking number is required.'),
    })),
    defaultValues: {
      email: '',
      trackingNumber: '',
    },
  });

  async function onSubmit(values: any) {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('email', values.email);
    formData.append('trackingNumber', values.trackingNumber);

    try {
      const result = await handleShippingNotification(formData);
      if (result?.error) {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
      } else {
        toast({ title: 'Success!', description: `Tracking number sent to ${values.email}.` });
        form.reset();
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to send notification.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
     <div className="p-4">
        <div className="mx-auto max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-headline">Send Shipping Notification</h1>
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
                            <FormControl><Input type="email" placeholder="customer@example.com" {...field} /></FormControl>
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
                            <FormControl><Input placeholder="USPS Tracking #" {...field} /></FormControl>
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
            toast({ title: "Account Deleted", description: `Account for ${userToDelete.firstName} deleted.` });
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to delete account." });
        } finally {
            setUserToDelete(null);
        }
    };

    const filteredUsers = useMemo(() => {
        if (!users) return [];
        if (!searchTerm) return users;
        const lower = searchTerm.toLowerCase();
        return users.filter(user =>
            (user.firstName?.toLowerCase() || '').includes(lower) ||
            (user.lastName?.toLowerCase() || '').includes(lower) ||
            (user.email?.toLowerCase() || '').includes(lower)
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
                    placeholder="Search accounts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                />
            </div>
            <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="space-y-3 pr-4">
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map(u => (
                            <div key={u.id} className="p-4 border rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">{u.firstName} {u.lastName}</p>
                                    <p className="text-sm text-muted-foreground">{u.email}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Joined: <SafeClientRender fallback="...">
                                            {u.registrationDate ? new Date(u.registrationDate).toLocaleDateString() : 'N/A'}
                                        </SafeClientRender>
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="text-right mr-4">
                                    <p className="font-bold text-lg text-primary">{u.loyaltyPoints || 0}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase">Points</p>
                                  </div>
                                  <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setEmailingUser(u)}>
                                    <Mail className="h-4 w-4" />
                                  </Button>
                                  <Button size="icon" variant="outline" className="h-8 w-8" asChild>
                                    <Link href={`/pos/accounts/${u.id}`}>
                                      <Pencil className="h-4 w-4" />
                                    </Link>
                                  </Button>
                                  <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => setUserToDelete(u)}>
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

            {emailingUser && (
                <SendEmailDialog 
                    user={emailingUser} 
                    isOpen={!!emailingUser} 
                    onOpenChange={(open) => !open && setEmailingUser(null)} 
                />
            )}
             <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Account?</AlertDialogTitle>
                        <AlertDialogDescription>Permanently delete account for {userToDelete?.firstName}.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteUser} className={buttonVariants({ variant: "destructive" })}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

function SendEmailDialog({ user, isOpen, onOpenChange }: { user: UserAccount | null, isOpen: boolean, onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);
  
  const form = useForm({
    resolver: zodResolver(z.object({
        subject: z.string().min(1, 'Subject required'),
        message: z.string().min(1, 'Message required'),
    })),
    defaultValues: { subject: '', message: '' },
  });

  async function onSubmit(values: any) {
    if (!user) return;
    setIsSending(true);
    try {
        const formData = new FormData();
        formData.append("customerEmail", user.email);
        formData.append("subject", values.subject);
        formData.append("message", values.message);
        const result = await handleSendPosEmail(formData);
        if (result.error) throw new Error(result.error);
        toast({ title: 'Success', description: 'Email sent.' });
        onOpenChange(false);
    } catch (e: any) {
        toast({ variant: 'destructive', title: 'Error', description: e.message });
    } finally {
        setIsSending(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Email {user?.firstName}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
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
                  <FormControl><Textarea {...field} className="min-h-[150px]" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSending}>
                <Send className="mr-2 h-4 w-4" />
                {isSending ? "Sending..." : "Send"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function ComplaintsTab({ complaints, isLoading }: { complaints: Complaint[] | null, isLoading: boolean }) {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [complaintToResolve, setComplaintToResolve] = useState<Complaint | null>(null);
  const [password, setPassword] = useState('');
  const [isEscalating, setIsEscalating] = useState<string | null>(null);
  
  const handleUpdateStatus = async (complaintId: string, status: any) => {
    if (!firestore) return;
    const complaintRef = doc(firestore, "complaints", complaintId);
    await updateDoc(complaintRef, { status, resolvedAt: status === 'resolved' ? serverTimestamp() : null });
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
        if (result.error) throw new Error(result.error);
        await handleUpdateStatus(complaint.id, 'escalated');
        toast({ title: 'Success', description: 'Complaint escalated.' });
    } catch (e: any) {
        toast({ variant: 'destructive', title: 'Error', description: e.message });
    } finally {
        setIsEscalating(null);
    }
  }

  if (isLoading) return <div className="text-center p-8">Loading complaints...</div>

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-3">Complaints</h2>
      <ScrollArea className="h-[calc(100vh-250px)]">
        <div className="space-y-3">
          {complaints?.map(c => (
            <div key={c.id} className={cn("p-4 border rounded-lg", c.status === 'resolved' && 'opacity-50 grayscale bg-muted')}>
              <div className="flex justify-between">
                <p className="font-semibold">{c.name} <span className="text-xs text-muted-foreground">({c.email})</span></p>
                <SafeClientRender fallback="...">
                    <span className="text-[10px] uppercase">{c.createdAt?.seconds ? new Date(c.createdAt.seconds * 1000).toLocaleDateString() : ''}</span>
                </SafeClientRender>
              </div>
              <p className="text-sm mt-2">{c.issue}</p>
              <div className="flex justify-end gap-2 mt-4">
                {c.status !== 'resolved' && (
                    <>
                        <Button size="sm" variant="outline" onClick={() => onEscalateClick(c)} disabled={isEscalating === c.id}>
                            {isEscalating === c.id ? "..." : "Escalate"}
                        </Button>
                        <Button size="sm" onClick={() => setComplaintToResolve(c)}>Resolve</Button>
                    </>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <AlertDialog open={!!complaintToResolve} onOpenChange={(open) => !open && setComplaintToResolve(null)}>
        <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>Resolve Issue</AlertDialogTitle></AlertDialogHeader>
            <Input type="password" placeholder="Passphrase" value={password} onChange={(e) => setPassword(e.target.value)} />
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => {
                    if (password === 'Murder11500') {
                        handleUpdateStatus(complaintToResolve!.id, 'resolved');
                        setComplaintToResolve(null);
                        setPassword('');
                    } else {
                        toast({ variant: 'destructive', title: 'Wrong Pass' });
                    }
                }}>Submit</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function ReviewsTab({ reviews, isLoading }: { reviews: Review[] | null, isLoading: boolean }) {
  if (isLoading) return <div className="text-center p-8">Loading...</div>
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-3">Product Reviews</h2>
       <ScrollArea className="h-[calc(100vh-250px)]">
        <div className="space-y-3">
          {reviews?.map(r => (
            <div key={r.id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{r.productName}</p>
                  <p className="text-xs text-muted-foreground">by {r.authorName}</p>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className={cn("h-3 w-3", i < (r.rating || 0) ? "text-yellow-400 fill-current" : "text-gray-300")} />
                  ))}
                </div>
              </div>
              <p className="text-sm mt-2 italic">"{r.comment}"</p>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

// --- MAIN PAGE ---

export default function PosPage() {
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [cart, setCart] = useState<any[]>([]);
  const [currentTab, setCurrentTab] = useState("pos");
  const isMobile = useIsMobile();
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
  const [managingProduct, setManagingProduct] = useState<Product | null>(null);
  const [selectingProduct, setSelectingProduct] = useState<Product | null>(null);

  const [reader, setReader] = useState<Reader | null>(null);
  const [readerStatus, setReaderStatus] = useState('idle');
  
  const { firestore, auth, user, isUserLoading } = useFirebase();

  const ordersQuery = useMemoFirebase(() => (firestore && user) ? query(collection(firestore, "orders"), orderBy("createdAt", "desc")) : null, [firestore, user]);
  const usersQuery = useMemoFirebase(() => (firestore && user) ? query(collection(firestore, "users")) : null, [firestore, user]);
  const complaintsQuery = useMemoFirebase(() => (firestore && user) ? query(collection(firestore, "complaints"), orderBy("createdAt", "desc")) : null, [firestore, user]);
  const reviewsQuery = useMemoFirebase(() => (firestore && user) ? query(collection(firestore, "reviews"), orderBy("createdAt", "desc")) : null, [firestore, user]);

  const { data: orders, isLoading: ordersLoading } = useCollection<Order>(ordersQuery);
  const { data: users, isLoading: usersLoading } = useCollection<UserAccount>(usersQuery);
  const { data: complaints, isLoading: complaintsLoading } = useCollection<Complaint>(complaintsQuery);
  const { data: reviews, isLoading: reviewsLoading } = useCollection<Review>(reviewsQuery);
  
  async function loadProducts() {
    setIsSyncing(true);
    setIsLoadingProducts(true);
    try {
      const fetched = await fetchProductsAction();
      setProducts(fetched);
    } finally {
      setIsLoadingProducts(false);
      setIsSyncing(false);
    }
  }

  useEffect(() => { if (user) loadProducts(); }, [user]);

  const handleLogin = async () => {
    if (password === "080808" && auth) {
      try {
        await signInAnonymously(auth);
        toast({ title: "Access Granted" });
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Sign-in failed." });
      }
    } else {
      toast({ variant: "destructive", title: "Denied", description: "Wrong password." });
    }
  };

  const addToCart = (product: Product, color: string, size: string) => {
    const cartItemId = `${product.id}-${color}-${size}`;
    setCart(prev => {
        const existing = prev.find(i => i.id === cartItemId);
        if (existing) {
            return prev.map(i => i.id === cartItemId ? { ...i, quantity: i.quantity + 1 } : i);
        }
        return [...prev, {
            id: cartItemId,
            name: `${product.name} (${color}/${size})`,
            price: product.price,
            quantity: 1,
            productId: product.id,
            color,
            size
        }];
    });
    toast({ title: "Added", description: product.name });
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (isUserLoading) return <div className="p-20 text-center">Loading Admin...</div>;

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted/30">
        <div className="w-full max-w-sm p-8 bg-background border rounded-xl shadow-xl space-y-6">
          <h1 className="text-center text-2xl font-bold">POS Admin</h1>
          <Input type="password" placeholder="Passcode" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
          <Button onClick={handleLogin} className="w-full"><LogIn className="mr-2 h-4 w-4" /> Enter POS</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted/30 min-h-screen">
      <Tabs defaultValue="pos" value={currentTab} onValueChange={setCurrentTab}>
        <div className="p-4 lg:px-8 bg-background border-b shadow-sm sticky top-0 z-10">
          <header className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold">POS Terminal</h1>
              <Button size="sm" variant="outline" onClick={() => loadProducts()} disabled={isSyncing}>
                <RefreshCw className={cn("h-3 w-3 mr-2", isSyncing && "animate-spin")} /> Sync
              </Button>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium opacity-70">
                <span>{reader ? reader.label : 'Offline'}</span>
                {reader ? <Wifi className="h-4 w-4 text-green-500" /> : <WifiOff className="h-4 w-4" />}
            </div>
          </header>
          
          <ScrollArea orientation="horizontal" className="mt-4">
            <TabsList>
                <TabsTrigger value="pos"><ShoppingCart className="mr-2 h-4 w-4" /> POS</TabsTrigger>
                <TabsTrigger value="notifications"><Bell className="mr-2 h-4 w-4" /> Orders <TabBadge count={orders?.filter(o => o.status === 'new').length || 0} /></TabsTrigger>
                <TabsTrigger value="shipping"><Send className="mr-2 h-4 w-4" /> Shipping</TabsTrigger>
                <TabsTrigger value="accounts"><Users className="mr-2 h-4 w-4" /> Accounts</TabsTrigger>
                <TabsTrigger value="complaints"><MessageSquare className="mr-2 h-4 w-4" /> Issues <TabBadge count={complaints?.filter(c => c.status === 'new').length || 0} /></TabsTrigger>
                <TabsTrigger value="reviews"><StarIcon className="mr-2 h-4 w-4" /> Reviews</TabsTrigger>
            </TabsList>
          </ScrollArea>
        </div>

        <TabsContent value="pos" className="container py-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {products.map(p => (
                    <div key={p.id} className="p-4 bg-background border rounded-lg hover:shadow-md transition-shadow group relative">
                        <Button variant="ghost" size="icon" className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 h-7 w-7" onClick={() => setManagingProduct(p)}>
                            <Settings2 className="h-3.5 w-3.5" />
                        </Button>
                        <h3 className="font-bold text-sm truncate">{p.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{formatPrice(p.price)}</p>
                        <Button size="sm" className="w-full mt-4 bg-blue-600 hover:bg-blue-700" onClick={() => setSelectingProduct(p)}>Select</Button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-6 bg-background border rounded-xl shadow-lg sticky top-32">
                    <h2 className="text-lg font-bold mb-4 flex items-center justify-between">
                        Cart
                        {cart.length > 0 && <Button variant="ghost" size="sm" onClick={() => setCart([])} className="h-7 text-xs">Clear</Button>}
                    </h2>
                    <ScrollArea className="h-[300px]">
                        {cart.length === 0 ? <p className="text-center py-10 text-muted-foreground italic text-sm">Cart is empty</p> : (
                            <ul className="space-y-3">
                                {cart.map(i => (
                                    <li key={i.id} className="flex justify-between text-sm border-b pb-2">
                                        <div className="flex-1 pr-4">
                                            <p className="font-medium truncate">{i.name}</p>
                                            <p className="text-xs text-muted-foreground">Qty: {i.quantity}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold">{formatPrice(i.price * i.quantity)}</p>
                                            <button onClick={() => setCart(prev => prev.filter(item => item.id !== i.id))} className="text-[10px] text-destructive underline">Remove</button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </ScrollArea>
                    <div className="pt-4 border-t mt-4">
                        <div className="flex justify-between font-bold text-xl mb-6">
                            <span>Total</span>
                            <span>{formatPrice(total)}</span>
                        </div>
                        <Button className="w-full h-12 text-lg font-bold" disabled={cart.length === 0}>
                            <CreditCard className="mr-2 h-5 w-5" /> Charge Customer
                        </Button>
                    </div>
                </div>
              </div>
            </div>
        </TabsContent>

        <TabsContent value="notifications" className="container py-6">
          <NotificationsTab orders={orders} isLoading={ordersLoading}/>
        </TabsContent>
        <TabsContent value="shipping" className="container py-6">
          <ShippingTab />
        </TabsContent>
        <TabsContent value="accounts" className="container py-6">
          <AccountsTab users={users} isLoading={usersLoading} />
        </TabsContent>
        <TabsContent value="complaints" className="container py-6">
          <ComplaintsTab complaints={complaints} isLoading={complaintsLoading} />
        </TabsContent>
        <TabsContent value="reviews" className="container py-6">
          <ReviewsTab reviews={reviews} isLoading={reviewsLoading} />
        </TabsContent>
      </Tabs>

      {managingProduct && (
          <ManageProductDialog 
            product={managingProduct} 
            isOpen={!!managingProduct} 
            onOpenChange={(open) => !open && setManagingProduct(null)}
            onUpdate={loadProducts}
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