import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, CreditCard, Plus, Smartphone, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/payra/app-shell";
import { PaymentSourceCard } from "@/components/payra/cards";
import { EmptyState, SectionHeading, SoftButton, SurfaceCard } from "@/components/payra/ui-kit";
import { SubmitButton } from "@/components/payra/flow-kit";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { paymentSources } from "@/lib/payra-data";
import type { PaymentSource } from "@/lib/payra-data";

export const Route = createFileRoute("/sources/")({
  head: () => ({
    meta: [
      { title: "Payment Sources — Payra" },
      { name: "description", content: "Manage the banks, cards and wallets connected to Payra." },
      { property: "og:title", content: "Payment Sources — Payra" },
      { property: "og:description", content: "Manage your connected Payra payment sources." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SourcesPage,
});

const connectOptions = [
  { kind: "bank", label: "Bank account", detail: "Fund and withdraw", icon: Building2 },
  { kind: "card", label: "Debit / credit card", detail: "Instant top-ups", icon: CreditCard },
  { kind: "mfs", label: "Mobile wallet", detail: "bKash, Nagad, Rocket", icon: Smartphone },
] as const;

function SourcesPage() {
  const [sources, setSources] = useState<PaymentSource[]>(paymentSources);
  const [pendingRemoval, setPendingRemoval] = useState<PaymentSource | null>(null);

  const removable = sources.filter((source) => source.kind !== "wallet");

  function remove(source: PaymentSource) {
    setSources((prev) => prev.filter((item) => item.id !== source.id));
    setPendingRemoval(null);
    toast.success(`${source.name} removed`);
  }

  return (
    <AppShell title="Payment Sources" subtitle="Choose where your Payra payments come from.">
      <div className="mx-auto grid max-w-4xl gap-6">
        <SurfaceCard className="p-6">
          <SectionHeading
            title="Connected accounts"
            description="Wallets, banks, cards and mobile financial services."
          />
          {sources.length === 0 ? (
            <EmptyState
              title="No payment sources yet"
              description="Connect a bank, card or mobile wallet to start moving money."
            />
          ) : (
            <div className="space-y-3">
              {sources.map((source) => (
                <div key={source.id} className="flex items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <PaymentSourceCard source={source} />
                  </div>
                  {source.kind !== "wallet" ? (
                    <button
                      type="button"
                      onClick={() => setPendingRemoval(source)}
                      aria-label={`Remove ${source.name}`}
                      className="grid size-10 shrink-0 place-items-center rounded-xl border border-border text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          )}
          <p className="mt-4 text-xs text-muted-foreground">
            {removable.length} removable source{removable.length === 1 ? "" : "s"} connected.
          </p>
        </SurfaceCard>

        <SurfaceCard className="p-6">
          <SectionHeading title="Add a payment source" description="Connect a new account in a few steps." />
          <div className="grid gap-3 sm:grid-cols-3">
            {connectOptions.map(({ kind, label, detail, icon: Icon }) => (
              <Link
                key={kind}
                to="/sources/connect/$kind"
                params={{ kind }}
                className="rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-accent"
              >
                <Icon className="size-5 text-primary" aria-hidden />
                <span className="mt-2 block text-sm font-semibold text-foreground">{label}</span>
                <span className="block text-xs text-muted-foreground">{detail}</span>
              </Link>
            ))}
          </div>
          <Link to="/sources/connect/$kind" params={{ kind: "bank" }} className="mt-5 block">
            <SubmitButton className="w-full">
              <Plus className="size-4" aria-hidden /> Add Payment Source
            </SubmitButton>
          </Link>
        </SurfaceCard>

        <SurfaceCard className="p-6">
          <SectionHeading title="Move money" description="Use your connected sources right away." />
          <div className="grid gap-3 sm:grid-cols-2">
            <Link to="/add-money">
              <SoftButton className="w-full">Add money</SoftButton>
            </Link>
            <Link to="/withdraw">
              <SoftButton className="w-full">Withdraw</SoftButton>
            </Link>
          </div>
        </SurfaceCard>
      </div>

      <AlertDialog open={pendingRemoval !== null} onOpenChange={(open) => !open && setPendingRemoval(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {pendingRemoval?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              You won&apos;t be able to add money or withdraw with this source until you connect it again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep source</AlertDialogCancel>
            <AlertDialogAction onClick={() => pendingRemoval && remove(pendingRemoval)}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
