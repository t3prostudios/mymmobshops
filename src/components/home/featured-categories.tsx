
import Link from "next/link";
import { getCategories } from '@/lib/products';

export default async function FeaturedCategories() {
  // Direct mapping of category IDs to their video assets
  const categoryVideos: { [key: string]: { url: string; hint: string } } = {
    'men': { url: '/images/Mens Cat.mp4', hint: 'man model' },
    'adults': { url: '/images/Women-Cat.mp4', hint: 'woman confident' },
    'new-arrivals': { url: '/images/new-arrivs-cat.mp4', hint: 'new arrivals' },
  };

  const categories = await getCategories();
  
  // Define the featured categories explicitly
  const featuredCategoryIds = ['men', 'adults', 'new-arrivals'];
  
  const featuredCategories = featuredCategoryIds.map(id => {
    const category = categories.find(c => c.id === id) || { id, name: id.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) };
    return {
      ...category,
      video: categoryVideos[category.id]
    };
  });

  return (
    <section className="bg-background py-16 sm:py-24">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="font-headline text-3xl sm:text-4xl md:text-5xl">Shop By Category</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {featuredCategories.map((category) => {
            const href = category.id === 'new-arrivals' 
              ? `/products?sort=newest` 
              : `/products?category=${category.id.toLowerCase()}`;
            return (
              <Link key={category.name} href={href} className="group relative aspect-[3/4] overflow-hidden rounded-lg">
                {category.video && (
                  <video
                    src={category.video.url}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                    data-ai-hint={category.video.hint}
                  />
                )}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-300 flex items-center justify-center">
                  <h3 className="font-headline text-2xl text-white">
                    {category.name}
                  </h3>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  );
}

