
"use client";

import { createContext, useState, useEffect, useMemo, type ReactNode } from "react";
import type { CartItem, Product, ProductVariant, ShippingAddress } from "@/types";
import { useToast } from "@/hooks/use-toast";

export type Discount = {
  label: string;
  type: "fixed" | "percentage" | "bogo";
  value: number;
  minimumPurchase?: number;
  bogoCategories?: string[];
} | null;

const FREE_SHIPPING_THRESHOLD = 100;

const getShippingRate = (weightInOz: number, country: string): number => {
    const isCanadaOrUS = ['CA', 'US'].includes(country.toUpperCase());

    if (weightInOz <= 8) return 10.99;
    if (weightInOz <= 16) return 13.99;
    if (weightInOz <= 32) return 17.99;
    if (weightInOz <= 48) return 21.99;
    if (weightInOz <= 64) return 28.99;
    
    return isCanadaOrUS ? 28.99 : 37.99;
};


interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, variant?: ProductVariant | Product['variants'][0], stockItem?: any, options?: { openCart?: boolean }) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  subtotal: number;
  shippingCost: number | null;
  cartCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  discount: Discount;
  appliedDiscountValue: number;
  applyDiscount: (discount: Discount) => void;
  bogoEligibleItems: CartItem[];
  bogoSelection: string | null;
  setBogoSelection: (itemId: string | null) => void;
  isBogoChoiceRequired: boolean;
  setShippingAddress: (address: ShippingAddress | null) => void;
  lastPurchaseTimestamp: number | null;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [discount, setDiscount] = useState<Discount>(null);
  const [bogoSelection, setBogoSelection] = useState<string | null>(null);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [lastPurchaseTimestamp, setLastPurchaseTimestamp] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const storedCart = localStorage.getItem("vogueverse-cart");
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
    const storedDiscount = localStorage.getItem('vogueverse-discount');
    if (storedDiscount) {
      setDiscount(JSON.parse(storedDiscount));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("vogueverse-cart", JSON.stringify(cartItems));
    setBogoSelection(null);
  }, [cartItems]);

  useEffect(() => {
    if (discount) {
      localStorage.setItem('vogueverse-discount', JSON.stringify(discount));
    } else {
      localStorage.removeItem('vogueverse-discount');
    }
    setBogoSelection(null);
  }, [discount]);

  const applyDiscount = (newDiscount: Discount) => {
    setDiscount(newDiscount);
  };
  
  const clearCart = () => {
    setCartItems([]);
    setLastPurchaseTimestamp(Date.now());
  };

  const addToCart = (product: Product, variant?: ProductVariant | Product['variants'][0], stockItem?: any, options?: { openCart?: boolean }) => {
    const { openCart = true } = options || {};

    const itemToAdd: Product & { variant?: ProductVariant | Product['variants'][0] } = { ...product };
    let itemId = product.id;
    let itemName = product.name;
    let itemWeight = product.weight;
    
    if (variant) {
        itemId = variant.id
        itemName = variant.name;
        itemWeight = variant.weight || product.weight;
    } else if (stockItem) {
        itemId = `${product.id}-${stockItem.color}-${stockItem.size}`;
        itemName = `${product.name} (${stockItem.color}, ${stockItem.size})`;
        itemWeight = stockItem.weight || product.weight;
    }


    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === itemId);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      const newProduct = { ...product, name: itemName, weight: itemWeight };
      if (variant) {
        (newProduct as any).variant = variant;
      }
      return [...prevItems, { id: itemId, product: newProduct, quantity: 1 }];
    });
    toast({
      title: "Added to cart",
      description: `${itemName} has been added to your cart.`,
    });
    
    if(openCart) {
      setIsCartOpen(true);
    }
  };

  const removeFromCart = (itemId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const subtotal = useMemo(() => 
    cartItems.reduce(
      (total, item) => total + (item.product.variant?.price ?? item.product.price) * item.quantity,
      0
    ), [cartItems]);

  const bogoEligibleItems = useMemo(() => 
    discount?.type === 'bogo'
      ? cartItems.filter(item => discount.bogoCategories?.includes(item.product.category))
      : [], 
    [cartItems, discount]);

  const appliedDiscountValue = useMemo(() => {
    if (!discount) return 0;

    switch (discount.type) {
      case 'fixed':
        return discount.value;
      case 'percentage':
        if (!discount.minimumPurchase || subtotal >= discount.minimumPurchase) {
          return subtotal * discount.value;
        }
        return 0;
      case 'bogo':
        if (bogoEligibleItems.length < 2) return 0;

        let itemToDiscount = null;
        if (bogoSelection) {
          itemToDiscount = bogoEligibleItems.find(i => i.id === bogoSelection);
        } else {
          const eligibleCategories = [...new Set(bogoEligibleItems.map(item => item.product.category))];
          if (eligibleCategories.length === 1) {
            itemToDiscount = bogoEligibleItems.sort((a, b) => (a.product.price) - (b.product.price))[0];
          }
        }

        if (itemToDiscount) {
          const price = itemToDiscount.product.variant?.price ?? itemToDiscount.product.price;
          return price * discount.value;
        }
        return 0;
      default:
        return 0;
    }
  }, [discount, subtotal, bogoEligibleItems, bogoSelection]);
  
  const isBogoChoiceRequired = 
    discount?.type === 'bogo' &&
    bogoEligibleItems.length >= 2 &&
    !bogoSelection &&
    [...new Set(bogoEligibleItems.map(i => i.product.category))].length > 1;

  const cartWeight = useMemo(() => cartItems.reduce((total, item) => {
    const weight = item.product.weight || 0;
    return total + (weight * item.quantity);
  }, 0), [cartItems]);

  const shippingCost = useMemo(() => {
    if (subtotal === 0) return 0;
    if (shippingAddress?.city.toLowerCase().includes('sacramento') && shippingAddress?.state.toLowerCase() === 'ca' && subtotal >= FREE_SHIPPING_THRESHOLD) {
      return 0;
    }
    if (shippingAddress) {
      return getShippingRate(cartWeight, shippingAddress.country);
    }
    return null;
  }, [subtotal, cartWeight, shippingAddress]);

  const cartTotal = useMemo(() => {
    const total = subtotal - appliedDiscountValue + (shippingCost || 0);
    return total > 0 ? total : 0;
  }, [subtotal, appliedDiscountValue, shippingCost]);
  
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        subtotal,
        shippingCost,
        cartCount,
        isCartOpen,
        setIsCartOpen,
        discount,
        appliedDiscountValue,
        applyDiscount,
        bogoEligibleItems,
        bogoSelection,
        setBogoSelection,
        isBogoChoiceRequired,
        setShippingAddress,
        lastPurchaseTimestamp,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
