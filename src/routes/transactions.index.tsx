import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";

import { AppShell } from "@/components/payra/app-shell";
import { TransactionCard } from "@/components/payra/cards";
import {
  EmptyState,
  ErrorState,
  ListSkeleton,
  SoftButton,
  SurfaceCard,
} from "@/components/payra/ui-kit";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabaseClient";
import type { Transaction } from "@/lib/payra-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/transactions/")({
  head: () => ({
    meta: [
      { title: "Transactions — Payra" },
      {
        name: "description",
        content: "Review and search your Payra transaction history.",
      },
      { property: "og:title", content: "Transactions — Payra" },
      {
        property: "og:description",
        content: "Review your Payra transaction history.",
      },
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
  const [phase, setPhase] =
    useState<"loading" | "ready" | "error">("loading");

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  async function loadTransactions() {
    setPhase("loading");

    const { data, error } = await supabase.rpc("get_my_transactions");

    if (error) {
      console.error("Transactions error:", error);
      setPhase("error");
      return;
    }

    const mapped: Transaction[] = (data ?? []).map((transaction: any) => {
      const amount = Number(transaction.amount) || 0;

      let kind: Transaction["kind"] = "sent";

      if (transaction.type === "received") {
        kind = "received";
      } else if (transaction.type === "payment") {
        kind = "payment";
      } else if (transaction.type === "add-money") {
        kind = "add-money";
      } else if (transaction.type === "withdrawal") {
        kind = "withdrawal";
      }

      return {
        id: transaction.id,
        kind,
        counterparty: "Payra User",
        description:
          transaction.description ||
          (transaction.type === "received"
            ? "Money received"
            : "Money sent"),
        amount,
        date: transaction.created_at,
        source: "Payra Wallet",
        status:
          transaction.status === "completed" ||
          transaction.status === "pending" ||
          transaction.status === "failed"
            ? transaction.status
            : "pending",
        fee: 0,
        category: transaction.type || "Transfer",
      };
    });

    setTransactions(mapped);
    setPhase("ready");
  }

  useEffect(() => {
    loadTransactions();
  }, []);

  const filtered = useMemo(() => {
    return transactions.filter((transaction) => {
      const searchText = [
        transaction.description,
        transaction.counterparty,
        transaction.id,
        transaction.category,
      ]
        .join(" ")
        .toLowerCase();

      const matchesQuery = searchText.includes(
        query.trim().toLowerCase(),
      );

      const matchesFilter =
        filter === "all" || transaction.status === filter;

      return matchesQuery && matchesFilter;
    });
  }, [transactions, query, filter]);

  return (
    <AppShell
      title="Transactions"
      subtitle="Every payment, transfer and top-up in one place."
    >
      <div className="mx-auto max-w-3xl">
        <div className="relative mb-4">
          <Search
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />

          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search transactions"
            aria-label="Search transactions"
            className="h-12 rounded-xl bg-card pl-9"
          />
        </div>

        <div
          className="mb-5 flex flex-wrap gap-2"
          role="group"
          aria-label="Filter by status"
        >
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
            <ErrorState onRetry={loadTransactions} />
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
                <SoftButton className="w-full">
                  Send money
                </SoftButton>
              </Link>
            </div>
          </SurfaceCard>
        ) : (
          <div className="space-y-3">
            {filtered.map((transaction) => (
              <TransactionCard
                key={transaction.id}
                tx={transaction}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}