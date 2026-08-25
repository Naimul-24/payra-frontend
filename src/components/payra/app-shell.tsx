import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  CreditCard,
  Home,
  LifeBuoy,
  LogOut,
  QrCode,
  Receipt,
  Search,
  Send,
  Settings,
  User,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  HandCoins,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PayraLogo } from "./logo";
import { UserAvatar } from "./cards";
import { currentUser, notifications } from "@/lib/payra-data";
import { Input } from "@/components/ui/input";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/send", label: "Send Money", icon: Send },
  { to: "/receive", label: "Receive Money", icon: ArrowDownLeft },
  { to: "/request", label: "Request Money", icon: HandCoins },
  { to: "/add-money", label: "Add Money", icon: Plus },
  { to: "/withdraw", label: "Withdraw", icon: ArrowUpRight },
  { to: "/scan", label: "Scan QR", icon: QrCode },
  { to: "/transactions", label: "Transactions", icon: Receipt },
  { to: "/sources", label: "Payment Sources", icon: CreditCard },
  { to: "/kyc", label: "Verify Identity", icon: ShieldCheck },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

const mobileNav = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/transactions", label: "History", icon: Receipt },
  { to: "/scan", label: "Scan", icon: QrCode },
  { to: "/sources", label: "Payments", icon: Wallet },
  { to: "/profile", label: "Profile", icon: User },
] as const;

function useActivePath() {
  return useRouterState({ select: (s) => s.location.pathname });
}

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const pathname = useActivePath();
  const unread = notifications.filter((n) => n.unread).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar px-4 py-6 lg:flex">
        <Link to="/dashboard" className="px-2">
          <PayraLogo />
        </Link>

        <nav className="mt-8 flex-1 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = pathname === to || pathname.startsWith(`${to}/`);
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-sidebar-foreground hover:bg-muted",
                )}
              >
                <Icon className="size-4.5" aria-hidden />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-1 border-t border-sidebar-border pt-4">
          <Link
            to="/settings"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-muted"
          >
            <LifeBuoy className="size-4.5" aria-hidden /> Help &amp; Support
          </Link>
          <Link
            to="/login"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10"
          >
            <LogOut className="size-4.5" aria-hidden /> Log out
          </Link>
        </div>
      </aside>

      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-border/70 bg-background/85 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
            <Link to="/dashboard" className="lg:hidden">
              <PayraLogo className="[&_span:last-child]:text-lg" />
            </Link>

            <div className="ml-auto hidden max-w-sm flex-1 items-center lg:flex">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <Input
                  placeholder="Search payments, people, transactions"
                  aria-label="Search"
                  className="h-10 rounded-xl border-border bg-card pl-9"
                />
              </div>
            </div>

            <Link
              to="/notifications"
              aria-label="Notifications"
              className="relative ml-auto inline-flex size-10 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-colors hover:bg-accent lg:ml-3"
            >
              <Bell className="size-4.5" aria-hidden />
              {unread > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                  {unread}
                </span>
              ) : null}
            </Link>

            <Link to="/profile" aria-label="Profile">
              <UserAvatar initials={currentUser.initials} />
            </Link>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:pb-16">
          <div className="mb-6 animate-rise">
            <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">{title}</h1>
            {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
          </div>
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur lg:hidden">
        <ul className="mx-auto flex max-w-lg items-end justify-between px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
          {mobileNav.map(({ to, label, icon: Icon }) => {
            const active = pathname === to || pathname.startsWith(`${to}/`);
            const emphasized = to === "/scan";

            if (emphasized) {
              return (
                <li key={to} className="-mt-7">
                  <Link
                    to={to}
                    className="flex flex-col items-center gap-1"
                    aria-label={label}
                  >
                    <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-brand text-primary-foreground shadow-glow">
                      <Icon className="size-6" aria-hidden />
                    </span>
                    <span className="text-[11px] font-semibold text-foreground">{label}</span>
                  </Link>
                </li>
              );
            }

            return (
              <li key={to}>
                <Link
                  to={to}
                  className={cn(
                    "flex flex-col items-center gap-1 px-3 py-1.5 text-[11px] font-medium",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <Icon className="size-5" aria-hidden />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
