
import Image from 'next/image';
import { getStripeProducts } from '@/lib/stripe';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Image as ImageType } from '@/types';

export default async function MovementPage() {
  const allProducts = await getStripeProducts();
  
  const socialImages = allProducts.reduce((acc: ImageType[], product) => {
    const allImages = [...product.images, ...(product.alternateImages || [])];
    const productSocialImages = allImages.filter(img => img.id.startsWith('social-'));
    return [...acc, ...productSocialImages];
  }, []);

  return (
    <div className="container py-12 md:py-20">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-headline tracking-tight sm:text-5xl">
          The Movement in Action
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          See how our community styles their favorite pieces. Tag @M.M.O.B to be featured!
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
        {socialImages.map(image => (
          <Dialog key={image.id}>
            <DialogTrigger asChild>
              <div className="group relative block overflow-hidden rounded-lg cursor-pointer">
                <Image
                  src={image.url}
                  alt={image.description}
                  width={500}
                  height={500}
                  className="aspect-square w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  data-ai-hint={image.hint}
                />
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-3xl p-0">
                <DialogHeader className='sr-only'>
                    <DialogTitle>Social media post by {image.author || '@vogueverse_style'}</DialogTitle>
                    <DialogDescription>{image.description}</DialogDescription>
                </DialogHeader>
              <div className="flex flex-col md:flex-row">
                <div className="md:w-2/3">
                  <Image
                    src={image.url}
                    alt={image.description}
                    width={800}
                    height={800}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="p-6 md:w-1/3 flex flex-col">
                  <h3 className="font-bold">{image.author || '@vogueverse_style'}</h3>
                  <ScrollArea className="flex-grow mt-2 max-h-[calc(80vh-100px)]">
                    <p className="text-sm text-muted-foreground pr-4">{image.description}</p>
                  </ScrollArea>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  );
}
