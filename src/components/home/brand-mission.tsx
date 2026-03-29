
import Image from 'next/image';
import { Button } from '../ui/button';
import Link from 'next/link';

export default function BrandMission() {
  return (
    <section className="bg-background py-16 sm:py-24">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
            <Image
                src="/images/the-shop.jpeg"
                alt="Inside the Minding My Own Business shop"
                fill
                className="object-cover"
                data-ai-hint="people talking"
              />
          </div>
          <div>
            <h2 className="font-headline text-3xl md:text-4xl lg:text-5xl text-primary">Quality in Every Thread</h2>
            <p className="mt-4 text-lg text-foreground/80 leading-relaxed">
              At Minding My Own Business, our mission is to inspire a lifestyle of self-growth and creativity. We build community and offer thoughtfully designed products that empower you to elevate beyond your limits. From apparel that helps you look good to wellness products that help you feel good, the MMOB Shop provides the tools for your personal journey. Join us in fostering a community dedicated to looking, feeling, and achieving your best.
            </p>
            <div className="mt-8">
              <Button asChild>
                <Link href="/mission">Our Mission</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
