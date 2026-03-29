import { ShieldCheck, Receipt, CalendarDays } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = {
  title: 'Return Policy | VogueVerse',
};

export default function ReturnPolicyPage() {
  return (
    <div className="bg-secondary py-20">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Return Policy
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Your satisfaction is important to us. Please review our return policy below.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl text-center">All Sales Are Final</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground mb-8">
              While all sales are considered final, we accept returns for items under the following conditions.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <CalendarDays className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">7-Day Window</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Returns are accepted within 7 days of the original purchase date.
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Receipt className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">Proof of Purchase</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  A valid receipt or proof of purchase is required for all returns.
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">Condition</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Items must be unworn, undamaged, and in their original packaging to be eligible for a return.
                </p>
              </div>
            </div>
            <p className="mt-10 text-center text-muted-foreground">
              To initiate a return, please contact our customer service team.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
