"use server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("[signIn] Missing Supabase env vars — restart `npm run dev` after adding .env.local.");
    redirect(
      "/login?error=" +
        encodeURIComponent("Server is missing Supabase credentials — stop the server (Ctrl+C) and run `npm run dev` again.")
    );
  }

  let error;
  try {
    const supabase = createClient();
    const result = await supabase.auth.signInWithPassword({ email, password });
    error = result.error;
  } catch (err: any) {
    console.error("[signIn] Unexpected exception:", err);
    redirect("/login?error=" + encodeURIComponent("Unexpected error: " + (err?.message || "see server terminal for details")));
  }

  if (error) {
    console.error("[signIn] Supabase returned an error:", error);
    redirect(`/login?error=${encodeURIComponent(error.message || "Sign in failed — see server terminal for details.")}`);
  }

  redirect("/dashboard");
}
