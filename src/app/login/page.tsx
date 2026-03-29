import LoginForm from "@/components/auth/login-form";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="container mx-auto py-12">
      <div className="mx-auto max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-headline">Login</h1>
          <p className="text-muted-foreground mt-2">Access your account and continue your style journey.</p>
        </div>
        <LoginForm />
        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account?{" "}
          <Link href="/signup" className="font-semibold text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
