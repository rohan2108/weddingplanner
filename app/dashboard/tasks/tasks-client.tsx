"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { Card, SectionTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Confetti } from "@/components/confetti";
import { createClient } from "@/lib/supabase/client";
import { themeFor } from "@/lib/types";
import type { EventRow, Task, TaskPriority, TaskStatus } from "@/lib/types";
import { PRIORITY_COLOR, STATUS_COLUMNS, URGENCY_COLORS, urgencyForTask, SIDE_COLORS } from "@/lib/utils";
import { useSide, matchesSide } from "@/lib/side-context";
import { addTask, updateTaskStatus, updateTaskDescription } from "./actions";

export function TasksClient({
  initialEvents, initialTasks, initialFilter,
}: { initialEvents: EventRow[]; initialTasks: Task[]; initialFilter: string }) {
  const router = useRouter();
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState(initialFilter);
  const [dragId, setDragId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { side } = useSide();
  const [form, setForm] = useState({
    name: "", eventId: initialEvents[0]?.id || "", assigneeName: "", priority: "Medium" as TaskPriority,
    dueDate: "", category: "", description: "", side: "Both",
  });

  useEffect(() => { setForm((f) => ({ ...f, side: side === "Both" ? "Both" : side })); }, [side]);

  useEffect(() => setTasks(initialTasks), [initialTasks]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("tasks-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, () => router.refresh())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [router]);

  const eventNameById = Object.fromEntries(initialEvents.map((e) => [e.id, e.name]));
  const filtered = tasks
    .filter((t) => filter === "All" || eventNameById[t.event_id || ""] === filter)
    .filter((t) => matchesSide(t, side));

  async function handleStatusChange(task: Task, status: TaskStatus) {
    const prevTasks = tasks;
    const optimistic = tasks.map((t) => (t.id === task.id ? { ...t, status, completion_pct: status === "Completed" ? 100 : t.completion_pct } : t));
    setTasks(optimistic);

    if (status === "Completed") {
      const siblings = optimistic.filter((t) => t.event_id === task.event_id);
      if (siblings.length && siblings.every((t) => t.status === "Completed")) {
        setConfettiTrigger((x) => x + 1);
      }
    }

    try {
      await updateTaskStatus(task.id, status);
      setError(null);
    } catch (e: any) {
      setTasks(prevTasks);
      setError(e.message);
    }
  }

  async function handleDescriptionSave(taskId: string, description: string) {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, description } : t)));
    try {
      await updateTaskDescription(taskId, description);
      setError(null);
    } catch (e: any) {
      setError(e.message);
      router.refresh();
    }
  }

  async function handleAdd() {
    if (!form.name.trim() || !form.eventId) return;
    try {
      await addTask(form);
      setForm({ name: "", eventId: initialEvents[0]?.id || "", assigneeName: "", priority: "Medium", dueDate: "", category: "", description: "" });
      setShowNew(false);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <div className="space-y-5">
      <Confetti trigger={confettiTrigger} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionTitle sub="Drag cards across columns to update status · click a card to add details">Task board</SectionTitle>
        <div className="flex items-center gap-2">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="field-input w-auto">
            <option value="All">All events</option>
            {initialEvents.map((e) => <option key={e.id} value={e.name}>{e.name}</option>)}
          </select>
          <button onClick={() => setShowNew((v) => !v)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald text-white text-sm font-medium hover:bg-emerald-light">
            <Plus size={15} /> New task
          </button>
        </div>
      </div>

      {error && (
        <Card className="p-3 border-l-4 flex items-center gap-2" border-l-red-600: "#c0392b" }}>
          <AlertTriangle size={16} className="text-[#c0392b] shrink-0" />
          <p className="text-sm text-[#c0392b]">{error}</p>
        </Card>
      )}

      {showNew && (
        <Card className="p-4 grid md:grid-cols-6 gap-2">
          <input placeholder="Task name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="field-input md:col-span-2" />
          <select value={form.eventId} onChange={(e) => setForm((f) => ({ ...f, eventId: e.target.value }))} className="field-input">
            {initialEvents.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
          <input placeholder="Assignee" value={form.assigneeName} onChange={(e) => setForm((f) => ({ ...f, assigneeName: e.target.value }))} className="field-input" />
          <select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as TaskPriority }))} className="field-input">
            {Object.keys(PRIORITY_COLOR).map((p) => <option key={p}>{p}</option>)}
          </select>
          <input type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} className="field-input" />
          <select value={form.side} onChange={(e) => setForm((f) => ({ ...f, side: e.target.value }))} className="field-input">
            <option value="Both">Both sides</option>
            <option value="Bride">Anushka's side</option>
            <option value="Groom">Rohan's side</option>
          </select>
          <textarea
            placeholder="Description (optional) — any details worth capturing..."
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={2}
            className="field-input md:col-span-6 resize-none"
          />
          <button onClick={handleAdd} className="md:col-span-6 px-4 py-2 rounded-xl bg-gold text-white text-sm font-medium">Add task</button>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {STATUS_COLUMNS.map((col) => {
          const colTasks = filtered.filter((t) => t.status === col);
          return (
            <div
              key={col}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragId) {
                  const task = tasks.find((t) => t.id === dragId);
                  if (task) handleStatusChange(task, col);
                }
                setDragId(null);
              }}
              className="bg-[#f4efe0]/60 dark:bg-[#161d18] rounded-2xl p-3 min-h-[200px]"
            >
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#6b7a6d] dark:text-[#9caa9d]">{col}</span>
                <span className="text-xs text-[#a8975f]">{colTasks.length}</span>
              </div>
              <div className="space-y-2">
                {colTasks.map((t) => {
                  const u = urgencyForTask(t.due_date, t.status);
                  const th = themeFor(eventNameById[t.event_id || ""] || "");
                  const isExpanded = expandedId === t.id;
                  return (
                    <div
                      key={t.id}
                      draggable
                      onDragStart={() => setDragId(t.id)}
                      className="p-3 rounded-xl bg-white dark:bg-[#1c2420] border border-[#e7ddc4] dark:border-[#2c362f] shadow-sm cursor-grab active:cursor-grabbing hover:border-gold/60 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1.5 gap-1">
                        <div className="flex items-center gap-1 flex-wrap">
                          <Badge color={th.chip}>{eventNameById[t.event_id || ""]}</Badge>
                          {t.side !== "Both" && <Badge color={SIDE_COLORS[t.side]}>{t.side === "Bride" ? "Anushka" : "Rohan"}</Badge>}
                        </div>
                        {u !== "none" && <span className="w-2 h-2 rounded-full shrink-0" style={{ background: URGENCY_COLORS[u] }} />}
                      </div>
                      <button onClick={() => setExpandedId(isExpanded ? null : t.id)} className="w-full text-left">
                        <p className="text-sm font-medium leading-snug flex items-start justify-between gap-1">
                          <span>{t.name}</span>
                          {isExpanded ? <ChevronUp size={14} className="shrink-0 mt-0.5 text-[#8a8360]" /> : <ChevronDown size={14} className="shrink-0 mt-0.5 text-[#8a8360]" />}
                        </p>
                        {!isExpanded && t.description && (
                          <p className="text-xs text-[#8a8360] mt-1 line-clamp-2">{t.description}</p>
                        )}
                      </button>

                      {isExpanded && (
                        <div className="mt-2">
                          <textarea
                            defaultValue={t.description}
                            onBlur={(e) => handleDescriptionSave(t.id, e.target.value)}
                            placeholder="Add a description..."
                            rows={3}
                            className="field-input w-full text-xs resize-none"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-2 text-xs text-[#8a8360]">
                        <span>{t.assignee_name || "Unassigned"}</span>
                        <span>{t.due_date}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <Badge color={PRIORITY_COLOR[t.priority]}>{t.priority}</Badge>
                        <select
                          value={t.status}
                          onChange={(e) => handleStatusChange(t, e.target.value as TaskStatus)}
                          className="text-xs bg-transparent outline-none text-[#6b7a6d] dark:text-[#9caa9d]"
                        >
                          {STATUS_COLUMNS.map((s) => <option key={s}>{s}</option>)}
                          <option>Cancelled</option>
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
