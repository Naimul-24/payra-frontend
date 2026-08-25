import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Building2, CreditCard, Smartphone } from "lucide-react";
import { z } from "zod";
import { AppShell } from "@/components/payra/app-shell";
import { EmptyState, SectionHeading, SoftButton, SuccessState, SurfaceCard, TrustBadges } from "@/components/payra/ui-kit";
import {
  FailureState,
  FlowActions,
  ProcessingState,
  StepTracker,
  SubmitButton,
  SummaryList,
  TextField,
} from "@/components/payra/flow-kit";
import { useSimulatedRequest } from "@/lib/use-simulated-request";

const connectKinds = ["bank", "card", "mfs"] as const;
type ConnectKind = (typeof connectKinds)[number];

function isConnectKind(value: string): value is ConnectKind {
  return (connectKinds as readonly string[]).includes(value);
}

export const Route = createFileRoute("/sources/connect/$kind")({
  loader: ({ params }) => {
    if (!isConnectKind(params.kind)) throw notFound();
    return { kind: params.kind };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Source not found — Payra" }, { name: "robots", content: "noindex" }] };
    }
    const label = kindConfig[loaderData.kind].title;
    return {
      meta: [
        { title: `${label} — Payra` },
        { name: "description", content: kindConfig[loaderData.kind].description },
        { property: "og:title", content: `${label} — Payra` },
        { property: "og:description", content: kindConfig[loaderData.kind].description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: UnknownKind,
  component: ConnectSourcePage,
});

type FieldDef = {
  id: string;
  label: string;
  placeholder: string;
  schema: z.ZodType<string>;
  type?: string;
};

const kindConfig: Record<
  ConnectKind,
  { title: string; description: string; icon: typeof Building2; providers: string[]; fields: FieldDef[] }
> = {
  bank: {
    title: "Connect a bank account",
    description: "Link a Bangladeshi bank account to fund and withdraw from Payra.",
    icon: Building2,
    providers: ["BRAC Bank", "City Bank", "Dutch-Bangla Bank", "Eastern Bank"],
    fields: [
      {
        id: "accountName",
        label: "Account holder name",
        placeholder: "Naimul Hasan",
        schema: z.string().trim().min(3, { message: "Enter the account holder name." }).max(100),
      },
      {
        id: "accountNumber",
        label: "Account number",
        placeholder: "1501 2034 5678",
        schema: z
          .string()
          .trim()
          .regex(/^[0-9 ]{10,20}$/, { message: "Enter a valid 10-20 digit account number." }),
      },
      {
        id: "branch",
        label: "Branch",
        placeholder: "Gulshan Branch, Dhaka",
        schema: z.string().trim().min(3, { message: "Enter your branch name." }).max(100),
      },
    ],
  },
  card: {
    title: "Add a debit or credit card",
    description: "Add a Visa or Mastercard to top up your Payra wallet.",
    icon: CreditCard,
    providers: ["Visa", "Mastercard", "American Express"],
    fields: [
      {
        id: "cardName",
        label: "Name on card",
        placeholder: "NAIMUL HASAN",
        schema: z.string().trim().min(3, { message: "Enter the name printed on the card." }).max(100),
      },
      {
        id: "cardNumber",
        label: "Card number",
        placeholder: "4111 1111 1111 1111",
        schema: z
          .string()
          .trim()
          .regex(/^[0-9 ]{13,23}$/, { message: "Enter a valid card number." }),
      },
      {
        id: "expiry",
        label: "Expiry (MM/YY)",
        placeholder: "09/29",
        schema: z
          .string()
          .trim()
          .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, { message: "Use the MM/YY format." }),
      },
      {
        id: "cvc",
        label: "CVC",
        placeholder: "123",
        type: "password",
        schema: z
          .string()
          .trim()
          .regex(/^\d{3,4}$/, { message: "Enter the 3 or 4 digit CVC." }),
      },
    ],
  },
  mfs: {
    title: "Link a mobile wallet",
    description: "Connect bKash, Nagad or Rocket to move money with Payra.",
    icon: Smartphone,
    providers: ["bKash", "Nagad", "Rocket", "Upay"],
    fields: [
      {
        id: "walletNumber",
        label: "Wallet number",
        placeholder: "01712 345678",
        schema: z
          .string()
          .trim()
          .regex(/^01[3-9][0-9 ]{8,10}$/, { message: "Enter a valid Bangladeshi mobile number." }),
      },
      {
        id: "accountName",
        label: "Account holder name",
        placeholder: "Naimul Hasan",
        schema: z.string().trim().min(3, { message: "Enter the account holder name." }).max(100),
      },
    ],
  },
};

const steps = ["Provider", "Details", "Confirm"] as const;

function ConnectSourcePage() {
  const { kind } = Route.useLoaderData();
  const config = kindConfig[kind];
  const Icon = config.icon;

  const [step, setStep] = useState(0);
  const [provider, setProvider] = useState(config.providers[0] ?? "");
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const request = useSimulatedRequest(1700);

  function validate() {
    const next: Record<string, string> = {};
    for (const field of config.fields) {
      const parsed = field.schema.safeParse(values[field.id] ?? "");
      if (!parsed.success) next[field.id] = parsed.error.issues[0]?.message ?? "Invalid value.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function connect(forceFail = false) {
    request.run({
      fail: forceFail,
      failMessage: "We couldn't verify these details with the provider. Check them and try again.",
    });
  }

  const maskedIdentifier = (() => {
    const raw = values["accountNumber"] ?? values["cardNumber"] ?? values["walletNumber"] ?? "";
    const digits = raw.replace(/\D/g, "");
    return digits ? `•••• ${digits.slice(-4)}` : "—";
  })();

  return (
    <AppShell title={config.title} subtitle={config.description}>
      <SurfaceCard className="mx-auto max-w-2xl p-6 sm:p-7">
        {request.isLoading ? (
          <ProcessingState title="Connecting source" description={`Verifying your ${provider} details securely.`} />
        ) : request.isError ? (
          <FailureState
            title="Couldn't connect"
            description={request.error ?? "The connection failed."}
            onRetry={() => {
              request.reset();
              setStep(1);
            }}
            retryLabel="Edit details"
            secondaryAction={
              <Link to="/sources">
                <SoftButton className="w-full sm:w-auto">Back to sources</SoftButton>
              </Link>
            }
          />
        ) : request.isSuccess ? (
          <>
            <SuccessState title="Source connected" description={`${provider} is ready to use with Payra.`} />
            <SummaryList
              className="mt-6"
              rows={[
                { label: "Provider", value: provider },
                { label: "Identifier", value: maskedIdentifier },
                { label: "Status", value: "Active" },
              ]}
            />
            <FlowActions>
              <Link to="/add-money">
                <SoftButton className="w-full sm:w-auto">Add money now</SoftButton>
              </Link>
              <Link to="/sources">
                <SubmitButton className="w-full sm:w-auto">Back to sources</SubmitButton>
              </Link>
            </FlowActions>
          </>
        ) : (
          <>
            <StepTracker steps={steps} current={step} />

            {step === 0 ? (
              <div className="space-y-5">
                <SectionHeading title="Select a provider" description="Pick who you want to connect." />
                <fieldset>
                  <legend className="sr-only">Provider</legend>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {config.providers.map((item) => (
                      <label
                        key={item}
                        className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-colors ${
                          provider === item ? "border-primary bg-accent" : "border-border bg-card hover:bg-accent/50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="provider"
                          className="size-4 accent-[var(--color-primary)]"
                          checked={provider === item}
                          onChange={() => setProvider(item)}
                        />
                        <Icon className="size-5 text-primary" aria-hidden />
                        <span className="text-sm font-semibold text-foreground">{item}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <FlowActions>
                  <Link to="/sources">
                    <SoftButton className="w-full sm:w-auto">
                      <ArrowLeft className="size-4" aria-hidden /> Cancel
                    </SoftButton>
                  </Link>
                  <SubmitButton onClick={() => setStep(1)}>Continue</SubmitButton>
                </FlowActions>
              </div>
            ) : null}

            {step === 1 ? (
              <form
                className="space-y-4"
                noValidate
                onSubmit={(event) => {
                  event.preventDefault();
                  if (validate()) setStep(2);
                }}
              >
                <SectionHeading title={`${provider} details`} description="Prototype only — never enter real card or bank data." />
                {config.fields.map((field) => (
                  <TextField
                    key={field.id}
                    id={field.id}
                    label={field.label}
                    placeholder={field.placeholder}
                    type={field.type ?? "text"}
                    value={values[field.id] ?? ""}
                    error={errors[field.id]}
                    onChange={(event) => setValues((prev) => ({ ...prev, [field.id]: event.target.value }))}
                  />
                ))}
                <FlowActions>
                  <SoftButton onClick={() => setStep(0)}>
                    <ArrowLeft className="size-4" aria-hidden /> Back
                  </SoftButton>
                  <SubmitButton type="submit">Continue</SubmitButton>
                </FlowActions>
              </form>
            ) : null}

            {step === 2 ? (
              <div className="space-y-5">
                <SectionHeading title="Confirm connection" description="We'll verify this source with the provider." />
                <SummaryList
                  rows={[
                    { label: "Type", value: config.title.replace("Connect a ", "").replace("Add a ", "") },
                    { label: "Provider", value: provider },
                    { label: "Identifier", value: maskedIdentifier },
                  ]}
                />
                <TrustBadges />
                <FlowActions>
                  <SoftButton onClick={() => setStep(1)}>
                    <ArrowLeft className="size-4" aria-hidden /> Back
                  </SoftButton>
                  <SoftButton onClick={() => connect(true)}>Simulate failure</SoftButton>
                  <SubmitButton onClick={() => connect()}>Connect source</SubmitButton>
                </FlowActions>
              </div>
            ) : null}
          </>
        )}
      </SurfaceCard>
    </AppShell>
  );
}

function UnknownKind() {
  return (
    <AppShell title="Unknown source type" subtitle="We don't support that connection type.">
      <SurfaceCard className="mx-auto max-w-2xl p-7">
        <EmptyState
          title="Source type not found"
          description="Choose bank, card or mobile wallet from your payment sources."
        />
        <FlowActions>
          <Link to="/sources">
            <SubmitButton className="w-full sm:w-auto">Back to sources</SubmitButton>
          </Link>
        </FlowActions>
      </SurfaceCard>
    </AppShell>
  );
}
