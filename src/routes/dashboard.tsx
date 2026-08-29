import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, ArrowDownLeft, ArrowUpRight, HandCoins, Plus, QrCode, Send } from "lucide-react";
import { AppShell } from "@/components/payra/app-shell";
import { BalanceCard, PaymentSourceCard, TransactionCard } from "@/components/payra/cards";
import { SectionHeading, SurfaceCard, TrustBadges } from "@/components/payra/ui-kit";
import { formatBDT, type PaymentSource, type Transaction } from "@/lib/payra-data";
import { getCurrentProfile, getCurrentWallet, getMyPaymentMethods, getMyTransactions, supabase, transactionAmount, transactionKind } from "@/lib/supabase-data";

export const Route = createFileRoute("/dashboard")({ head: () => ({ meta: [
  { title: "Dashboard — Payra" }, { name: "description", content: "Your Payra balance, quick actions and recent transactions." },
  { property: "og:title", content: "Dashboard — Payra" }, { property: "og:description", content: "Your balance, quick actions and recent activity." },
] }), component: Dashboard });

const quickActions = [
  { to: "/send", label: "Send Money", icon: Send }, { to: "/receive", label: "Receive Money", icon: ArrowDownLeft },
  { to: "/scan", label: "Scan QR", icon: QrCode }, { to: "/add-money", label: "Add Money", icon: Plus },
  { to: "/withdraw", label: "Withdraw", icon: ArrowUpRight }, { to: "/request", label: "Request", icon: HandCoins },
] as const;

function Dashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("there");
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paymentSources, setPaymentSources] = useState<PaymentSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [welcomeBonus, setWelcomeBonus] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [profile, wallet, dbMethods] = await Promise.all([getCurrentProfile(), getCurrentWallet(), getMyPaymentMethods()]);
        if (!profile || !wallet) { navigate({ to: "/login" }); return; }
        setUserName(profile.full_name?.split(" ")[0] || "there");
        setBalance(Number(wallet.balance) || 0);
        const { data: bonus } = await supabase.from("signup_bonuses").select("user_id").eq("user_id", profile.id).maybeSingle();
        setWelcomeBonus(Boolean(bonus));
        const dbTx = await getMyTransactions(5);
        setTransactions(dbTx.map((tx) => ({ id: tx.id, kind: transactionKind(tx, wallet.id), counterparty: "Payra user", description: tx.description || tx.type, amount: transactionAmount(tx, wallet.id), date: tx.created_at, source: "Payra Wallet", status: tx.status as Transaction["status"], fee: 0, category: tx.type })));
        setPaymentSources(dbMethods.map((m) => ({ id: m.id, name: m.provider, detail: m.account_label || (m.last4 ? `•••• ${m.last4}` : m.method_type), kind: (m.method_type === "bank" ? "bank" : m.method_type === "card" ? "card" : "mfs") as PaymentSource["kind"], status: "connected" as const })));
      } catch (e) { console.error(e); setError(e instanceof Error ? e.message : "Unable to load your wallet."); }
      finally { setLoading(false); }
    }
    load();
  }, [navigate]);

  const spent = transactions.filter((t) => t.amount < 0 && t.status === "completed").reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const receivedTotal = transactions.filter((t) => t.amount > 0 && t.status === "completed").reduce((sum, t) => sum + t.amount, 0);

  return <AppShell title={`Good afternoon, ${userName} 👋`} subtitle="Here's how your money is moving today.">
    {error ? <div className="mb-6 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div> : null}
    {welcomeBonus ? <div className="mb-6 rounded-3xl border border-primary/20 bg-primary/5 p-5 shadow-soft"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-lg font-bold text-foreground">🎉 You received ৳1,000 to explore Payra</p><p className="mt-1 text-sm text-muted-foreground">Use your welcome bonus to try Send Money, Receive Money and QR Scan payments with real Payra wallet transactions.</p></div><div className="flex flex-wrap gap-2"><Link to="/send" className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Try Send</Link><Link to="/scan" className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground">Try QR</Link></div></div></div> : null}
    <div className="grid gap-6 lg:grid-cols-3"><div className="space-y-6 lg:col-span-2">
      <BalanceCard total={loading ? 0 : balance} available={loading ? 0 : balance} pending={0} last4="0000" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{quickActions.map(({ to, label, icon: Icon }) => <Link key={to + label} to={to} className="flex flex-col items-center gap-2.5 rounded-3xl border border-border/70 bg-card p-5 text-center shadow-soft transition-all hover:-translate-y-1 hover:shadow-card"><span className="inline-flex size-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground"><Icon className="size-5" /></span><span className="text-sm font-semibold text-foreground">{label}</span></Link>)}</div>
      <div><SectionHeading title="Recent transactions" action={<Link to="/transactions" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">View all <ArrowRight className="size-4" /></Link>} /><div className="space-y-3">{transactions.map((tx) => <TransactionCard key={tx.id} tx={tx} />)}</div></div>
    </div><div className="space-y-6"><SurfaceCard><SectionHeading title="Recent activity" /><div className="space-y-3"><div className="flex items-center justify-between rounded-2xl bg-success/8 px-4 py-3"><span className="text-sm font-medium text-muted-foreground">Money in</span><span className="text-sm font-bold text-success">{formatBDT(receivedTotal)}</span></div><div className="flex items-center justify-between rounded-2xl bg-accent px-4 py-3"><span className="text-sm font-medium text-muted-foreground">Money out</span><span className="text-sm font-bold text-foreground">{formatBDT(spent)}</span></div></div></SurfaceCard>
      <SurfaceCard><SectionHeading title="Payment sources" action={<Link to="/sources" className="text-sm font-semibold text-primary hover:underline">Manage</Link>} /><div className="space-y-3">{paymentSources.slice(0, 3).map((s) => <PaymentSourceCard key={s.id} source={s} />)}</div></SurfaceCard>
      <SurfaceCard><p className="text-sm font-semibold text-foreground">Your money stays protected</p><p className="mt-1 text-xs text-muted-foreground">Every transfer is encrypted and confirmed with your PIN or biometrics.</p><TrustBadges className="mt-4" /></SurfaceCard>
    </div></div>
  </AppShell>;
}
