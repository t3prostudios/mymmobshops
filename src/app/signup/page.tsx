import SignupForm from "@/components/auth/signup-form";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="container mx-auto py-12">
      <div className="mx-auto max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-headline">Create an Account</h1>
          <p className="text-muted-foreground mt-2">Join the MindingMyOwnBusiness community</p>
        </div>
        <SignupForm />
        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
