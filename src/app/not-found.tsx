import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Dna } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container flex min-h-[calc(100vh-200px)] items-center justify-center">
      <div className="text-center">
        <h1 className="mt-4 text-3xl font-headline tracking-tight text-foreground sm:text-5xl">
          Page Not Found
        </h1>
        <p className="mt-6 text-base leading-7 text-muted-foreground">
          Sorry, we couldn’t find the page you’re looking for.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button asChild>
            <Link href="/">Go back home</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/products">Continue Shopping <span aria-hidden="true">&rarr;</span></Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
