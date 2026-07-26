"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Vendor } from "@/lib/types";

type Patch = Partial<Omit<Vendor, "id" | "created_at">>;

export async function addVendor() {
  const supabase = createClient();
  const { error } = await supabase.from("vendors").insert({ name: "New vendor", category: "Decorator", rating: 4, side: "Both" });
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/vendors");
}

export async function updateVendor(id: string, patch: Patch) {
  const supabase = createClient();
  const { error } = await supabase.from("vendors").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/vendors");
}

export async function deleteVendor(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("vendors").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/vendors");
}
