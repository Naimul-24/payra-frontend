import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { AuthLayout, GoogleButton } from "@/components/payra/auth-layout";
import { InlineFormError, SubmitButton, TextField } from "@/components/payra/flow-kit";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/lib/supabaseClient";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create your Payra account" }, { name: "description", content: "Open a Payra wallet in minutes and start sending, receiving and paying in BDT." }] }),
  component: SignupPage,
});

const fields = [
  { id: "name", label: "Full name", placeholder: "Your name", type: "text", autoComplete: "name" },
  { id: "email", label: "Email", placeholder: "you@example.com", type: "email", autoComplete: "email" },
  { id: "phone", label: "Phone number", placeholder: "+880 1XXXXXXXXX", type: "tel", autoComplete: "tel" },
  { id: "password", label: "Password", placeholder: "••••••••", type: "password", autoComplete: "new-password" },
  { id: "confirm", label: "Confirm password", placeholder: "••••••••", type: "password", autoComplete: "new-password" },
] as const;
type FieldId = (typeof fields)[number]["id"];
const schema = z.object({ name:z.string().trim().min(3,{message:"Enter your full name."}).max(100), email:z.string().trim().email({message:"Enter a valid email address."}).max(255), phone:z.string().trim().regex(/^(\+880|0)1[3-9][0-9 -]{8,12}$/,{message:"Enter a valid Bangladeshi phone number."}), password:z.string().min(8,{message:"Use at least 8 characters."}).max(128).regex(/[0-9]/,{message:"Include at least one number."}), confirm:z.string() }).refine((v)=>v.password===v.confirm,{message:"Passwords don't match.",path:["confirm"]});

function SignupPage() {
 const navigate=useNavigate(); const [values,setValues]=useState<Record<FieldId,string>>({name:"",email:"",phone:"",password:"",confirm:""}); const [errors,setErrors]=useState<Partial<Record<FieldId|"terms",string>>>({}); const [accepted,setAccepted]=useState(false); const [loading,setLoading]=useState(false); const [submitError,setSubmitError]=useState("");
 async function submit(event:React.FormEvent){event.preventDefault();const parsed=schema.safeParse(values);const next:Partial<Record<FieldId|"terms",string>>={};if(!parsed.success)for(const issue of parsed.error.issues){const key=issue.path[0] as FieldId;if(key&&!next[key])next[key]=issue.message;}if(!accepted)next.terms="Accept the Terms & Privacy Policy to continue.";setErrors(next);if(Object.keys(next).length)return;setSubmitError("");setLoading(true);try{const {data,error}=await supabase.auth.signUp({email:values.email.trim().toLowerCase(),password:values.password,options:{data:{full_name:values.name.trim(),phone:values.phone.trim()}}});if(error)throw error;if(data.session)await navigate({to:"/dashboard"});else await navigate({to:"/login"});}catch(e){setSubmitError(e instanceof Error?e.message:"Unable to create your account.");}finally{setLoading(false);}}
 return <AuthLayout title="Create your Payra account" subtitle="One wallet for sending, receiving and paying across Bangladesh." footer={<>Already have an account? <Link to="/login" className="font-semibold text-primary hover:underline">Log in</Link></>}><form className="space-y-4" noValidate onSubmit={submit}>{submitError?<InlineFormError message={submitError}/>:null}{fields.map(field=><TextField key={field.id} id={field.id} label={field.label} type={field.type} placeholder={field.placeholder} autoComplete={field.autoComplete} value={values[field.id]} disabled={loading} error={errors[field.id]} onChange={e=>setValues(prev=>({...prev,[field.id]:e.target.value}))}/>)}<div className="space-y-1.5"><label className="flex items-start gap-2.5 text-sm text-muted-foreground"><Checkbox id="terms" className="mt-0.5" checked={accepted} disabled={loading} onCheckedChange={checked=>setAccepted(checked===true)}/><span>I agree to Payra&apos;s <span className="font-semibold text-primary">Terms &amp; Privacy Policy</span></span></label>{errors.terms?<p role="alert" className="text-xs font-medium text-destructive">{errors.terms}</p>:null}</div><SubmitButton type="submit" className="w-full" loading={loading} loadingLabel="Creating account…">Create Payra Account</SubmitButton><div className="relative py-2 text-center"><span className="relative z-10 bg-background px-3 text-xs text-muted-foreground">or</span><span className="absolute inset-x-0 top-1/2 h-px bg-border"/></div><GoogleButton label="Continue with Google"/></form></AuthLayout>;
}