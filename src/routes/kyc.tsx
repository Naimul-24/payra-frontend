import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Clock,
  FileText,
  IdCard,
  ShieldAlert,
  UploadCloud,
} from "lucide-react";
import { z } from "zod";
import { AppShell } from "@/components/payra/app-shell";
import { SectionHeading, SoftButton, SuccessState, SurfaceCard, TrustBadges } from "@/components/payra/ui-kit";
import {
  FailureState,
  FlowActions,
  InlineFormError,
  ProcessingState,
  StepTracker,
  SubmitButton,
  SummaryList,
  TextField,
} from "@/components/payra/flow-kit";
import { Progress } from "@/components/ui/progress";
import { documentTypes, type DocumentTypeId, currentUser, kycProfile } from "@/lib/payra-data";
import { useSimulatedRequest } from "@/lib/use-simulated-request";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/kyc")({
  head: () => ({
    meta: [
      { title: "Identity Verification — Payra" },
      { name: "description", content: "Verify your identity to unlock higher Payra transfer limits." },
      { property: "og:title", content: "Identity Verification — Payra" },
      { property: "og:description", content: "Complete Payra KYC to raise your limits." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: KycPage,
});

const steps = ["Personal info", "Document", "Review"] as const;

const personalSchema = z.object({
  fullName: z.string().trim().min(3, { message: "Enter your full legal name." }).max(100),
  dateOfBirth: z.string().min(1, { message: "Select your date of birth." }),
  address: z.string().trim().min(6, { message: "Enter your current address." }).max(200),
  documentNumber: z.string().trim().min(6, { message: "Enter your document number." }).max(40),
});

type PersonalErrors = Partial<Record<keyof z.infer<typeof personalSchema>, string>>;

type UploadSlot = "front" | "back" | "selfie";

const uploadSlots: { id: UploadSlot; label: string; hint: string }[] = [
  { id: "front", label: "Document front", hint: "All four corners visible" },
  { id: "back", label: "Document back", hint: "Required for NID and licence" },
  { id: "selfie", label: "Selfie with document", hint: "Face clearly visible" },
];

function KycPage() {
  const [step, setStep] = useState(0);
  const [fullName, setFullName] = useState(currentUser.name);
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [address, setAddress] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [errors, setErrors] = useState<PersonalErrors>({});
  const [docType, setDocType] = useState<DocumentTypeId>("nid");
  const [uploads, setUploads] = useState<Record<UploadSlot, string | null>>({
    front: null,
    back: null,
    selfie: null,
  });
  const [uploadError, setUploadError] = useState<string | undefined>();
  const [outcome, setOutcome] = useState<"pending" | "verified">("pending");
  const request = useSimulatedRequest(2000);

  const requiredSlots: UploadSlot[] = docType === "passport" ? ["front", "selfie"] : ["front", "back", "selfie"];
  const completedUploads = requiredSlots.filter((slot) => uploads[slot]).length;
  const progress = Math.round((completedUploads / requiredSlots.length) * 100);

  function validatePersonal() {
    const parsed = personalSchema.safeParse({ fullName, dateOfBirth, address, documentNumber });
    if (parsed.success) {
      setErrors({});
      return true;
    }
    const next: PersonalErrors = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof PersonalErrors;
      if (key && !next[key]) next[key] = issue.message;
    }
    setErrors(next);
    return false;
  }

  function simulateUpload(slot: UploadSlot) {
    setUploadError(undefined);
    setUploads((prev) => ({ ...prev, [slot]: `${slot}-${docType}.jpg` }));
  }

  function submit(forceReject = false) {
    request.run({
      fail: forceReject,
      failMessage: "We couldn't read your document. Upload a clearer photo and submit again.",
    });
  }

  /* --------------------------------------------------------- results UI */

  if (request.isLoading) {
    return (
      <KycShell>
        <SurfaceCard className="mx-auto max-w-2xl p-7">
          <ProcessingState
            title="Reviewing your documents"
            description="This prototype simulates verification — no real documents are processed or stored."
          />
          <Progress value={70} className="mt-4" />
        </SurfaceCard>
      </KycShell>
    );
  }

  if (request.isError) {
    return (
      <KycShell>
        <SurfaceCard className="mx-auto max-w-2xl p-7">
          <FailureState
            title="Verification rejected"
            description={request.error ?? "Your submission was rejected."}
            onRetry={() => {
              request.reset();
              setStep(1);
            }}
            retryLabel="Re-upload documents"
            secondaryAction={
              <Link to="/dashboard">
                <SoftButton className="w-full sm:w-auto">Back to dashboard</SoftButton>
              </Link>
            }
          />
        </SurfaceCard>
      </KycShell>
    );
  }

  if (request.isSuccess) {
    return (
      <KycShell>
        <SurfaceCard className="mx-auto max-w-2xl p-7">
          {outcome === "verified" ? (
            <SuccessState
              title="Identity verified"
              description="Your Payra limits have been raised to ৳500,000 per day."
            />
          ) : (
            <div className="flex flex-col items-center text-center">
              <span className="inline-flex size-16 items-center justify-center rounded-full bg-warning/18">
                <Clock className="size-8 text-warning-foreground" aria-hidden />
              </span>
              <h3 className="mt-5 text-xl font-bold text-foreground">Verification pending</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                We usually review documents within 30 minutes. We&apos;ll notify you as soon as it&apos;s done.
              </p>
            </div>
          )}

          <SummaryList
            className="mt-6"
            rows={[
              { label: "Reference", value: "KYC-2026-77120" },
              { label: "Document", value: documentTypes.find((d) => d.id === docType)?.label ?? "—" },
              { label: "Submitted", value: "Just now" },
              { label: "Current level", value: kycProfile.level },
            ]}
          />

          <FlowActions>
            {outcome === "pending" ? (
              <SoftButton onClick={() => setOutcome("verified")}>Simulate approval</SoftButton>
            ) : null}
            <Link to="/dashboard">
              <SubmitButton className="w-full sm:w-auto">Go to dashboard</SubmitButton>
            </Link>
          </FlowActions>
        </SurfaceCard>
      </KycShell>
    );
  }

  /* ------------------------------------------------------------ wizard */

  return (
    <KycShell>
      <SurfaceCard className="mx-auto max-w-2xl p-6 sm:p-7">
        <StepTracker steps={steps} current={step} />

        {step === 0 ? (
          <form
            className="space-y-4"
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              if (validatePersonal()) setStep(1);
            }}
          >
            <SectionHeading title="Personal information" description="Must match your identity document exactly." />
            <TextField
              id="kyc-name"
              label="Full legal name"
              value={fullName}
              error={errors.fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
            <TextField
              id="kyc-dob"
              label="Date of birth"
              type="date"
              value={dateOfBirth}
              error={errors.dateOfBirth}
              onChange={(event) => setDateOfBirth(event.target.value)}
            />
            <TextField
              id="kyc-address"
              label="Present address"
              placeholder="House 12, Road 5, Dhanmondi, Dhaka"
              value={address}
              error={errors.address}
              onChange={(event) => setAddress(event.target.value)}
            />
            <TextField
              id="kyc-doc-number"
              label="Document number"
              placeholder="1990 1234 567890"
              value={documentNumber}
              error={errors.documentNumber}
              onChange={(event) => setDocumentNumber(event.target.value)}
            />
            <FlowActions>
              <SubmitButton type="submit" className="w-full sm:w-auto">
                Continue <ArrowRight className="size-4" aria-hidden />
              </SubmitButton>
            </FlowActions>
          </form>
        ) : null}

        {step === 1 ? (
          <div className="space-y-5">
            <SectionHeading title="Identity document" description="Choose a document type and upload clear photos." />

            <fieldset>
              <legend className="sr-only">Document type</legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {documentTypes.map((type) => (
                  <label
                    key={type.id}
                    className={cn(
                      "cursor-pointer rounded-2xl border p-4 transition-colors",
                      docType === type.id ? "border-primary bg-accent" : "border-border bg-card hover:bg-accent/50",
                    )}
                  >
                    <input
                      type="radio"
                      name="doc-type"
                      className="sr-only"
                      checked={docType === type.id}
                      onChange={() => {
                        setDocType(type.id);
                        setUploads({ front: null, back: null, selfie: null });
                      }}
                    />
                    <IdCard className="size-5 text-primary" aria-hidden />
                    <span className="mt-2 block text-sm font-semibold text-foreground">{type.label}</span>
                    <span className="block text-xs text-muted-foreground">{type.detail}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {uploadError ? <InlineFormError message={uploadError} /> : null}

            <div className="space-y-3">
              {uploadSlots
                .filter((slot) => requiredSlots.includes(slot.id))
                .map((slot) => {
                  const file = uploads[slot.id];
                  return (
                    <div
                      key={slot.id}
                      className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4"
                    >
                      <span
                        className={cn(
                          "grid size-12 shrink-0 place-items-center rounded-xl",
                          file ? "bg-success/12" : "bg-accent",
                        )}
                      >
                        {file ? (
                          <BadgeCheck className="size-5 text-success" aria-hidden />
                        ) : (
                          <FileText className="size-5 text-accent-foreground" aria-hidden />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground">{slot.label}</p>
                        <p className="truncate text-xs text-muted-foreground">{file ?? slot.hint}</p>
                      </div>
                      <SoftButton
                        className="h-10 px-4 text-sm"
                        onClick={() => simulateUpload(slot.id)}
                        aria-label={`${file ? "Replace" : "Upload"} ${slot.label}`}
                      >
                        <UploadCloud className="size-4" aria-hidden /> {file ? "Replace" : "Upload"}
                      </SoftButton>
                    </div>
                  );
                })}
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>Upload progress</span>
                <span>
                  {completedUploads}/{requiredSlots.length}
                </span>
              </div>
              <Progress value={progress} aria-label="Document upload progress" />
            </div>

            <p className="flex items-start gap-2 rounded-2xl border border-dashed border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
              <ShieldAlert className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              Prototype only — uploads are simulated in the browser and nothing is stored or processed.
            </p>

            <FlowActions>
              <SoftButton onClick={() => setStep(0)}>
                <ArrowLeft className="size-4" aria-hidden /> Back
              </SoftButton>
              <SubmitButton
                onClick={() => {
                  if (completedUploads < requiredSlots.length) {
                    setUploadError("Upload every required photo before continuing.");
                    return;
                  }
                  setUploadError(undefined);
                  setStep(2);
                }}
              >
                Continue <ArrowRight className="size-4" aria-hidden />
              </SubmitButton>
            </FlowActions>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-5">
            <SectionHeading title="Review & submit" description="Check everything before sending it for review." />
            <SummaryList
              rows={[
                { label: "Full name", value: fullName },
                { label: "Date of birth", value: dateOfBirth || "—" },
                { label: "Address", value: address },
                { label: "Document", value: documentTypes.find((d) => d.id === docType)?.label ?? "—" },
                { label: "Document number", value: documentNumber },
                { label: "Photos uploaded", value: `${completedUploads} of ${requiredSlots.length}` },
              ]}
            />
            <TrustBadges />
            <FlowActions>
              <SoftButton onClick={() => setStep(1)}>
                <ArrowLeft className="size-4" aria-hidden /> Back
              </SoftButton>
              <SoftButton onClick={() => submit(true)}>Simulate rejection</SoftButton>
              <SubmitButton onClick={() => submit()}>Submit for verification</SubmitButton>
            </FlowActions>
          </div>
        ) : null}
      </SurfaceCard>
    </KycShell>
  );
}

function KycShell({ children }: { children: React.ReactNode }) {
  return (
    <AppShell title="Identity Verification" subtitle="Unlock higher limits by verifying who you are.">
      {children}
    </AppShell>
  );
}
