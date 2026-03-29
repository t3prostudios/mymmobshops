
"use client";

import { useCart } from "@/hooks/use-cart";
import { Button } from "../ui/button";
import { Minus, Plus } from "lucide-react";

type UpdateItemQuantityButtonProps = {
  productId: string;
  quantity: number;
};

export default function UpdateItemQuantityButton({
  productId,
  quantity,
}: UpdateItemQuantityButtonProps) {
  const { updateQuantity } = useCart();

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => updateQuantity(productId, quantity - 1)}
      >
        <Minus className="h-4 w-4" />
        <span className="sr-only">Decrease quantity</span>
      </Button>
      <span className="w-6 text-center text-sm font-medium">{quantity}</span>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => updateQuantity(productId, quantity + 1)}
      >
        <Plus className="h-4 w-4" />
        <span className="sr-only">Increase quantity</span>
      </Button>
    </div>
  );
}
