import { createClient } from "@/lib/supabase/server";
import { BookingsClient } from "./bookings-client";

export const revalidate = 0;

export default async function BookingsPage() {
  const supabase = createClient();
  const [{ data: events }, { data: bookings }] = await Promise.all([
    supabase.from("events").select("*").eq("archived", false).order("created_at"),
    supabase.from("bookings").select("*").order("category"),
  ]);
  return <BookingsClient initialEvents={events || []} initialBookings={bookings || []} />;
}
