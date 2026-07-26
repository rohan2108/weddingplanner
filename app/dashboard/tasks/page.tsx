import { createClient } from "@/lib/supabase/server";
import { TasksClient } from "./tasks-client";

export const revalidate = 0;

export default async function TasksPage({ searchParams }: { searchParams: { event?: string } }) {
  const supabase = createClient();
  const [{ data: events }, { data: tasks }] = await Promise.all([
    supabase.from("events").select("*").eq("archived", false).order("created_at"),
    supabase.from("tasks").select("*").order("due_date"),
  ]);
  return (
    <TasksClient initialEvents={events || []} initialTasks={tasks || []} initialFilter={searchParams?.event || "All"} />
  );
}
