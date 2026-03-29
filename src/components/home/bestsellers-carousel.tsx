
import { getBestsellers } from '@/lib/products';
import ProductCard from '../products/product-card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

export default async function BestsellersCarousel() {
  const bestsellers = await getBestsellers();

  return (
    <section className="bg-background py-12 md:py-24">
      <div className="container">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-headline tracking-tight sm:text-4xl md:text-5xl">Shop Best-Sellers</h2>
          <p className="mt-3 max-w-md mx-auto text-muted-foreground sm:text-lg md:mt-4 md:text-xl">
            Discover our most-loved pieces, curated for you.
          </p>
        </div>
        <Carousel
          opts={{
            align: 'start',
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {bestsellers.map((product) => (
              <CarouselItem key={product.id} className="md:basis-1/2 lg:basis-1/4">
                <div className="p-1 h-full">
                  <ProductCard product={product} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      </div>
    </section>
  );
}
