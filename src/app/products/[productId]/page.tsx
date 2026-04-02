
"use client";

import { useState, useEffect, Suspense, useRef, use } from "react";
import { fetchProductByIdAction } from "@/lib/actions";
import { notFound } from "next/navigation";
import Image from "next/image";
import { formatPrice, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Star, MessageCircle, Loader2 } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import type { Product, Stock } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useUser, useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

function ProductPageSkeleton() {
  return (
    <div className="container py-8 md:py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        <Skeleton className="w-full aspect-[3/4] rounded-lg" />
        <div className="space-y-6">
          <Skeleton className="h-10 w-3/4" />
          <div className="flex items-center space-x-4">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-6 w-20" />
            <div className="flex gap-2">
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="w-8 h-8 rounded-full" />
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-6 w-20" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-16" />
              <Skeleton className="h-10 w-16" />
            </div>
          </div>
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}

export default function ProductPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      const fetchedProduct = await fetchProductByIdAction(productId);
      if (fetchedProduct) {
        setProduct(fetchedProduct);
      } else {
        setIsLoaded(true);
      }
    }
    fetchProduct();
  }, [productId]);
  
  if (!product) {
    if (isLoaded) notFound();
    return <ProductPageSkeleton />;
  }

  return (
    <Suspense fallback={<ProductPageSkeleton />}>
      <ProductDetail product={product} />
    </Suspense>
  )
}

