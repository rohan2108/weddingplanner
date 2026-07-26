"use client";
import { Search, Bell, LogOut, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SideSwitch } from "@/components/side-switch";
import { useMobileNav } from "@/lib/mobile-nav-context";

export function Topbar({ urgentCount, userLabel }: { urgentCount: number; userLabel: string }) {
  const router = useRouter();
  const { setOpen } = useMobileNav();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 md:px-8 py-3 md:py-4 border-b border-[#e7ddc4] dark:border-[#2c362f] bg-white/50 dark:bg-charcoal sticky top-0 z-20 backdrop-blur safe-top">
      <button
        onClick={() => setOpen(true)}
        className="md:hidden p-2 -ml-1 rounded-xl hover:bg-[#f0e6d2]/60 dark:hover:bg-[#1c2420] shrink-0"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <div className="relative flex-1 max-w-sm hidden sm:block">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a8975f]" />
        <input
          placeholder="Search tasks, guests, vendors..."
          className="w-full pl-9 pr-3 py-2 rounded-xl text-sm bg-[#f4efe0] dark:bg-[#1c2420] border border-transparent focus:border-gold outline-none"
        />
      </div>
      <div className="flex-1 sm:hidden" />

      <SideSwitch />
      <span className="hidden lg:inline text-xs text-[#8a8360] truncate max-w-[160px]">{userLabel}</span>
      <button className="relative p-2 rounded-xl hover:bg-[#f0e6d2]/60 dark:hover:bg-[#1c2420] shrink-0">
        <Bell size={17} />
        {urgentCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#c0392b]" />}
      </button>
      <button onClick={signOut} className="hidden md:inline-flex p-2 rounded-xl hover:bg-[#f0e6d2]/60 dark:hover:bg-[#1c2420] shrink-0" title="Sign out">
        <LogOut size={17} />
      </button>
    </header>
  );
}
