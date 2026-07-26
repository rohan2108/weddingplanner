import { createClient } from "@/lib/supabase/server";
import { BudgetClient } from "./budget-client";

export const revalidate = 0;

export default async function BudgetPage() {
  const supabase = createClient();
  const [{ data: events }, { data: budget }] = await Promise.all([
    supabase.from("events").select("*").eq("archived", false).order("created_at"),
    supabase.from("budget_items").select("*"),
  ]);
  return <BudgetClient initialEvents={events || []} initialBudget={budget || []} />;
}
