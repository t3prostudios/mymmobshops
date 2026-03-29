
"use client";

import { useState, useEffect } from "react";
import ProductFilters from "@/components/products/product-filters";
import ProductGrid from "@/components/products/product-grid";
import { fetchProductsAction, fetchFilterOptionsAction } from "@/lib/actions";
import type { FilterOptions as FilterOptionsType, Product } from "@/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "../ui/skeleton";

export default function ProductList() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [filterOptions, setFilterOptions] = useState<any>(null);
  const [filters, setFilters] = useState<FilterOptionsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const [fetchedProducts, fetchedFilterOptions] = await Promise.all([
        fetchProductsAction(),
        fetchFilterOptionsAction(),
      ]);
      
      setProducts(fetchedProducts);
      setFilterOptions(fetchedFilterOptions);
      
      setFilters({
        sizes: [],
        colors: [],
        styles: categoryParam ? [categoryParam] : [],
        price: fetchedFilterOptions.priceRange,
      });
      setIsLoading(false);
    }
    fetchData();
  }, [categoryParam]);
  
  const filteredProducts = products.filter((product) => {
    if (!filters) return true;
    const { sizes, colors, styles, price } = filters;
    const [minPrice, maxPrice] = price;

    const sizeMatch = sizes.length === 0 || product.sizes.some(s => sizes.includes(s));
    const colorMatch = colors.length === 0 || product.colors.some(c => colors.includes(c.name));
    const styleMatch = styles.length === 0 || styles.includes(product.category);
    const priceMatch = product.price >= minPrice && product.price <= maxPrice;
    
    return sizeMatch && colorMatch && styleMatch && priceMatch;
  });

  if (isLoading || !filters || !filterOptions) {
    return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-lg" />)}
    </div>;
  }

  const filtersComponent = (
    <ProductFilters
        options={filterOptions}
        filters={filters}
        onFilterChange={(f) => setFilters(prev => prev ? ({ ...prev, ...f }) : null)}
        onReset={() => setFilters({ sizes: [], colors: [], styles: categoryParam ? [categoryParam] : [], price: filterOptions.priceRange })}
    />
  );

  return (
    <div className="flex gap-8">
      {isMobile ? (
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button className="md:hidden fixed bottom-4 left-4 z-40 shadow-lg rounded-full h-14 w-14">
              <Filter className="h-6 w-6" /><span className="sr-only">Filters</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-4/5">{filtersComponent}</SheetContent>
        </Sheet>
      ) : (
        <aside className="w-1/4">{filtersComponent}</aside>
      )}
      <div className="flex-1"><ProductGrid products={filteredProducts} /></div>
    </div>
  );
}
