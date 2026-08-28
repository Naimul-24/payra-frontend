import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Fingerprint } from "lucide-react";
import { z } from "zod";
import { AuthLayout, GoogleButton } from "@/components/payra/auth-layout";
import { InlineFormError, SubmitButton, TextField } from "@/components/payra/flow-kit";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/lib/supabaseClient";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in to Payra" },
      { name: "description", content: "Access your Payra wallet, transactions and payment sources." },
      { property: "og:title", content: "Log in to Payra" },
      { property: "og:description", content: "Access your Payra wallet securely." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

const schema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, { message: "Enter your email or phone number." })
    .max(255, { message: "Must be less than 255 characters." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." })
    .max(128, { message: "Password must be less than 128 characters." }),
});

type Errors = Partial<Record<"identifier" | "password", string>>;

function LoginPage() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [twoStep, setTwoStep] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  

  async function submit(event: React.FormEvent) {
    event.preventDefault();

    const parsed = schema.safeParse({ identifier, password });

    if (!parsed.success) {
      const next: Errors = {};

      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof Errors;

        if (key && !next[key]) {
          next[key] = issue.message;
        }
      }

      setErrors(next);
      return;
    }

    setErrors({});
    setSubmitError("");
    setIsLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: parsed.data.identifier.trim().toLowerCase(),
      password: parsed.data.password,
    });

    setIsLoading(false);

    if (error) {
      setSubmitError(error.message);
      return;
    }

    console.log("Logged in user:", data.user);

    if (twoStep) {
      navigate({
        to: "/verify-otp",
        search: { flow: "login" },
      });
    } else {
      navigate({
        to: "/dashboard",
      });
    }
  }

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
      <form className="space-y-4" noValidate onSubmit={submit}>
        {submitError ? <InlineFormError message={submitError} /> : null}

        <TextField
          id="identifier"
          label="Email / Phone number"
          placeholder="naimul@payra.app"
          autoComplete="username"
          value={identifier}
          disabled={isLoading}
          error={errors.identifier}
          onChange={(event) => setIdentifier(event.target.value)}
        />
        <TextField
          id="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          value={password}
          disabled={isLoading}
          error={errors.password}
          hint="Prototype password: payra1234"
          onChange={(event) => setPassword(event.target.value)}
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox
              id="two-step"
              checked={twoStep}
              onCheckedChange={(checked) => setTwoStep(checked === true)}
            />{" "}
            Ask for a 2-step code
          </label>
          <Link
            to="/forgot-password"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <SubmitButton
          type="submit"
          className="w-full"
          loading={isLoading}
          loadingLabel="Logging in…"
        >
          Log In
        </SubmitButton>

        <div className="relative py-2 text-center">
          <span className="relative z-10 bg-background px-3 text-xs text-muted-foreground">or</span>
          <span className="absolute inset-x-0 top-1/2 h-px bg-border" />
        </div>

        <GoogleButton label="Continue with Google" />

        <button
          type="button"
          disabled={isLoading}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent disabled:opacity-60"
        >
          <Fingerprint className="size-4.5" aria-hidden /> Use Face ID / Fingerprint
        </button>
      </form>
    </AuthLayout>
  );
}
