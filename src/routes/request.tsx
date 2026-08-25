import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Copy, Share2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { AppShell } from "@/components/payra/app-shell";
import { SectionHeading, SoftButton, SuccessState, SurfaceCard } from "@/components/payra/ui-kit";
import {
  AmountField,
  FailureState,
  FlowActions,
  ProcessingState,
  ReferenceRow,
  StepTracker,
  SubmitButton,
  SummaryList,
  TextField,
} from "@/components/payra/flow-kit";
import { UserAvatar } from "@/components/payra/cards";
import { contacts, formatBDT, formatDateTime, makeReference, paymentRequests } from "@/lib/payra-data";
import type { PaymentRequestItem, PaymentRequestStatus } from "@/lib/payra-data";
import { useSimulatedRequest } from "@/lib/use-simulated-request";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/request")({
  head: () => ({
    meta: [
      { title: "Request Money — Payra" },
      { name: "description", content: "Ask friends or clients to pay you and track every Payra request." },
      { property: "og:title", content: "Request Money — Payra" },
      { property: "og:description", content: "Send and track Payra payment requests." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RequestMoneyPage,
});

const steps = ["Who", "Amount", "Send"] as const;

const noteSchema = z.string().trim().max(140, { message: "Notes must be under 140 characters." });

const statusTone: Record<PaymentRequestStatus, string> = {
  pending: "bg-warning/15 text-warning-foreground",
  paid: "bg-success/12 text-success",
  declined: "bg-destructive/12 text-destructive",
  expired: "bg-muted text-muted-foreground",
};

function RequestMoneyPage() {
  const [step, setStep] = useState(0);
  const [contactId, setContactId] = useState(contacts[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState<string | undefined>();
  const [note, setNote] = useState("");
  const [noteError, setNoteError] = useState<string | undefined>();
  const [reference, setReference] = useState("");
  const [sent, setSent] = useState<PaymentRequestItem[]>(paymentRequests);
  const request = useSimulatedRequest(1500);

  const contact = contacts.find((item) => item.id === contactId);
  const numeric = Number(amount);

  function validateAmount() {
    if (!amount || !Number.isFinite(numeric) || numeric <= 0) {
      setAmountError("Enter how much you want to request.");
      return false;
    }
    if (numeric > 500000) {
      setAmountError("Requests are capped at ৳500,000.");
      return false;
    }
    setAmountError(undefined);
    return true;
  }

  function send(forceFail = false) {
    const parsedNote = noteSchema.safeParse(note);
    if (!parsedNote.success) {
      setNoteError(parsedNote.error.issues[0]?.message);
      return;
    }
    setNoteError(undefined);
    const ref = makeReference("REQ");
    setReference(ref);
    request.run({
      fail: forceFail,
      failMessage: "We couldn't deliver this request. Check the recipient and try again.",
      onSuccess: () => {
        if (!contact) return;
        setSent((prev) => [
          {
            id: ref,
            contactName: contact.name,
            handle: contact.handle,
            amount: numeric,
            note: parsedNote.data,
            status: "pending",
            date: new Date().toISOString(),
            direction: "outgoing",
          },
          ...prev,
        ]);
      },
    });
  }

  function resetFlow() {
    request.reset();
    setStep(0);
    setAmount("");
    setNote("");
  }

  return (
    <AppShell title="Request Money" subtitle="Ask someone to pay you — they get a link and a reminder.">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <SurfaceCard className="p-6 sm:p-7">
          {request.isLoading ? (
            <ProcessingState title="Sending request" description={`Notifying ${contact?.name ?? "your contact"}.`} />
          ) : request.isError ? (
            <FailureState
              title="Request not sent"
              description={request.error ?? "Something went wrong."}
              onRetry={() => request.reset()}
              retryLabel="Try again"
            />
          ) : request.isSuccess ? (
            <>
              <SuccessState
                title="Request sent"
                description={`${contact?.name ?? "Your contact"} was asked for ${formatBDT(numeric)}.`}
              />
              <SummaryList
                className="mt-6"
                rows={[
                  { label: "To", value: `${contact?.name ?? "—"} · ${contact?.handle ?? ""}` },
                  { label: "Amount", value: formatBDT(numeric), emphasis: true },
                  { label: "Note", value: note || "—" },
                  { label: "Status", value: "Pending" },
                ]}
              />
              <ReferenceRow reference={reference} />
              <FlowActions>
                <SoftButton
                  onClick={() => {
                    void navigator.clipboard?.writeText(`https://payra.app/pay/${reference}`);
                    toast.success("Payment link copied");
                  }}
                >
                  <Copy className="size-4" aria-hidden /> Copy link
                </SoftButton>
                <SoftButton onClick={() => toast.success("Share sheet opened (demo)")}>
                  <Share2 className="size-4" aria-hidden /> Share
                </SoftButton>
                <SubmitButton onClick={resetFlow}>New request</SubmitButton>
              </FlowActions>
            </>
          ) : (
            <>
              <StepTracker steps={steps} current={step} />

              {step === 0 ? (
                <div className="space-y-5">
                  <SectionHeading title="Who owes you?" description="Pick a Payra contact to request from." />
                  <fieldset>
                    <legend className="sr-only">Contact</legend>
                    <div className="space-y-2">
                      {contacts.map((item) => (
                        <label
                          key={item.id}
                          className={cn(
                            "flex cursor-pointer items-center gap-3 rounded-2xl border p-3 transition-colors",
                            contactId === item.id
                              ? "border-primary bg-accent"
                              : "border-border bg-card hover:bg-accent/50",
                          )}
                        >
                          <input
                            type="radio"
                            name="request-contact"
                            className="size-4 accent-[var(--color-primary)]"
                            checked={contactId === item.id}
                            onChange={() => setContactId(item.id)}
                          />
                          <UserAvatar initials={item.name.split(" ").map((part) => part[0]).slice(0, 2).join("")} />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-foreground">{item.name}</span>
                            <span className="block truncate text-xs text-muted-foreground">{item.handle}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <FlowActions>
                    <SubmitButton disabled={!contact} onClick={() => setStep(1)}>
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
                  <SectionHeading title="How much?" description={`Requesting from ${contact?.name ?? ""}`} />
                  <AmountField id="request-amount" value={amount} onChange={setAmount} error={amountError} />
                  <TextField
                    id="request-note"
                    label="Note (optional)"
                    placeholder="Dinner at Gulshan"
                    value={note}
                    error={noteError}
                    onChange={(event) => setNote(event.target.value)}
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
                  <SectionHeading title="Review request" description="They'll get a notification and a payment link." />
                  <SummaryList
                    rows={[
                      { label: "To", value: `${contact?.name ?? "—"} · ${contact?.handle ?? ""}` },
                      { label: "Amount", value: formatBDT(numeric), emphasis: true },
                      { label: "Note", value: note || "—" },
                      { label: "Fee", value: "Free" },
                    ]}
                  />
                  <FlowActions>
                    <SoftButton onClick={() => setStep(1)}>
                      <ArrowLeft className="size-4" aria-hidden /> Back
                    </SoftButton>
                    <SoftButton onClick={() => send(true)}>Simulate failure</SoftButton>
                    <SubmitButton onClick={() => send()}>Send request</SubmitButton>
                  </FlowActions>
                </div>
              ) : null}
            </>
          )}
        </SurfaceCard>

        <SurfaceCard className="h-fit p-6">
          <SectionHeading title="Your requests" description="Track who has paid you back." />
          <ul className="space-y-3">
            {sent.map((item) => (
              <li key={item.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{item.contactName}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {item.direction === "incoming" ? "Asked you for" : "You requested"} · {formatDateTime(item.date)}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-bold text-foreground">{formatBDT(item.amount)}</span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
                      statusTone[item.status],
                    )}
                  >
                    {item.status}
                  </span>
                  {item.status === "pending" ? (
                    <button
                      type="button"
                      onClick={() => toast.success(`Reminder sent to ${item.contactName}`)}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Send reminder
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
          <Link to="/receive" className="mt-5 block">
            <SoftButton className="w-full">Show my QR instead</SoftButton>
          </Link>
        </SurfaceCard>
      </div>
    </AppShell>
  );
}
