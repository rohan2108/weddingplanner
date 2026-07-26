import Link from "next/link";
import { Heart } from "lucide-react";
import { signIn } from "./actions";

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-ivory dark:bg-charcoal px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald to-gold flex items-center justify-center mb-3">
            <Heart size={20} className="text-white" fill="white" />
          </div>
          <h1 className="font-display text-2xl text-emerald">Anushka & Rohan</h1>
          <p className="text-sm text-[#8a8360]">Sign in to the wedding planner</p>
        </div>
        <form action={signIn} className="space-y-3 bg-white rounded-2xl border border-[#e7ddc4] p-6 shadow-sm">
          {searchParams?.error && (
            <p className="text-xs text-[#c0392b] bg-[#c0392b]/10 rounded-lg px-3 py-2">{searchParams.error}</p>
          )}
          <div>
            <label className="block text-xs uppercase tracking-wide text-[#8a8360] mb-1">Email</label>
            <input name="email" type="email" required className="field-input" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-[#8a8360] mb-1">Password</label>
            <input name="password" type="password" required className="field-input" placeholder="••••••••" />
          </div>
          <button type="submit" className="w-full py-2.5 rounded-xl bg-emerald text-white text-sm font-medium hover:bg-emerald-light">
            Sign in
          </button>
        </form>
        <p className="text-center text-sm text-[#8a8360] mt-4">
          New here? <Link href="/signup" className="text-emerald font-medium hover:underline">Create an account</Link>
        </p>
      </div>
    </main>
  );
}
