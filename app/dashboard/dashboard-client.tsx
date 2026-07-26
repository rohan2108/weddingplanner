"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ClipboardCheck, AlertTriangle, Wallet, ShoppingBag, Clock,
} from "lucide-react";
import { Card, SectionTitle, StatCard } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CountdownRing } from "@/components/countdown-ring";
import { createClient } from "@/lib/supabase/client";
import {
  WEDDING_DATE, PLANNING_START, daysBetween, currency,
  urgencyForTask, bookingUrgency, bookingProgressPct, URGENCY_COLORS, URGENCY_LABEL,
} from "@/lib/utils";
import { themeFor } from "@/lib/types";
import { useSide, matchesSide } from "@/lib/side-context";
import type { EventRow, Task, Booking, BudgetItem, ShoppingItem } from "@/lib/types";

export function DashboardClient({
  initialEvents, initialTasks, initialBookings, initialBudget, initialShopping,
}: {
  initialEvents: EventRow[];
  initialTasks: Task[];
  initialBookings: Booking[];
  initialBudget: BudgetItem[];
  initialShopping: ShoppingItem[];
}) {
  const router = useRouter();
  const { side } = useSide();
  const [now, setNow] = useState(new Date());

  const tasksBySide = initialTasks.filter((t) => matchesSide(t, side));
  const bookingsBySide = initialBookings.filter((b) => matchesSide(b, side));
  const budgetBySide = initialBudget.filter((b) => matchesSide(b, side));
  const shoppingBySide = initialShopping.filter((s) => matchesSide(s, side));

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  // Realtime: any change to the tables this page cares about refreshes server data.
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("dashboard-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, () => router.refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => router.refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "events" }, () => router.refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "budget_items" }, () => router.refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "shopping_items" }, () => router.refresh())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [router]);

  const daysLeft = Math.max(0, daysBetween(now, WEDDING_DATE));
  const totalPlanningDays = daysBetween(PLANNING_START, WEDDING_DATE);
  const elapsedDays = daysBetween(PLANNING_START, now);
  const pctElapsed = Math.min(100, Math.max(0, (elapsedDays / totalPlanningDays) * 100));

  const overallPct = useMemo(() => {
    if (!tasksBySide.length) return 0;
    return Math.round(tasksBySide.reduce((s, t) => s + t.completion_pct, 0) / tasksBySide.length);
  }, [tasksBySide]);

  function eventPct(eventId: string) {
    const et = tasksBySide.filter((t) => t.event_id === eventId);
    if (!et.length) return 0;
    return Math.round(et.reduce((s, t) => s + t.completion_pct, 0) / et.length);
  }

  const urgentTasks = tasksBySide
    .filter((t) => ["red", "orange"].includes(urgencyForTask(t.due_date, t.status)))
    .sort((a, b) => (a.due_date || "").localeCompare(b.due_date || ""));

  const todayStr = now.toISOString().slice(0, 10);
  const todaysTasks = tasksBySide.filter((t) => t.due_date === todayStr);

  const overdueBookings = bookingsBySide.filter((b) => bookingUrgency(b) === "red");
  const confirmedBookings = bookingsBySide.filter((b) => ["Booked", "Confirmed"].includes(b.status)).length;
  const overallBookingPct = bookingsBySide.length
    ? Math.round(bookingsBySide.reduce((s, b) => s + bookingProgressPct(b), 0) / bookingsBySide.length)
    : 0;
  const upcomingTrialsFittings = bookingsBySide.filter((b) => {
    const dates = [b.trial_scheduled && b.trial_date, b.fitting_needed && b.fitting_dates]
      .filter(Boolean).join(",").split(",").map((s) => s.trim()).filter(Boolean);
    return dates.some((d) => { const dd = daysBetween(now, new Date(d)); return dd >= 0 && dd <= 30; });
  });

  const totalBudgetPlanned = budgetBySide.reduce((s, b) => s + Number(b.planned), 0);
  const totalBudgetActual = budgetBySide.reduce((s, b) => s + Number(b.actual), 0);
  const purchasedPct = shoppingBySide.length
    ? Math.round((shoppingBySide.filter((s) => s.purchased).length / shoppingBySide.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 bg-gradient-to-br from-emerald to-emerald-light rounded-3xl p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-56 h-56 rounded-full bg-gold/20 blur-2xl" />
        <CountdownRing pctElapsed={pctElapsed} daysLeft={daysLeft} />
        <div className="relative">
          <p className="uppercase text-xs tracking-[0.2em] text-[#f4e9c8]">Welcome back</p>
          <h1 className="font-display text-3xl md:text-4xl mt-1">Anushka & Rohan's Big Day</h1>
          <p className="text-sm text-[#dce8de] mt-2 max-w-md">
            {Math.round(pctElapsed)}% of your planning time has elapsed — {overallPct}% of tasks complete overall.
          </p>
          <div className="mt-4 w-72 max-w-full h-2 rounded-full bg-white/20 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-gold to-gold-light transition-all duration-700" style={{ width: overallPct + "%" }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={ClipboardCheck} label="Bookings confirmed" value={`${confirmedBookings}/${bookingsBySide.length}`} accent="#0b4a3a" />
        <StatCard icon={AlertTriangle} label="Overdue bookings" value={overdueBookings.length} accent="#c0392b" />
        <StatCard icon={Wallet} label="Budget spent" value={`${Math.round((totalBudgetActual / totalBudgetPlanned) * 100) || 0}%`} accent="#c9a227" />
        <StatCard icon={ShoppingBag} label="Shopping purchased" value={`${purchasedPct}%`} accent="#7c9a4b" />
      </div>

      {overdueBookings.length > 0 && (
        <Card className="p-4 border-l-4 flex items-center justify-between gap-3" style={{ borderLeftColor: "#c0392b" } as any}>
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-[#c0392b] mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-[#c0392b]">
                {overdueBookings.length} booking{overdueBookings.length > 1 ? "s" : ""} past their ideal booking-by date
              </p>
              <p className="text-xs text-[#6b7a6d] dark:text-[#9caa9d] mt-0.5">{overdueBookings.map((b) => b.category).join(" · ")}</p>
            </div>
          </div>
          <a href="/dashboard/bookings" className="shrink-0 px-3 py-1.5 rounded-lg bg-[#c0392b] text-white text-xs font-medium whitespace-nowrap">Fix now</a>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-5">
        <Card className="p-5 md:col-span-2">
          <div className="flex items-center justify-between mb-1">
            <SectionTitle sub="Weighted by Not Booked → Enquired → Negotiating → Booked → Confirmed">Booking progress</SectionTitle>
            <span className="font-display text-2xl text-emerald dark:text-[#e9dfc0]">{overallBookingPct}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#e7ddc4] dark:bg-[#2c362f] overflow-hidden mb-4">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: overallBookingPct + "%", background: "linear-gradient(90deg,#0b4a3a,#c9a227)" }} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {bookingsBySide.slice(0, 9).map((b) => {
              const p = bookingProgressPct(b);
              const u = bookingUrgency(b);
              return (
                <div key={b.id} className="p-2 rounded-lg bg-[#f4efe0]/60 dark:bg-[#1c2420]">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="truncate font-medium">{b.category}</span>
                    {u !== "none" && <span className="w-1.5 h-1.5 rounded-full shrink-0 ml-1" style={{ background: URGENCY_COLORS[u] }} />}
                  </div>
                  <div className="w-full h-1 rounded-full bg-[#e7ddc4] dark:bg-[#2c362f] overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: p + "%", background: "#c9a227" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
        <Card className="p-5">
          <SectionTitle sub="Next 30 days">Trials & fittings</SectionTitle>
          <div className="space-y-2">
            {upcomingTrialsFittings.length ? upcomingTrialsFittings.map((b) => (
              <div key={b.id} className="flex items-center gap-2 p-2 rounded-lg bg-[#f4efe0] dark:bg-[#1c2420]">
                <Clock size={14} className="text-gold shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{b.category}</p>
                  <p className="text-[11px] text-[#8a8360]">{b.trial_date || b.fitting_dates}</p>
                </div>
              </div>
            )) : <p className="text-sm text-[#8a8360]">Nothing scheduled in the next month.</p>}
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        <Card className="p-5 md:col-span-2">
          <SectionTitle sub="Sorted by urgency — red is overdue">Urgent tasks</SectionTitle>
          <div className="space-y-2">
            {urgentTasks.slice(0, 6).map((t) => {
              const u = urgencyForTask(t.due_date, t.status);
              return (
                <div key={t.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#f4efe0] dark:hover:bg-[#1c2420]">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: URGENCY_COLORS[u] }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{t.name}</p>
                    <p className="text-xs text-[#8a8360]">due {t.due_date} · {t.assignee_name || "Unassigned"}</p>
                  </div>
                  <Badge color={URGENCY_COLORS[u]}>{URGENCY_LABEL[u]}</Badge>
                </div>
              );
            })}
            {!urgentTasks.length && <p className="text-sm text-[#8a8360]">Nothing urgent right now — enjoy the calm 🌿</p>}
          </div>
        </Card>
        <Card className="p-5">
          <SectionTitle>Today</SectionTitle>
          <div className="space-y-2">
            {todaysTasks.length ? todaysTasks.map((t) => (
              <div key={t.id} className="text-sm p-2 rounded-lg bg-[#f4efe0] dark:bg-[#1c2420]">{t.name}</div>
            )) : <p className="text-sm text-[#8a8360]">No tasks due today.</p>}
          </div>
        </Card>
      </div>

      <div>
        <SectionTitle sub="Open Events for the full workspace of each function">Events at a glance</SectionTitle>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {initialEvents.map((ev) => {
            const th = themeFor(ev.name);
            const pct = eventPct(ev.id);
            return (
              <Card key={ev.id} className="overflow-hidden">
                <div className={`h-16 bg-gradient-to-r ${th.grad} flex items-center px-4`}>
                  <span className="text-2xl mr-2">{th.emoji}</span>
                  <span className="font-display text-white text-lg">{ev.name}</span>
                </div>
                <div className="p-4">
                  <div className="flex justify-between text-xs text-[#8a8360] mb-1">
                    <span>{ev.event_date || "Date TBD"}</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#e7ddc4] dark:bg-[#2c362f] overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: pct + "%", background: "linear-gradient(90deg,#0b4a3a,#c9a227)" }} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
