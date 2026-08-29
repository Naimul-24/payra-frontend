import { cn } from "@/lib/utils";

export function QrCodeArt({ className, value }: { className?: string; value?: string }) {
  const payload = value?.trim() || "";
  const src = payload
    ? `https://api.qrserver.com/v1/create-qr-code/?size=500x500&margin=20&data=${encodeURIComponent(payload)}`
    : "";

  return (
    <div
      className={cn(
        "relative grid size-64 place-items-center rounded-3xl border border-border bg-card p-5 text-brand-ink shadow-card",
        className,
      )}
      role="img"
      aria-label="Payra payment QR code"
    >
      {src ? (
        <img
          src={src}
          alt="Payra payment QR code"
          className="size-full rounded-xl object-contain"
          loading="eager"
          decoding="async"
        />
      ) : (
        <div className="grid size-full place-items-center rounded-xl bg-muted text-center text-sm text-muted-foreground">
          QR code unavailable
        </div>
      )}
    </div>
  );
}
