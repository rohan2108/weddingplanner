"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Card, SectionTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { themeFor } from "@/lib/types";
import type { EventRow, ShoppingItem } from "@/lib/types";
import { currency, SIDE_COLORS } from "@/lib/utils";
import { useSide, matchesSide } from "@/lib/side-context";
import { addShoppingItem, updateShoppingItem, deleteShoppingItem } from "./actions";

export function ShoppingClient({ initialEvents, initialShopping }: { initialEvents: EventRow[]; initialShopping: ShoppingItem[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initialShopping);
  const [error, setError] = useState<string | null>(null);
  const [quickAdd, setQuickAdd] = useState<Record<string, string>>({});
  const { side } = useSide();

  useEffect(() => setItems(initialShopping), [initialShopping]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("shopping-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "shopping_items" }, () => router.refresh())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [router]);

  function localPatch(id: string, patch: Partial<ShoppingItem>) {
    setItems((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }
  async function commit(id: string, patch: Partial<ShoppingItem>) {
    localPatch(id, patch);
    try {
      await updateShoppingItem(id, patch as any);
      setError(null);
    } catch (e: any) {
      setError(e.message);
      router.refresh();
    }
  }
  async function handleQuickAdd(eventId: string) {
    const name = (quickAdd[eventId] || "").trim();
    if (!name) return;
    try {
      await addShoppingItem(eventId, name, side);
      setQuickAdd((prev) => ({ ...prev, [eventId]: "" }));
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
  }
  async function handleDelete(id: string) {
    setItems((prev) => prev.filter((s) => s.id !== id));
    try {
      await deleteShoppingItem(id);
    } catch (e: any) {
      setError(e.message);
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      <SectionTitle sub="Type an item name and hit Enter — organized by wedding function">Shopping list</SectionTitle>

      {error && (
        <Card className="p-3 border-l-4 flex items-center gap-2" style={{ borderLeftColor: "#c0392b" }}>
          <AlertTriangle size={16} className="text-[#c0392b] shrink-0" />
          <p className="text-sm text-[#c0392b]">{error}</p>
        </Card>
      )}

      <div className="space-y-5">
        {initialEvents.map((ev) => {
          const th = themeFor(ev.name);
          const evItems = items.filter((s) => s.event_id === ev.id).filter((s) => matchesSide(s, side));
          const purchasedCount = evItems.filter((s) => s.purchased).length;

          return (
            <Card key={ev.id} className="overflow-hidden">
              <div className={`px-5 py-3 bg-gradient-to-r ${th.grad} flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{th.emoji}</span>
                  <span className="font-display text-white text-lg">{ev.name}</span>
                </div>
                <span className="text-white text-xs">{purchasedCount}/{evItems.length} done</span>
              </div>

              <div className="p-2">
                {evItems.length > 0 && (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[11px] uppercase tracking-wide text-[#8a8360]">
                        <th className="p-2 w-8"></th>
                        <th className="p-2">Item</th>
                        <th className="p-2 w-20 text-center">Qty</th>
                        <th className="p-2 w-24 text-center">Remaining</th>
                        <th className="p-2 w-28 text-right">Price</th>
                        <th className="p-2 w-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {evItems.map((s) => (
                        <tr key={s.id} className="border-t border-[#e7ddc4]/60 dark:border-[#2c362f]/60 hover:bg-[#f4efe0]/50 dark:hover:bg-[#1c2420]/50">
                          <td className="p-2">
                            <input
                              type="checkbox"
                              checked={s.purchased}
                              onChange={(e) => commit(s.id, { purchased: e.target.checked, remaining_qty: e.target.checked ? 0 : s.remaining_qty })}
                              className="w-4 h-4 accent-[#4c7a3d]"
                            />
                          </td>
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              <input
                                defaultValue={s.name}
                                onBlur={(e) => commit(s.id, { name: e.target.value })}
                                className={`bg-transparent outline-none w-full font-medium ${s.purchased ? "line-through text-[#a8975f]" : ""}`}
                              />
                              {s.side !== "Both" && <Badge color={SIDE_COLORS[s.side]}>{s.side === "Bride" ? "A" : "R"}</Badge>}
                            </div>
                          </td>
                          <td className="p-2">
                            <input
                              type="number" defaultValue={s.qty}
                              onBlur={(e) => commit(s.id, { qty: Number(e.target.value) })}
                              className="w-full text-center bg-transparent outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number" defaultValue={s.remaining_qty}
                              onBlur={(e) => commit(s.id, { remaining_qty: Number(e.target.value) })}
                              className="w-full text-center bg-transparent outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number" defaultValue={s.actual}
                              onBlur={(e) => commit(s.id, { actual: Number(e.target.value) })}
                              className="w-full text-right bg-transparent outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <button onClick={() => handleDelete(s.id)} className="p-1 rounded text-[#c0392b] hover:bg-[#c0392b]/10">
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {!evItems.length && <p className="text-sm text-[#8a8360] p-2">Nothing added yet for {ev.name}.</p>}

                <div className="p-2 pt-2 mt-1 border-t border-[#e7ddc4] dark:border-[#2c362f]">
                  <input
                    value={quickAdd[ev.id] || ""}
                    onChange={(e) => setQuickAdd((prev) => ({ ...prev, [ev.id]: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && handleQuickAdd(ev.id)}
                    placeholder={`+ Add an item for ${ev.name}, then hit Enter...`}
                    className="field-input w-full"
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
