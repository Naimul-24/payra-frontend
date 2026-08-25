import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, Mail, Phone, User } from "lucide-react";
import { AppShell } from "@/components/payra/app-shell";
import { UserAvatar } from "@/components/payra/cards";
import { SurfaceCard } from "@/components/payra/ui-kit";
import { currentUser } from "@/lib/payra-data";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [
    { title: "Profile — Payra" }, { name: "description", content: "View your Payra account profile." },
    { property: "og:title", content: "Profile — Payra" }, { property: "og:description", content: "Your Payra account profile." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ProfilePage,
});

function ProfilePage() {
  const details = [{ icon: User, label: "Payra ID", value: currentUser.payraId }, { icon: Mail, label: "Email", value: currentUser.email }, { icon: Phone, label: "Phone", value: currentUser.phone }];
  return <AppShell title="Profile" subtitle="Your personal and account information."><SurfaceCard className="mx-auto max-w-2xl p-7"><div className="flex items-center gap-4 border-b border-border pb-6"><UserAvatar initials={currentUser.initials} className="size-16 text-xl" /><div><h2 className="text-xl font-bold text-foreground">{currentUser.name}</h2><p className="flex items-center gap-1 text-sm font-medium text-success"><BadgeCheck className="size-4" /> Verified account</p></div></div><dl className="mt-3 divide-y divide-border">{details.map(({ icon: Icon, label, value }) => <div key={label} className="flex items-center gap-4 py-4"><Icon className="size-5 text-primary" /><dt className="flex-1 text-sm text-muted-foreground">{label}</dt><dd className="text-sm font-semibold text-foreground">{value}</dd></div>)}</dl></SurfaceCard></AppShell>;
}