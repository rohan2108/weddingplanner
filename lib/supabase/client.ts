import { createBrowserClient } from "@supabase/ssr";

// Client-side Supabase client. Used inside "use client" components,
// e.g. for realtime subscriptions and interactive forms.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
