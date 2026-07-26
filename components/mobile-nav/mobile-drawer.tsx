"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Heart, Home, CalendarDays, ListChecks, ShoppingBag, Wallet, Users, Building2,
  ClipboardCheck, Moon, Sun, X, LogOut,
} from "lucide-react";
import { useMobileNav } from "@/lib/mobile-nav-context";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/events", label: "Events", icon: CalendarDays },
  { href: "/dashboard/tasks", label: "Tasks", icon: ListChecks },
  { href: "/dashboard/bookings", label: "Bookings", icon: ClipboardCheck },
  { href: "/dashboard/budget", label: "Budget", icon: Wallet },
  { href: "/dashboard/shopping", label: "Shopping", icon: ShoppingBag },
  { href: "/dashboard/guests", label: "Guests", icon: Users },
  { href: "/dashboard/vendors", label: "Vendors", icon: Building2 },
];

export function MobileDrawer({ coupleNames }: { coupleNames: string }) {
  const { open, setOpen } = useMobileNav();
  const pathname = usePathname();
  const router = useRouter();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, [open]);

  // Lock body scroll while the drawer is open so the page behind it doesn't
  // scroll along with it (common mobile drawer bug otherwise).
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  function toggleDark() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("wp-dark", next ? "1" : "0");
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.push("/login");
    router.refresh();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
      <div className="absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-white dark:bg-[#161d18] shadow-xl flex flex-col safe-top safe-bottom">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald to-gold flex items-center justify-center">
              <Heart size={14} className="text-white" fill="white" />
            </div>
            <span className="font-display text-base text-emerald dark:text-[#e9dfc0]">{coupleNames}</span>
          </div>
          <button onClick={() => setOpen(false)} className="p-2 text-[#8a8360]">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {NAV.map((n) => {
            const active = n.href === "/dashboard" ? pathname === n.href : pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium ${
                  active
                    ? "bg-gradient-to-r from-emerald to-emerald-light text-white"
                    : "text-[#4b5a4c] dark:text-[#b8c2b8] hover:bg-[#f0e6d2]/60 dark:hover:bg-[#1c2420]"
                }`}
              >
                <n.icon size={18} />
                {n.label}
              </Link>
            );
          })}
        </div>

        <div className="px-3 pb-3 pt-2 border-t border-[#e7ddc4] dark:border-[#2c362f] space-y-1">
          <button onClick={toggleDark} className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm w-full text-[#4b5a4c] dark:text-[#b8c2b8] hover:bg-[#f0e6d2]/60 dark:hover:bg-[#1c2420]">
            {dark ? <Sun size={18} /> : <Moon size={18} />}
            {dark ? "Light mode" : "Dark mode"}
          </button>
          <button onClick={signOut} className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm w-full text-[#c0392b] hover:bg-[#c0392b]/10">
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
