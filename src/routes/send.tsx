import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Search } from "lucide-react";
import { AppShell } from "@/components/payra/app-shell";
import { GradientButton, SoftButton, SectionHeading, SurfaceCard, SuccessState, TrustBadges } from "@/components/payra/ui-kit";
import { UserAvatar } from "@/components/payra/cards";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { getCurrentWallet, sendMoney } from "@/lib/supabase-data";
import { supabase } from "@/lib/supabaseClient";

export const Route = createFileRoute("/send")({
  head: () => ({ meta: [{ title: "Send Money — Payra" }, { name: "description", content: "Send money securely from your Payra wallet." }] }),
  component: SendPage,
});

const methods = ["Phone Number", "Payra ID", "Email", "Scan QR"];
const categories = ["Transfer", "Bills", "Food & Drink", "Shopping", "Family"];
const steps = ["Recipient", "Amount", "Review"];
const formatBDT = (value: number) => `৳${value.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

type Profile = { id: string; full_name: string; phone: string | null; avatar_url: string | null };

function SendPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [balance, setBalance] = useState(0);
  const [walletId, setWalletId] = useState("");
  const [step, setStep] = useState(0);
  const [method, setMethod] = useState(methods[0]);
  const [query, setQuery] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const wallet = await getCurrentWallet();
        if (!wallet) throw new Error("Wallet not found. Please complete your account setup.");
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData.user?.id;
        if (!userId) throw new Error("Please log in again.");
        const { data, error } = await supabase.from("profiles").select("id, full_name, phone, avatar_url").neq("id", userId).order("full_name").limit(100);
        if (error) throw error;
        if (active) {
          setWalletId(wallet.id);
          setBalance(Number(wallet.balance) || 0);
          setProfiles((data ?? []) as Profile[]);
        }
      } catch (error) {
        if (active) setSendError(error instanceof Error ? error.message : "Unable to load wallet.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  const recipient = profiles.find((p) => p.id === recipientId);
  const filtered = useMemo(() => profiles.filter((p) => `${p.full_name} ${p.phone ?? ""}`.toLowerCase().includes(query.toLowerCase())), [profiles, query]);
  const value = Number(amount) || 0;

  const continueToAmount = () => {
    setSendError("");
    if (!recipient) return setSendError("Select a recipient first.");
    setStep(1);
  };

  const continueToReview = () => {
    setSendError("");
    if (value <= 0) return setSendError("Enter a valid amount.");
    if (value > balance) return setSendError("Insufficient wallet balance.");
    setStep(2);
  };

  const confirmTransfer = async () => {
    setSending(true);
    setSendError("");
    try {
      if (!recipient) throw new Error("Select a recipient first.");
      if (value <= 0) throw new Error("Enter a valid amount.");
      if (value > balance) throw new Error("Insufficient wallet balance.");
      await sendMoney(recipient.id, value, note || `${category} transfer`);
      const wallet = await getCurrentWallet();
      setBalance(Number(wallet?.balance) || Math.max(0, balance - value));
      setDone(true);
    } catch (error) {
      setSendError(error instanceof Error ? error.message : "Transfer failed. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <AppShell title="Send Money" subtitle="Send securely from your Payra wallet.">
      <div className="mx-auto max-w-2xl">
        <ol className="mb-6 flex items-center gap-2">
          {steps.map((label, i) => (
            <li key={label} className="flex flex-1 items-center gap-2">
              <span className={cn("inline-flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold", i <= step ? "bg-brand text-primary-foreground" : "bg-muted text-muted-foreground")}>{i < step ? <Check className="size-4" /> : i + 1}</span>
              <span className={cn("hidden text-sm font-semibold sm:inline", i <= step ? "text-foreground" : "text-muted-foreground")}>{label}</span>
              {i < steps.length - 1 ? <span className="h-px flex-1 bg-border" /> : null}
            </li>
          ))}
        </ol>

        {sendError && !confirmOpen ? <div className="mb-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{sendError}</div> : null}

        <SurfaceCard className="p-6">
          {loading ? <p className="py-10 text-center text-sm text-muted-foreground">Loading your wallet and recipients…</p> : null}

          {!loading && step === 0 ? (
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">{methods.map((m) => <button key={m} type="button" onClick={() => setMethod(m)} className={cn("rounded-xl border px-3.5 py-2 text-sm font-semibold", method === m ? "border-primary bg-accent text-accent-foreground" : "border-border text-muted-foreground hover:bg-muted")}>{m}</button>)}</div>
              <div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or phone" aria-label="Search recipient" className="h-12 rounded-xl pl-9" /></div>
              <div><SectionHeading title="Payra users" /><div className="space-y-2">{filtered.length ? filtered.map((p) => <button key={p.id} type="button" onClick={() => setRecipientId(p.id)} className={cn("flex w-full items-center gap-3 rounded-2xl border p-3 text-left", recipientId === p.id ? "border-primary bg-accent/60" : "border-border hover:bg-muted")}><UserAvatar initials={p.full_name.split(" ").map((n) => n[0]).join("")} /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{p.full_name}</span><span className="block truncate text-xs text-muted-foreground">{p.phone ?? "Payra account"}</span></span>{recipientId === p.id ? <Check className="size-4 text-primary" /> : null}</button>) : <p className="py-6 text-center text-sm text-muted-foreground">No Payra users found.</p>}</div></div>
              <GradientButton className="w-full" onClick={continueToAmount}>Continue <ArrowRight className="size-4" /></GradientButton>
            </div>
          ) : null}

          {!loading && step === 1 && recipient ? (
            <div className="space-y-5">
              <div className="rounded-2xl bg-brand-soft p-6 text-center"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Amount to send</p><div className="mt-2 flex items-center justify-center gap-2"><span className="text-3xl font-extrabold text-brand-ink">৳</span><input value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))} inputMode="decimal" className="w-44 bg-transparent text-center text-4xl font-extrabold text-brand-ink outline-none" placeholder="0.00" /></div><p className="mt-3 text-xs text-muted-foreground">Available balance {formatBDT(balance)}</p></div>
              <div className="flex items-center gap-3 rounded-2xl bg-muted p-4"><UserAvatar initials={recipient.full_name.split(" ").map((n) => n[0]).join("")} /><div><p className="text-sm font-semibold">{recipient.full_name}</p><p className="text-xs text-muted-foreground">{recipient.phone}</p></div></div>
              <div><Label htmlFor="note">Note (optional)</Label><Input id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Dinner split" className="mt-1.5 h-12 rounded-xl" /></div>
              <div><Label>Category</Label><div className="mt-2 flex flex-wrap gap-2">{categories.map((c) => <button key={c} type="button" onClick={() => setCategory(c)} className={cn("rounded-xl border px-3 py-1.5 text-sm", category === c ? "border-primary bg-accent text-accent-foreground" : "border-border text-muted-foreground")}>{c}</button>)}</div></div>
              <div className="flex gap-3"><SoftButton className="flex-1" onClick={() => setStep(0)}><ArrowLeft className="size-4" /> Back</SoftButton><GradientButton className="flex-1" onClick={continueToReview}>Review <ArrowRight className="size-4" /></GradientButton></div>
            </div>
          ) : null}

          {!loading && step === 2 && recipient ? (
            <div className="space-y-5"><div className="flex items-center gap-3 rounded-2xl bg-muted p-4"><UserAvatar initials={recipient.full_name.split(" ").map((n) => n[0]).join("")} /><div><p className="text-sm font-semibold">{recipient.full_name}</p><p className="text-xs text-muted-foreground">{recipient.phone}</p></div></div><dl className="space-y-3 text-sm"><div className="flex justify-between"><dt className="text-muted-foreground">Amount</dt><dd className="font-semibold">{formatBDT(value)}</dd></div><div className="flex justify-between"><dt className="text-muted-foreground">Category</dt><dd className="font-semibold">{category}</dd></div><div className="flex justify-between"><dt className="text-muted-foreground">Note</dt><dd className="font-semibold">{note || "—"}</dd></div><div className="flex justify-between border-t pt-3"><dt className="font-semibold">Total</dt><dd className="text-lg font-extrabold">{formatBDT(value)}</dd></div></dl><TrustBadges /><div className="flex gap-3"><SoftButton className="flex-1" onClick={() => setStep(1)}><ArrowLeft className="size-4" /> Back</SoftButton><GradientButton className="flex-1" onClick={() => setConfirmOpen(true)}>Confirm &amp; Send</GradientButton></div></div>
          ) : null}
        </SurfaceCard>
      </div>

      <Dialog open={confirmOpen} onOpenChange={(open) => { setConfirmOpen(open); if (!open && !done) setSendError(""); }}><DialogContent className="rounded-3xl sm:max-w-md"><DialogHeader><DialogTitle>{done ? "Transfer complete" : "Confirm transfer"}</DialogTitle></DialogHeader>{sendError ? <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{sendError}</div> : null}{done ? <div className="space-y-6 py-2"><SuccessState title={`${formatBDT(value)} sent`} description={`${recipient?.full_name ?? "Recipient"} will receive it instantly.`} /><div className="flex gap-3"><Link to="/transactions" className="flex-1"><SoftButton className="w-full">View history</SoftButton></Link><Link to="/dashboard" className="flex-1"><GradientButton className="w-full">Done</GradientButton></Link></div></div> : <div className="space-y-5 py-2"><p className="text-sm text-muted-foreground">Send <strong>{formatBDT(value)}</strong> to <strong>{recipient?.full_name}</strong>?</p><GradientButton className="w-full" disabled={sending} onClick={confirmTransfer}>{sending ? "Sending…" : "Confirm & Send"}</GradientButton></div>}</DialogContent></Dialog>
    </AppShell>
  );
}
