import SubmissionForm from "@/components/motivational-mondays/submission-form";
import { Lightbulb } from "lucide-react";

export const metadata = {
  title: "Motivational Mondays | VogueVerse",
  description: "Share your story and inspire the VogueVerse community.",
};

export default function MotivationalMondaysPage() {
  return (
    <div className="bg-secondary">
      <div className="container py-12 md:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <Lightbulb className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-4 text-4xl font-headline tracking-tight sm:text-5xl">
            Motivational Mondays
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Welcome to our weekly dose of inspiration! Every Monday, we celebrate the incredible stories from our community. Share your triumphs, your struggles, and your journey. Your story could be the spark that ignites someone else's fire.
          </p>
        </div>
        <div className="mx-auto mt-12 max-w-2xl">
          <div className="bg-background p-6 sm:p-8 rounded-xl shadow-lg">
            <SubmissionForm />
          </div>
        </div>
      </div>
    </div>
  );
}
