"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Phone, Trash2 } from "lucide-react";
import { Card, SectionTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import type { Vendor, Side } from "@/lib/types";
import { currency, SIDE_COLORS } from "@/lib/utils";
import { useSide, matchesSide } from "@/lib/side-context";
import { addVendor, updateVendor, deleteVendor } from "./actions";

export function VendorsClient({ initialVendors }: { initialVendors: Vendor[] }) {
  const router = useRouter();
  const [vendors, setVendors] = useState(initialVendors);
  const { side } = useSide();

  useEffect(() => setVendors(initialVendors), [initialVendors]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("vendors-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "vendors" }, () => router.refresh())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [router]);

  function localPatch(id: string, patch: Partial<Vendor>) {
    setVendors((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  }
  function patchNow(id: string, patch: Partial<Vendor>) {
    localPatch(id, patch);
    updateVendor(id, patch).catch(() => router.refresh());
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <SectionTitle sub="Full contact and payment record for every vendor">Vendors</SectionTitle>
        <button onClick={() => addVendor()} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald text-white text-sm font-medium">
          <Plus size={15} /> Add vendor
        </button>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vendors.filter((v) => matchesSide(v, side)).map((v) => (
          <Card key={v.id} className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <input defaultValue={v.name} onBlur={(e) => patchNow(v.id, { name: e.target.value })} className="font-display text-lg bg-transparent outline-none" />
              <button onClick={() => deleteVendor(v.id)} className="p-1 rounded text-[#c0392b] hover:bg-[#c0392b]/10"><Trash2 size={13} /></button>
            </div>
            <div className="flex items-center gap-2">
              <input defaultValue={v.category} onBlur={(e) => patchNow(v.id, { category: e.target.value })} className="text-xs bg-[#f4efe0] dark:bg-[#1c2420] rounded-lg px-2 py-1 outline-none flex-1" />
              <select value={v.side} onChange={(e) => patchNow(v.id, { side: e.target.value as Side })} className="text-xs bg-[#f4efe0] dark:bg-[#1c2420] rounded-lg px-1 py-1 outline-none" style={{ color: SIDE_COLORS[v.side] }}>
                <option value="Both">Both</option>
                <option value="Bride">Anushka</option>
                <option value="Groom">Rohan</option>
              </select>
              <input
                type="number" step="0.5" min="0" max="5" defaultValue={v.rating}
                onBlur={(e) => patchNow(v.id, { rating: Number(e.target.value) })}
                className="w-14 text-xs text-gold font-semibold bg-transparent outline-none text-right"
              />
            </div>
            <div className="flex items-center gap-2">
              <input defaultValue={v.phone} onBlur={(e) => patchNow(v.id, { phone: e.target.value })} className="text-xs bg-transparent outline-none flex-1" placeholder="Phone" />
              {v.phone && (
                <a href={`https://wa.me/${v.phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-[#4c7a3d]">
                  <Phone size={12} />
                </a>
              )}
            </div>
            <div className="flex justify-between text-xs text-[#8a8360] gap-2">
              <input type="number" defaultValue={v.advance_paid} onBlur={(e) => patchNow(v.id, { advance_paid: Number(e.target.value) })} className="bg-transparent outline-none w-full" title="Advance paid" />
              <input type="number" defaultValue={v.balance_due} onBlur={(e) => patchNow(v.id, { balance_due: Number(e.target.value) })} className="bg-transparent outline-none w-full text-right" title="Balance due" />
            </div>
          </Card>
        ))}
        {!vendors.length && <p className="text-sm text-[#8a8360]">No vendors yet — add your first one above.</p>}
      </div>
    </div>
  );
}
