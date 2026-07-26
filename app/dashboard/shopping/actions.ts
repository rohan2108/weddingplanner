"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ShoppingItem } from "@/lib/types";

type Patch = Partial<Omit<ShoppingItem, "id" | "created_at">>;

export async function addShoppingItem(eventId: string, name: string, side: string) {
  const supabase = createClient();
  const { error, data } = await supabase
    .from("shopping_items")
    .insert({
      event_id: eventId, category: "General", name: name || "New item",
      qty: 1, remaining_qty: 1, budget: 0, actual: 0, purchased: false, side: side || "Both",
    })
    .select();
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error("Add was blocked by permissions.");
  revalidatePath("/dashboard/shopping");
}

export async function updateShoppingItem(id: string, patch: Patch) {
  const supabase = createClient();
  const { error, data } = await supabase.from("shopping_items").update(patch).eq("id", id).select();
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error("Update was blocked by permissions.");
  revalidatePath("/dashboard/shopping");
  revalidatePath("/dashboard");
}

export async function deleteShoppingItem(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("shopping_items").delete().eq("id", id);
  if (error) throw new Error(error.message + " — deleting requires Admin permissions.");
  revalidatePath("/dashboard/shopping");
}