function ProductDetail({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    product?.colors?.[0]?.name
  );
  
  const getInitialSize = () => {
    if (!product) return undefined;
    
    if (!selectedColor && product.sizes.length > 0) return product.sizes[0];

    const firstAvailableSize = product.sizes?.find(size => 
      product.stock?.some(s => s.color === selectedColor && s.size === size && s.quantity > 0)
    );
    return firstAvailableSize || product.sizes?.[0];
  }

  const [selectedSize, setSelectedSize] = useState<string | undefined>(getInitialSize);
  const [userRating, setUserRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    setSelectedSize(getInitialSize());
  }, [selectedColor, product]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (product.hoverVideo && videoElement) {
      if (isHovered) {
        videoElement.play().catch(error => {
          console.warn("Video play was prevented:", error);
        });
      } else {
        videoElement.pause();
        videoElement.currentTime = 0;
      }
    }
  }, [isHovered, product.hoverVideo]);

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
  }

  const handleAddToCart = () => {
    const stockItem = product.stock?.find(s => s.color === selectedColor && s.size === selectedSize);
    if (stockItem) {
        addToCart(product, undefined, stockItem);
    } else {
        addToCart(product);
    }
  };

  const handleReviewSubmit = async () => {
    if (userRating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a star rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (!reviewComment.trim()) {
      toast({
        title: "Comment required",
        description: "Please share your thoughts in the comment section.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingReview(true);
    try {
      const reviewsRef = collection(firestore, "reviews");
      await addDoc(reviewsRef, {
        productId: product.id,
        productName: product.name,
        rating: userRating,
        comment: reviewComment,
        authorName: user?.displayName || user?.email?.split('@')[0] || "Guest",
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Review submitted!",
        description: "Thank you for your feedback.",
      });
      setReviewComment("");
      setUserRating(0);
    } catch (error) {
      console.error("Error submitting review:", error);
      toast({
        title: "Submission failed",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const selectedStock = product.stock?.find(
    (s) => s.color === selectedColor && s.size === selectedSize
  );

  const totalStock = product.stock.reduce((sum, item) => sum + item.quantity, 0);
  const isOutOfStock = totalStock > 0 ? (selectedStock ? selectedStock.quantity <= 0 : false) : true;
  
  const isSizeAvailableForColor = (size: string, color: string | undefined) => {
    if (!color || !product.stock) return true;
    const stockInfo = product.stock.find(s => s.color === color && s.size === size);
    return stockInfo ? stockInfo.quantity > 0 : false;
  }

  const displayImage = product.images.length > 0 ? product.images[0] : undefined;

  return (
    <div className="container py-8 md:py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        <div 
          className="md:sticky top-24 self-start"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative aspect-[3/4] bg-muted rounded-lg shadow-lg overflow-hidden">
            {displayImage && (
              <Image
                src={displayImage.url}
                alt={product.name}
                fill
                className={cn(
                  "object-cover transition-opacity duration-300",
                  isHovered && product.hoverVideo ? "opacity-0" : "opacity-100"
                )}
                priority
              />
            )}
            {product.hoverVideo && (
              <video
                ref={videoRef}
                src={product.hoverVideo}
                muted
                loop
                playsInline
                className={cn(
                  "absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
                  isHovered ? "opacity-100" : "opacity-0"
                )}
              />
            )}
          </div>
        </div>
        
        <div className="space-y-6">
          <h1 className="text-3xl font-headline tracking-tight sm:text-4xl lg:text-5xl">{product.name}</h1>
          
          <div className="flex items-center space-x-4">
            <p className="text-3xl text-muted-foreground">{formatPrice(product.price)}</p>
            {product.rating && (
              <div className="flex items-center">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-5 w-5",
                        i < Math.floor(product.rating as number) ? "text-yellow-400 fill-current" : "text-gray-300"
                      )}
                    />
                  ))}
                </div>
                <p className="ml-2 text-sm text-muted-foreground">({product.reviewCount} reviews)</p>
              </div>
            )}
          </div>

          <p className="text-base text-muted-foreground">{product.description}</p>

          <div>
            <h3 className="text-lg font-semibold mb-3 underline">Style & Logo Options</h3>
            <div className="flex flex-wrap gap-3">
              {product.colors?.map(color => (
                <button
                  key={color.name}
                  title={color.name}
                  className={cn(
                    "flex flex-col w-24 h-16 rounded-md border-2 overflow-hidden transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
                    selectedColor === color.name ? "border-primary" : "border-gray-200"
                  )}
                  onClick={() => handleColorSelect(color.name)}
                >
                  <div className="flex-1 w-full" style={{ backgroundColor: color.hex }} />
                  <div className="h-7 w-full bg-background flex items-center justify-center text-[9px] font-bold uppercase tracking-tighter leading-none px-1 text-center border-t">
                    {color.logoType}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Sizes</h3>
            <div className="flex flex-wrap gap-2">
              {product.sizes?.map(size => (
                <Button 
                  key={size} 
                  variant={selectedSize === size ? "default" : "outline"}
                  onClick={() => setSelectedSize(size)}
                  disabled={!isSizeAvailableForColor(size, selectedColor)}
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>
          
          <Button size="lg" className="w-full" onClick={handleAddToCart} disabled={isOutOfStock}>
            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </Button>
          
          {product.features && product.features.length > 0 && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold">Features</h3>
              <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                {product.features.map((feature, i) => <li key={i}>{feature}</li>)}
              </ul>
            </div>
          )}

          <div className="border-t pt-6 space-y-4">
            <h3 className="text-lg font-semibold">Write a review</h3>
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-7 w-7 cursor-pointer transition-colors",
                    i < userRating ? "text-yellow-400 fill-current" : "text-gray-300 hover:text-yellow-300"
                  )}
                  onClick={() => setUserRating(i + 1)}
                />
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                {userRating > 0 ? `${userRating} stars` : "Select a rating"}
              </span>
            </div>
            
            <Textarea 
              placeholder="What did you think of this item? Your feedback helps the community!"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className="min-h-[100px]"
            />

            <Button 
              className="w-full sm:w-auto" 
              onClick={handleReviewSubmit}
              disabled={isSubmittingReview}
            >
              {isSubmittingReview ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Submit Review
                </>
              )}
            </Button>
            
            {!user && (
              <p className="text-xs text-muted-foreground text-center sm:text-left italic">
                Note: You are posting as a guest. <Link href="/login" className="underline text-primary">Login</Link> to use your profile name.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
