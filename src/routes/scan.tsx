import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Camera, ImagePlus, ScanLine, X } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/payra/app-shell";
import { GradientButton, SoftButton, SurfaceCard } from "@/components/payra/ui-kit";
import { supabase } from "@/lib/supabaseClient";

export const Route = createFileRoute("/scan")({
  head: () => ({
    meta: [
      { title: "Scan QR — Payra" },
      { name: "description", content: "Scan a Payra QR code to find a recipient." },
    ],
  }),
  component: ScanPage,
});

type BarcodeDetectorLike = {
  detect: (source: ImageBitmap | HTMLVideoElement | HTMLImageElement | HTMLCanvasElement) => Promise<Array<{ rawValue?: string }>>;
};

type BarcodeDetectorConstructor = new (options?: { formats?: string[] }) => BarcodeDetectorLike;

declare global {
  interface Window {
    BarcodeDetector?: BarcodeDetectorConstructor;
  }
}

function ScanPage() {
  const [active, setActive] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanTimerRef = useRef<number | null>(null);
  const navigate = useNavigate();

  async function resolvePayload(payload: string) {
    const value = payload.trim();
    if (!value) return;

    setResolving(true);
    try {
      let phone = value;
      try {
        const url = new URL(value);
        phone =
          url.searchParams.get("phone") ||
          url.searchParams.get("payraId") ||
          url.pathname.split("/").filter(Boolean).pop() ||
          value;
      } catch {
        // QR may contain a plain phone number or Payra ID.
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("phone,full_name")
        .eq("phone", phone)
        .maybeSingle();

      if (error) throw error;
      if (!data?.phone) {
        toast.error("Payra recipient not found");
        return;
      }

      stopCamera();
      toast.success(`${data.full_name || "Payra user"} found`);
      await navigate({ to: "/send", search: { recipient: data.phone } } as any);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to resolve Payra QR");
    } finally {
      setResolving(false);
    }
  }

  async function startCamera() {
    setCameraError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera access is not supported by this browser.");
      toast.error("Camera access is not supported by this browser");
      return;
    }

    if (!window.BarcodeDetector) {
      setCameraError("QR scanning is not supported by this browser. Try Chrome on Android or upload the QR image.");
      toast.error("QR scanning is not supported by this browser");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      streamRef.current = stream;
      if (!videoRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setActive(true);
      scanCamera();
    } catch (e) {
      setActive(false);
      const message = e instanceof DOMException && e.name === "NotAllowedError"
        ? "Camera permission was denied. Allow camera access in your browser settings and try again."
        : "Unable to open the camera. Make sure no other app is using it.";
      setCameraError(message);
      toast.error(message);
    }
  }

  function stopCamera() {
    if (scanTimerRef.current !== null) {
      window.clearTimeout(scanTimerRef.current);
      scanTimerRef.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setActive(false);
  }

  async function scanCamera() {
    const video = videoRef.current;
    if (!video || !window.BarcodeDetector || !streamRef.current) return;

    try {
      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
      const codes = await detector.detect(video);
      const value = codes.find((code) => code.rawValue)?.rawValue;
      if (value) {
        await resolvePayload(value);
        return;
      }
    } catch {
      // Keep scanning; transient camera frames can fail to decode.
    }

    if (streamRef.current) {
      scanTimerRef.current = window.setTimeout(scanCamera, 250);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!window.BarcodeDetector) {
      toast.error("QR image scanning is not supported by this browser. Try Chrome on Android.");
      return;
    }

    try {
      const bitmap = await createImageBitmap(file);
      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
      const codes = await detector.detect(bitmap);
      bitmap.close();

      const value = codes.find((code) => code.rawValue)?.rawValue;
      if (!value) {
        toast.error("No QR code found in this image");
        return;
      }

      toast.success("QR code detected");
      await resolvePayload(value);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to scan this QR image");
    }
  }

  useEffect(() => () => stopCamera(), []);

  return (
    <AppShell title="Scan QR" subtitle="Scan a Payra payment code to find the recipient.">
      <div className="mx-auto max-w-xl">
        <SurfaceCard className="p-6">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-brand-ink">
            <video
              ref={videoRef}
              muted
              playsInline
              autoPlay
              className={`absolute inset-0 h-full w-full object-cover ${active ? "block" : "hidden"}`}
            />
            <div className="absolute inset-10 rounded-3xl border-2 border-primary-foreground/80">
              <ScanLine className="absolute left-1/2 top-1/2 size-20 -translate-x-1/2 -translate-y-1/2 text-primary-foreground/80" />
              {active ? <span className="absolute inset-x-3 top-3 h-0.5 animate-scan bg-cyan" /> : null}
            </div>
            <p className="absolute inset-x-4 bottom-6 text-center text-sm font-medium text-primary-foreground/90 drop-shadow">
              {resolving ? "Finding recipient…" : active ? "Align the QR code inside the frame" : "Camera preview is paused"}
            </p>
          </div>

          {cameraError ? (
            <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              {cameraError}
            </div>
          ) : null}

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <GradientButton disabled={resolving} onClick={() => (active ? stopCamera() : startCamera())}>
              {active ? <X className="size-4" /> : <Camera className="size-4" />}
              {active ? "Close camera" : "Open camera"}
            </GradientButton>
            <SoftButton disabled={resolving} onClick={() => fileRef.current?.click()}>
              <ImagePlus className="size-4" />
              Upload QR image
            </SoftButton>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Payra QR codes should contain a Payra recipient phone number or Payra ID.
          </p>
          <Link to="/send" className="mt-5 block text-center text-sm font-semibold text-primary hover:underline">
            Send without scanning
          </Link>
        </SurfaceCard>
      </div>
    </AppShell>
  );
}
