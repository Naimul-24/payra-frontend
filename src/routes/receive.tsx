import { useEffect, useState } from "react";
import { Copy, Check } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/payra/app-shell";
import { GradientButton, SoftButton, SurfaceCard, TrustBadges } from "@/components/payra/ui-kit";
import { QrCodeArt } from "@/components/payra/qr-art";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCurrentProfile } from "@/lib/supabase-data";
import { formatBDT } from "@/lib/payra-data";

export const Route=createFileRoute("/receive")({head:()=>({meta:[{title:"Receive Money — Payra"},{name:"description",content:"Share your Payra ID or QR code and request a specific amount."}]}),component:ReceivePage});
function ReceivePage(){
 const [profile,setProfile]=useState<any>(null); const [amount,setAmount]=useState("2000"); const [reason,setReason]=useState(""); const [copied,setCopied]=useState(false); const [loading,setLoading]=useState(true);
 useEffect(()=>{(async()=>{try{setProfile(await getCurrentProfile());}catch(e){toast.error(e instanceof Error?e.message:"Unable to load your Payra profile");}finally{setLoading(false);}})();},[]);
 const payraId=profile?.phone||profile?.id||""; const name=profile?.full_name||"Payra user";
 const qrPayload=payraId?`payra://pay?phone=${encodeURIComponent(payraId)}`:"";
 async function copyId(){if(!payraId)return;await navigator.clipboard.writeText(payraId);setCopied(true);toast.success("Payra ID copied");setTimeout(()=>setCopied(false),1600);}
 function request(){const value=Number(amount);if(!Number.isFinite(value)||value<=0){toast.error("Enter a valid request amount");return;}toast.info("Payment request creation will be connected when the request-money backend is enabled.");}
 if(loading)return <AppShell title="Receive Money"><SurfaceCard className="mx-auto max-w-xl p-8 text-center">Loading your Payra profile…</SurfaceCard></AppShell>;
 return <AppShell title="Receive Money" subtitle="Share your Payra ID or QR to get paid instantly."><div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-2"><SurfaceCard className="flex flex-col items-center p-8 text-center"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your Payra ID</p><p className="mt-1 break-all text-2xl font-extrabold text-brand-ink">{payraId||"Not available"}</p><QrCodeArt value={qrPayload} className="mt-6"/><p className="mt-5 text-sm text-muted-foreground">Scan this code with Payra to pay {name}.</p><div className="mt-6 w-full"><SoftButton disabled={!payraId} onClick={copyId} className="w-full">{copied?<Check className="size-4"/>:<Copy className="size-4"/>}{copied?"Copied":"Copy Payra ID"}</SoftButton></div></SurfaceCard><SurfaceCard className="p-8"><h2 className="text-lg font-bold text-foreground">Request a specific amount</h2><p className="mt-1 text-sm text-muted-foreground">Prepare an amount for a payment request.</p><div className="mt-6 rounded-2xl bg-brand-soft p-6 text-center"><div className="flex items-center justify-center gap-2"><span className="text-3xl font-extrabold text-brand-ink">৳</span><input value={amount} onChange={e=>setAmount(e.target.value.replace(/[^0-9.]/g,""))} inputMode="decimal" aria-label="Request amount" className="w-40 bg-transparent text-center text-4xl font-extrabold text-brand-ink outline-none" placeholder="0.00"/></div><p className="mt-2 text-xs text-muted-foreground">Requesting {formatBDT(Number(amount)||0)}</p></div><div className="mt-5 space-y-1.5"><Label htmlFor="reason">What’s it for? (optional)</Label><Input id="reason" value={reason} onChange={e=>setReason(e.target.value)} placeholder="Rent share for August" className="h-12 rounded-xl"/></div><GradientButton className="mt-6 w-full" onClick={request}>Create Payment Request</GradientButton><TrustBadges className="mt-6"/></SurfaceCard></div></AppShell>;
}