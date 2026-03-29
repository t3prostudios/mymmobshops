"use client";

import { useToast } from "@/hooks/use-toast";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function EmailCaptureForm({ className }: { className?: string }) {
  const { toast } = useToast();
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (email) {
      toast({
        title: "Subscribed!",
        description: "Thanks for joining the VogueVerse movement.",
      });
      setEmail('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("flex w-full max-w-sm items-center space-x-2", className)}>
      <Input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        aria-label="Email for newsletter"
        className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground placeholder:text-primary-foreground/70"
      />
      <Button type="submit" size="icon" variant="secondary" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90" aria-label="Subscribe">
        <ArrowRight className="h-4 w-4" />
      </Button>
    </form>
  );
}
