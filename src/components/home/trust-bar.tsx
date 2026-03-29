import { ShieldCheck, Truck, Recycle } from 'lucide-react';

const trustFeatures = [
  { icon: ShieldCheck, text: 'Ethically Sourced' },
  { icon: Truck, text: 'Free & Fast Shipping' },
  { icon: Recycle, text: 'Sustainable Practices' },
];

export default function TrustBar() {
  return (
    <div className="bg-background py-4">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          {trustFeatures.map((feature, index) => (
            <div key={index} className="flex items-center justify-center gap-3">
              <feature.icon className="h-6 w-6 text-foreground/70" />
              <span className="text-sm font-medium text-foreground/70">{feature.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
