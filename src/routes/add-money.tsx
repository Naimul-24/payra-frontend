import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Plus } from "lucide-react";
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

export const Route = createFileRoute("/add-money")({
  head: () => ({
    meta: [
      { title: "Add Money — Payra" },
      { name: "description", content: "Top up your Payra wallet from a bank, card or mobile financial service." },
      { property: "og:title", content: "Add Money — Payra" },
      { property: "og:description", content: "Top up your Payra wallet in seconds." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AddMoneyPage,
});

const steps = ["Source", "Amount", "Review"] as const;
const MIN_AMOUNT = 50;
const MAX_AMOUNT = 100000;

const fundingSources = paymentSources.filter((source) => source.kind !== "wallet");

function AddMoneyPage() {
  const [step, setStep] = useState(0);
  const [sourceId, setSourceId] = useState(fundingSources[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState<string | undefined>();
  const [reference, setReference] = useState("");
  const request = useSimulatedRequest(1800);

  const source = fundingSources.find((item) => item.id === sourceId);
  const numeric = Number(amount);
  const fee = calcFee("add", numeric);
  const total = Number.isFinite(numeric) && numeric > 0 ? numeric + fee : 0;

  function validateAmount() {
    if (!amount || !Number.isFinite(numeric) || numeric <= 0) {
      setAmountError("Enter the amount you want to add.");
      return false;
    }
    if (numeric < MIN_AMOUNT) {
      setAmountError(`Minimum top-up is ${formatBDT(MIN_AMOUNT)}.`);
      return false;
    }
    if (numeric > MAX_AMOUNT) {
      setAmountError(`Maximum top-up is ${formatBDT(MAX_AMOUNT)} per transaction.`);
      return false;
    }
    setAmountError(undefined);
    return true;
  }

  function confirm(forceFail = false) {
    setReference(makeReference("TOPUP"));
    request.run({
      fail: forceFail,
      failMessage: "Your bank declined this top-up. No money left your account — try another source.",
    });
  }

  if (request.isLoading) {
    return (
      <Shell>
        <ProcessingState title="Adding money" description={`Requesting ${formatBDT(total)} from ${source?.name ?? "your source"}.`} />
      </Shell>
    );
  }

  if (request.isError) {
    return (
      <Shell>
        <FailureState
          description={request.error ?? "The top-up failed."}
          onRetry={() => request.reset()}
          retryLabel="Try again"
          secondaryAction={
            <Link to="/sources">
              <SoftButton className="w-full sm:w-auto">Manage sources</SoftButton>
            </Link>
          }
        />
      </Shell>
    );
  }

  if (request.isSuccess) {
    return (
      <Shell>
        <SuccessState title="Money added" description={`${formatBDT(numeric)} is now available in your Payra wallet.`} />
        <SummaryList
          className="mt-6"
          rows={[
            { label: "From", value: source?.name ?? "—" },
            { label: "Amount", value: formatBDT(numeric) },
            { label: "Fee", value: fee === 0 ? "Free" : formatBDT(fee) },
            { label: "New balance", value: formatBDT(balances.available + numeric), emphasis: true },
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
          <SectionHeading title="Choose a funding source" description="Money is pulled from the source you pick." />
          {fundingSources.length === 0 ? (
            <InlineFormError message="No funding sources connected yet." />
          ) : (
            <SourceSelect
              sources={fundingSources}
              value={sourceId}
              onChange={setSourceId}
              label="Funding source"
              name="add-money-source"
            />
          )}
          <Link to="/sources/connect/$kind" params={{ kind: "bank" }} className="block">
            <SoftButton className="w-full">
              <Plus className="size-4" aria-hidden /> Connect a new source
            </SoftButton>
          </Link>
          <FlowActions>
            <SubmitButton disabled={!source} onClick={() => setStep(1)}>
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
          <SectionHeading title="How much do you want to add?" description={`From ${source?.name ?? ""}`} />
          <AmountField
            id="add-amount"
            value={amount}
            onChange={setAmount}
            error={amountError}
            hint={`Between ${formatBDT(MIN_AMOUNT)} and ${formatBDT(MAX_AMOUNT)}. Top-ups above ৳10,000 carry a 0.5% fee.`}
          />
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
          <SectionHeading title="Review top-up" description="Confirm the details before we move the money." />
          <SummaryList
            rows={[
              { label: "From", value: source?.name ?? "—" },
              { label: "To", value: "Payra Wallet" },
              { label: "Amount", value: formatBDT(numeric) },
              { label: "Fee", value: fee === 0 ? "Free" : formatBDT(fee) },
              { label: "Total charged", value: formatBDT(total), emphasis: true },
            ]}
          />
          <TrustBadges />
          <FlowActions>
            <SoftButton onClick={() => setStep(1)}>
              <ArrowLeft className="size-4" aria-hidden /> Back
            </SoftButton>
            <SoftButton onClick={() => confirm(true)}>Simulate failure</SoftButton>
            <SubmitButton onClick={() => confirm()}>Add {formatBDT(total)}</SubmitButton>
          </FlowActions>
        </div>
      ) : null}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <AppShell title="Add Money" subtitle="Top up your Payra wallet instantly.">
      <SurfaceCard className="mx-auto max-w-2xl p-6 sm:p-7">{children}</SurfaceCard>
    </AppShell>
  );
}
