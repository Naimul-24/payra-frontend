import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { AppShell } from "@/components/payra/app-shell";
import { TransactionCard } from "@/components/payra/cards";
import { Input } from "@/components/ui/input";
import { transactions } from "@/lib/payra-data";

export const Route = createFileRoute("/transactions/")({
  head: () => ({ meta: [
    { title: "Transactions — Payra" },
    { name: "description", content: "Review and search your Payra transaction history." },
    { property: "og:title", content: "Transactions — Payra" },
    { property: "og:description", content: "Review your Payra transaction history." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: TransactionsPage,
});

function TransactionsPage() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => transactions.filter((transaction) =>
    `${transaction.description} ${transaction.counterparty} ${transaction.id}`.toLowerCase().includes(query.toLowerCase()),
  ), [query]);
  return (
    <AppShell title="Transactions" subtitle="Every payment, transfer and top-up in one place.">
      <div className="mx-auto max-w-3xl">
        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search transactions" className="h-12 rounded-xl bg-card pl-9" />
        </div>
        <div className="space-y-3">
          {filtered.map((transaction) => <TransactionCard key={transaction.id} tx={transaction} />)}
          {filtered.length === 0 ? <p className="py-12 text-center text-sm text-muted-foreground">No matching transactions.</p> : null}
        </div>
      </div>
    </AppShell>
  );
}