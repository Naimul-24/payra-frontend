import { cn } from "@/lib/utils";

const modules = [
  [8, 2], [10, 2], [12, 2], [16, 2], [18, 2], [8, 4], [14, 4], [18, 4],
  [2, 8], [4, 8], [8, 8], [12, 8], [16, 8], [18, 8], [20, 8], [6, 10],
  [10, 10], [14, 10], [18, 10], [2, 12], [4, 12], [8, 12], [10, 12], [12, 12],
  [16, 12], [20, 12], [6, 14], [10, 14], [14, 14], [18, 14], [8, 16], [12, 16],
  [16, 16], [18, 16], [8, 18], [10, 18], [14, 18], [18, 18], [20, 18], [12, 20],
  [16, 20], [20, 20],
] as const;

function Finder({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y} width="7" height="7" rx="1" fill="currentColor" />
      <rect x={x + 1} y={y + 1} width="5" height="5" rx="0.6" className="fill-card" />
      <rect x={x + 2} y={y + 2} width="3" height="3" rx="0.4" fill="currentColor" />
    </g>
  );
}

export function QrCodeArt({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative grid size-64 place-items-center rounded-3xl border border-border bg-card p-5 text-brand-ink shadow-card",
        className,
      )}
      role="img"
      aria-label="Payra payment QR code"
    >
      <svg viewBox="0 0 25 25" className="size-full" aria-hidden>
        <Finder x={1} y={1} />
        <Finder x={17} y={1} />
        <Finder x={1} y={17} />
        {modules.map(([x, y], index) => (
          <rect key={`${x}-${y}-${index}`} x={x} y={y} width="1.4" height="1.4" rx="0.3" fill="currentColor" />
        ))}
      </svg>
      <span className="absolute grid size-11 place-items-center rounded-xl bg-brand text-sm font-extrabold text-primary-foreground shadow-soft">
        P
      </span>
    </div>
  );
}