"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Booking } from "@/lib/types";

type BookingPatch = Partial<Omit<Booking, "id" | "created_at" | "updated_at">>;

export async function addBooking(category: string, eventId: string, side: string) {
  const supabase = createClient();
  const { error } = await supabase.from("bookings").insert({
    category, event_id: eventId, is_custom: true, lead_months: 3, status: "Not Booked", side: side || "Both",
  });
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard");
}

export async function updateBooking(id: string, patch: BookingPatch) {
  const supabase = createClient();
  const { error } = await supabase.from("bookings").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard");
}

export async function removeBooking(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("bookings").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard");
}
