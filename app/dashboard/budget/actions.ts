"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateBudgetItem(id: string, patch: { planned?: number; actual?: number; category?: string }) {
  const supabase = createClient();
  const { error, data } = await supabase.from("budget_items").update(patch).eq("id", id).select();
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) {
    throw new Error("Update was blocked — you need Admin permissions to edit the budget.");
  }
  revalidatePath("/dashboard/budget");
  revalidatePath("/dashboard");
}

export async function addBudgetItem(eventId: string, category: string, side: string) {
  const supabase = createClient();
  const { error, data } = await supabase
    .from("budget_items")
    .insert({ event_id: eventId, category, planned: 0, actual: 0, side: side || "Both" })
    .select();
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) {
    throw new Error("Add was blocked — you need Admin permissions to edit the budget.");
  }
  revalidatePath("/dashboard/budget");
  revalidatePath("/dashboard");
}

export async function deleteBudgetItem(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("budget_items").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/budget");
  revalidatePath("/dashboard");
}
