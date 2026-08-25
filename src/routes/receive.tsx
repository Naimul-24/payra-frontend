import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Copy, Download, Share2, Check } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/payra/app-shell";
import { GradientButton, SoftButton, SurfaceCard, TrustBadges } from "@/components/payra/ui-kit";
import { QrCodeArt } from "@/components/payra/qr-art";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { currentUser, formatBDT } from "@/lib/payra-data";

export const Route = createFileRoute("/receive")({
  head: () => ({
    meta: [
      { title: "Receive Money — Payra" },
      { name: "description", content: "Share your Payra ID or QR code and request a specific amount." },
      { property: "og:title", content: "Receive Money — Payra" },
      { property: "og:description", content: "Get paid instantly with your Payra QR." },
    ],
  }),
  component: ReceivePage,
});

function ReceivePage() {
  const [amount, setAmount] = useState("2000");
  const [copied, setCopied] = useState(false);

  return (
    <AppShell title="Receive Money" subtitle="Share your Payra ID or QR to get paid instantly.">
      <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-2">
        <SurfaceCard className="flex flex-col items-center p-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Your Payra ID
          </p>
          <p className="mt-1 text-2xl font-extrabold text-brand-ink">{currentUser.payraId}</p>

          <QrCodeArt className="mt-6" />

          <p className="mt-5 text-sm text-muted-foreground">
            Scan this code with any Payra app to pay {currentUser.name}.
          </p>

          <div className="mt-6 grid w-full grid-cols-1 gap-2 sm:grid-cols-3">
            <SoftButton onClick={() => toast.success("QR share sheet opened (demo)")}>
              <Share2 className="size-4" /> Share
            </SoftButton>
            <SoftButton onClick={() => toast.success("QR downloaded (demo)")}>
              <Download className="size-4" /> Download
            </SoftButton>
            <SoftButton
              onClick={() => {
                setCopied(true);
                toast.success("Payra ID copied");
                setTimeout(() => setCopied(false), 1600);
              }}
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />} Copy ID
            </SoftButton>
          </div>
        </SurfaceCard>

        <SurfaceCard className="p-8">
          <h2 className="text-lg font-bold text-foreground">Request a specific amount</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a payment request link your contacts can pay in one tap.
          </p>

          <div className="mt-6 rounded-2xl bg-brand-soft p-6 text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl font-extrabold text-brand-ink">৳</span>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                inputMode="decimal"
                aria-label="Request amount"
                className="w-40 bg-transparent text-center text-4xl font-extrabold text-brand-ink outline-none"
                placeholder="0.00"
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Requesting {formatBDT(Number(amount) || 0)}
            </p>
          </div>

          <div className="mt-5 space-y-1.5">
            <Label htmlFor="reason">What's it for? (optional)</Label>
            <Input id="reason" placeholder="Rent share for August" className="h-12 rounded-xl" />
          </div>

          <GradientButton
            className="mt-6 w-full"
            onClick={() => toast.success("Payment request created (demo)")}
          >
            Create Payment Request
          </GradientButton>

          <TrustBadges className="mt-6" />
        </SurfaceCard>
      </div>
    </AppShell>
  );
}
