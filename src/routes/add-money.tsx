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
  const [result, setResult] = useState<DbProviderPayment | null>(null);\n  const [providerPayment, setProviderPayment] = useState<DbProviderPayment | null>(null);

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
    id: m.id,
    name: m.provider || m.method_type,
    detail: m.account_label || (m.last4 ? `•••• ${m.last4}` : m.method_type),
    kind: m.method_type === "bank" ? "bank" : m.method_type === "card" ? "card" : "mfs",
    status: "connected",
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
