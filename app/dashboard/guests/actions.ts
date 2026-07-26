"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Guest } from "@/lib/types";

type Patch = Partial<Omit<Guest, "id" | "created_at">>;

export async function addGuest() {
  const supabase = createClient();
  const { error } = await supabase.from("guests").insert({ name: "New guest", side: "Bride", type: "Family", rsvp: "Pending" });
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/guests");
}

export async function updateGuest(id: string, patch: Patch) {
  const supabase = createClient();
  const { error } = await supabase.from("guests").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/guests");
}

export async function deleteGuest(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("guests").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/guests");
}
