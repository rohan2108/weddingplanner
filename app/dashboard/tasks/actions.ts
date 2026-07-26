"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { TaskPriority, TaskStatus } from "@/lib/types";

export async function addTask(input: {
  name: string; eventId: string; assigneeName: string; priority: TaskPriority; dueDate: string; category: string; description: string; side: string;
}) {
  const supabase = createClient();
  const { error, data } = await supabase.from("tasks").insert({
    name: input.name,
    event_id: input.eventId,
    assignee_name: input.assigneeName,
    priority: input.priority,
    due_date: input.dueDate || null,
    category: input.category,
    description: input.description || "",
    side: input.side || "Both",
    status: "Not Started",
    completion_pct: 0,
  }).select();
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error("Add was blocked by permissions.");
  revalidatePath("/dashboard/tasks");
  revalidatePath("/dashboard");
}

export async function updateTaskStatus(id: string, status: TaskStatus) {
  const supabase = createClient();
  const { error, data } = await supabase
    .from("tasks")
    .update({ status, completion_pct: status === "Completed" ? 100 : undefined })
    .eq("id", id)
    .select();
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error("You can only update tasks assigned to you (or be an Admin).");
  revalidatePath("/dashboard/tasks");
  revalidatePath("/dashboard");
}

export async function updateTaskDescription(id: string, description: string) {
  const supabase = createClient();
  const { error, data } = await supabase.from("tasks").update({ description }).eq("id", id).select();
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error("You can only edit tasks assigned to you (or be an Admin).");
  revalidatePath("/dashboard/tasks");
}
