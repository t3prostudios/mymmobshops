import type { Product } from "@/types";
import ProductCard from "./product-card";
import { Dna } from "lucide-react";

type ProductGridProps = {
  products: Product[];
};

export default function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
        <div className="text-center py-20">
            <Dna className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium text-foreground">No Products Found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your filters to find what you're looking for.
            </p>
        </div>
    )
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
