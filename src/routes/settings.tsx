import { createFileRoute } from "@tanstack/react-router";
import { Bell, Fingerprint, HelpCircle, Lock } from "lucide-react";
import { AppShell } from "@/components/payra/app-shell";
import { SurfaceCard } from "@/components/payra/ui-kit";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [
    { title: "Settings — Payra" }, { name: "description", content: "Manage Payra security and notification settings." },
    { property: "og:title", content: "Settings — Payra" }, { property: "og:description", content: "Manage your Payra preferences." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: SettingsPage,
});

function SettingsPage() {
  const settings = [{ icon: Bell, title: "Payment notifications", body: "Alerts for every payment and transfer", checked: true }, { icon: Fingerprint, title: "Biometric approval", body: "Confirm payments with your fingerprint", checked: true }, { icon: Lock, title: "Privacy mode", body: "Hide balances when Payra opens", checked: false }, { icon: HelpCircle, title: "Product updates", body: "Occasional news about new Payra features", checked: false }];
  return <AppShell title="Settings" subtitle="Control security, privacy and notifications."><SurfaceCard className="mx-auto max-w-2xl p-6"><div className="divide-y divide-border">{settings.map(({ icon: Icon, title, body, checked }) => <div key={title} className="flex items-center gap-4 py-4"><span className="grid size-11 place-items-center rounded-xl bg-accent"><Icon className="size-5 text-accent-foreground" /></span><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-foreground">{title}</p><p className="text-xs text-muted-foreground">{body}</p></div><Switch defaultChecked={checked} aria-label={title} /></div>)}</div></SurfaceCard></AppShell>;
}