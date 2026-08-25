import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/payra/app-shell";
import { PaymentSourceCard } from "@/components/payra/cards";
import { GradientButton, SectionHeading, SurfaceCard } from "@/components/payra/ui-kit";
import { paymentSources } from "@/lib/payra-data";

export const Route = createFileRoute("/sources")({
  head: () => ({ meta: [
    { title: "Payment Sources — Payra" },
    { name: "description", content: "Manage the banks, cards and wallets connected to Payra." },
    { property: "og:title", content: "Payment Sources — Payra" },
    { property: "og:description", content: "Manage your connected Payra payment sources." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: SourcesPage,
});

function SourcesPage() {
  return (
    <AppShell title="Payment Sources" subtitle="Choose where your Payra payments come from.">
      <SurfaceCard className="mx-auto max-w-3xl p-6">
        <SectionHeading title="Connected accounts" description="Wallets, banks, cards and mobile financial services." />
        <div className="space-y-3">
          {paymentSources.map((source) => <PaymentSourceCard key={source.id} source={source} />)}
        </div>
        <GradientButton className="mt-6 w-full" onClick={() => toast.success("Add payment source opened (demo)")}>
          <Plus className="size-4" /> Add Payment Source
        </GradientButton>
      </SurfaceCard>
    </AppShell>
  );
}