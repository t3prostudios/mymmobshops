
"use client";

import { useState, useEffect, useMemo } from "react";
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
      try {
        const [fetchedProducts, fetchedFilterOptions] = await Promise.all([
          fetchProductsAction(),
          fetchFilterOptionsAction(),
        ]);
        
        setProducts(fetchedProducts);
        setFilterOptions(fetchedFilterOptions);
        
        // Check if categoryParam is actually a category we have in data
        const isStyleValid = categoryParam && fetchedFilterOptions.styles.includes(categoryParam);

        setFilters({
          sizes: [],
          colors: [],
          styles: isStyleValid ? [categoryParam] : [],
          price: fetchedFilterOptions.priceRange,
        });
      } catch (error) {
        console.error("Failed to load products or filter options:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [categoryParam]);
  
  const filteredProducts = useMemo(() => {
    if (!filters || products.length === 0) return products;

    const { sizes, colors, styles, price } = filters;
    const [minPrice, maxPrice] = price;

    return products.filter((product) => {
      const sizeMatch = sizes.length === 0 || product.sizes.some(s => sizes.includes(s));
      const colorMatch = colors.length === 0 || product.colors.some(c => colors.includes(c.name));
      const styleMatch = styles.length === 0 || styles.includes(product.category);
      const priceMatch = product.price >= minPrice && product.price <= maxPrice;
      
      return sizeMatch && colorMatch && styleMatch && priceMatch;
    });
  }, [products, filters]);

  const handleReset = () => {
    if (filterOptions) {
      setFilters({
        sizes: [],
        colors: [],
        styles: [], // Clear all category/style filters on manual reset
        price: filterOptions.priceRange
      });
    }
  };

  if (isLoading || !filters || !filterOptions) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="aspect-[3/4] w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  const filtersComponent = (
    <ProductFilters
        options={filterOptions}
        filters={filters}
        onFilterChange={(f) => setFilters(prev => prev ? ({ ...prev, ...f }) : null)}
        onReset={handleReset}
    />
  );

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {isMobile ? (
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button className="md:hidden fixed bottom-4 left-4 z-40 shadow-lg rounded-full h-14 w-14">
              <Filter className="h-6 w-6" />
              <span className="sr-only">Filters</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-4/5 overflow-y-auto">
            <div className="py-4">{filtersComponent}</div>
          </SheetContent>
        </Sheet>
      ) : (
        <aside className="w-full md:w-1/4 shrink-0">
          <div className="sticky top-24">{filtersComponent}</div>
        </aside>
      )}
      <div className="flex-1">
        <div className="mb-4 flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
          </p>
        </div>
        <ProductGrid products={filteredProducts} />
      </div>
    </div>
  );
}
