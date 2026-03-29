
"use client";

import Link from 'next/link';
import { Menu, ShoppingCart, User, ChevronDown, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import Logo from '@/components/ui/logo';
import { useCart } from '@/hooks/use-cart';
import CartSheet from '../cart/cart-sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogTitle, DialogTrigger, DialogHeader } from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { fetchProductsAction } from '@/lib/actions';
import type { Product } from '@/types';
import ProductCard from '../products/product-card';
import { ScrollArea } from '../ui/scroll-area';
import { useUser } from '@/firebase';

export default function Header() {
  const { cartCount, isCartOpen, setIsCartOpen } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user } = useUser();
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function initProducts() {
      const products = await fetchProductsAction();
      setAllProducts(products);
    }
    initProducts();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 1) {
      const filteredProducts = allProducts.filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filteredProducts);
    } else {
      setSearchResults([]);
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-[100px] items-center justify-between">
        <nav className="hidden md:flex md:items-center md:gap-6 text-sm font-medium">
          <Link href="/" className="transition-colors hover:text-foreground/80 text-foreground/60">Home</Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="transition-colors hover:text-foreground/80 text-foreground/60 px-0 hover:bg-transparent">
                Shop
                <ChevronDown className="relative top-[1px] ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Shop</DropdownMenuLabel>
                <DropdownMenuItem asChild><Link href="/products?category=tops">Tops</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/products?category=bottoms">Bottoms</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/products?category=hats">Hats</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/products?category=bundles">Bundles</Link></DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href="/create-your-look" className="transition-colors hover:text-foreground/80 text-foreground/60">Create Your Look</Link>
        </nav>
        
        <div className="md:hidden">
            <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Navigation</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left">
                <SheetHeader><SheetTitle className="sr-only">Mobile Navigation</SheetTitle></SheetHeader>
                <div className="flex flex-col gap-4 p-4">
                <Logo />
                <nav className="grid gap-2 text-lg font-medium">
                    <Link href="/" className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">Home</Link>
                    <Link href="/products" className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">Shop</Link>
                    <Link href="/create-your-look" className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">Create Your Look</Link>
                </nav>
                </div>
            </SheetContent>
            </Sheet>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2">
          <Logo />
        </div>

        <div className="flex items-center justify-end gap-2">
           <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] md:max-w-xl lg:max-w-2xl max-h-[80vh] flex flex-col">
              <DialogHeader><DialogTitle>Search Products</DialogTitle></DialogHeader>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Search for products..." value={searchQuery} onChange={handleSearch} className="pl-10" />
              </div>
                <ScrollArea className="flex-grow">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
                  {searchQuery.length > 1 && searchResults.length > 0 && searchResults.map(product => (
                    <div key={product.id} onClick={() => setIsSearchOpen(false)}>
                      <Link href={`/products/${product.id}`}><ProductCard product={product} /></Link>
                    </div>
                  ))}
                  </div>
                  {searchQuery.length > 1 && searchResults.length === 0 && (
                    <p className="text-center text-muted-foreground py-10">No products found for "{searchQuery}".</p>
                  )}
              </ScrollArea>
            </DialogContent>
          </Dialog>

          <Button variant="ghost" size="icon" asChild>
            <Link href={user ? "/profile" : "/login"}>
              <User className="h-5 w-5" />
              <span className="sr-only">Account</span>
            </Link>
          </Button>

          <CartSheet>
            <Button variant="ghost" size="icon" className="relative" onClick={() => setIsCartOpen(!isCartOpen)}>
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{cartCount}</span>}
              <span className="sr-only">Shopping Cart</span>
            </Button>
          </CartSheet>
        </div>
      </div>
    </header>
  );
}
