"use client";

import { useForm, useFormState } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { handleSubmission } from "@/app/motivational-mondays/actions";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Terminal } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  contentType: z.enum(["story", "image", "video"]),
  content: z.string().min(20, { message: "Your story must be at least 20 characters." }),
});

type SubmissionResult = {
  classification: {
    category: string;
    priority: string;
    sentiment: string;
  };
  issues: {
    hasCopyrightIssue: boolean;
    hasInappropriateContent: boolean;
    issueDetails: string;
  }
} | null;

export default function SubmissionForm() {
  const { toast } = useToast();
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      contentType: "story",
      content: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    setSubmissionResult(null);

    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("email", values.email);
    formData.append("contentType", values.contentType);
    formData.append("content", values.content);

    try {
      const result = await handleSubmission(formData);
      if (result.error) {
        toast({
          title: "Submission Failed",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Submission Successful!",
          description: "Thank you for sharing your story with the community.",
        });
        setSubmissionResult(result.data);
        form.reset();
      }
    } catch (error) {
      toast({
        title: "An unexpected error occurred.",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Jane Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Story</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us what's on your mind..."
                    className="min-h-[150px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Share your story, a description of your image, or video.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Share My Story'}
          </Button>
        </form>
      </Form>
      {submissionResult && (
        <Alert className="mt-6">
          <Terminal className="h-4 w-4" />
          <AlertTitle>AI Moderation Analysis (For Demo)</AlertTitle>
          <AlertDescription>
            <pre className="mt-2 w-full rounded-md bg-muted p-4 overflow-auto text-sm">
              <code>{JSON.stringify(submissionResult, null, 2)}</code>
            </pre>
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}
