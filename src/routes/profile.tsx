import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, Mail, Phone, User } from "lucide-react";
import { AppShell } from "@/components/payra/app-shell";
import { UserAvatar } from "@/components/payra/cards";
import { SectionHeading, SoftButton, SurfaceCard } from "@/components/payra/ui-kit";
import { SubmitButton } from "@/components/payra/flow-kit";
import { formatBDT, kycProfile } from "@/lib/payra-data";
import { supabase } from "@/lib/supabaseClient";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Payra" },
      { name: "description", content: "View your Payra account profile." },
      { property: "og:title", content: "Profile — Payra" },
      { property: "og:description", content: "Your Payra account profile." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const [profile, setProfile] = useState<{
    id: string;
    full_name: string;
    phone: string | null;
    avatar_url: string | null;
  } | null>(null);

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        setEmail(user.email ?? "");

        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, phone, avatar_url")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Profile error:", error);
          return;
        }

        setProfile(data);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  if (loading) {
    return (
      <AppShell title="Profile" subtitle="Your personal and account information.">
        <div className="mx-auto max-w-2xl">
          <SurfaceCard className="p-7">
            <p className="text-sm text-muted-foreground">
              Loading profile...
            </p>
          </SurfaceCard>
        </div>
      </AppShell>
    );
  }

  if (!profile) {
    return (
      <AppShell title="Profile" subtitle="Your personal and account information.">
        <div className="mx-auto max-w-2xl">
          <SurfaceCard className="p-7">
            <p className="text-sm text-destructive">
              Unable to load your profile. Please log in again.
            </p>
          </SurfaceCard>
        </div>
      </AppShell>
    );
  }

  const initials =
    profile.full_name
      ?.split(" ")
      .map((name) => name[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "P";

  const details = [
    {
      icon: User,
      label: "User ID",
      value: profile.id,
    },
    {
      icon: Mail,
      label: "Email",
      value: email || "Not available",
    },
    {
      icon: Phone,
      label: "Phone",
      value: profile.phone || "Not added",
    },
  ];

  return (
    <AppShell title="Profile" subtitle="Your personal and account information.">
      <div className="mx-auto grid max-w-2xl gap-6">
        <SurfaceCard className="p-7">
          <div className="flex items-center gap-4 border-b border-border pb-6">
            <UserAvatar
              initials={initials}
              className="size-16 text-xl"
            />

            <div>
              <h2 className="text-xl font-bold text-foreground">
                {profile.full_name}
              </h2>

              <p className="flex items-center gap-1 text-sm font-medium text-success">
                <BadgeCheck className="size-4" aria-hidden />
                Verified account
              </p>
            </div>
          </div>

          <dl className="mt-3 divide-y divide-border">
            {details.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex items-center gap-4 py-4"
              >
                <Icon className="size-5 text-primary" aria-hidden />

                <dt className="flex-1 text-sm text-muted-foreground">
                  {label}
                </dt>

                <dd className="max-w-[60%] truncate text-sm font-semibold text-foreground">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </SurfaceCard>

        <SurfaceCard className="p-6">
          <SectionHeading
            title="Identity verification"
            description={`Level ${kycProfile.level} · daily limit ${formatBDT(
              kycProfile.limitPerDay,
            )}`}
          />

          <p className="text-sm text-muted-foreground">
            Verify your NID, passport or driving licence to raise your
            limits and unlock higher withdrawals.
          </p>

          <Link to="/kyc" className="mt-4 block">
            <SubmitButton className="w-full">
              Verify my identity
            </SubmitButton>
          </Link>
        </SurfaceCard>

        <SurfaceCard className="p-6">
          <SectionHeading
            title="Account"
            description="Manage preferences and connected accounts."
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <Link to="/settings">
              <SoftButton className="w-full">
                Settings
              </SoftButton>
            </Link>

            <Link to="/sources">
              <SoftButton className="w-full">
                Payment sources
              </SoftButton>
            </Link>
          </div>
        </SurfaceCard>
      </div>
    </AppShell>
  );
}
