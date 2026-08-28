import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

import { AppShell } from "@/components/payra/app-shell";
import { SoftButton, StatusPill, SurfaceCard } from "@/components/payra/ui-kit";
import { formatBDT } from "@/lib/payra-data";
import { supabase } from "@/lib/supabaseClient";

export const Route = createFileRoute("/transactions/$id")({
  head: () => ({
    meta: [
      { title: "Transaction Details — Payra" },
      {
        name: "description",
        content: "View the status and details of a Payra transaction.",
      },
      { property: "og:title", content: "Transaction Details — Payra" },
      {
        property: "og:description",
        content: "View a Payra transaction receipt.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TransactionDetailsPage,
});

type Transaction = {
  id: string;
  sender_wallet_id: string;
  receiver_wallet_id: string;
  amount: number;
  currency: string;
  type: string;
  status: string;
  description: string | null;
  reference: string | null;
  created_at: string;
};

function TransactionDetailsPage() {
  const { id } = Route.useParams();

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTransaction() {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("transactions")
        .select(
          "id, sender_wallet_id, receiver_wallet_id, amount, currency, type, status, description, reference, created_at",
        )
        .eq("id", id)
        .single();

      if (error) {
        console.error("Transaction error:", error);
        setError("Transaction not found.");
        setTransaction(null);
      } else {
        setTransaction(data as Transaction);
      }

      setLoading(false);
    }

    loadTransaction();
  }, [id]);

  if (loading) {
    return (
      <AppShell title="Transaction Details">
        <SurfaceCard className="mx-auto max-w-xl p-7">
          <p className="text-center text-sm text-muted-foreground">
            Loading transaction...
          </p>
        </SurfaceCard>
      </AppShell>
    );
  }

  if (error || !transaction) {
    return (
      <AppShell title="Transaction not found">
        <div className="mx-auto max-w-xl">
          <SurfaceCard className="p-7 text-center">
            <p className="mb-5 text-sm text-muted-foreground">
              {error || "This transaction does not exist."}
            </p>

            <Link to="/transactions">
              <SoftButton>
                <ArrowLeft className="size-4" />
                Back to transactions
              </SoftButton>
            </Link>
          </SurfaceCard>
        </div>
      </AppShell>
    );
  }

  const rows = [
    ["Transaction ID", transaction.id],
    ["Date", new Date(transaction.created_at).toLocaleString()],
    ["Type", transaction.type],
    ["Currency", transaction.currency],
    ["Reference", transaction.reference || "—"],
    ["Fee", formatBDT(0)],
  ];

  return (
    <AppShell
      title="Transaction Details"
      subtitle="A complete receipt for this activity."
    >
      <SurfaceCard className="mx-auto max-w-xl p-7">
        <div className="flex flex-col items-center border-b border-border pb-6 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-success/12">
            <CheckCircle2 className="size-7 text-success" />
          </span>

          <p className="mt-4 text-3xl font-extrabold text-foreground">
            {formatBDT(Number(transaction.amount), true)}
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            {transaction.description || "Payra transaction"}
          </p>

          <div className="mt-3">
            <StatusPill
              status={
                transaction.status as
                  | "completed"
                  | "pending"
                  | "failed"
              }
            />
          </div>
        </div>

        <dl className="space-y-4 py-6 text-sm">
          {rows.map(([label, value]) => (
            <div
              key={label}
              className="flex justify-between gap-5"
            >
              <dt className="text-muted-foreground">{label}</dt>

              <dd className="max-w-[65%] break-all text-right font-semibold text-foreground">
                {value}
              </dd>
            </div>
          ))}
        </dl>

        <Link to="/transactions">
          <SoftButton className="w-full">
            <ArrowLeft className="size-4" />
            Back to transactions
          </SoftButton>
        </Link>
      </SurfaceCard>
    </AppShell>
  );
}