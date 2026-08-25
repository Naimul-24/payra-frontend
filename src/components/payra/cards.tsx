import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Building2,
  CreditCard,
  Eye,
  EyeOff,
  Plus,
  Smartphone,
  Wallet,
  QrCode,
  ShoppingBag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatBDT,
  formatDateTime,
  type PaymentSource,
  type Transaction,
} from "@/lib/payra-data";
import { StatusPill } from "./ui-kit";
import { Button } from "@/components/ui/button";

export function UserAvatar({
  initials,
  className,
}: {
  initials: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-primary-foreground",
        className,
      )}
    >
      {initials}
    </span>
  );
}

export function BalanceCard({
  total,
  available,
  pending,
  last4,
}: {
  total: number;
  available: number;
  pending: number;
  last4: string;
}) {
  const [hidden, setHidden] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-brand-card p-6 text-primary-foreground shadow-glow">
      <div className="pointer-events-none absolute -right-16 -top-24 size-64 rounded-full bg-primary-foreground/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-10 size-52 rounded-full bg-primary-foreground/10 blur-3xl" />

      <div className="relative">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-primary-foreground/75">Payra Wallet · Total balance</p>
          <Button
            variant="ghost"
            size="icon"
            aria-label={hidden ? "Show balance" : "Hide balance"}
            onClick={() => setHidden((v) => !v)}
            className="size-9 rounded-full text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
          >
            {hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </Button>
        </div>

        <p className="mt-1 text-4xl font-extrabold tracking-tight transition-all sm:text-5xl">
          {hidden ? "৳ ••••••" : formatBDT(total)}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="glass-panel rounded-2xl px-4 py-3">
            <p className="text-xs text-primary-foreground/70">Available</p>
            <p className="text-base font-semibold">{hidden ? "৳ ••••" : formatBDT(available)}</p>
          </div>
          <div className="glass-panel rounded-2xl px-4 py-3">
            <p className="text-xs text-primary-foreground/70">Pending</p>
            <p className="text-base font-semibold">{hidden ? "৳ ••••" : formatBDT(pending)}</p>
          </div>
        </div>

        <p className="mt-5 font-mono text-sm tracking-[0.35em] text-primary-foreground/80">
          **** **** **** {last4}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link to="/send">
            <Button className="h-10 rounded-xl bg-primary-foreground/95 px-4 font-semibold text-brand-ink hover:bg-primary-foreground">
              <ArrowUpRight className="size-4" /> Send
            </Button>
          </Link>
          <Link to="/receive">
            <Button className="h-10 rounded-xl bg-primary-foreground/15 px-4 font-semibold text-primary-foreground hover:bg-primary-foreground/25">
              <ArrowDownLeft className="size-4" /> Receive
            </Button>
          </Link>
          <Link to="/sources">
            <Button className="h-10 rounded-xl bg-primary-foreground/15 px-4 font-semibold text-primary-foreground hover:bg-primary-foreground/25">
              <Plus className="size-4" /> Add Money
            </Button>
          </Link>
          <Link to="/scan">
            <Button className="h-10 rounded-xl bg-primary-foreground/15 px-4 font-semibold text-primary-foreground hover:bg-primary-foreground/25">
              <QrCode className="size-4" /> Pay
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

const kindIcon = {
  sent: ArrowUpRight,
  received: ArrowDownLeft,
  payment: ShoppingBag,
  "add-money": Plus,
  withdrawal: Building2,
} as const;

export function TransactionCard({ tx }: { tx: Transaction }) {
  const Icon = kindIcon[tx.kind];
  const positive = tx.amount > 0;

  return (
    <Link
      to="/transactions/$id"
      params={{ id: tx.id }}
      className="flex items-center gap-4 rounded-2xl border border-border/70 bg-card p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card"
    >
      <span
        className={cn(
          "inline-flex size-11 shrink-0 items-center justify-center rounded-xl",
          positive ? "bg-success/12 text-success" : "bg-accent text-accent-foreground",
        )}
      >
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{tx.description}</p>
        <p className="truncate text-xs text-muted-foreground">
          {formatDateTime(tx.date)} · {tx.source}
        </p>
      </div>
      <div className="text-right">
        <p
          className={cn(
            "text-sm font-bold tabular-nums",
            positive ? "text-success" : "text-foreground",
          )}
        >
          {formatBDT(tx.amount, true)}
        </p>
        <StatusPill status={tx.status} />
      </div>
    </Link>
  );
}

const sourceIcon = {
  wallet: Wallet,
  bank: Building2,
  card: CreditCard,
  mfs: Smartphone,
} as const;

export function PaymentSourceCard({
  source,
  selected,
  onSelect,
}: {
  source: PaymentSource;
  selected?: boolean;
  onSelect?: (id: string) => void;
}) {
  const Icon = sourceIcon[source.kind];
  const interactive = Boolean(onSelect);

  const content = (
    <>
      <span
        className={cn(
          "inline-flex size-11 items-center justify-center rounded-xl",
          selected ? "bg-brand text-primary-foreground" : "bg-accent text-accent-foreground",
        )}
      >
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1 text-left">
        <p className="truncate text-sm font-semibold text-foreground">{source.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {source.balance != null ? formatBDT(source.balance) : source.detail}
        </p>
      </div>
      <span
        className={cn(
          "rounded-full px-2.5 py-1 text-xs font-semibold",
          source.status === "connected"
            ? "bg-success/12 text-success"
            : "bg-muted text-muted-foreground",
        )}
      >
        {source.status === "connected" ? "Connected" : "Not connected"}
      </span>
    </>
  );

  if (!interactive) {
    return (
      <div className="flex items-center gap-4 rounded-2xl border border-border/70 bg-card p-4 shadow-soft">
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelect?.(source.id)}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-center gap-4 rounded-2xl border bg-card p-4 text-left shadow-soft transition-all hover:-translate-y-0.5",
        selected ? "border-primary ring-2 ring-primary/25" : "border-border/70",
      )}
    >
      {content}
    </button>
  );
}
