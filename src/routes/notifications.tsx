import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Bell, CreditCard, ShieldCheck, Wallet } from "lucide-react";
import { AppShell } from "@/components/payra/app-shell";
import { SurfaceCard } from "@/components/payra/ui-kit";
import { getMyNotifications } from "@/lib/supabase-data";
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
  const [items, setItems] = useState<Array<{ id: string; title: string; message: string; is_read: boolean; created_at: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyNotifications().then(setItems).catch((e) => setError(e instanceof Error ? e.message : "Unable to load notifications.")).finally(() => setLoading(false));
  }, []);

  return <AppShell title="Notifications" subtitle="Payments, requests and security updates."><SurfaceCard className="mx-auto max-w-3xl p-2">
    {loading ? <p className="p-4 text-sm text-muted-foreground">Loading notifications...</p> : error ? <p className="p-4 text-sm text-destructive">{error}</p> : items.length === 0 ? <p className="p-4 text-sm text-muted-foreground">No notifications yet.</p> : <div className="divide-y divide-border">{items.map((item) => { const Icon = icons.payment; return <div key={item.id} className={cn("flex gap-4 rounded-xl p-4", !item.is_read && "bg-accent/60")}><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-card"><Icon className="size-5 text-primary" /></span><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><p className="text-sm font-semibold text-foreground">{item.title}</p><span className="shrink-0 text-xs text-muted-foreground">{new Date(item.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</span></div><p className="mt-1 text-sm text-muted-foreground">{item.message}</p></div>{!item.is_read ? <span className="mt-2 size-2 shrink-0 rounded-full bg-primary" /> : null}</div>; })}</div>}
  </SurfaceCard></AppShell>;
}
