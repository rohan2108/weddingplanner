import { createClient } from "@/lib/supabase/server";
import { ShoppingClient } from "./shopping-client";

export const revalidate = 0;

export default async function ShoppingPage() {
  const supabase = createClient();
  const [{ data: events }, { data: shopping }] = await Promise.all([
    supabase.from("events").select("*").eq("archived", false).order("created_at"),
    supabase.from("shopping_items").select("*").order("created_at"),
  ]);
  return <ShoppingClient initialEvents={events || []} initialShopping={shopping || []} />;
}
