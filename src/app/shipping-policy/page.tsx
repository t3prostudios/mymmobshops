import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Truck, Globe, MapPin } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const metadata = {
  title: 'Shipping Policy | VogueVerse',
};

const rates = [
  { weight: "Up to 8 oz (1 T-shirt)", canada_us: "$10.99", world: "$13.99" },
  { weight: "Up to 16 oz (2 T-shirts)", canada_us: "$13.99", world: "$17.99" },
  { weight: "Up to 32 oz (1 pair of jeans)", canada_us: "$17.99", world: "$21.99" },
  { weight: "Up to 48 oz (1 hoodie + jeans)", canada_us: "$21.99", world: "$28.99" },
  { weight: "Up to 64 oz (Light jacket/Bulk)", canada_us: "$28.99", world: "$37.99" },
];

export default function ShippingPolicyPage() {
  return (
    <div className="bg-secondary py-20">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-center font-headline text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-12">
          Shipping Policy
        </h1>
        <div className="space-y-8">

          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <MapPin className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Local Shipping (Sacramento, CA)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We offer FREE shipping for all orders over $100 shipped to a Sacramento, CA address. For orders under $100, our standard domestic rates apply.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <Globe className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Domestic & International Shipping</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Shipping costs are calculated based on the total weight of your order and the destination. Please see the table below for our current rates.
              </p>
               <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Weight</TableHead>
                    <TableHead>Canada & USA</TableHead>
                    <TableHead>Rest of World</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rates.map((rate) => (
                    <TableRow key={rate.weight}>
                      <TableCell className="font-medium">{rate.weight}</TableCell>
                      <TableCell>{rate.canada_us}</TableCell>
                      <TableCell>{rate.world}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
