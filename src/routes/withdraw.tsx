import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Info } from "lucide-react";
import { AppShell } from "@/components/payra/app-shell";
import { SectionHeading, SoftButton, SuccessState, SurfaceCard, TrustBadges } from "@/components/payra/ui-kit";
import {
  AmountField,
  FailureState,
  FlowActions,
  InlineFormError,
  ProcessingState,
  ReferenceRow,
  SourceSelect,
  StepTracker,
  SubmitButton,
  SummaryList,
} from "@/components/payra/flow-kit";
import { balances, calcFee, formatBDT, makeReference, paymentSources } from "@/lib/payra-data";
import { useSimulatedRequest } from "@/lib/use-simulated-request";

export const Route = createFileRoute("/withdraw")({
  head: () => ({
    meta: [
      { title: "Withdraw Money — Payra" },
      { name: "description", content: "Cash out from your Payra wallet to a bank account or mobile wallet." },
      { property: "og:title", content: "Withdraw Money — Payra" },
      { property: "og:description", content: "Move money out of Payra to your bank or wallet." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WithdrawPage,
});

const steps = ["Destination", "Amount", "Review"] as const;
const MIN_AMOUNT = 100;

const destinations = paymentSources.filter((source) => source.kind !== "wallet" && source.kind !== "card");

function WithdrawPage() {
  const [step, setStep] = useState(0);
  const [destinationId, setDestinationId] = useState(destinations[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState<string | undefined>();
  const [reference, setReference] = useState("");
  const request = useSimulatedRequest(1800);

  const destination = destinations.find((item) => item.id === destinationId);
  const numeric = Number(amount);
  const fee = calcFee("withdraw", numeric);
  const receives = Number.isFinite(numeric) && numeric > 0 ? Math.max(0, numeric - fee) : 0;

  function validateAmount() {
    if (!amount || !Number.isFinite(numeric) || numeric <= 0) {
      setAmountError("Enter the amount you want to withdraw.");
      return false;
    }
    if (numeric < MIN_AMOUNT) {
      setAmountError(`Minimum withdrawal is ${formatBDT(MIN_AMOUNT)}.`);
      return false;
    }
    if (numeric > balances.available) {
      setAmountError(`You only have ${formatBDT(balances.available)} available.`);
      return false;
    }
    setAmountError(undefined);
    return true;
  }

  function confirm(forceFail = false) {
    setReference(makeReference("WDR"));
    request.run({
      fail: forceFail,
      failMessage: "The receiving bank rejected this withdrawal. Your balance is unchanged.",
    });
  }

  if (request.isLoading) {
    return (
      <Shell>
        <ProcessingState
          title="Processing withdrawal"
          description={`Sending ${formatBDT(receives)} to ${destination?.name ?? "your account"}.`}
        />
      </Shell>
    );
  }

  if (request.isError) {
    return (
      <Shell>
        <FailureState
          title="Withdrawal failed"
          description={request.error ?? "The withdrawal could not be completed."}
          onRetry={() => request.reset()}
          retryLabel="Try again"
          secondaryAction={
            <Link to="/sources">
              <SoftButton className="w-full sm:w-auto">Manage destinations</SoftButton>
            </Link>
          }
        />
      </Shell>
    );
  }

  if (request.isSuccess) {
    return (
      <Shell>
        <SuccessState
          title="Withdrawal on the way"
          description={`${formatBDT(receives)} will reach ${destination?.name ?? "your account"} within 1 business day.`}
        />
        <SummaryList
          className="mt-6"
          rows={[
            { label: "To", value: destination?.name ?? "—" },
            { label: "Amount", value: formatBDT(numeric) },
            { label: "Fee", value: formatBDT(fee) },
            { label: "You receive", value: formatBDT(receives), emphasis: true },
            { label: "Remaining balance", value: formatBDT(balances.available - numeric) },
          ]}
        />
        <ReferenceRow reference={reference} />
        <FlowActions>
          <Link to="/transactions">
            <SoftButton className="w-full sm:w-auto">View transactions</SoftButton>
          </Link>
          <Link to="/dashboard">
            <SubmitButton className="w-full sm:w-auto">Back to dashboard</SubmitButton>
          </Link>
        </FlowActions>
      </Shell>
    );
  }

  return (
    <Shell>
      <StepTracker steps={steps} current={step} />

      {step === 0 ? (
        <div className="space-y-5">
          <SectionHeading title="Where should the money go?" description="Choose a linked bank or mobile wallet." />
          {destinations.length === 0 ? (
            <InlineFormError message="No withdrawal destinations connected yet." />
          ) : (
            <SourceSelect
              sources={destinations}
              value={destinationId}
              onChange={setDestinationId}
              label="Withdrawal destination"
              name="withdraw-destination"
            />
          )}
          <Link to="/sources/connect/$kind" params={{ kind: "bank" }} className="block">
            <SoftButton className="w-full">Connect a bank account</SoftButton>
          </Link>
          <FlowActions>
            <SubmitButton disabled={!destination} onClick={() => setStep(1)}>
              Continue <ArrowRight className="size-4" aria-hidden />
            </SubmitButton>
          </FlowActions>
        </div>
      ) : null}

      {step === 1 ? (
        <form
          className="space-y-5"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            if (validateAmount()) setStep(2);
          }}
        >
          <SectionHeading
            title="How much do you want to withdraw?"
            description={`Available balance ${formatBDT(balances.available)}`}
          />
          <AmountField
            id="withdraw-amount"
            value={amount}
            onChange={setAmount}
            error={amountError}
            hint="A 0.85% cash-out fee applies (minimum ৳10)."
          />
          <button
            type="button"
            onClick={() => setAmount(String(balances.available))}
            className="text-sm font-semibold text-primary hover:underline"
          >
            Withdraw full balance
          </button>
          <FlowActions>
            <SoftButton onClick={() => setStep(0)}>
              <ArrowLeft className="size-4" aria-hidden /> Back
            </SoftButton>
            <SubmitButton type="submit">
              Review <ArrowRight className="size-4" aria-hidden />
            </SubmitButton>
          </FlowActions>
        </form>
      ) : null}

      {step === 2 ? (
        <div className="space-y-5">
          <SectionHeading title="Review withdrawal" description="Double-check the destination before confirming." />
          <SummaryList
            rows={[
              { label: "From", value: "Payra Wallet" },
              { label: "To", value: `${destination?.name ?? "—"} · ${destination?.detail ?? ""}` },
              { label: "Amount", value: formatBDT(numeric) },
              { label: "Cash-out fee", value: formatBDT(fee) },
              { label: "You receive", value: formatBDT(receives), emphasis: true },
            ]}
          />
          <p className="flex items-start gap-2 rounded-2xl border border-dashed border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
            <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            Bank withdrawals settle on business days. Mobile wallet cash-outs are usually instant.
          </p>
          <TrustBadges />
          <FlowActions>
            <SoftButton onClick={() => setStep(1)}>
              <ArrowLeft className="size-4" aria-hidden /> Back
            </SoftButton>
            <SoftButton onClick={() => confirm(true)}>Simulate failure</SoftButton>
            <SubmitButton onClick={() => confirm()}>Withdraw {formatBDT(numeric)}</SubmitButton>
          </FlowActions>
        </div>
      ) : null}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <AppShell title="Withdraw Money" subtitle="Move funds from Payra to your bank or wallet.">
      <SurfaceCard className="mx-auto max-w-2xl p-6 sm:p-7">{children}</SurfaceCard>
    </AppShell>
  );
}
