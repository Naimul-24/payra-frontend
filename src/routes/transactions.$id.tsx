import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/payra/app-shell";
import { SoftButton, StatusPill, SurfaceCard } from "@/components/payra/ui-kit";
import { formatBDT, formatDateTime, getTransaction } from "@/lib/payra-data";

export const Route = createFileRoute("/transactions/$id")({
  head: () => ({ meta: [
    { title: "Transaction Details — Payra" },
    { name: "description", content: "View the status and details of a Payra transaction." },
    { property: "og:title", content: "Transaction Details — Payra" },
    { property: "og:description", content: "View a Payra transaction receipt." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: TransactionDetailsPage,
});

function TransactionDetailsPage() {
  const { id } = Route.useParams();
  const transaction = getTransaction(id);
  if (!transaction) {
    return <AppShell title="Transaction not found"><Link to="/transactions"><SoftButton><ArrowLeft /> Back to transactions</SoftButton></Link></AppShell>;
  }
  const rows = [
    ["Transaction ID", transaction.id], ["Date", formatDateTime(transaction.date)],
    ["Counterparty", transaction.counterparty], ["Payment source", transaction.source],
    ["Category", transaction.category], ["Fee", formatBDT(transaction.fee)],
  ];
  return (
    <AppShell title="Transaction Details" subtitle="A complete receipt for this activity.">
      <SurfaceCard className="mx-auto max-w-xl p-7">
        <div className="flex flex-col items-center border-b border-border pb-6 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-success/12"><CheckCircle2 className="size-7 text-success" /></span>
          <p className="mt-4 text-3xl font-extrabold text-foreground">{formatBDT(transaction.amount, true)}</p>
          <p className="mt-1 text-sm text-muted-foreground">{transaction.description}</p>
          <div className="mt-3"><StatusPill status={transaction.status} /></div>
        </div>
        <dl className="space-y-4 py-6 text-sm">
          {rows.map(([label, value]) => <div key={label} className="flex justify-between gap-5"><dt className="text-muted-foreground">{label}</dt><dd className="text-right font-semibold text-foreground">{value}</dd></div>)}
        </dl>
        <Link to="/transactions"><SoftButton className="w-full"><ArrowLeft /> Back to transactions</SoftButton></Link>
      </SurfaceCard>
    </AppShell>
  );
}