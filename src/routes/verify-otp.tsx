import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck, Timer } from "lucide-react";
import { AuthLayout } from "@/components/payra/auth-layout";
import { SoftButton, SuccessState } from "@/components/payra/ui-kit";
import { InlineFormError, SubmitButton } from "@/components/payra/flow-kit";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { currentUser } from "@/lib/payra-data";
import { formatCountdown, useCountdown, useSimulatedRequest } from "@/lib/use-simulated-request";

type VerifyFlow = "signup" | "reset" | "login";

export const Route = createFileRoute("/verify-otp")({
  validateSearch: (search: Record<string, unknown>) => {
    const raw = search["flow"];
    const flow: VerifyFlow = raw === "reset" || raw === "login" ? raw : "signup";
    return { flow };
  },
  head: () => ({
    meta: [
      { title: "Verify your code — Payra" },
      { name: "description", content: "Enter the 6-digit verification code sent to your Payra phone number." },
      { property: "og:title", content: "Verify your code — Payra" },
      { property: "og:description", content: "Confirm your identity with a Payra one-time code." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VerifyOtpPage,
});

/** Prototype-only: the demo accepts this code, anything else fails. */
const DEMO_CODE = "123456";
const CODE_TTL_SECONDS = 90;

const copy: Record<VerifyFlow, { title: string; subtitle: string; nextLabel: string }> = {
  signup: {
    title: "Verify your phone number",
    subtitle: "We sent a 6-digit code to confirm your new Payra account.",
    nextLabel: "Continue to identity verification",
  },
  reset: {
    title: "Confirm it's you",
    subtitle: "Enter the 6-digit code we sent so you can set a new password.",
    nextLabel: "Continue to log in",
  },
  login: {
    title: "Two-step verification",
    subtitle: "Enter the 6-digit code we sent to finish logging in.",
    nextLabel: "Continue to dashboard",
  },
};

function VerifyOtpPage() {
  const { flow } = Route.useSearch();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [expired, setExpired] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const countdown = useCountdown(CODE_TTL_SECONDS);
  const request = useSimulatedRequest(1200);

  useEffect(() => {
    if (countdown.isFinished) setExpired(true);
  }, [countdown.isFinished]);

  const text = copy[flow];

  function verify() {
    if (expired) return;
    if (code.length !== 6) return;
    const wrong = code !== DEMO_CODE;
    if (wrong) setAttempts((value) => value + 1);
    request.run({
      fail: wrong,
      failMessage:
        attempts >= 2
          ? "That code is still incorrect. Request a new code to continue."
          : "That code isn't valid. Please check the 6 digits and try again.",
    });
  }

  function resend() {
    setCode("");
    setExpired(false);
    setAttempts(0);
    request.reset();
    countdown.restart();
  }

  function goNext() {
    if (flow === "signup") navigate({ to: "/kyc" });
    else if (flow === "reset") navigate({ to: "/login" });
    else navigate({ to: "/dashboard" });
  }

  return (
    <AuthLayout
      title={request.isSuccess ? "Verified" : text.title}
      subtitle={request.isSuccess ? "Your code was confirmed successfully." : text.subtitle}
      footer={
        <Link to="/login" className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline">
          <ArrowLeft className="size-4" aria-hidden /> Back to log in
        </Link>
      }
    >
      {request.isSuccess ? (
        <div className="space-y-6">
          <SuccessState title="Code verified" description="Thanks — your identity was confirmed." />
          <SubmitButton className="w-full" onClick={goNext}>
            {text.nextLabel}
          </SubmitButton>
        </div>
      ) : (
        <form
          className="space-y-5"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            verify();
          }}
        >
          <p className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
            <ShieldCheck className="size-4 shrink-0 text-primary" aria-hidden />
            Code sent to <span className="font-semibold text-foreground">{currentUser.phone}</span>
          </p>

          {expired ? (
            <InlineFormError message="This code has expired. Request a new one to continue." />
          ) : request.error ? (
            <InlineFormError message={request.error} />
          ) : null}

          <div className="space-y-2">
            <label htmlFor="otp-code" className="text-sm font-semibold text-foreground">
              6-digit verification code
            </label>
            <InputOTP
              id="otp-code"
              maxLength={6}
              value={code}
              autoFocus
              disabled={request.isLoading || expired}
              onChange={(value) => setCode(value)}
              onComplete={() => {
                if (!expired) verify();
              }}
              aria-label="6-digit verification code"
            >
              <InputOTPGroup className="w-full justify-between gap-2">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <InputOTPSlot
                    key={index}
                    index={index}
                    className="size-12 flex-1 rounded-xl border border-border text-lg font-bold sm:size-14"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
            <p className="text-xs text-muted-foreground">Prototype tip: use {DEMO_CODE} to continue.</p>
          </div>

          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Timer className="size-4" aria-hidden />
              {expired ? "Code expired" : `Expires in ${formatCountdown(countdown.seconds)}`}
            </span>
            <button
              type="button"
              onClick={resend}
              disabled={!expired && countdown.seconds > CODE_TTL_SECONDS - 15}
              className="font-semibold text-primary hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
            >
              Resend code
            </button>
          </div>

          <SubmitButton
            type="submit"
            className="w-full"
            loading={request.isLoading}
            loadingLabel="Verifying…"
            disabled={code.length !== 6 || expired}
          >
            Verify code
          </SubmitButton>

          <SoftButton type="button" className="w-full" onClick={resend}>
            Send a new code
          </SoftButton>
        </form>
      )}
    </AuthLayout>
  );
}
