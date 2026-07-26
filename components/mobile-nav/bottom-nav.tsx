"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ListChecks, ShoppingBag, Wallet, Menu } from "lucide-react";
import { useMobileNav } from "@/lib/mobile-nav-context";

// Four most-used sections get a permanent slot; everything else lives behind
// "More", which opens the same slide-in drawer as the hamburger button.
const PRIMARY = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/tasks", label: "Tasks", icon: ListChecks },
  { href: "/dashboard/shopping", label: "Shopping", icon: ShoppingBag },
  { href: "/dashboard/budget", label: "Budget", icon: Wallet },
];

export function BottomNav() {
  const pathname = usePathname();
  const { setOpen } = useMobileNav();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-[#161d18]/95 backdrop-blur
        border-t border-[#e7ddc4] dark:border-[#2c362f] flex items-stretch safe-bottom safe-left safe-right"
    >
      {PRIMARY.map((n) => {
        const active = n.href === "/dashboard" ? pathname === n.href : pathname.startsWith(n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium ${
              active ? "text-emerald dark:text-gold" : "text-[#8a8360]"
            }`}
          >
            <n.icon size={20} />
            {n.label}
          </Link>
        );
      })}
      <button
        onClick={() => setOpen(true)}
        className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium text-[#8a8360]"
      >
        <Menu size={20} />
        More
      </button>
    </nav>
  );
}
