import { FormEvent, useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, Mail, Phone, User } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/payra/app-shell";
import { UserAvatar } from "@/components/payra/cards";
import { SectionHeading, SoftButton, SurfaceCard } from "@/components/payra/ui-kit";
import { SubmitButton } from "@/components/payra/flow-kit";
import { getCurrentProfile, getCurrentUser, updateCurrentProfile, type DbProfile } from "@/lib/supabase-data";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — Payra" }, { name: "description", content: "View and update your Payra account profile." }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const [profile, setProfile] = useState<DbProfile | null>(null);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadProfile() {
    setLoading(true);
    setError("");
    try {
      const [user, data] = await Promise.all([getCurrentUser(), getCurrentProfile()]);
      if (!user || !data) throw new Error("Unable to load your profile. Please log in again.");
      setEmail(user.email ?? "");
      setProfile(data);
      setFullName(data.full_name ?? "");
      setPhone(data.phone ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load your profile.");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadProfile(); }, []);

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    if (!fullName.trim()) {
      toast.error("Enter your full name.");
      return;
    }
    setSaving(true);
    try {
      const updated = await updateCurrentProfile({ full_name: fullName, phone });
      setProfile(updated);
      setFullName(updated.full_name ?? "");
      setPhone(updated.phone ?? "");
      toast.success("Profile updated.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to update your profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <AppShell title="Profile" subtitle="Your personal and account information."><div className="mx-auto max-w-2xl"><SurfaceCard className="p-7"><p className="text-sm text-muted-foreground">Loading profile...</p></SurfaceCard></div></AppShell>;

  if (!profile) return <AppShell title="Profile" subtitle="Your personal and account information."><div className="mx-auto max-w-2xl"><SurfaceCard className="p-7"><p className="text-sm text-destructive">{error || "Unable to load your profile."}</p><SoftButton className="mt-4" onClick={loadProfile}>Retry</SoftButton></SurfaceCard></div></AppShell>;

  const initials = (profile.full_name ?? "P").split(" ").map((name) => name[0]).join("").slice(0, 2).toUpperCase() || "P";
  const details = [
    { icon: User, label: "User ID", value: profile.id },
    { icon: Mail, label: "Email", value: email || "Not available" },
  ];

  return <AppShell title="Profile" subtitle="Your personal and account information.">
    <div className="mx-auto grid max-w-2xl gap-6">
      <SurfaceCard className="p-7">
        <div className="flex items-center gap-4 border-b border-border pb-6">
          <UserAvatar initials={initials} className="size-16 text-xl" />
          <div>
            <h2 className="text-xl font-bold text-foreground">{profile.full_name || "Payra user"}</h2>
            <p className="flex items-center gap-1 text-sm font-medium text-success"><BadgeCheck className="size-4" aria-hidden />Payra account</p>
          </div>
        </div>

        <dl className="mt-3 divide-y divide-border">
          {details.map(({ icon: Icon, label, value }) => <div key={label} className="flex items-center gap-4 py-4"><Icon className="size-5 text-primary" aria-hidden /><dt className="flex-1 text-sm text-muted-foreground">{label}</dt><dd className="max-w-[60%] truncate text-sm font-semibold text-foreground">{value}</dd></div>)}
        </dl>

        <form className="mt-6 space-y-4 border-t border-border pt-6" onSubmit={saveProfile}>
          <SectionHeading title="Edit profile" description="Update the information stored in your Payra profile." />
          <div className="space-y-1.5"><label htmlFor="full-name" className="text-sm font-medium">Full name</label><input id="full-name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm" disabled={saving} /></div>
          <div className="space-y-1.5"><label htmlFor="phone" className="text-sm font-medium">Phone</label><input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm" disabled={saving} placeholder="01XXXXXXXXX" /></div>
          <SubmitButton type="submit" className="w-full" disabled={saving}>{saving ? "Saving..." : "Save profile"}</SubmitButton>
        </form>
      </SurfaceCard>

      <SurfaceCard className="p-6">
        <SectionHeading title="Identity verification" description="Verification and account limits are managed from your KYC flow." />
        <p className="text-sm text-muted-foreground">Verify your identity to unlock the verification features configured for your Payra account.</p>
        <Link to="/kyc" className="mt-4 block"><SubmitButton className="w-full">Verify my identity</SubmitButton></Link>
      </SurfaceCard>

      <SurfaceCard className="p-6">
        <SectionHeading title="Account" description="Manage preferences and connected accounts." />
        <div className="grid gap-3 sm:grid-cols-2">
          <Link to="/settings"><SoftButton className="w-full">Settings</SoftButton></Link>
          <Link to="/sources"><SoftButton className="w-full">Payment sources</SoftButton></Link>
        </div>
      </SurfaceCard>
    </div>
  </AppShell>;
}
