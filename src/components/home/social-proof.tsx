
'use client';

import Image from 'next/image';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import placeholderData from '@/app/lib/placeholder-images.json';

export default function SocialProof() {
  const socialImages = placeholderData.movement;

  return (
    <section className="py-12 md:py-24 bg-background">
      <div className="container">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-headline tracking-tight sm:text-4xl md:text-5xl text-primary">The Movement in Action</h2>
          <p className="mt-3 max-w-md mx-auto text-muted-foreground sm:text-lg md:mt-4 md:text-xl">
            See how our community styles their favorite pieces and shares the message.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
          {socialImages.map(image => (
            <Dialog key={image.id}>
              <DialogTrigger asChild>
                <div className="group relative block overflow-hidden rounded-lg cursor-pointer bg-muted">
                  <Image
                    src={image.url}
                    alt={image.description}
                    width={500}
                    height={500}
                    className="aspect-[3/4] w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    data-ai-hint={image.hint}
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-sm font-medium">{image.author}</span>
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
                      height={1066}
                      className="object-cover w-full h-full aspect-[3/4]"
                    />
                  </div>
                  <div className="p-6 md:w-1/3 flex flex-col justify-center bg-card">
                    <h3 className="font-bold text-primary text-xl">{image.author}</h3>
                    <ScrollArea className="flex-grow mt-4 max-h-[200px] md:max-h-none">
                      <p className="text-sm italic leading-relaxed text-muted-foreground pr-4">
                        "{image.description}"
                      </p>
                    </ScrollArea>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Button asChild variant="outline">
            <Link href="/movement">View All Stories</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
