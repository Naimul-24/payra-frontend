import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { AuthLayout, GoogleButton } from "@/components/payra/auth-layout";
import { InlineFormError, SubmitButton, TextField } from "@/components/payra/flow-kit";
import { supabase } from "@/lib/supabaseClient";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Log in to Payra" }, { name: "description", content: "Access your Payra wallet, transactions and payment sources." }] }),
  component: LoginPage,
});

const schema = z.object({ email: z.string().trim().email({ message: "Enter a valid email address." }).max(255), password: z.string().min(8, { message: "Password must be at least 8 characters." }).max(128) });
type Errors = Partial<Record<"email" | "password", string>>;

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) { const key = issue.path[0] as keyof Errors; if (key && !next[key]) next[key] = issue.message; }
      setErrors(next); return;
    }
    setErrors({}); setSubmitError(""); setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: parsed.data.email.toLowerCase(), password: parsed.data.password });
      if (error) throw error;
      await navigate({ to: "/dashboard" });
    } catch (e) { setSubmitError(e instanceof Error ? e.message : "Unable to log in."); }
    finally { setIsLoading(false); }
  }

  return <AuthLayout title="Welcome back" subtitle="Log in to your Payra wallet to keep moving money." footer={<>Don't have an account? <Link to="/signup" className="font-semibold text-primary hover:underline">Sign up</Link></>}>
    <form className="space-y-4" noValidate onSubmit={submit}>
      {submitError ? <InlineFormError message={submitError} /> : null}
      <TextField id="email" label="Email address" type="email" placeholder="you@example.com" autoComplete="email" value={email} disabled={isLoading} error={errors.email} onChange={(event) => setEmail(event.target.value)} />
      <TextField id="password" label="Password" type="password" placeholder="••••••••" autoComplete="current-password" value={password} disabled={isLoading} error={errors.password} onChange={(event) => setPassword(event.target.value)} />
      <div className="flex justify-end"><Link to="/forgot-password" className="text-sm font-semibold text-primary hover:underline">Forgot password?</Link></div>
      <SubmitButton type="submit" className="w-full" loading={isLoading} loadingLabel="Logging in…">Log In</SubmitButton>
      <div className="relative py-2 text-center"><span className="relative z-10 bg-background px-3 text-xs text-muted-foreground">or</span><span className="absolute inset-x-0 top-1/2 h-px bg-border" /></div>
      <GoogleButton label="Continue with Google" />
    </form>
  </AuthLayout>;
}