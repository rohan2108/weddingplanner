"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, X, Trash2, ChevronRight } from "lucide-react";
import { Card, SectionTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { themeFor } from "@/lib/types";
import type { EventRow, Task } from "@/lib/types";
import { addEvent, archiveEvent } from "./actions";

export function EventsClient({ initialEvents, initialTasks }: { initialEvents: EventRow[]; initialTasks: Task[] }) {
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("events-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "events" }, () => router.refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, () => router.refresh())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [router]);

  function eventPct(eventId: string) {
    const et = initialTasks.filter((t) => t.event_id === eventId);
    if (!et.length) return 0;
    return Math.round(et.reduce((s, t) => s + t.completion_pct, 0) / et.length);
  }

  async function handleAdd() {
    if (!name.trim()) return;
    setPending(true);
    try {
      await addEvent(name.trim(), date || null);
      setName(""); setDate(""); setShowAdd(false);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionTitle sub="Add, remove, and open any wedding function">Events</SectionTitle>
        <button onClick={() => setShowAdd((v) => !v)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald text-white text-sm font-medium hover:bg-emerald-light">
          <Plus size={15} /> Add event
        </button>
      </div>

      {showAdd && (
        <Card className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Engagement, Sangeet..." className="field-input flex-1" />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="field-input sm:w-44" />
          <button disabled={pending} onClick={handleAdd} className="px-4 py-2 rounded-xl bg-gold text-white text-sm font-medium disabled:opacity-50">
            {pending ? "Creating..." : "Create"}
          </button>
          <button onClick={() => setShowAdd(false)} className="p-2 text-[#8a8360]"><X size={16} /></button>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {initialEvents.map((ev) => {
          const th = themeFor(ev.name);
          const pct = eventPct(ev.id);
          const evTasks = initialTasks.filter((t) => t.event_id === ev.id);
          return (
            <Card key={ev.id} className="overflow-hidden group">
              <div className={`h-20 bg-gradient-to-r ${th.grad} flex items-center justify-between px-4`}>
                <div className="flex items-center gap-2">
                  <span className="text-3xl">{th.emoji}</span>
                  <div>
                    <div className="font-display text-white text-xl">{ev.name}</div>
                    <div className="text-white/80 text-xs">{ev.event_date || "Date TBD"}</div>
                  </div>
                </div>
                <button
                  onClick={() => archiveEvent(ev.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-black/20 hover:bg-black/40 text-white"
                  title="Archive event"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-[#8a8360] mb-1">
                    <span>{evTasks.filter((t) => t.status === "Completed").length}/{evTasks.length} tasks done</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#e7ddc4] dark:bg-[#2c362f] overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: pct + "%", background: "linear-gradient(90deg,#0b4a3a,#c9a227)" }} />
                  </div>
                </div>
                <Link
                  href={`/dashboard/tasks?event=${encodeURIComponent(ev.name)}`}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#f4efe0] dark:bg-[#1c2420] text-sm font-medium hover:bg-[#e7ddc4] dark:hover:bg-[#2c362f]"
                >
                  Open task board <ChevronRight size={15} />
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
