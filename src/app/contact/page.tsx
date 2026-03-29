import { MapPin, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = {
  title: 'Contact Us | VogueVerse',
};

export default function ContactPage() {
  return (
    <div className="bg-secondary py-20">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-center font-headline text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-12">
          Contact Us
        </h1>
        <div className="space-y-8">
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <MapPin className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Our Location</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-muted-foreground">
                6955 Stockton Boulevard, Suite E
                <br />
                Sacramento, CA 95823
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <Phone className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">By Phone</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                For immediate assistance, please call us during business hours.
              </p>
              <p className="text-lg font-semibold mt-2">916-519-2470</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
