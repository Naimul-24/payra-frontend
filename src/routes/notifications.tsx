import { createFileRoute } from "@tanstack/react-router";
import { Bell, CreditCard, ShieldCheck, Wallet } from "lucide-react";
import { AppShell } from "@/components/payra/app-shell";
import { SurfaceCard } from "@/components/payra/ui-kit";
import { notifications } from "@/lib/payra-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [
    { title: "Notifications — Payra" }, { name: "description", content: "Review your Payra payment and security alerts." },
    { property: "og:title", content: "Notifications — Payra" }, { property: "og:description", content: "Your Payra alerts and updates." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: NotificationsPage,
});

const icons = { payment: CreditCard, received: Wallet, security: ShieldCheck, request: Bell };
function NotificationsPage() {
  return <AppShell title="Notifications" subtitle="Payments, requests and security updates."><SurfaceCard className="mx-auto max-w-3xl p-2"><div className="divide-y divide-border">{notifications.map((item) => { const Icon = icons[item.type]; return <div key={item.id} className={cn("flex gap-4 rounded-xl p-4", item.unread && "bg-accent/60")}><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-card"><Icon className="size-5 text-primary" /></span><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><p className="text-sm font-semibold text-foreground">{item.title}</p><span className="shrink-0 text-xs text-muted-foreground">{item.time}</span></div><p className="mt-1 text-sm text-muted-foreground">{item.body}</p></div>{item.unread ? <span className="mt-2 size-2 shrink-0 rounded-full bg-primary" /> : null}</div>; })}</div></SurfaceCard></AppShell>;
}