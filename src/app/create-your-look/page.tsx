
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { fetchProductsAction } from '@/lib/actions';
import type { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const colors = [
  { name: 'Grey', code: '1', hex: '#808080' },
  { name: 'Baby Blue', code: '2', hex: '#ADD8E6' },
  { name: 'Red', code: '3', hex: '#FF0000' },
  { name: 'Black', code: '4', hex: '#000000' },
];

const itemTypes = [
  { name: 'Hats', code: '04' },
  { name: 'Sweatshirts', code: '01' },
  { name: 'Sweatpants', code: '02' },
  { name: 'Full', code: '07' },
];

const layerOrder = {
  '02': 1, // Sweatpants
  '01': 2, // Sweatshirts
  '04': 3, // Hats
  '07': 0, // Full outfit
};

const productMapping: Record<string, string> = {
  '04': 'prod_Tm0HnmbMNAV5Ab', // Hats -> Trucker Hats
  '01': 'prod_TlOIBgsfsOT6Ac', // Sweatshirts -> Graphic Hoodie
  '02': 'prod_TlO33CirJ52rIb', // Sweatpants -> Adult Joggers
  '07': 'prod_TlOIBgsfsOT6Ac_set', // Full -> Jogger Set
};

export default function CreateYourLookPage() {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [selectedMobileCategory, setSelectedMobileCategory] = useState<string>(itemTypes[0].code);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
        const fetchedProducts = await fetchProductsAction();
        setProducts(fetchedProducts);
        setIsLoading(false);
    };
    fetchProducts();
  }, []);

  const handleSelection = (itemCode: string, colorCode: string) => {
    setSelections(prev => {
      const newSelections = { ...prev };

      if (itemCode === '07') {
        // If a full outfit is selected, clear individual items
        delete newSelections['04'];
        delete newSelections['01'];
        delete newSelections['02'];
        // Toggle the full outfit selection
        if (prev['07'] === colorCode) {
          delete newSelections['07'];
        } else {
          newSelections['07'] = colorCode;
        }
      } else {
        // If an individual item is selected, clear the full outfit selection
        delete newSelections['07'];
        // Toggle the individual item selection
        if (prev[itemCode] === colorCode) {
          delete newSelections[itemCode];
        } else {
          newSelections[itemCode] = colorCode;
        }
      }

      return newSelections;
    });
  };

  const handleAddToCart = (product: Product, colorName: string) => {
    // Find the first available stock item for the selected color
    const stockItem = product.stock.find(
      (s) => s.color.toLowerCase() === colorName.toLowerCase() && s.quantity > 0
    );

    if (stockItem) {
      addToCart(product, undefined, stockItem, { openCart: false });
    } else {
      toast({
        variant: "destructive",
        title: "Out of Stock",
        description: `The ${colorName} ${product.name} is currently out of stock.`,
      });
    }
  };


  const clearSelection = (itemCode: string) => {
    setSelections(prev => {
      const newSelections = { ...prev };
      delete newSelections[itemCode];
      return newSelections;
    });
  };
  
  const YourLookSection = ({ isMobile = false }: { isMobile?: boolean }) => {
    if (isLoading) {
      return (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      )
    }

    return (
       <>
        {Object.keys(selections).length > 0 ? (
            <ul className="mt-2 space-y-3">
              {Object.entries(selections).map(([itemCode, colorCode]) => {
                const productId = productMapping[itemCode];
                const product = products.find(p => p.id === productId);
                const item = itemTypes.find(i => i.code === itemCode);
                const color = colors.find(c => c.code === colorCode);
                
                if (product && item && color) {
                  const displayImage = product.images[0];
                  const displayPrice = product.price;

                  return (
                     <li key={itemCode} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {displayImage && <Image src={displayImage.url} alt={product.name} width={isMobile ? 40 : 48} height={isMobile ? 53 : 64} className="rounded-md object-cover bg-muted" />}
                          <div className="min-w-0">
                            <p className="font-semibold text-sm truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{formatPrice(displayPrice)}</p>
                            <p className="text-xs text-muted-foreground">Color: {color.name}</p>
                          </div>
                        </div>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-9 w-9 flex-shrink-0"
                          onClick={() => handleAddToCart(product, color.name)}
                          aria-label={`Add ${product.name} to cart`}
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </Button>
                      </li>
                  );
                }

                if (item && color) {
                  return <li key={itemCode} className="text-muted-foreground">{color.name} {item.name}</li>;
                }
                return null;
              })}
            </ul>
          ) : (
            <p className="text-muted-foreground mt-2 text-center md:text-left">Select items to create your look.</p>
          )}
       </>
    )
  }

  const desktopWardrobe = (
    <div className="md:col-span-1 hidden md:block space-y-8">
      <div className="p-4 bg-background border rounded-lg shadow-sm">
        <h2 className="text-xl font-bold mb-4">Your Wardrobe</h2>
        {itemTypes.map(item => (
          <div key={item.code} className="mt-4">
            <h3 className="text-lg font-semibold">{item.name}</h3>
            <div className="flex items-center space-x-2 mt-2">
              {colors.map(color => (
                <button
                  key={color.code}
                  onClick={() => handleSelection(item.code, color.code)}
                  className={cn(
                    'w-8 h-8 rounded-full border-2 transition-transform',
                    selections[item.code] === color.code ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:scale-110'
                  )}
                  style={{ backgroundColor: color.hex }}
                  aria-label={`Select ${color.name} ${item.name}`}
                />
              ))}
              <button
                onClick={() => clearSelection(item.code)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 bg-background border rounded-lg shadow-sm">
        <h2 className="text-xl font-bold">Your Look</h2>
        <YourLookSection />
      </div>
    </div>
  );

  const mobileWardrobe = (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-background/95 backdrop-blur-sm border-t">
        <Tabs defaultValue="wardrobe" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="wardrobe">Wardrobe</TabsTrigger>
                <TabsTrigger value="your-look">Your Look ({Object.keys(selections).length})</TabsTrigger>
            </TabsList>
            <TabsContent value="wardrobe" className="p-4 max-h-[30vh]">
                 <div className="space-y-4">
                  <Select value={selectedMobileCategory} onValueChange={setSelectedMobileCategory}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select an apparel category" />
                    </SelectTrigger>
                    <SelectContent>
                      {itemTypes.map(item => (
                        <SelectItem key={item.code} value={item.code}>{item.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedMobileCategory && (
                     <div className="flex items-center space-x-2 mt-2">
                        {colors.map(color => (
                          <button
                            key={color.code}
                            onClick={() => handleSelection(selectedMobileCategory, color.code)}
                            className={cn(
                              'w-8 h-8 rounded-full border-2 flex-shrink-0',
                              selections[selectedMobileCategory] === color.code ? 'ring-2 ring-offset-2 ring-primary' : ''
                            )}
                            style={{ backgroundColor: color.hex }}
                            aria-label={`Select ${color.name} ${itemTypes.find(i => i.code === selectedMobileCategory)?.name}`}
                          />
                        ))}
                        <button
                          onClick={() => clearSelection(selectedMobileCategory)}
                          className="text-sm text-muted-foreground hover:text-foreground pl-2"
                        >
                          Clear
                        </button>
                      </div>
                  )}
                </div>
            </TabsContent>
            <TabsContent value="your-look" className="p-4 max-h-[30vh]">
                 <ScrollArea className="h-full">
                    <YourLookSection isMobile={true} />
                </ScrollArea>
            </TabsContent>
        </Tabs>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <h1 className="text-center font-headline text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
        Create Your Look
      </h1>
      <p className="mt-4 text-center text-lg text-muted-foreground">
        Mix and match items to create your perfect outfit.
      </p>
      <div className="mt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {desktopWardrobe}
          <div className="md:col-span-2 relative aspect-[9/16] w-full mx-auto md:max-w-md">
            <div className="absolute inset-0 transform scale-[1] translate-x-[0rem] translate-y-[0rem]">
              <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover -z-20 transform scale-[1] translate-x-[0rem] translate-y-[0rem]">
                <source src="/Create-Ur-look/mmob-sc00.mp4" type="video/mp4" />
              </video>
              
              <Image 
                  src="/images/mmob-display00.png" 
                  alt="Base model stand" 
                  fill 
                  className="object-contain -z-10 transform scale-[1] translate-x-[-0.11rem] translate-y-[2.4rem]" 
              />
              
              <Image 
                  src="/Create-Ur-look/0000.png" 
                  alt="Base model" 
                  fill 
                  className="object-contain transform scale-[1] translate-x-[-.28rem] translate-y-[2rem]" 
                  priority 
              />

              {Object.keys(selections)
                  .sort((a, b) => (layerOrder[a as keyof typeof layerOrder] || 0) - (layerOrder[b as keyof typeof layerOrder] || 0))
                  .map(itemCode => {
                      const colorCode = selections[itemCode];
                      if (colorCode) {
                          const imageDirectory = itemCode === '07' ? '/Create-Ur-look/' : '/Create-Ur-look-Trans/';
                          let imageName;
                          if (itemCode === '07') {
                              imageName = `${colorCode}070`;
                          } else if (itemCode === '04') {
                              if (colorCode === '1') imageName = '1040';
                              else if (colorCode === '2') imageName = '2040';
                              else if (colorCode === '3') imageName = '3040';
                              else if (colorCode === '4') imageName = '4040';
                          } else {
                              imageName = `${colorCode}${itemCode}`;
                          }
                          const imagePath = `${imageDirectory}${imageName}.png`;
                          return <Image key={imagePath} src={imagePath} alt="" fill className="object-contain transform scale-[1] translate-x-[-0.3rem] translate-y-[2rem]" />;
                      }
                      return null;
              })}
            </div>
          </div>
        </div>
      </div>
      {mobileWardrobe}
      <div className="md:hidden h-48"></div>
    </div>
  );
}
