"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addEvent(name: string, eventDate: string | null) {
  const supabase = createClient();
  const { error } = await supabase.from("events").insert({ name, event_date: eventDate });
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/events");
  revalidatePath("/dashboard");
}

export async function archiveEvent(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("events").update({ archived: true }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/events");
  revalidatePath("/dashboard");
}
