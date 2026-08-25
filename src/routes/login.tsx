import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Fingerprint } from "lucide-react";
import { AuthLayout, GoogleButton } from "@/components/payra/auth-layout";
import { GradientButton } from "@/components/payra/ui-kit";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in to Payra" },
      { name: "description", content: "Access your Payra wallet, transactions and payment sources." },
      { property: "og:title", content: "Log in to Payra" },
      { property: "og:description", content: "Access your Payra wallet securely." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to your Payra wallet to keep moving money."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="font-semibold text-primary hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          navigate({ to: "/dashboard" });
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="identifier">Email / Phone number</Label>
          <Input id="identifier" placeholder="naimul@payra.app" className="h-12 rounded-xl" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="••••••••" className="h-12 rounded-xl" />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox id="remember" /> Remember me
          </label>
          <button type="button" className="text-sm font-semibold text-primary hover:underline">
            Forgot password?
          </button>
        </div>

        <GradientButton type="submit" className="w-full">
          Log In
        </GradientButton>

        <div className="relative py-2 text-center">
          <span className="relative z-10 bg-background px-3 text-xs text-muted-foreground">or</span>
          <span className="absolute inset-x-0 top-1/2 h-px bg-border" />
        </div>

        <GoogleButton label="Continue with Google" />

        <button
          type="button"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent"
        >
          <Fingerprint className="size-4.5" aria-hidden /> Use Face ID / Fingerprint
        </button>
      </form>
    </AuthLayout>
  );
}
