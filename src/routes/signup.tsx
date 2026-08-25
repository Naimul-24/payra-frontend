import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthLayout, GoogleButton } from "@/components/payra/auth-layout";
import { GradientButton } from "@/components/payra/ui-kit";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create your Payra account" },
      {
        name: "description",
        content: "Open a Payra wallet in minutes and start sending, receiving and paying in BDT.",
      },
      { property: "og:title", content: "Create your Payra account" },
      { property: "og:description", content: "Open a Payra wallet in minutes." },
    ],
  }),
  component: SignupPage,
});

const fields = [
  { id: "name", label: "Full name", placeholder: "Naimul Hossain", type: "text" },
  { id: "email", label: "Email", placeholder: "naimul@payra.app", type: "email" },
  { id: "phone", label: "Phone number", placeholder: "+880 1712 345 678", type: "tel" },
  { id: "password", label: "Password", placeholder: "••••••••", type: "password" },
  { id: "confirm", label: "Confirm password", placeholder: "••••••••", type: "password" },
];

function SignupPage() {
  const navigate = useNavigate();

  return (
    <AuthLayout
      title="Create your Payra account"
      subtitle="One wallet for sending, receiving and paying across Bangladesh."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          navigate({ to: "/dashboard" });
        }}
      >
        {fields.map((f) => (
          <div key={f.id} className="space-y-1.5">
            <Label htmlFor={f.id}>{f.label}</Label>
            <Input id={f.id} type={f.type} placeholder={f.placeholder} className="h-12 rounded-xl" />
          </div>
        ))}

        <label className="flex items-start gap-2.5 text-sm text-muted-foreground">
          <Checkbox id="terms" className="mt-0.5" />
          <span>
            I agree to Payra&apos;s <span className="font-semibold text-primary">Terms &amp; Privacy Policy</span>
          </span>
        </label>

        <GradientButton type="submit" className="w-full">
          Create Payra Account
        </GradientButton>

        <div className="relative py-2 text-center">
          <span className="relative z-10 bg-background px-3 text-xs text-muted-foreground">or</span>
          <span className="absolute inset-x-0 top-1/2 h-px bg-border" />
        </div>

        <GoogleButton label="Continue with Google" />
      </form>
    </AuthLayout>
  );
}
