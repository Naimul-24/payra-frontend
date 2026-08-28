import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { AuthLayout } from "@/components/payra/auth-layout";
import { InlineFormError, SubmitButton } from "@/components/payra/flow-kit";
import { SoftButton, SuccessState } from "@/components/payra/ui-kit";
import { supabase } from "@/lib/supabaseClient";

export const Route = createFileRoute("/verify-otp")({
  head: () => ({ meta: [{ title: "Verify your Payra account" }, { name: "description", content: "Complete verification using your secure Supabase authentication link." }] }),
  component: VerifyOtpPage,
});

function VerifyOtpPage() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");

  async function checkSession() {
    setChecking(true);
    setError("");
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      setVerified(Boolean(session?.user));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to check your verification status.");
    } finally {
      setChecking(false);
    }
  }

  useEffect(() => { void checkSession(); }, []);

  async function continueToDashboard() {
    await navigate({ to: "/dashboard" });
  }

  return <AuthLayout
    title={verified ? "Account verified" : "Verify your account"}
    subtitle={verified ? "Your Payra session is active." : "Payra does not accept a hard-coded demo code. Complete verification using the secure link sent by Supabase Auth."}
    footer={<Link to="/login" className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"><ArrowLeft className="size-4" />Back to log in</Link>}
  >
    {checking ? <p className="text-center text-sm text-muted-foreground">Checking verification status...</p> : error ? <div className="space-y-4"><InlineFormError message={error} /><SoftButton className="w-full" onClick={() => void checkSession()}>Retry</SoftButton></div> : verified ? <div className="space-y-6"><SuccessState title="Verified" description="Your secure Supabase session is active." /><SubmitButton className="w-full" onClick={() => void continueToDashboard()}>Continue to dashboard</SubmitButton></div> : <div className="space-y-5"><div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />Open the verification email or password-reset link sent by Supabase Auth. When verification creates a session, return here or log in.</div><div className="grid gap-3"><Link to="/login"><SoftButton className="w-full">Go to log in</SoftButton></Link><Link to="/forgot-password"><SoftButton className="w-full">Request password reset</SoftButton></Link></div></div>}
  </AuthLayout>;
}