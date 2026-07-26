"use server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const fullName = String(formData.get("full_name") || "");

  // Fail loudly and clearly if the env vars never made it into this process.
  // Most common cause: .env.local was added to the folder *after* `npm run dev`
  // was already running — Next.js only reads .env.local at server startup.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("[signUp] Missing Supabase env vars — restart `npm run dev` after adding .env.local.");
    redirect(
      "/signup?error=" +
        encodeURIComponent("Server is missing Supabase credentials — stop the server (Ctrl+C) and run `npm run dev` again.")
    );
  }

  let error;
  try {
    const supabase = createClient();
    const result = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    error = result.error;
  } catch (err: any) {
    // A thrown exception (bad URL, network issue, etc.) rather than a normal
    // Supabase error response. Logged to the terminal running `npm run dev`.
    console.error("[signUp] Unexpected exception:", err);
    redirect("/signup?error=" + encodeURIComponent("Unexpected error: " + (err?.message || "see server terminal for details")));
  }

  if (error) {
    console.error("[signUp] Supabase returned an error:", error);
    redirect(`/signup?error=${encodeURIComponent(error.message || "Sign up failed — see server terminal for details.")}`);
  }

  redirect("/login?error=" + encodeURIComponent("Check your email to confirm your account, then sign in."));
}
