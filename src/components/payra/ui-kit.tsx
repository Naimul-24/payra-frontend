import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ShieldCheck, Lock, BadgeCheck, AlertTriangle, Inbox, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { TransactionStatus } from "@/lib/payra-data";

export function GradientButton({
  children,
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      {...props}
      className={cn(
        "h-12 rounded-xl bg-brand px-6 text-base font-semibold text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5 hover:opacity-95",
        className,
      )}
    >
      {children}
    </Button>
  );
}

export function SoftButton({
  children,
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      {...props}
      variant="outline"
      className={cn(
        "h-12 rounded-xl border-border bg-card px-6 text-base font-semibold text-foreground shadow-soft transition-colors hover:bg-accent",
        className,
      )}
    >
      {children}
    </Button>
  );
}

export function SurfaceCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-3xl border border-border/70 bg-card p-5 shadow-soft", className)}>
      {children}
    </div>
  );
}

export function SectionHeading({
  title,
  action,
  description,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function StatusPill({ status }: { status: TransactionStatus }) {
  const map: Record<TransactionStatus, string> = {
    completed: "bg-success/12 text-success",
    pending: "bg-warning/18 text-warning-foreground",
    failed: "bg-destructive/12 text-destructive",
  };
  return (
    <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold capitalize", map[status])}>
      {status}
    </span>
  );
}

export function TrustBadges({ className }: { className?: string }) {
  const items = [
    { icon: Lock, label: "Encrypted" },
    { icon: ShieldCheck, label: "Secure payment" },
    { icon: BadgeCheck, label: "Protected by Payra" },
  ];
  return (
    <div className={cn("flex flex-wrap items-center gap-x-5 gap-y-2", className)}>
      {items.map(({ icon: Icon, label }) => (
        <span key={label} className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Icon className="size-3.5 text-primary" aria-hidden />
          {label}
        </span>
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  actionLabel,
  to,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  to?: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-border bg-card px-6 py-14 text-center">
      <span className="mb-4 inline-flex size-14 items-center justify-center rounded-2xl bg-accent">
        <Inbox className="size-6 text-accent-foreground" aria-hidden />
      </span>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {actionLabel && to ? (
        <Link to={to} className="mt-6">
          <GradientButton>{actionLabel}</GradientButton>
        </Link>
      ) : null}
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-border bg-card px-6 py-14 text-center">
      <span className="mb-4 inline-flex size-14 items-center justify-center rounded-2xl bg-destructive/10">
        <AlertTriangle className="size-6 text-destructive" aria-hidden />
      </span>
      <h3 className="text-base font-semibold text-foreground">Something went wrong.</h3>
      <p className="mt-1 text-sm text-muted-foreground">Please try again in a moment.</p>
      <SoftButton className="mt-6" onClick={onRetry}>
        Try Again
      </SoftButton>
    </div>
  );
}

export function SuccessState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="mb-4 inline-flex size-16 animate-pop items-center justify-center rounded-full bg-success/12">
        <CheckCircle2 className="size-9 text-success" aria-hidden />
      </span>
      <h3 className="text-xl font-bold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-2xl border border-border/70 bg-card p-4">
          <Skeleton className="size-11 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}
