import { Star, Crown, Diamond, Zap, Gift, Check, Box, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = {
  title: 'Loyalty Program | VogueVerse',
  description: 'Get rewarded for your style. The more you shop, the more you earn.',
};

const tiers = [
  {
    icon: Star,
    name: 'Bronze',
    spend: '$0+',
    description: 'Start earning as soon as you join.',
    benefits: [
      { icon: Zap, text: '1 point for every $1 spent' },
      { icon: Gift, text: 'Member-only promotions' },
    ],
  },
  {
    icon: Crown,
    name: 'Style Scout',
    spend: '$250+',
    description: 'Unlock more benefits as you shop.',
    benefits: [
      { icon: Zap, text: '1.25 points for every $1 spent' },
      { icon: Gift, text: 'Annual birthday reward' },
      { icon: Zap, text: 'Early access to sales events' },
    ],
  },
  {
    icon: Diamond,
    name: 'Trendsetter',
    spend: '$750+',
    description: 'The highest level of rewards and service.',
    benefits: [
      { icon: Zap, text: '1.5 points for every $1 spent' },
      { icon: Check, text: 'Free standard shipping on all orders' },
      { icon: Box, text: 'Access to exclusive products' },
    ],
  },
];

export default function LoyaltyProgramPage() {
  return (
    <div className="bg-secondary py-20">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Our Loyalty Program
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Get rewarded for your style. The more you shop, the more you earn.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <Card key={tier.name} className="flex flex-col text-center">
              <CardHeader>
                <tier.icon className="mx-auto h-10 w-10 text-primary mb-4" />
                <CardTitle className="text-2xl font-headline">{tier.name}</CardTitle>
                <p className="text-sm text-muted-foreground">Annual Spend: {tier.spend}</p>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-between">
                <p className="text-muted-foreground mb-6">{tier.description}</p>
                <ul className="space-y-3 text-left">
                  {tier.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <benefit.icon className="h-4 w-4 text-primary" />
                      <span className="text-sm">{benefit.text}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-12">
           <CardHeader className="items-center text-center">
             <RefreshCw className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl font-headline mt-2">Program Details</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground">
            <p>
              Your loyalty tier is determined by your total spend within a calendar year (January 1st to December 31st).
            </p>
            <p className="mt-4">
              On January 1st of each year, your Annual Spend resets to $0. Your new starting tier for the year is based on your total spend from the previous year. Your points balance does not reset.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
