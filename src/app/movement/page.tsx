
'use client';

import Image from 'next/image';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import placeholderData from '@/app/lib/placeholder-images.json';

export default function MovementPage() {
  const socialImages = placeholderData.movement;

  return (
    <div className="container py-12 md:py-20">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-headline tracking-tight sm:text-5xl">
          The Movement in Action
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Real stories from our community. Tag @mindingmyown.business to be featured and inspire others!
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-6">
        {socialImages.map(image => (
          <Dialog key={image.id}>
            <DialogTrigger asChild>
              <div className="group relative block overflow-hidden rounded-lg cursor-pointer bg-muted">
                <Image
                  src={image.url}
                  alt={image.description}
                  width={500}
                  height={500}
                  className="aspect-square w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  data-ai-hint={image.hint}
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs font-semibold">{image.author}</p>
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-3xl p-0 overflow-hidden">
                <DialogHeader className='sr-only'>
                    <DialogTitle>Social media post by {image.author}</DialogTitle>
                    <DialogDescription>{image.description}</DialogDescription>
                </DialogHeader>
              <div className="flex flex-col md:flex-row">
                <div className="md:w-2/3">
                  <Image
                    src={image.url}
                    alt={image.description}
                    width={800}
                    height={800}
                    className="object-cover w-full h-full aspect-square"
                  />
                </div>
                <div className="p-8 md:w-1/3 flex flex-col justify-center bg-card">
                  <h3 className="font-bold text-xl text-primary">{image.author}</h3>
                  <ScrollArea className="flex-grow mt-6">
                    <p className="text-md italic text-muted-foreground leading-relaxed pr-4">
                      "{image.description}"
                    </p>
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
