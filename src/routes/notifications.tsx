import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Bell, CreditCard, ShieldCheck, Wallet } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/payra/app-shell";
import { SoftButton, SurfaceCard } from "@/components/payra/ui-kit";
import { getMyNotifications, markNotificationRead } from "@/lib/supabase-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Payra" }, { name: "description", content: "Review your Payra payment and security alerts." }] }),
  component: NotificationsPage,
});

const icons = { payment: CreditCard, received: Wallet, security: ShieldCheck, request: Bell } as const;
type Notification = { id: string; title: string; message: string; is_read: boolean; created_at: string; type?: keyof typeof icons };

function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true); setError("");
    try { setItems((await getMyNotifications()) as Notification[]); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to load notifications."); }
    finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);

  async function read(id: string) {
    setBusyId(id);
    try {
      await markNotificationRead(id);
      setItems(current => current.map(item => item.id === id ? { ...item, is_read: true } : item));
    } catch (e) { toast.error(e instanceof Error ? e.message : "Unable to mark notification as read."); }
    finally { setBusyId(null); }
  }

  return <AppShell title="Notifications" subtitle="Payments, requests and security updates."><SurfaceCard className="mx-auto max-w-3xl p-2">
    {loading ? <p className="p-4 text-sm text-muted-foreground">Loading notifications...</p> : error ? <div className="p-4"><p className="text-sm text-destructive">{error}</p><SoftButton className="mt-3" onClick={load}>Retry</SoftButton></div> : items.length === 0 ? <p className="p-4 text-sm text-muted-foreground">No notifications yet.</p> : <div className="divide-y divide-border">{items.map(item => { const Icon = icons[item.type || "payment"] || Bell; return <div key={item.id} className={cn("flex gap-4 rounded-xl p-4", !item.is_read && "bg-accent/60")}><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-card"><Icon className="size-5 text-primary" /></span><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><p className="text-sm font-semibold text-foreground">{item.title}</p><span className="shrink-0 text-xs text-muted-foreground">{new Date(item.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</span></div><p className="mt-1 text-sm text-muted-foreground">{item.message}</p>{!item.is_read && <button type="button" disabled={busyId === item.id} onClick={() => void read(item.id)} className="mt-2 text-xs font-semibold text-primary hover:underline disabled:opacity-50">{busyId === item.id ? "Saving…" : "Mark as read"}</button>}</div>{!item.is_read && <span className="mt-2 size-2 shrink-0 rounded-full bg-primary" />}</div>; })}</div>}
  </SurfaceCard></AppShell>;
}