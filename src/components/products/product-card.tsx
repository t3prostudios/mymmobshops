
"use client";

import Image from "next/image";
import type { Product, ProductVariant } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [activeVariantId, setActiveVariantId] = useState<string | undefined>(
    product.variants ? product.variants[0].id : undefined
  );

  const activeVariant = product.variants?.find(v => v.id === activeVariantId);
  
  const allImages = product.images.length > 0 ? [product.images[0], ...(product.alternateImages || [])] : [];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const hasSlideshow = allImages.length > 1 && !product.hoverVideo && !product.variants;

  const totalStock = useMemo(() => {
    if (!product.stock || product.stock.length === 0) {
      return 0;
    }
    return product.stock.reduce((total, stockItem) => total + stockItem.quantity, 0);
  }, [product.stock]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    if (hasSlideshow) {
      intervalId = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % allImages.length);
      }, 8000);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [hasSlideshow, allImages.length]);


  const displayName = activeVariant ? activeVariant.name : product.name;
  const displayPrice = activeVariant ? activeVariant.price : product.price;
  const displayImage = activeVariant ? activeVariant.image : (allImages.length > 0 ? allImages[currentImageIndex] : undefined);
  const displayHoverVideo = activeVariant ? activeVariant.hoverVideo : product.hoverVideo;

  useEffect(() => {
    const videoElement = videoRef.current;
    if (displayHoverVideo && videoElement) {
      if (isHovered || !displayImage) {
        videoElement.play().catch(error => {
          console.warn("Video play was prevented:", error);
        });
      } else {
        videoElement.pause();
        videoElement.currentTime = 0;
      }
    }
  }, [isHovered, displayHoverVideo, displayImage]);
  
  const isOutOfStock = totalStock <= 0;

  return (
    <Card 
      className="overflow-hidden h-full flex flex-col group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-[3/4] bg-muted">
          {hasSlideshow ? (
            allImages.map((image, index) => (
              <Image
                key={image.id}
                src={image.url}
                alt={product.name}
                fill
                className={cn(
                  "object-cover transition-opacity duration-1000",
                  index === currentImageIndex ? "opacity-100" : "opacity-0"
                )}
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                data-ai-hint={image.hint}
                priority={product.id === 'prod_QJkM5qQWqY6LgS'}
              />
            ))
          ) : (
            <>
              {displayImage && (
                <Image
                  src={displayImage.url}
                  alt={displayName}
                  fill
                  className={cn(
                    "object-cover transition-opacity duration-300",
                    isHovered && displayHoverVideo ? "opacity-0" : "opacity-100"
                  )}
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  data-ai-hint={displayImage.hint}
                />
              )}
              {displayHoverVideo && (
                <video
                  ref={videoRef}
                  src={displayHoverVideo}
                  muted
                  loop
                  playsInline
                  className={cn(
                    "absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
                    (isHovered || !displayImage) ? "opacity-100" : "opacity-0"
                  )}
                />
              )}
            </>
          )}
           {isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white font-bold bg-black/50 px-4 py-2 rounded-md">Out of Stock</span>
            </div>
          )}
        </div>
      </Link>
      <CardContent className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-lg">{displayName}</h3>
          <p className="text-muted-foreground">{formatPrice(displayPrice)}</p>
        </div>
        
        {product.variants && (
          <div className="flex justify-center gap-2 my-4">
            {product.variants.map((variant) => (
              <Button 
                key={variant.id} 
                variant={activeVariantId === variant.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveVariantId(variant.id)}
              >
                {variant.type}
              </Button>
            ))}
          </div>
        )}

        <Button 
          className="w-full mt-4" 
          onClick={() => addToCart(product, activeVariant)}
          disabled={isOutOfStock}
        >
          <ShoppingBag className="mr-2 h-4 w-4" />
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </CardContent>
    </Card>
  );
}
