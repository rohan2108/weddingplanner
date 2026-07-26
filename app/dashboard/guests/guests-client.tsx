"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, MessageCircle, Trash2 } from "lucide-react";
import { Card, SectionTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import type { Guest } from "@/lib/types";
import { addGuest, updateGuest, deleteGuest } from "./actions";

const RSVP_COLOR: Record<string, string> = { Confirmed: "#4c7a3d", Pending: "#d9b021", Declined: "#c0392b" };

export function GuestsClient({ initialGuests }: { initialGuests: Guest[] }) {
  const router = useRouter();
  const [guests, setGuests] = useState(initialGuests);
  const [filter, setFilter] = useState("All");
  const [q, setQ] = useState("");

  useEffect(() => setGuests(initialGuests), [initialGuests]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("guests-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "guests" }, () => router.refresh())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [router]);

  const filtered = guests.filter((g) => (filter === "All" || g.type === filter) && g.name.toLowerCase().includes(q.toLowerCase()));

  function localPatch(id: string, patch: Partial<Guest>) {
    setGuests((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g)));
  }
  function patchNow(id: string, patch: Partial<Guest>) {
    localPatch(id, patch);
    updateGuest(id, patch as any).catch(() => router.refresh());
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SectionTitle sub={`${guests.length} guests · ${guests.filter((g) => g.rsvp === "Confirmed").length} confirmed`}>Guest list</SectionTitle>
        <div className="flex flex-wrap items-center gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search guests..." className="field-input flex-1 min-w-[140px] sm:w-auto" />
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="field-input w-auto">
            {["All", "Family", "Friend", "VIP"].map((f) => <option key={f}>{f}</option>)}
          </select>
          <button onClick={() => addGuest()} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald text-white text-sm font-medium">
            <Plus size={15} /> Add
          </button>
        </div>
      </div>

      {/* Mobile: stacked cards, no horizontal scroll */}
      <div className="md:hidden space-y-3">
        {filtered.map((g) => (
          <Card key={g.id} className="p-4 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <input
                defaultValue={g.name}
                onBlur={(e) => patchNow(g.id, { name: e.target.value })}
                className="bg-transparent outline-none font-medium text-base flex-1 min-w-0"
              />
              <Badge color={RSVP_COLOR[g.rsvp]}>{g.rsvp}</Badge>
              <button onClick={() => deleteGuest(g.id)} className="p-1.5 rounded text-[#c0392b] hover:bg-[#c0392b]/10 shrink-0">
                <Trash2 size={14} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <select value={g.side} onChange={(e) => patchNow(g.id, { side: e.target.value as Guest["side"] })} className="field-input py-1.5">
                <option>Bride</option><option>Groom</option>
              </select>
              <select value={g.type} onChange={(e) => patchNow(g.id, { type: e.target.value as Guest["type"] })} className="field-input py-1.5">
                <option>Family</option><option>Friend</option><option>VIP</option>
              </select>
              <select value={g.rsvp} onChange={(e) => patchNow(g.id, { rsvp: e.target.value as Guest["rsvp"] })} className="field-input py-1.5">
                <option>Pending</option><option>Confirmed</option><option>Declined</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                defaultValue={g.food_preference}
                onBlur={(e) => patchNow(g.id, { food_preference: e.target.value })}
                placeholder="Food preference"
                className="field-input flex-1 py-1.5 text-xs"
              />
              <input
                defaultValue={g.phone}
                onBlur={(e) => patchNow(g.id, { phone: e.target.value })}
                placeholder="Phone"
                className="field-input flex-1 py-1.5 text-xs"
              />
              {g.phone && (
                <a href={`https://wa.me/${g.phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-[#4c7a3d]/10 text-[#4c7a3d] shrink-0">
                  <MessageCircle size={14} />
                </a>
              )}
            </div>
          </Card>
        ))}
        {!filtered.length && <p className="text-sm text-[#8a8360]">No guests match this search/filter.</p>}
      </div>

      {/* Desktop / tablet: full table */}
      <Card className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-[#8a8360] border-b border-[#e7ddc4] dark:border-[#2c362f]">
              <th className="p-3">Name</th><th className="p-3">Side</th><th className="p-3">Type</th><th className="p-3">RSVP</th><th className="p-3">Food</th><th className="p-3">Contact</th><th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((g) => (
              <tr key={g.id} className="border-b border-[#e7ddc4]/60 dark:border-[#2c362f]/60">
                <td className="p-3"><input defaultValue={g.name} onBlur={(e) => patchNow(g.id, { name: e.target.value })} className="bg-transparent outline-none font-medium" /></td>
                <td className="p-3">
                  <select value={g.side} onChange={(e) => patchNow(g.id, { side: e.target.value as Guest["side"] })} className="bg-transparent text-xs outline-none">
                    <option>Bride</option><option>Groom</option>
                  </select>
                </td>
                <td className="p-3">
                  <select value={g.type} onChange={(e) => patchNow(g.id, { type: e.target.value as Guest["type"] })} className="bg-transparent text-xs outline-none">
                    <option>Family</option><option>Friend</option><option>VIP</option>
                  </select>
                </td>
                <td className="p-3">
                  <select value={g.rsvp} onChange={(e) => patchNow(g.id, { rsvp: e.target.value as Guest["rsvp"] })} className="bg-transparent text-xs outline-none">
                    <option>Pending</option><option>Confirmed</option><option>Declined</option>
                  </select>
                </td>
                <td className="p-3 text-xs">
                  <input defaultValue={g.food_preference} onBlur={(e) => patchNow(g.id, { food_preference: e.target.value })} className="bg-transparent outline-none w-16" />
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <input defaultValue={g.phone} onBlur={(e) => patchNow(g.id, { phone: e.target.value })} className="bg-transparent outline-none text-xs w-28" />
                    {g.phone && (
                      <a href={`https://wa.me/${g.phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer" className="text-[#4c7a3d]">
                        <MessageCircle size={13} />
                      </a>
                    )}
                  </div>
                </td>
                <td className="p-3">
                  <button onClick={() => deleteGuest(g.id)} className="p-1 rounded text-[#c0392b] hover:bg-[#c0392b]/10"><Trash2 size={13} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
