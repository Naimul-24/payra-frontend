import { useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Camera, ImagePlus, ScanLine } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/payra/app-shell";
import { GradientButton, SoftButton, SurfaceCard } from "@/components/payra/ui-kit";
import { supabase } from "@/lib/supabaseClient";

export const Route=createFileRoute("/scan")({head:()=>({meta:[{title:"Scan QR — Payra"},{name:"description",content:"Scan a Payra QR code to find a recipient."}]}),component:ScanPage});
function ScanPage(){
 const [active,setActive]=useState(false); const [resolving,setResolving]=useState(false); const fileRef=useRef<HTMLInputElement>(null); const navigate=useNavigate();
 async function resolvePayload(payload:string){
  const value=payload.trim(); if(!value)return;
  setResolving(true);try{
   let phone=value;
   try{const url=new URL(value); phone=url.searchParams.get("phone")||url.searchParams.get("payraId")||url.pathname.split("/").filter(Boolean).pop()||value;}catch{}
   const {data,error}=await supabase.from("profiles").select("phone,full_name").eq("phone",phone).maybeSingle();
   if(error)throw error; if(!data?.phone){toast.error("Payra recipient not found");return;}
   toast.success(`${data.full_name||"Payra user"} found`);
   await navigate({to:"/send",search:{recipient:data.phone}} as any);
  }catch(e){toast.error(e instanceof Error?e.message:"Unable to resolve Payra QR");}finally{setResolving(false);}
 }
 async function handleUpload(e:React.ChangeEvent<HTMLInputElement>){const file=e.target.files?.[0];if(!file)return;toast.info("QR image selected. Browser QR decoding is not available in this build yet.");}
 return <AppShell title="Scan QR" subtitle="Scan a Payra payment code to find the recipient."><div className="mx-auto max-w-xl"><SurfaceCard className="p-6"><div className="relative aspect-square overflow-hidden rounded-2xl bg-brand-ink"><div className="absolute inset-10 rounded-3xl border-2 border-primary-foreground/80"><ScanLine className="absolute left-1/2 top-1/2 size-20 -translate-x-1/2 -translate-y-1/2 text-primary-foreground/80"/>{active?<span className="absolute inset-x-3 top-3 h-0.5 animate-scan bg-cyan"/>:null}</div><p className="absolute inset-x-4 bottom-6 text-center text-sm font-medium text-primary-foreground/80">{resolving?"Finding recipient…":active?"Camera ready — align a QR code":"Camera preview is paused"}</p></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><GradientButton disabled={resolving} onClick={()=>setActive(v=>!v)}><Camera className="size-4"/>{active?"Pause camera":"Open camera"}</GradientButton><SoftButton disabled={resolving} onClick={()=>fileRef.current?.click()}><ImagePlus className="size-4"/>Upload QR image</SoftButton><input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload}/></div><p className="mt-4 text-center text-xs text-muted-foreground">Payra QR codes should contain a Payra recipient phone number or Payra ID.</p><Link to="/send" className="mt-5 block text-center text-sm font-semibold text-primary hover:underline">Send without scanning</Link></SurfaceCard></div></AppShell>;
}