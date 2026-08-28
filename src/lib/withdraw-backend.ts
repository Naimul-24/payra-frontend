import { supabase } from "./supabaseClient";

export async function withdrawMoney(amount: number, paymentMethodId: string) {
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Enter a valid amount");
  if (!paymentMethodId) throw new Error("Select a payment method");
  const { data, error } = await supabase.rpc("payra_withdraw", { p_amount: amount, p_payment_method_id: paymentMethodId });
  if (error) throw error;
  return data;
}
