import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { PayraLogo } from "./logo";
import { PayraGlobe } from "./globe";
import { TrustBadges } from "./ui-kit";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden bg-brand p-10 lg:flex lg:flex-col">
        <Link to="/">
          <PayraLogo onLight={false} />
        </Link>
        <div className="flex flex-1 items-center justify-center">
          <PayraGlobe className="max-w-[420px]" />
        </div>
        <div className="text-primary-foreground">
          <p className="text-2xl font-extrabold leading-tight">
            Move money across Bangladesh
            <br />
            in a couple of taps.
          </p>
          <p className="mt-2 max-w-sm text-sm text-primary-foreground/75">
            Wallet, bank, card and mobile financial services — connected in one place.
          </p>
        </div>
      </aside>

      {/* Form panel */}
      <main className="flex flex-col justify-center px-5 py-10 sm:px-10">
        <div className="mx-auto w-full max-w-md animate-rise">
          <Link to="/" className="lg:hidden">
            <PayraLogo />
          </Link>
          <h1 className="mt-8 text-3xl font-extrabold text-foreground lg:mt-0">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>

          <div className="mt-8">{children}</div>

          <div className="mt-8 text-center text-sm text-muted-foreground">{footer}</div>
          <TrustBadges className="mt-8 justify-center" />
        </div>
      </main>
    </div>
  );
}

export function GoogleButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-border bg-card text-sm font-semibold text-foreground transition-colors hover:bg-accent"
    >
      <svg viewBox="0 0 24 24" className="size-4.5" aria-hidden>
        <path fill="#4285F4" d="M23 12.3c0-.9-.1-1.6-.2-2.3H12v4.3h6.2c-.1 1-.8 2.6-2.3 3.6l3.6 2.8c2.1-2 3.5-4.9 3.5-8.4Z" />
        <path fill="#34A853" d="M12 24c3.1 0 5.7-1 7.6-2.8l-3.6-2.8c-1 .7-2.3 1.2-4 1.2-3 0-5.6-2-6.5-4.8l-3.7 2.9C3.7 21.3 7.5 24 12 24Z" />
        <path fill="#FBBC05" d="M5.5 14.8a7.4 7.4 0 0 1 0-4.6L1.8 7.3a12 12 0 0 0 0 10.4l3.7-2.9Z" />
        <path fill="#EA4335" d="M12 4.7c2.1 0 3.6.9 4.4 1.7l3.2-3.1C17.7 1.4 15.1 0 12 0 7.5 0 3.7 2.7 1.8 6.6l3.7 2.9C6.4 6.7 9 4.7 12 4.7Z" />
      </svg>
      {label}
    </button>
  );
}
