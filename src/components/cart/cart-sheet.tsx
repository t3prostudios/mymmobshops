

"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import UpdateItemQuantityButton from "./update-item-quantity-button";
import { Trash2, ShoppingBag } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function CartSheet({ children }: { children: React.ReactNode }) {
  const {
    cartItems,
    cartTotal,
    subtotal,
    shippingCost,
    removeFromCart,
    isCartOpen,
    setIsCartOpen,
    cartCount,
    discount,
    appliedDiscountValue,
    bogoEligibleItems,
    bogoSelection,
    setBogoSelection,
    isBogoChoiceRequired,
  } = useCart();

  const isDiscountApplied = appliedDiscountValue > 0;

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      {children}
      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
        <SheetHeader className="px-6">
          <SheetTitle>Cart ({cartCount})</SheetTitle>
        </SheetHeader>
        {cartItems.length > 0 ? (
          <>
            <ScrollArea className="flex-1">
              <div className="flex flex-col gap-6 px-6 py-4">
                {cartItems.map((item) => {
                  const image = item.product.variant?.image || item.product.images[0];
                  const price = item.product.variant?.price ?? item.product.price;
                  return (
                    <div key={item.id} className="flex items-start gap-4">
                      <div className="relative h-24 w-24 overflow-hidden rounded-md">
                        {image && (
                          <Image
                            src={image.url}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.product.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatPrice(price)}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <UpdateItemQuantityButton
                            productId={item.id}
                            quantity={item.quantity}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remove item</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
             {isBogoChoiceRequired && (
                <div className="px-6 py-4 border-t bg-amber-50">
                  <h4 className="font-semibold text-amber-900">Choose Your BOGO Discount</h4>
                  <p className="text-sm text-amber-800 mb-4">You have multiple items eligible for the BOGO discount. Please select one to apply the 50% off.</p>
                  <RadioGroup value={bogoSelection || undefined} onValueChange={setBogoSelection}>
                    {bogoEligibleItems.map(item => (
                      <div key={item.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={item.id} id={item.id} />
                        <Label htmlFor={item.id} className="flex-1 text-sm">
                          {item.product.name} ({formatPrice(item.product.variant?.price ?? item.product.price)})
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}
            <SheetFooter className="px-6 py-4 border-t">
              <div className="w-full space-y-2">
                 <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                
                {discount && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Discount ({discount.label})</span>
                    {isDiscountApplied ? (
                      <span className="text-green-600">-{formatPrice(appliedDiscountValue)}</span>
                    ) : (
                       <span className="text-xs">
                        {discount.type === 'bogo' 
                          ? "Add an eligible item to cart" 
                          : `(min. ${formatPrice(discount.minimumPurchase as number)} purchase)`}
                      </span>
                    )}
                  </div>
                )}
                
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="text-xs">
                    {shippingCost === null ? 'Calculated at checkout' : (shippingCost > 0 ? formatPrice(shippingCost) : 'Free')}
                  </span>
                </div>

                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <Button asChild size="lg" className="w-full" disabled={isBogoChoiceRequired && !bogoSelection}>
                  <Link href="/checkout" onClick={() => setIsCartOpen(false)}>Proceed to Checkout</Link>
                </Button>
                 {isBogoChoiceRequired && !bogoSelection && (
                  <p className="text-xs text-center text-red-600">Please select an item for your BOGO discount before proceeding.</p>
                )}
              </div>
            </SheetFooter>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <ShoppingBag className="h-20 w-20 text-muted-foreground/50" strokeWidth={1} />
            <h3 className="text-xl font-semibold">Your cart is empty</h3>
            <p className="text-muted-foreground">Looks like you haven't added anything yet.</p>
            <Button asChild onClick={() => setIsCartOpen(false)}>
              <Link href="/products">Start Shopping</Link>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
