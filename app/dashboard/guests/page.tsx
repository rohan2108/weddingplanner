import { createClient } from "@/lib/supabase/server";
import { GuestsClient } from "./guests-client";

export const revalidate = 0;

export default async function GuestsPage() {
  const supabase = createClient();
  const { data: guests } = await supabase.from("guests").select("*").order("created_at");
  return <GuestsClient initialGuests={guests || []} />;
}
