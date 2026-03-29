
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import ProductList from "@/components/products/product-list";

export default function ProductsPage() {
  return (
    <div className="container py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-headline tracking-tight sm:text-5xl">All Products</h1>
        <p className="mt-2 text-lg text-muted-foreground">Find your next favorite piece in our collection.</p>
      </div>
      <Suspense fallback={<ProductsSkeleton />}>
        <ProductList />
      </Suspense>
    </div>
  );
}

function ProductsSkeleton() {
  return (
    <div className="flex gap-8">
      <div className="w-1/4">
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <div className="w-3/4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-[300px] w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
