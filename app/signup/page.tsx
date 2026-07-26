import Link from "next/link";
import { Heart } from "lucide-react";
import { signUp } from "./actions";

export default function SignupPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-ivory dark:bg-charcoal px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald to-gold flex items-center justify-center mb-3">
            <Heart size={20} className="text-white" fill="white" />
          </div>
          <h1 className="font-display text-2xl text-emerald">Join the planning</h1>
          <p className="text-sm text-[#8a8360] text-center">
            The first person to sign up becomes Admin automatically. Everyone else joins as Family.
          </p>
        </div>
        <form action={signUp} className="space-y-3 bg-white rounded-2xl border border-[#e7ddc4] p-6 shadow-sm">
          {searchParams?.error && (
            <p className="text-xs text-[#c0392b] bg-[#c0392b]/10 rounded-lg px-3 py-2">{searchParams.error}</p>
          )}
          <div>
            <label className="block text-xs uppercase tracking-wide text-[#8a8360] mb-1">Full name</label>
            <input name="full_name" required className="field-input" placeholder="Priya Sharma" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-[#8a8360] mb-1">Email</label>
            <input name="email" type="email" required className="field-input" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-[#8a8360] mb-1">Password</label>
            <input name="password" type="password" required minLength={6} className="field-input" placeholder="At least 6 characters" />
          </div>
          <button type="submit" className="w-full py-2.5 rounded-xl bg-gold text-white text-sm font-medium hover:opacity-90">
            Create account
          </button>
        </form>
        <p className="text-center text-sm text-[#8a8360] mt-4">
          Already have an account? <Link href="/login" className="text-emerald font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
