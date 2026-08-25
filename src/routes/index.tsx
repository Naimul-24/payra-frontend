import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowDownLeft,
  QrCode,
  Send,
  Wallet,
  CheckCircle2,
  ShieldCheck,
  Link2,
} from "lucide-react";
import { PayraLogo } from "@/components/payra/logo";
import { PayraGlobe } from "@/components/payra/globe";
import { GradientButton, SoftButton, TrustBadges } from "@/components/payra/ui-kit";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Payra — Move Money. Simply." },
      {
        name: "description",
        content:
          "Payra is a digital wallet for Bangladesh: send, receive, pay with QR and manage every payment source in one place.",
      },
      { property: "og:title", content: "Payra — Move Money. Simply." },
      {
        property: "og:description",
        content:
          "Pay, receive, manage and move your money from one powerful digital wallet.",
      },
    ],
  }),
  component: Landing,
});

const floatingChips = [
  { label: "Payment Successful", icon: CheckCircle2, className: "left-0 top-10" },
  { label: "+ ৳5,000 Received", icon: ArrowDownLeft, className: "right-0 top-24" },
  { label: "QR Payment", icon: QrCode, className: "left-2 bottom-24" },
  { label: "Secure Payment", icon: ShieldCheck, className: "right-4 bottom-10" },
  { label: "Connected", icon: Link2, className: "left-1/2 -translate-x-1/2 -top-2" },
];

const features = [
  {
    icon: Send,
    title: "Send Money",
    body: "Reach any phone number, Payra ID or saved contact in seconds.",
  },
  {
    icon: ArrowDownLeft,
    title: "Receive Money",
    body: "Share your Payra ID or QR and get paid instantly.",
  },
  {
    icon: QrCode,
    title: "Pay with QR",
    body: "Scan and pay at shops, cafés and online merchants.",
  },
  {
    icon: Wallet,
    title: "Multiple Sources",
    body: "Wallet, bank, card or mobile financial service — your choice.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
          <PayraLogo onLight={false} />
          <div className="flex items-center gap-2">
            <Link to="/login">
              <button className="rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground/90 transition-colors hover:text-primary-foreground">
                Log In
              </button>
            </Link>
            <Link to="/signup">
              <button className="rounded-xl bg-primary-foreground/95 px-4 py-2 text-sm font-semibold text-brand-ink transition-colors hover:bg-primary-foreground">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-brand pb-24 pt-28 sm:pb-32 sm:pt-32">
        <div className="pointer-events-none absolute -left-24 top-1/3 size-96 rounded-full bg-primary-foreground/10 blur-3xl" />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
          <div className="animate-rise text-primary-foreground">
            <span className="glass-panel inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold">
              <ShieldCheck className="size-3.5" aria-hidden /> Built for Bangladesh · BDT ৳
            </span>
            <h1 className="mt-5 text-5xl font-extrabold leading-[1.05] sm:text-6xl lg:text-7xl">
              Move Money.
              <br />
              Simply.
            </h1>
            <p className="mt-5 max-w-md text-lg text-primary-foreground/80">
              Pay, receive, manage and move your money from one powerful digital wallet.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/signup">
                <GradientButton className="bg-none bg-primary-foreground text-brand-ink hover:bg-primary-foreground">
                  Get Started <ArrowRight className="size-4" />
                </GradientButton>
              </Link>
              <Link to="/login">
                <SoftButton className="border-primary-foreground/35 bg-transparent text-primary-foreground shadow-none hover:bg-primary-foreground/15 hover:text-primary-foreground">
                  Log In
                </SoftButton>
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-primary-foreground/75">
              <span>Encrypted transfers</span>
              <span>·</span>
              <span>PIN &amp; biometric ready</span>
              <span>·</span>
              <span>Prototype demo data</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg">
            <PayraGlobe />
            {floatingChips.map(({ label, icon: Icon, className }) => (
              <span
                key={label}
                className={`glass-panel absolute inline-flex animate-float items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold text-primary-foreground ${className}`}
                style={{ animationDelay: `${label.length * 0.12}s` }}
              >
                <Icon className="size-3.5" aria-hidden />
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto -mt-16 max-w-6xl px-4 pb-20 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-3xl border border-border/70 bg-card p-6 shadow-card transition-transform hover:-translate-y-1"
            >
              <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                <Icon className="size-5" aria-hidden />
              </span>
              <h3 className="mt-4 text-base font-bold text-foreground">{title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-4xl border border-border/70 bg-brand-soft p-8 text-center sm:p-12">
          <h2 className="text-3xl font-extrabold text-brand-ink sm:text-4xl">
            One wallet. Every way to pay.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
            Connect your wallet, bank account, card or mobile financial service and choose
            your source at checkout.
          </p>
          <div className="mt-7 flex justify-center">
            <Link to="/signup">
              <GradientButton>
                Create your Payra account <ArrowRight className="size-4" />
              </GradientButton>
            </Link>
          </div>
          <TrustBadges className="mt-8 justify-center" />
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 text-center sm:px-6">
          <PayraLogo />
          <p className="text-xs text-muted-foreground">
            Payra is a design prototype with demo data. No real money moves here.
          </p>
        </div>
      </footer>
    </div>
  );
}
