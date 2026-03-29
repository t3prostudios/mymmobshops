import { Scissors, Target, Sparkles, BrainCircuit, Rocket, Users, HandHeart, Mountain } from 'lucide-react';
import Image from 'next/image';

export const metadata = {
  title: 'About Us | VogueVerse',
  description:
    'Learn about the story, mission, and philosophy of Minding My Own Business.',
};

export default function AboutPage() {
  return (
    <div className="bg-secondary py-20">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            About Minding My Own Business
          </h1>
        </div>

        <div className="mb-16">
            <Image 
                src="/images/unk-tori.jpeg"
                alt="Founder of Minding My Own Business"
                width={800}
                height={600}
                className="rounded-lg shadow-xl mx-auto"
            />
        </div>

        <div className="space-y-16">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Scissors className="h-6 w-6" />
            </div>
            <h2 className="mt-6 text-2xl font-semibold font-headline">
              Our Story
            </h2>
            <p className="mt-2 max-w-2xl text-lg text-muted-foreground">
              Before this brand existed, I was behind the chair as a barber. My journey began with a single "Aha!" moment: a deep desire to create something that offered positive empowerment.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Mountain className="h-6 w-6" />
            </div>
            <h2 className="mt-6 text-2xl font-semibold font-headline">
              The Journey
            </h2>
            <p className="mt-2 max-w-2xl text-lg text-muted-foreground">
                Building this wasn't easy. If I had to map it out, my journey came in three major milestones: acquiring the perfect product, securing our location, and sharing our message with the world. The biggest hurdle was finding the right vendors to provide the specific sizes and colors my customers deserved. It took sacrifice and time, but I refused to settle until I found exactly what was needed.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Target className="h-6 w-6" />
            </div>
            <h2 className="mt-6 text-2xl font-semibold font-headline">
              Our Mission
            </h2>
            <p className="mt-2 max-w-2xl text-lg text-muted-foreground">
              Beyond making money, the core purpose of this company is to spread a positive message and be impactful. We are here to:
            </p>
            <ul className="mt-4 space-y-2 text-left text-lg text-muted-foreground max-w-md">
              <li className="flex items-start">
                <HandHeart className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                <span>Serve the community.</span>
              </li>
              <li className="flex items-start">
                <Users className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                <span>Provide jobs.</span>
              </li>
              <li className="flex items-start">
                <Rocket className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                <span>Be an example for the youth.</span>
              </li>
            </ul>
             <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              We want every customer to feel empowered, to feel better about themselves, and to stand out as outstanding amongst their peers.
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Sparkles className="h-6 w-6" />
            </div>
            <h2 className="mt-6 text-2xl font-semibold font-headline">
              The "Secret Sauce"
            </h2>
            <p className="mt-2 max-w-2xl text-lg text-muted-foreground">
              If you look at us alongside our competitors, the choice is clear. We don't just sell a product; we project a positive affirmation. My "secret sauce" is a relentless dedication to your requests. While others might think it’s "crazy" or "too much work," I believe in going above and beyond by creating custom artifacts for my clients. I will never negotiate the integrity of my product or the location of my business.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <BrainCircuit className="h-6 w-6" />
            </div>
            <h2 className="mt-6 text-2xl font-semibold font-headline">
              Our Philosophy
            </h2>
            <p className="mt-2 max-w-2xl text-lg text-muted-foreground italic">
              "If this brand were a person, they would be determined and committed to being the best. In this house, we hate the words 'I can't,' 'I'll try,' and 'we don't.' We find a way."
            </p>
          </div>

           <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Rocket className="h-6 w-6" />
            </div>
            <h2 className="mt-6 text-2xl font-semibold font-headline">
              The Future
            </h2>
            <p className="mt-2 max-w-2xl text-lg text-muted-foreground">
                My ideal customer is the middle-aged working-class father—the provider. I know that if he understands the message, he can distribute that positivity to his family and friends. Five years from now, my goal is to look back and see that we have influenced the youth to see that anything is possible if they chase their dreams.
            </p>
          </div>

          <div className="border-t border-muted-foreground/20 pt-12 text-center">
            <p className="text-xl font-headline text-foreground">
                "Come for the product, stay for the service."
            </p>
             <p className="mt-2 max-w-2xl mx-auto text-muted-foreground">
                The nicest thing a client ever told me was that we offered the best customer service they had ever experienced. We intend to keep it that way.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
