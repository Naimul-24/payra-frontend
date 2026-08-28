import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, MailCheck } from "lucide-react";
import { z } from "zod";
import { AuthLayout } from "@/components/payra/auth-layout";
import { SoftButton, SuccessState } from "@/components/payra/ui-kit";
import { InlineFormError, SubmitButton, TextField } from "@/components/payra/flow-kit";
import { supabase } from "@/lib/supabaseClient";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset your Payra password" }, { name: "description", content: "Send a secure reset link to the email on your Payra account." }] }),
  component: ForgotPasswordPage,
});

const emailSchema = z.string().trim().min(1, { message: "Enter the email on your Payra account." }).email({ message: "Enter a valid email address." }).max(255);

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit() {
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) { setFieldError(parsed.error.issues[0]?.message); return; }
    setFieldError(undefined); setError(""); setLoading(true);
    try {
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.toLowerCase(), { redirectTo });
      if (error) throw error;
      setSuccess(true);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to send the reset email."); }
    finally { setLoading(false); }
  }

  return <AuthLayout title={success ? "Check your email" : "Forgot your password?"} subtitle={success ? "We've sent a secure password reset link if an account exists for this email." : "Enter your account email and we'll send you a secure reset link."} footer={<Link to="/login" className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"><ArrowLeft className="size-4" />Back to log in</Link>}>
    {success ? <div className="space-y-6"><SuccessState title="Reset link sent" description={`Check ${email} for your password reset instructions.`} /><div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-xs text-muted-foreground"><MailCheck className="size-4 shrink-0 text-primary" />Check spam before requesting another email.</div><SoftButton className="w-full" disabled={loading} onClick={() => void submit()}>{loading ? "Sending..." : "Resend email"}</SoftButton></div> : <form className="space-y-4" noValidate onSubmit={(event) => { event.preventDefault(); void submit(); }}>{error ? <InlineFormError message={error} /> : null}<TextField id="reset-email" label="Email address" type="email" autoComplete="email" placeholder="you@example.com" value={email} disabled={loading} error={fieldError} onChange={(event) => setEmail(event.target.value)} /><SubmitButton type="submit" className="w-full" loading={loading} loadingLabel="Sending link…">Send reset link</SubmitButton></form>}
  </AuthLayout>;
}