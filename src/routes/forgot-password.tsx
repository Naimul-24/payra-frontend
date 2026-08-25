import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, MailCheck } from "lucide-react";
import { z } from "zod";
import { AuthLayout } from "@/components/payra/auth-layout";
import { SoftButton, SuccessState } from "@/components/payra/ui-kit";
import { InlineFormError, SubmitButton, TextField } from "@/components/payra/flow-kit";
import { useSimulatedRequest } from "@/lib/use-simulated-request";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset your Payra password" },
      { name: "description", content: "Send a secure reset link to the email on your Payra account." },
      { property: "og:title", content: "Reset your Payra password" },
      { property: "og:description", content: "Send a secure Payra password reset link." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ForgotPasswordPage,
});

const emailSchema = z
  .string()
  .trim()
  .min(1, { message: "Enter the email on your Payra account." })
  .email({ message: "Enter a valid email address." })
  .max(255, { message: "Email must be less than 255 characters." });

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [resendCount, setResendCount] = useState(0);
  const request = useSimulatedRequest(1300);

  function submit(isResend = false) {
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0]?.message);
      return;
    }
    setFieldError(undefined);
    // Prototype failure trigger so the error state is reachable.
    const fail = parsed.data.toLowerCase().endsWith("@fail.com");
    if (isResend) setResendCount((count) => count + 1);
    request.run({
      fail,
      failMessage: "We couldn't reach that address. Check the email and try again.",
    });
  }

  return (
    <AuthLayout
      title={request.isSuccess ? "Check your email" : "Forgot your password?"}
      subtitle={
        request.isSuccess
          ? "We've sent a secure reset link. It expires in 15 minutes."
          : "Enter your account email and we'll send you a reset link."
      }
      footer={
        <Link to="/login" className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline">
          <ArrowLeft className="size-4" aria-hidden /> Back to log in
        </Link>
      }
    >
      {request.isSuccess ? (
        <div className="space-y-6">
          <SuccessState
            title="Reset link sent"
            description={`We emailed a password reset link to ${email}.`}
          />
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-xs text-muted-foreground">
            <MailCheck className="size-4 shrink-0 text-primary" aria-hidden />
            Didn&apos;t get it? Check your spam folder before resending.
          </div>
          <SoftButton className="w-full" onClick={() => submit(true)}>
            Resend email{resendCount > 0 ? ` (${resendCount})` : ""}
          </SoftButton>
          <Link to="/verify-otp" search={{ flow: "reset" }} className="block">
            <SubmitButton className="w-full">Enter code instead</SubmitButton>
          </Link>
        </div>
      ) : (
        <form
          className="space-y-4"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          {request.error ? <InlineFormError message={request.error} /> : null}
          <TextField
            id="reset-email"
            label="Email address"
            type="email"
            autoComplete="email"
            placeholder="naimul@payra.app"
            value={email}
            disabled={request.isLoading}
            error={fieldError}
            hint="We'll only email the address linked to your Payra wallet."
            onChange={(event) => setEmail(event.target.value)}
          />
          <SubmitButton
            type="submit"
            className="w-full"
            loading={request.isLoading}
            loadingLabel="Sending link…"
          >
            Send reset link
          </SubmitButton>
        </form>
      )}
    </AuthLayout>
  );
}
