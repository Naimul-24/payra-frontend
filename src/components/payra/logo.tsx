import { cn } from "@/lib/utils";

export function PayraMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-xl bg-brand shadow-glow",
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="none">
        <path
          d="M5 19V7.5A2.5 2.5 0 0 1 7.5 5h5a4.5 4.5 0 0 1 0 9H9"
          stroke="currentColor"
          className="text-primary-foreground"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="17.5" cy="17.5" r="1.8" className="fill-primary-foreground" />
      </svg>
    </span>
  );
}

export function PayraLogo({
  className,
  onLight = true,
}: {
  className?: string;
  onLight?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <PayraMark />
      <span
        className={cn(
          "text-xl font-extrabold tracking-tight",
          onLight ? "text-brand-ink" : "text-primary-foreground",
        )}
      >
        Payra
      </span>
    </span>
  );
}
