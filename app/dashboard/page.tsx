import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "./dashboard-client";

export const revalidate = 0;

export default async function DashboardPage() {
  const supabase = createClient();

  const [{ data: events }, { data: tasks }, { data: bookings }, { data: budget }, { data: shopping }] =
    await Promise.all([
      supabase.from("events").select("*").eq("archived", false).order("created_at"),
      supabase.from("tasks").select("*").order("due_date"),
      supabase.from("bookings").select("*").order("category"),
      supabase.from("budget_items").select("*"),
      supabase.from("shopping_items").select("*"),
    ]);

  return (
    <DashboardClient
      initialEvents={events || []}
      initialTasks={tasks || []}
      initialBookings={bookings || []}
      initialBudget={budget || []}
      initialShopping={shopping || []}
    />
  );
}
