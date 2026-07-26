import { createClient } from "@/lib/supabase/server";
import { EventsClient } from "./events-client";

export const revalidate = 0;

export default async function EventsPage() {
  const supabase = createClient();
  const [{ data: events }, { data: tasks }] = await Promise.all([
    supabase.from("events").select("*").eq("archived", false).order("created_at"),
    supabase.from("tasks").select("*"),
  ]);
  return <EventsClient initialEvents={events || []} initialTasks={tasks || []} />;
}
