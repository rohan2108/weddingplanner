"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, AlertTriangle, Wallet, TrendingUp, Gem } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid,
} from "recharts";
import { Card, SectionTitle, StatCard } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import type { EventRow, BudgetItem, Side } from "@/lib/types";
import { currency, SIDE_COLORS } from "@/lib/utils";
import { useSide, matchesSide } from "@/lib/side-context";
import { updateBudgetItem, addBudgetItem, deleteBudgetItem } from "./actions";

const COLORS = ["#3f6b3a", "#e8ab1f", "#0b4a3a", "#8a6d3a", "#c9a227", "#4c7a3d"];

const SIDE_LABELS: Record<Side, string> = {
  Bride: "Anushka's Budget",
  Groom: "Rohan's Budget",
  Both: "Combined Budget (Anushka + Rohan)",
};

// Hoisted to module scope (NOT defined inside BudgetClient) — this is what
// keeps its identity stable across re-renders so React doesn't remount the
// inputs (and lose your cursor) every time you type a character.
function SideBudgetSection({
  side, initialEvents, budget, newCategory, setNewCategory, onAdd, onCommit, onDelete,
}: {
  side: Side;
  initialEvents: EventRow[];
  budget: BudgetItem[];
  newCategory: Record<string, string>;
  setNewCategory: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onAdd: (eventId: string, side: Side) => void;
  onCommit: (id: string, patch: Partial<BudgetItem>) => void;
  onDelete: (id: string) => void;
}) {
  const accent = SIDE_COLORS[side];
  const items = side === "Both" ? budget : budget.filter((b) => matchesSide(b, side));
  const planned = items.reduce((s, b) => s + Number(b.planned), 0);
  const actual = items.reduce((s, b) => s + Number(b.actual), 0);

  return (
    <Card className="overflow-hidden">
      <div className="px-5 py-4" style={{ background: `linear-gradient(120deg, ${accent}, ${accent}cc)` }}>
        <p className="font-display text-white text-xl">{SIDE_LABELS[side]}</p>
        <div className="flex flex-wrap items-center gap-4 mt-2 text-white/90 text-xs">
          <span>Planned: <strong className="text-white">{currency(planned)}</strong></span>
          <span>Spent: <strong className="text-white">{currency(actual)}</strong></span>
          <span>Remaining: <strong className="text-white">{currency(planned - actual)}</strong></span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {initialEvents.map((ev) => {
          const evItems = items.filter((b) => b.event_id === ev.id);
          const key = `${ev.id}:${side}`;
          return (
            <div key={ev.id}>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#8a8360] mb-1.5">{ev.name}</p>
              {evItems.length > 0 && (
                <div className="space-y-1.5 mb-2">
                  {evItems.map((b) => (
                    <div key={b.id} className="flex flex-wrap items-center gap-2 p-2 rounded-xl hover:bg-[#f4efe0]/50 dark:hover:bg-[#1c2420]/50">
                      <span className="text-sm font-medium min-w-[90px] flex-1">{b.category}</span>
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-[#8a8360]">Plan</span>
                        <input type="number" defaultValue={b.planned} onBlur={(e) => onCommit(b.id, { planned: Number(e.target.value) })} className="field-input w-20 py-1" />
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-[#8a8360]">Spent</span>
                        <input type="number" defaultValue={b.actual} onBlur={(e) => onCommit(b.id, { actual: Number(e.target.value) })} className="field-input w-20 py-1" />
                      </div>
                      <button onClick={() => onDelete(b.id)} className="p-1.5 rounded-lg text-[#c0392b] hover:bg-[#c0392b]/10">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2">
                <input
                  value={newCategory[key] || ""}
                  onChange={(e) => setNewCategory((prev) => ({ ...prev, [key]: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && onAdd(ev.id, side)}
                  placeholder={`+ Add category for ${ev.name}...`}
                  className="field-input flex-1 text-xs py-1.5"
                />
                <button onClick={() => onAdd(ev.id, side)} className="p-1.5 rounded-lg" style={{ background: accent + "22", color: accent }}>
                  <Plus size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export function BudgetClient({ initialEvents, initialBudget }: { initialEvents: EventRow[]; initialBudget: BudgetItem[] }) {
  const router = useRouter();
  const { side } = useSide();
  const [budget, setBudget] = useState(initialBudget);
  const [newCategory, setNewCategory] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setBudget(initialBudget), [initialBudget]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("budget-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "budget_items" }, () => router.refresh())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [router]);

  // The stat cards & charts reflect whichever tab is currently selected —
  // Anushka's own numbers, Rohan's own numbers, or everything combined.
  const visibleItems = side === "Both" ? budget : budget.filter((b) => matchesSide(b, side));

  const byEvent = initialEvents.map((ev) => {
    const items = visibleItems.filter((b) => b.event_id === ev.id);
    return {
      name: ev.name,
      planned: items.reduce((s, i) => s + Number(i.planned), 0),
      actual: items.reduce((s, i) => s + Number(i.actual), 0),
    };
  });
  const totalPlanned = visibleItems.reduce((s, b) => s + Number(b.planned), 0);
  const totalActual = visibleItems.reduce((s, b) => s + Number(b.actual), 0);
  const pieData = byEvent.filter((e) => e.actual > 0).map((e) => ({ name: e.name, value: e.actual }));

  function localPatch(id: string, patch: Partial<BudgetItem>) {
    setBudget((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }

  async function commit(id: string, patch: Partial<BudgetItem>) {
    localPatch(id, patch);
    try {
      await updateBudgetItem(id, patch as any);
      setError(null);
    } catch (e: any) {
      setError(e.message || "Something went wrong saving that change.");
      router.refresh();
    }
  }

  async function handleAdd(eventId: string, addSide: Side) {
    const key = `${eventId}:${addSide}`;
    const cat = (newCategory[key] || "").trim();
    if (!cat) return;
    try {
      await addBudgetItem(eventId, cat, addSide);
      setNewCategory((prev) => ({ ...prev, [key]: "" }));
      setError(null);
    } catch (e: any) {
      setError(e.message || "Couldn't add that category.");
    }
  }

  async function handleDelete(id: string) {
    setBudget((prev) => prev.filter((b) => b.id !== id));
    try {
      await deleteBudgetItem(id);
    } catch (e: any) {
      setError(e.message || "Couldn't delete that line item.");
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      <SectionTitle sub="Switch tabs above (Anushka / Both / Rohan) to see each budget separately">Budget</SectionTitle>

      {error && (
        <Card className="p-3 border-l-4 flex items-center gap-2" border-l-red-600: "#c0392b" }}>
          <AlertTriangle size={16} className="text-[#c0392b] shrink-0" />
          <p className="text-sm text-[#c0392b]">{error}</p>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard icon={Wallet} label="Planned" value={currency(totalPlanned)} accent="#0b4a3a" />
        <StatCard icon={TrendingUp} label="Spent" value={currency(totalActual)} accent="#c9a227" />
        <StatCard icon={Gem} label="Remaining" value={currency(totalPlanned - totalActual)} accent="#4c7a3d" />
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <Card className="p-5">
          <SectionTitle>Planned vs actual by event</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byEvent}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7ddc4" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: number) => currency(v)} />
              <Bar dataKey="planned" fill="#c9a227" radius={[6, 6, 0, 0]} />
              <Bar dataKey="actual" fill="#0b4a3a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-5">
          <SectionTitle>Spend distribution</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => currency(v)} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <SideBudgetSection
        side={side}
        initialEvents={initialEvents}
        budget={budget}
        newCategory={newCategory}
        setNewCategory={setNewCategory}
        onAdd={handleAdd}
        onCommit={commit}
        onDelete={handleDelete}
      />
    </div>
  );
}
