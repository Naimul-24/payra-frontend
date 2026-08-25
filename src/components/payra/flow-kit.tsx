import type { ReactNode } from "react";
import { AlertTriangle, Check, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GradientButton, SoftButton } from "./ui-kit";
import { formatBDT, type PaymentSource } from "@/lib/payra-data";

/* ---------------------------------------------------------------- stepper */

export function StepTracker({
  steps,
  current,
  className,
}: {
  steps: readonly string[];
  current: number;
  className?: string;
}) {
  return (
    <ol className={cn("mb-6 flex items-center gap-2", className)} aria-label="Progress">
      {steps.map((label, index) => {
        const state = index < current ? "done" : index === current ? "current" : "todo";
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              aria-current={state === "current" ? "step" : undefined}
              className={cn(
                "inline-flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                state === "todo" && "bg-muted text-muted-foreground",
                state === "current" && "bg-brand text-primary-foreground shadow-glow",
                state === "done" && "bg-success/15 text-success",
              )}
            >
              {state === "done" ? <Check className="size-3.5" aria-hidden /> : index + 1}
            </span>
            <span
              className={cn(
                "hidden text-xs font-semibold sm:inline",
                state === "todo" ? "text-muted-foreground" : "text-foreground",
              )}
            >
              {label}
            </span>
            {index < steps.length - 1 ? (
              <span className={cn("h-px flex-1", index < current ? "bg-success/50" : "bg-border")} />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

/* ------------------------------------------------------------ form fields */

export function TextField({
  id,
  label,
  error,
  hint,
  className,
  ...props
}: React.ComponentProps<typeof Input> & { id: string; label: string; error?: string; hint?: string }) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn("h-12 rounded-xl", error && "border-destructive focus-visible:ring-destructive/40", className)}
        {...props}
      />
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function AmountField({
  value,
  onChange,
  label = "Amount",
  error,
  hint,
  quickAmounts = [500, 1000, 2500, 5000],
  id = "amount",
  disabled,
}: {
  value: string;
  onChange: (next: string) => void;
  label?: string;
  error?: string;
  hint?: string;
  quickAmounts?: readonly number[];
  id?: string;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-3">
      <Label htmlFor={id}>{label}</Label>
      <div
        className={cn(
          "flex items-center gap-2 rounded-2xl border bg-card px-5 py-4",
          error ? "border-destructive" : "border-border",
        )}
      >
        <span className="text-3xl font-extrabold text-muted-foreground" aria-hidden>
          ৳
        </span>
        <input
          id={id}
          inputMode="decimal"
          disabled={disabled}
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(event) => onChange(event.target.value.replace(/[^\d.]/g, ""))}
          placeholder="0"
          className="w-full min-w-0 bg-transparent text-3xl font-extrabold tracking-tight text-foreground outline-none placeholder:text-muted-foreground/50 disabled:opacity-60"
        />
      </div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {quickAmounts.map((quick) => (
          <button
            key={quick}
            type="button"
            disabled={disabled}
            onClick={() => onChange(String(quick))}
            className="rounded-full border border-border bg-card px-4 py-1.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent disabled:opacity-60"
          >
            {formatBDT(quick)}
          </button>
        ))}
      </div>
    </div>
  );
}

export function SourceSelect({
  sources,
  value,
  onChange,
  label,
  name,
}: {
  sources: readonly PaymentSource[];
  value: string;
  onChange: (id: string) => void;
  label: string;
  name: string;
}) {
  return (
    <fieldset className="space-y-3">
      <legend className="mb-2 text-sm font-semibold text-foreground">{label}</legend>
      <div className="space-y-2">
        {sources.map((source) => {
          const selected = source.id === value;
          return (
            <label
              key={source.id}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-colors",
                selected ? "border-primary bg-accent" : "border-border bg-card hover:bg-accent/50",
              )}
            >
              <input
                type="radio"
                name={name}
                value={source.id}
                checked={selected}
                onChange={() => onChange(source.id)}
                className="size-4 accent-[var(--color-primary)]"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-foreground">{source.name}</span>
                <span className="block truncate text-xs text-muted-foreground">{source.detail}</span>
              </span>
              {typeof source.balance === "number" ? (
                <span className="shrink-0 text-sm font-bold text-foreground">{formatBDT(source.balance)}</span>
              ) : null}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/* ------------------------------------------------------------- summaries */

export type SummaryRow = { label: string; value: ReactNode; emphasis?: boolean };

export function SummaryList({ rows, className }: { rows: readonly SummaryRow[]; className?: string }) {
  return (
    <dl className={cn("divide-y divide-border rounded-2xl border border-border bg-card px-4", className)}>
      {rows.map((row) => (
        <div key={row.label} className="flex items-center justify-between gap-4 py-3.5">
          <dt className="text-sm text-muted-foreground">{row.label}</dt>
          <dd
            className={cn(
              "text-right text-sm font-semibold text-foreground",
              row.emphasis && "text-base font-extrabold",
            )}
          >
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function ReferenceRow({ reference }: { reference: string }) {
  return (
    <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-dashed border-border bg-muted/40 px-4 py-3">
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">Reference</p>
        <p className="truncate text-sm font-semibold text-foreground">{reference}</p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="shrink-0 gap-1.5 text-primary"
        onClick={() => {
          void navigator.clipboard?.writeText(reference);
          toast.success("Reference copied");
        }}
      >
        <Copy className="size-4" aria-hidden /> Copy
      </Button>
    </div>
  );
}

/* ------------------------------------------------------- process results */

export function ProcessingState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center py-8 text-center" role="status" aria-live="polite">
      <Loader2 className="size-10 animate-spin text-primary" aria-hidden />
      <h3 className="mt-5 text-lg font-bold text-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function FailureState({
  title = "Transaction failed",
  description,
  onRetry,
  retryLabel = "Try Again",
  secondaryAction,
}: {
  title?: string;
  description: string;
  onRetry?: () => void;
  retryLabel?: string;
  secondaryAction?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center py-6 text-center" role="alert">
      <span className="inline-flex size-16 items-center justify-center rounded-full bg-destructive/12">
        <AlertTriangle className="size-8 text-destructive" aria-hidden />
      </span>
      <h3 className="mt-5 text-xl font-bold text-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      <div className="mt-6 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        {onRetry ? (
          <GradientButton onClick={onRetry} className="sm:min-w-40">
            {retryLabel}
          </GradientButton>
        ) : null}
        {secondaryAction}
      </div>
    </div>
  );
}

export function FlowActions({ children }: { children: ReactNode }) {
  return <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">{children}</div>;
}

export function InlineFormError({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/8 px-3.5 py-2.5 text-sm font-medium text-destructive"
    >
      <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
      {message}
    </p>
  );
}

export function SubmitButton({
  loading,
  loadingLabel,
  children,
  className,
  ...props
}: React.ComponentProps<typeof GradientButton> & { loading?: boolean; loadingLabel?: string }) {
  return (
    <GradientButton {...props} disabled={loading || props.disabled} className={className}>
      {loading ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden /> {loadingLabel ?? "Please wait…"}
        </>
      ) : (
        children
      )}
    </GradientButton>
  );
}

export { SoftButton };
