import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowDownLeft, Plus, QrCode, Send } from "lucide-react";
import { AppShell } from "@/components/payra/app-shell";
import { BalanceCard, PaymentSourceCard, TransactionCard } from "@/components/payra/cards";
import { SectionHeading, SurfaceCard, TrustBadges } from "@/components/payra/ui-kit";
import {
  balances,
  currentUser,
  formatBDT,
  paymentSources,
  transactions,
} from "@/lib/payra-data";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Payra" },
      { name: "description", content: "Your Payra balance, quick actions and recent transactions." },
      { property: "og:title", content: "Dashboard — Payra" },
      { property: "og:description", content: "Your balance, quick actions and recent activity." },
    ],
  }),
  component: Dashboard,
});

const quickActions = [
  { to: "/send", label: "Send Money", icon: Send },
  { to: "/receive", label: "Receive Money", icon: ArrowDownLeft },
  { to: "/scan", label: "Scan QR", icon: QrCode },
  { to: "/sources", label: "Add Money", icon: Plus },
] as const;

function Dashboard() {
  const recent = transactions.slice(0, 5);
  const spent = transactions
    .filter((t) => t.amount < 0 && t.status === "completed")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const receivedTotal = transactions
    .filter((t) => t.amount > 0 && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <AppShell
      title={`Good afternoon, ${currentUser.firstName} 👋`}
      subtitle="Here's how your money is moving today."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <BalanceCard
            total={balances.total}
            available={balances.available}
            pending={balances.pending}
            last4={currentUser.cardLast4}
          />

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {quickActions.map(({ to, label, icon: Icon }) => (
              <Link
                key={to + label}
                to={to}
                className="flex flex-col items-center gap-2.5 rounded-3xl border border-border/70 bg-card p-5 text-center shadow-soft transition-all hover:-translate-y-1 hover:shadow-card"
              >
                <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="text-sm font-semibold text-foreground">{label}</span>
              </Link>
            ))}
          </div>

          <div>
            <SectionHeading
              title="Recent transactions"
              action={
                <Link
                  to="/transactions"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                >
                  View all <ArrowRight className="size-4" />
                </Link>
              }
            />
            <div className="space-y-3">
              {recent.map((tx) => (
                <TransactionCard key={tx.id} tx={tx} />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <SurfaceCard>
            <SectionHeading title="This month" />
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-2xl bg-success/8 px-4 py-3">
                <span className="text-sm font-medium text-muted-foreground">Money in</span>
                <span className="text-sm font-bold text-success">{formatBDT(receivedTotal)}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-accent px-4 py-3">
                <span className="text-sm font-medium text-muted-foreground">Money out</span>
                <span className="text-sm font-bold text-foreground">{formatBDT(spent)}</span>
              </div>
            </div>
          </SurfaceCard>

          <SurfaceCard>
            <SectionHeading
              title="Payment sources"
              action={
                <Link to="/sources" className="text-sm font-semibold text-primary hover:underline">
                  Manage
                </Link>
              }
            />
            <div className="space-y-3">
              {paymentSources.slice(0, 3).map((s) => (
                <PaymentSourceCard key={s.id} source={s} />
              ))}
            </div>
          </SurfaceCard>

          <SurfaceCard>
            <p className="text-sm font-semibold text-foreground">Your money stays protected</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Every transfer is encrypted and confirmed with your PIN or biometrics.
            </p>
            <TrustBadges className="mt-4" />
          </SurfaceCard>
        </div>
      </div>
    </AppShell>
  );
}
