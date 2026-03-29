import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Megaphone } from "lucide-react";
import Link from "next/link";

export default function MotivationalMondays() {
  return (
    <section className="bg-background py-16 sm:py-24">
      <div className="container max-w-5xl mx-auto">
        <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
          <AccordionItem value="item-1" className="border-b">
            <AccordionTrigger className="text-2xl sm:text-3xl font-headline hover:no-underline [&[data-state=open]>svg]:rotate-180">
                <div className="text-left">
                  <p className="text-sm font-semibold tracking-wider text-primary">THE MMOB SHOP PRESENTS</p>
                  <div className="flex items-center gap-3">
                    <Megaphone className="h-6 w-6 text-primary" />
                    <h2 className="text-3xl sm:text-4xl font-headline">Motivational Mondays</h2>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground italic">Because when we mind our business, we make room for greatness.</p>
                </div>
            </AccordionTrigger>
            <AccordionContent className="pt-8 text-base text-foreground/80">
              <div className="space-y-6">
                <p>
                  At MMOB, we are dedicated to celebrating growth, positive momentum, and perseverance. For this reason, we are launching Motivational Mondays—a weekly spotlight to recognize real individuals and their genuine accomplishments, regardless of scale.
                </p>
                <p>
                  Whether you just launched a business, passed your final exam, secured a new position, or achieved a personal milestone—we want to hear about it. Every advancement matters, and your story could inspire someone else to persevere.
                </p>
                <Card className="bg-secondary p-6">
                  <CardContent className="p-0">
                    <h3 className="font-headline text-2xl text-center mb-4">Want to be featured? Here's how:</h3>
                    <p className="text-center text-muted-foreground mb-4">
                      DM us your submission! Your MMOB apparel is your ticket to the spotlight. Please include:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                      <li>A photo of the person featuring MMOB apparel</li>
                      <li>Their name and a brief description of the accomplishment</li>
                      <li>Inform us if it's time-sensitive so we can schedule the post appropriately</li>
                    </ul>
                    <p className="text-center mt-4 text-muted-foreground">
                      Don't own any MMOB gear yet? <Link href="#" className="underline text-primary">Visit us at 6955 Stockton Boulevard, Suite E</Link>, get your gear, and get ready for your feature.
                    </p>
                  </CardContent>
                </Card>
                <p className="text-center font-semibold text-primary text-lg">
                  Let's elevate one another by demonstrating what's possible when we stay focused, stay grounded, and mind our own business.
                </p>
                <p className="text-center text-xs text-muted-foreground">
                  By submitting, you grant The MMOB Shop permission to feature your story and image on our platforms.
                </p>
                <p className="text-center text-xs text-primary font-semibold tracking-wider">
                  #MMOB #MotivationalMondays #MindingMyOwnBusiness #CommunityWins
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
}
