import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { SideProvider } from "@/lib/side-context";
import { MobileNavProvider } from "@/lib/mobile-nav-context";
import { BottomNav } from "@/components/mobile-nav/bottom-nav";
import { MobileDrawer } from "@/components/mobile-nav/mobile-drawer";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  const { count: urgentCount } = await supabase
    .from("tasks")
    .select("id", { count: "exact", head: true })
    .lt("due_date", new Date().toISOString().slice(0, 10))
    .not("status", "in", "(Completed,Cancelled)");

  const coupleNames = process.env.NEXT_PUBLIC_COUPLE_NAMES || "Anushka & Rohan";
  const userLabel = `${profile?.full_name || user.email} · ${profile?.role || "family"}`;

  return (
    <div className="min-h-[100dvh] flex bg-ivory dark:bg-charcoal">
      <SideProvider>
        <MobileNavProvider>
          <Sidebar coupleNames={coupleNames} />
          <main className="flex-1 min-w-0 flex flex-col">
            <Topbar urgentCount={urgentCount || 0} userLabel={userLabel} />
            <div className="p-4 sm:p-5 md:p-8 flex-1 overflow-auto pb-24 md:pb-8 safe-left safe-right">
              {children}
            </div>
          </main>
          <BottomNav />
          <MobileDrawer coupleNames={coupleNames} />
        </MobileNavProvider>
      </SideProvider>
    </div>
  );
}
