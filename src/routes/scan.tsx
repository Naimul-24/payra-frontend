import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, ImagePlus, ScanLine } from "lucide-react";
import { AppShell } from "@/components/payra/app-shell";
import { GradientButton, SoftButton, SurfaceCard } from "@/components/payra/ui-kit";

export const Route = createFileRoute("/scan")({
  head: () => ({ meta: [
    { title: "Scan QR — Payra" },
    { name: "description", content: "Scan a Payra QR code to make a secure payment." },
    { property: "og:title", content: "Scan QR — Payra" },
    { property: "og:description", content: "Scan and pay securely with Payra." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ScanPage,
});

function ScanPage() {
  const [active, setActive] = useState(false);
  return (
    <AppShell title="Scan QR" subtitle="Point your camera at a Payra payment code.">
      <div className="mx-auto max-w-xl">
        <SurfaceCard className="p-6">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-brand-ink">
            <div className="absolute inset-10 rounded-3xl border-2 border-primary-foreground/80">
              <ScanLine className="absolute left-1/2 top-1/2 size-20 -translate-x-1/2 -translate-y-1/2 text-primary-foreground/80" />
              {active ? <span className="absolute inset-x-3 top-3 h-0.5 animate-scan bg-cyan" /> : null}
            </div>
            <p className="absolute inset-x-4 bottom-6 text-center text-sm font-medium text-primary-foreground/80">
              {active ? "Camera ready — align a QR code" : "Camera preview is paused"}
            </p>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <GradientButton onClick={() => setActive((value) => !value)}>
              <Camera className="size-4" /> {active ? "Pause camera" : "Open camera"}
            </GradientButton>
            <SoftButton><ImagePlus className="size-4" /> Upload QR image</SoftButton>
          </div>
          <Link to="/send" className="mt-5 block text-center text-sm font-semibold text-primary hover:underline">
            Send without scanning
          </Link>
        </SurfaceCard>
      </div>
    </AppShell>
  );
}