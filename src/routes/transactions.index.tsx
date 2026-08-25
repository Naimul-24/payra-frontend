import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { AppShell } from "@/components/payra/app-shell";
import { TransactionCard } from "@/components/payra/cards";
import { EmptyState, ErrorState, ListSkeleton, SoftButton, SurfaceCard } from "@/components/payra/ui-kit";
import { Input } from "@/components/ui/input";
import { transactions } from "@/lib/payra-data";
import type { TransactionStatus } from "@/lib/payra-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/transactions/")({
  head: () => ({
    meta: [
      { title: "Transactions — Payra" },
      { name: "description", content: "Review and search your Payra transaction history." },
      { property: "og:title", content: "Transactions — Payra" },
      { property: "og:description", content: "Review your Payra transaction history." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TransactionsPage,
});

const filters = [
  { id: "all", label: "All" },
  { id: "completed", label: "Completed" },
  { id: "pending", label: "Pending" },
  { id: "failed", label: "Failed" },
] as const;

type FilterId = (typeof filters)[number]["id"];

function TransactionsPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterId>("all");
  const [phase, setPhase] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    if (phase !== "loading") return;
    const timer = setTimeout(() => setPhase("ready"), 700);
    return () => clearTimeout(timer);
  }, [phase]);

  const filtered = useMemo(
    () =>
      transactions.filter((transaction) => {
        const matchesQuery = `${transaction.description} ${transaction.counterparty} ${transaction.id}`
          .toLowerCase()
          .includes(query.trim().toLowerCase());
        const matchesFilter = filter === "all" || transaction.status === (filter as TransactionStatus);
        return matchesQuery && matchesFilter;
      }),
    [query, filter],
  );

  return (
    <AppShell title="Transactions" subtitle="Every payment, transfer and top-up in one place.">
      <div className="mx-auto max-w-3xl">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search transactions"
            aria-label="Search transactions"
            className="h-12 rounded-xl bg-card pl-9"
          />
        </div>

        <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Filter by status">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={filter === item.id}
              onClick={() => setFilter(item.id)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors",
                filter === item.id
                  ? "border-primary bg-accent text-accent-foreground"
                  : "border-border bg-card text-muted-foreground hover:bg-accent/50",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        {phase === "loading" ? (
          <SurfaceCard className="p-4">
            <ListSkeleton rows={5} />
          </SurfaceCard>
        ) : phase === "error" ? (
          <SurfaceCard className="p-6">
            <ErrorState onRetry={() => setPhase("loading")} />
          </SurfaceCard>
        ) : filtered.length === 0 ? (
          <SurfaceCard className="p-6">
            <EmptyState
              title="No transactions found"
              description={
                query || filter !== "all"
                  ? "Try a different search term or clear the status filter."
                  : "Once you send or receive money it will show up here."
              }
            />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <SoftButton
                className="w-full"
                onClick={() => {
                  setQuery("");
                  setFilter("all");
                }}
              >
                Clear filters
              </SoftButton>
              <Link to="/send">
                <SoftButton className="w-full">Send money</SoftButton>
              </Link>
            </div>
          </SurfaceCard>
        ) : (
          <div className="space-y-3">
            {filtered.map((transaction) => (
              <TransactionCard key={transaction.id} tx={transaction} />
            ))}
          </div>
        )}

        {phase === "ready" ? (
          <button
            type="button"
            onClick={() => setPhase("error")}
            className="mx-auto mt-6 block text-xs font-medium text-muted-foreground hover:text-foreground hover:underline"
          >
            Preview load-failure state
          </button>
        ) : null}
      </div>
    </AppShell>
  );
}
