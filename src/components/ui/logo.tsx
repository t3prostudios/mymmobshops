import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Icons } from '../icons';

type LogoProps = {
  className?: string;
  isLink?: boolean;
};

export default function Logo({ className, isLink = true }: LogoProps) {
  const Comp = isLink ? Link : 'div';
  const href = isLink ? { href: '/' } : {};

  return (
    <Comp
      {...href}
      className={cn('flex items-center gap-2', className)}
    >
      <Icons.logo />
    </Comp>
  );
}
