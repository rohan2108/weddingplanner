"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart, Home, CalendarDays, ListChecks, ShoppingBag, Wallet, Users, Building2,
  ClipboardCheck, Moon, Sun,
} from "lucide-react";
import { useEffect, useState } from "react";

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

export function Sidebar({ coupleNames }: { coupleNames: string }) {
  const pathname = usePathname();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("wp-dark") === "1";
    setDark(stored);
    document.documentElement.classList.toggle("dark", stored);
  }, []);

  function toggleDark() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("wp-dark", next ? "1" : "0");
  }

  return (
    <aside className="w-60 shrink-0 hidden md:flex flex-col border-r border-[#e7ddc4] dark:border-[#2c362f] bg-white/60 dark:bg-[#161d18] px-4 py-6 gap-1">
      <div className="flex items-center gap-2 px-2 mb-6">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald to-gold flex items-center justify-center">
          <Heart size={16} className="text-white" fill="white" />
        </div>
        <div>
          <div className="font-display text-lg leading-tight text-emerald dark:text-[#e9dfc0]">{coupleNames}</div>
          <div className="text-[10px] uppercase tracking-wider text-[#a8975f]">11 Dec 2026</div>
        </div>
      </div>
      {NAV.map((n) => {
        const active = n.href === "/dashboard" ? pathname === n.href : pathname.startsWith(n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              active
                ? "bg-gradient-to-r from-emerald to-emerald-light text-white shadow-md"
                : "text-[#4b5a4c] dark:text-[#b8c2b8] hover:bg-[#f0e6d2]/60 dark:hover:bg-[#1c2420]"
            }`}
          >
            <n.icon size={17} />
            {n.label}
          </Link>
        );
      })}
      <div className="mt-auto pt-4 border-t border-[#e7ddc4] dark:border-[#2c362f]">
        <button
          onClick={toggleDark}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm w-full text-[#4b5a4c] dark:text-[#b8c2b8] hover:bg-[#f0e6d2]/60 dark:hover:bg-[#1c2420]"
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
          {dark ? "Light mode" : "Dark mode"}
        </button>
      </div>
    </aside>
  );
}
