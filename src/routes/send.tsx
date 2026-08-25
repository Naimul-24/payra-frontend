import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Fingerprint, Search } from "lucide-react";
import { AppShell } from "@/components/payra/app-shell";
import { PaymentSourceCard, UserAvatar } from "@/components/payra/cards";
import {
  GradientButton,
  SoftButton,
  SectionHeading,
  SurfaceCard,
  SuccessState,
  TrustBadges,
} from "@/components/payra/ui-kit";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { balances, contacts, formatBDT, paymentSources } from "@/lib/payra-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/send")({
  head: () => ({
    meta: [
      { title: "Send Money — Payra" },
      { name: "description", content: "Send money to any phone number, Payra ID or saved contact." },
      { property: "og:title", content: "Send Money — Payra" },
      { property: "og:description", content: "Send money in a few taps with Payra." },
    ],
  }),
  component: SendPage,
});

const methods = ["Phone Number", "Payra ID", "Email", "Saved Contact", "Scan QR"];
const categories = ["Transfer", "Bills", "Food & Drink", "Shopping", "Family"];
const steps = ["Recipient", "Amount", "Review"];

function SendPage() {
  const [step, setStep] = useState(0);
  const [method, setMethod] = useState(methods[3]);
  const [query, setQuery] = useState("");
  const [recipientId, setRecipientId] = useState(contacts[0]!.id);
  const [amount, setAmount] = useState("2500");
  const [note, setNote] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [sourceId, setSourceId] = useState(paymentSources[0]!.id);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [done, setDone] = useState(false);

  const recipient = contacts.find((c) => c.id === recipientId)!;
  const source = paymentSources.find((s) => s.id === sourceId)!;
  const value = Number(amount) || 0;
  const fee = value > 2000 ? 5 : 0;

  const filtered = useMemo(
    () =>
      contacts.filter((c) =>
        `${c.name} ${c.handle} ${c.phone}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );

  return (
    <AppShell title="Send Money" subtitle="Three quick steps and the money is on its way.">
      <div className="mx-auto max-w-2xl">
        {/* Stepper */}
        <ol className="mb-6 flex items-center gap-2">
          {steps.map((label, i) => (
            <li key={label} className="flex flex-1 items-center gap-2">
              <span
                className={cn(
                  "inline-flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                  i <= step
                    ? "bg-brand text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {i < step ? <Check className="size-4" /> : i + 1}
              </span>
              <span
                className={cn(
                  "hidden text-sm font-semibold sm:inline",
                  i <= step ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
              {i < steps.length - 1 ? <span className="h-px flex-1 bg-border" /> : null}
            </li>
          ))}
        </ol>

        <SurfaceCard className="p-6">
          {step === 0 ? (
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                {methods.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m)}
                    className={cn(
                      "rounded-xl border px-3.5 py-2 text-sm font-semibold transition-colors",
                      method === m
                        ? "border-primary bg-accent text-accent-foreground"
                        : "border-border text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search recipient"
                  aria-label="Search recipient"
                  className="h-12 rounded-xl pl-9"
                />
              </div>

              <div>
                <SectionHeading title="Recent recipients" />
                <div className="space-y-2">
                  {filtered.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setRecipientId(c.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors",
                        recipientId === c.id
                          ? "border-primary bg-accent/60"
                          : "border-border hover:bg-muted",
                      )}
                    >
                      <UserAvatar initials={c.name.split(" ").map((n) => n[0]).join("")} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-foreground">
                          {c.name}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {c.handle} · {c.phone}
                        </span>
                      </span>
                      {recipientId === c.id ? <Check className="size-4 text-primary" /> : null}
                    </button>
                  ))}
                </div>
              </div>

              <GradientButton className="w-full" onClick={() => setStep(1)}>
                Continue <ArrowRight className="size-4" />
              </GradientButton>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="space-y-5">
              <div className="rounded-2xl bg-brand-soft p-6 text-center">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Amount to send
                </p>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <span className="text-3xl font-extrabold text-brand-ink">৳</span>
                  <input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                    inputMode="decimal"
                    aria-label="Amount"
                    className="w-40 bg-transparent text-center text-4xl font-extrabold text-brand-ink outline-none"
                    placeholder="0.00"
                  />
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Available balance {formatBDT(balances.available)}
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="note">Note (optional)</Label>
                <Input
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Dinner split"
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Payment category</Label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCategory(c)}
                      className={cn(
                        "rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors",
                        category === c
                          ? "border-primary bg-accent text-accent-foreground"
                          : "border-border text-muted-foreground hover:bg-muted",
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Pay from</Label>
                {paymentSources
                  .filter((s) => s.status === "connected")
                  .map((s) => (
                    <PaymentSourceCard
                      key={s.id}
                      source={s}
                      selected={sourceId === s.id}
                      onSelect={setSourceId}
                    />
                  ))}
              </div>

              <div className="flex gap-3">
                <SoftButton className="flex-1" onClick={() => setStep(0)}>
                  <ArrowLeft className="size-4" /> Back
                </SoftButton>
                <GradientButton className="flex-1" onClick={() => setStep(2)}>
                  Review <ArrowRight className="size-4" />
                </GradientButton>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-5">
              <div className="flex items-center gap-3 rounded-2xl bg-muted p-4">
                <UserAvatar initials={recipient.name.split(" ").map((n) => n[0]).join("")} />
                <div>
                  <p className="text-sm font-semibold text-foreground">{recipient.name}</p>
                  <p className="text-xs text-muted-foreground">{recipient.handle}</p>
                </div>
              </div>

              <dl className="space-y-3 text-sm">
                {[
                  ["Amount", formatBDT(value)],
                  ["Transaction fee", formatBDT(fee)],
                  ["Payment source", source.name],
                  ["Category", category],
                  ["Note", note || "—"],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="font-semibold text-foreground">{v}</dd>
                  </div>
                ))}
                <div className="flex items-center justify-between border-t border-border pt-3">
                  <dt className="font-semibold text-foreground">Total</dt>
                  <dd className="text-lg font-extrabold text-foreground">
                    {formatBDT(value + fee)}
                  </dd>
                </div>
              </dl>

              <TrustBadges />

              <div className="flex gap-3">
                <SoftButton className="flex-1" onClick={() => setStep(1)}>
                  <ArrowLeft className="size-4" /> Back
                </SoftButton>
                <GradientButton className="flex-1" onClick={() => setConfirmOpen(true)}>
                  Confirm &amp; Send
                </GradientButton>
              </div>
            </div>
          ) : null}
        </SurfaceCard>
      </div>

      <Dialog
        open={confirmOpen}
        onOpenChange={(open) => {
          setConfirmOpen(open);
          if (!open) setDone(false);
        }}
      >
        <DialogContent className="rounded-3xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{done ? "Transfer complete" : "Confirm payment"}</DialogTitle>
          </DialogHeader>

          {done ? (
            <div className="space-y-6 py-2">
              <SuccessState
                title={`${formatBDT(value)} sent`}
                description={`${recipient.name} will receive it instantly.`}
              />
              <div className="flex gap-3">
                <Link to="/transactions" className="flex-1">
                  <SoftButton className="w-full">View history</SoftButton>
                </Link>
                <Link to="/dashboard" className="flex-1">
                  <GradientButton className="w-full">Done</GradientButton>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-5 py-2 text-center">
              <p className="text-sm text-muted-foreground">
                Sending <span className="font-bold text-foreground">{formatBDT(value + fee)}</span> to{" "}
                <span className="font-bold text-foreground">{recipient.name}</span> from {source.name}.
              </p>
              <span className="mx-auto inline-flex size-16 items-center justify-center rounded-full bg-accent">
                <Fingerprint className="size-8 text-accent-foreground" aria-hidden />
              </span>
              <p className="text-xs text-muted-foreground">
                Confirm with your PIN or biometrics (demo placeholder).
              </p>
              <GradientButton className="w-full" onClick={() => setDone(true)}>
                Authorise payment
              </GradientButton>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
