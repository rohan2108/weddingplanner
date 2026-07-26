import { createClient } from "@/lib/supabase/server";
import { VendorsClient } from "./vendors-client";

export const revalidate = 0;

export default async function VendorsPage() {
  const supabase = createClient();
  const { data: vendors } = await supabase.from("vendors").select("*").order("created_at");
  return <VendorsClient initialVendors={vendors || []} />;
}
