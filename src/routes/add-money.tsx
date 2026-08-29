import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CheckCircle2, Plus } from "lucide-react";
import { AppShell } from "@/components/payra/app-shell";
import { SectionHeading, SoftButton, SuccessState, SurfaceCard, TrustBadges } from "@/components/payra/ui-kit";
import { AmountField, FlowActions, InlineFormError, ProcessingState, ReferenceRow, SourceSelect, StepTracker, SubmitButton, SummaryList } from "@/components/payra/flow-kit";
import { completeMockProviderPayment, getCurrentWallet, getMyPaymentMethods, initiateProviderPayment, type DbPaymentMethod, type DbProviderPayment } from "@/lib/supabase-data";

export const Route = createFileRoute("/add-money")({
  head: () => ({ meta: [
    { title: "Add Money — Payra" },
    { name: "description", content: "Top up your Payra wallet from a connected payment method." },
  ]}),
  component: AddMoneyPage,
});

const steps = ["Source", "Amount", "Review"] as const;
const MIN_AMOUNT = 50;
const MAX_AMOUNT = 100000;

function formatBDT(amount: number) {
  return `৳${new Intl.NumberFormat("en-BD", { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(Math.abs(amount))}`;
}

function AddMoneyPage() {
  const [methods, setMethods] = useState<DbPaymentMethod[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [sourceId, setSourceId] = useState("");
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState<string>();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<DbProviderPayment | null>(null);
  const [providerPayment, setProviderPayment] = useState<DbProviderPayment | null>(null);

  useEffect(() => {
    Promise.all([getMyPaymentMethods(), getCurrentWallet()])
      .then(([loadedMethods, wallet]) => {
        setMethods(loadedMethods);
        setSourceId(loadedMethods.find((m) => m.is_default)?.id ?? loadedMethods[0]?.id ?? "");
        setWalletBalance(Number(wallet?.balance) || 0);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Unable to load payment methods."))
      .finally(() => setLoading(false));
  }, []);

  const sources = useMemo(() => methods.map((m) => ({
    id: m.id, name: m.provider || m.method_type,
    detail: m.account_label || (m.last4 ? `•••• ${m.last4}` : m.method_type),
    kind: m.method_type === "bank" ? "bank" : m.method_type === "card" ? "card" : "mfs", status: "connected",
  })), [methods]);
  const source = sources.find((s) => s.id === sourceId);
  const numeric = Number(amount);

  function validateAmount() {
    if (!amount || !Number.isFinite(numeric) || numeric <= 0) return setAmountError("Enter the amount you want to add."), false;
    if (numeric < MIN_AMOUNT) return setAmountError(`Minimum top-up is ${formatBDT(MIN_AMOUNT)}.`), false;
    if (numeric > MAX_AMOUNT) return setAmountError(`Maximum top-up is ${formatBDT(MAX_AMOUNT)} per transaction.`), false;
    setAmountError(undefined); return true;
  }

  async function confirm() {
    if (!sourceId || !validateAmount()) return;
    setProcessing(true); setError("");
    try { const payment = await initiateProviderPayment(sourceId, numeric, "add_money"); setProviderPayment(payment); setStep(3); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to start provider payment."); }
    finally { setProcessing(false); }
  }

  async function approveMockPayment() {
    if (!providerPayment) return;
    setProcessing(true); setError("");
    try { const completed = await completeMockProviderPayment(providerPayment.id, true); const wallet = await getCurrentWallet(); setWalletBalance(Number(wallet?.balance) || walletBalance + numeric); setResult(completed); }
    catch (e) { setError(e instanceof Error ? e.message : "Provider payment could not be completed."); }
    finally { setProcessing(false); }
  }

  if (loading) return <Shell><ProcessingState title="Loading payment methods" description="Checking your connected sources." /></Shell>;
  if (processing) return <Shell><ProcessingState title="Contacting provider" description={`Processing ${formatBDT(numeric)} through the selected payment provider.`} /></Shell>;
  if (result) return <Shell>
    <SuccessState title="Money added" description={`${formatBDT(numeric)} was added to your Payra wallet.`} />
    <SummaryList className="mt-6" rows={[{ label: "From", value: source?.name ?? "Payment method" }, { label: "Amount", value: formatBDT(numeric) }, { label: "New balance", value: formatBDT(walletBalance), emphasis: true }]} />
    <ReferenceRow reference={result.provider_reference} />
    <FlowActions><Link to="/transactions"><SoftButton className="w-full sm:w-auto">View transactions</SoftButton></Link><Link to="/dashboard"><SubmitButton className="w-full sm:w-auto">Back to dashboard</SubmitButton></Link></FlowActions>
  </Shell>;

  return <Shell>
    <StepTracker steps={steps} current={Math.min(step, 2)} />
    {error ? <InlineFormError message={error} /> : null}
    {step === 0 ? <div className="space-y-5">
      <SectionHeading title="Choose a funding source" description="Select a payment method already connected to your Payra account." />
      {sources.length ? <SourceSelect sources={sources} value={sourceId} onChange={setSourceId} label="Funding source" name="add-money-source" /> : <InlineFormError message="No payment method is connected yet." />}
      <Link to="/sources/connect/$kind" params={{ kind: "bank" }} className="block"><SoftButton className="w-full"><Plus className="size-4" /> Connect a new source</SoftButton></Link>
      <FlowActions><SubmitButton disabled={!source} onClick={() => setStep(1)}>Continue <ArrowRight className="size-4" /></SubmitButton></FlowActions>
    </div> : null}
    {step === 1 ? <form className="space-y-5" noValidate onSubmit={(e) => { e.preventDefault(); if (validateAmount()) setStep(2); }}>
      <SectionHeading title="How much do you want to add?" description={`From ${source?.name ?? "your payment method"}`} />
      <AmountField id="add-amount" value={amount} onChange={setAmount} error={amountError} hint={`Between ${formatBDT(MIN_AMOUNT)} and ${formatBDT(MAX_AMOUNT)}.`} />
      <FlowActions><SoftButton onClick={() => setStep(0)}><ArrowLeft className="size-4" /> Back</SoftButton><SubmitButton type="submit">Review <ArrowRight className="size-4" /></SubmitButton></FlowActions>
    </form> : null}
    {step === 2 ? <div className="space-y-5">
      <SectionHeading title="Review top-up" description="Confirm the amount and connected payment method." />
      <SummaryList rows={[{ label: "From", value: source?.name ?? "—" }, { label: "To", value: "Payra Wallet" }, { label: "Amount", value: formatBDT(numeric) }, { label: "New balance", value: formatBDT(walletBalance + numeric), emphasis: true }]} />
      <TrustBadges />
      <FlowActions><SoftButton onClick={() => setStep(1)}><ArrowLeft className="size-4" /> Back</SoftButton><SubmitButton onClick={confirm}>Continue to provider</SubmitButton></FlowActions>
    </div> : null}
    {step === 3 && providerPayment ? <div className="space-y-5">
      <SectionHeading title={`Mock ${source?.name ?? providerPayment.provider} payment`} description="This simulates provider approval. Your Payra wallet is credited only after approval." />
      <SummaryList rows={[{ label: "Provider", value: source?.name ?? providerPayment.provider }, { label: "Provider reference", value: providerPayment.provider_reference }, { label: "Amount", value: formatBDT(numeric), emphasis: true }, { label: "Status", value: "Awaiting mock approval" }]} />
      <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">When official APIs are available, this mock step can be replaced by real provider checkout and verified callbacks without changing the Payra wallet flow.</div>
      <FlowActions><SoftButton onClick={() => setStep(2)}><ArrowLeft className="size-4" /> Back</SoftButton><SubmitButton onClick={approveMockPayment}><CheckCircle2 className="size-4" /> Approve mock payment</SubmitButton></FlowActions>
    </div> : null}
  </Shell>;
}

function Shell({ children }: { children: React.ReactNode }) { return <AppShell title="Add Money" subtitle="Top up your Payra wallet using a connected payment method."><SurfaceCard className="mx-auto max-w-2xl p-6 sm:p-7">{children}</SurfaceCard></AppShell>; }
