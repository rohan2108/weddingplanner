"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, X, ClipboardCheck, CheckCircle2, Circle, AlertTriangle, Clock,
  ChevronRight, Trash2, MessageCircle, Filter,
} from "lucide-react";
import { Card, SectionTitle, StatCard } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { themeFor } from "@/lib/types";
import type { EventRow, Booking, BookingStatus } from "@/lib/types";
import { currency, bookingUrgency, bookingProgressPct, URGENCY_COLORS, URGENCY_LABEL, SIDE_COLORS } from "@/lib/utils";
import { useSide, matchesSide } from "@/lib/side-context";
import { addBooking, removeBooking, updateBooking } from "./actions";

const STATUS_OPTIONS: BookingStatus[] = ["Not Booked", "Enquired", "Negotiating", "Booked", "Confirmed", "Cancelled"];

export function BookingsClient({ initialEvents, initialBookings }: { initialEvents: EventRow[]; initialBookings: Booking[] }) {
  const router = useRouter();
  const [bookings, setBookings] = useState(initialBookings);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [customName, setCustomName] = useState("");
  const { side } = useSide();

  useEffect(() => setBookings(initialBookings), [initialBookings]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("bookings-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => router.refresh())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [router]);

  const eventNameById = Object.fromEntries(initialEvents.map((e) => [e.id, e.name]));
  const confirmed = bookings.filter((b) => ["Booked", "Confirmed"].includes(b.status)).length;
  const pending = bookings.filter((b) => !["Booked", "Confirmed", "Cancelled"].includes(b.status)).length;
  const overdue = bookings.filter((b) => bookingUrgency(b) === "red");
  const trialsFittings = bookings.filter((b) => b.trial_scheduled || b.fitting_dates);
  const overallPct = bookings.length ? Math.round(bookings.reduce((s, b) => s + bookingProgressPct(b), 0) / bookings.length) : 0;
  const visible = bookings.filter((b) => statusFilter === "All" || b.status === statusFilter).filter((b) => matchesSide(b, side));

  function localPatch(id: string, patch: Partial<Booking>) {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }
  function commit(id: string, patch: Partial<Booking>) {
    updateBooking(id, patch as any).catch(() => router.refresh());
  }
  function patchNow(id: string, patch: Partial<Booking>) {
    localPatch(id, patch);
    commit(id, patch);
  }

  async function handleAddBooking() {
    if (!customName.trim()) return;
    await addBooking(customName.trim(), initialEvents[0]?.id || "", side);
    setCustomName("");
    setShowAdd(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionTitle sub="Every vendor category tracked against its ideal booking-by date, separate from general vendor contacts">Vendor booking tracker</SectionTitle>
        <button onClick={() => setShowAdd((v) => !v)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald text-white text-sm font-medium hover:bg-emerald-light h-fit">
          <Plus size={15} /> Add booking
        </button>
      </div>

      {showAdd && (
        <Card className="p-4 flex items-center gap-3">
          <input
            autoFocus value={customName} onChange={(e) => setCustomName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddBooking()}
            placeholder="Category name — e.g. Baraat Horses, Pandit, Others..."
            className="field-input flex-1"
          />
          <button onClick={handleAddBooking} className="px-4 py-2 rounded-xl bg-gold text-white text-sm font-medium">Create</button>
          <button onClick={() => setShowAdd(false)} className="p-2 text-[#8a8360]"><X size={16} /></button>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard icon={ClipboardCheck} label="Total bookings needed" value={bookings.length} accent="#0b4a3a" />
        <StatCard icon={CheckCircle2} label="Confirmed / booked" value={confirmed} accent="#4c7a3d" />
        <StatCard icon={Circle} label="Pending" value={pending} accent="#d9b021" />
        <StatCard icon={AlertTriangle} label="Overdue, unbooked" value={overdue.length} accent="#c0392b" />
        <StatCard icon={Clock} label="Trials & fittings" value={trialsFittings.length} accent="#c9a227" />
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="font-medium">Overall booking progress</span>
          <span className="font-display text-xl text-emerald dark:text-[#e9dfc0]">{overallPct}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-[#e7ddc4] dark:bg-[#2c362f] overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: overallPct + "%", background: "linear-gradient(90deg,#0b4a3a,#c9a227)" }} />
        </div>
      </Card>

      {overdue.length > 0 && (
        <Card className="p-4 border-l-4" style={{ borderLeftColor: "#c0392b" } as any}>
          <p className="text-sm font-semibold text-[#c0392b] flex items-center gap-2 mb-1"><AlertTriangle size={15} /> Needs attention now</p>
          <p className="text-sm text-[#6b7a6d] dark:text-[#9caa9d]">{overdue.map((b) => b.category).join(", ")} — past the ideal booking window and still not booked.</p>
        </Card>
      )}

      <div className="flex items-center gap-2">
        <Filter size={14} className="text-[#a8975f]" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="field-input w-auto text-xs py-1.5">
          {["All", ...STATUS_OPTIONS].map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="space-y-3">
        {visible.map((b) => {
          const u = bookingUrgency(b);
          const isOpen = expanded === b.id;
          return (
            <Card key={b.id} className="overflow-hidden">
              <button onClick={() => setExpanded(isOpen ? null : b.id)} className="w-full flex flex-wrap items-center gap-3 p-4 text-left hover:bg-[#f4efe0]/40 dark:hover:bg-[#1c2420]/40">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: u === "none" ? "#4c7a3d" : URGENCY_COLORS[u] }} />
                <div className="min-w-[140px]">
                  <p className="text-sm font-semibold">{b.category}</p>
                  <p className="text-xs text-[#8a8360]">{b.vendor_name || "No vendor yet"}</p>
                </div>
                <Badge color={themeFor(eventNameById[b.event_id || ""] || "").chip}>{eventNameById[b.event_id || ""] || "—"}</Badge>
                <Badge color={u === "none" ? "#4c7a3d" : URGENCY_COLORS[u]}>{u === "none" ? b.status : URGENCY_LABEL[u]}</Badge>
                {b.side !== "Both" && <Badge color={SIDE_COLORS[b.side]}>{b.side === "Bride" ? "Anushka" : "Rohan"}</Badge>}
                {b.contract_signed && <Badge color="#4c7a3d">Contract signed</Badge>}
                <div className="ml-auto flex items-center gap-4 text-xs text-[#8a8360]">
                  <span>Adv {currency(b.advance_paid)}</span>
                  <span>Bal {currency(b.balance_due)}</span>
                  <ChevronRight size={16} className={`transition-transform ${isOpen ? "rotate-90" : ""}`} />
                </div>
              </button>

              {isOpen && (
                <div className="p-4 border-t border-[#e7ddc4] dark:border-[#2c362f] grid md:grid-cols-3 gap-3 bg-[#faf7ee] dark:bg-[#161d18]">
                  <Field label="Vendor name">
                    <input defaultValue={b.vendor_name} onBlur={(e) => commit(b.id, { vendor_name: e.target.value })} className="field-input" />
                  </Field>
                  <Field label="Wedding function">
                    <select value={b.event_id || ""} onChange={(e) => patchNow(b.id, { event_id: e.target.value })} className="field-input">
                      {initialEvents.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                  </Field>
                  <Field label="Booking status">
                    <select value={b.status} onChange={(e) => patchNow(b.id, { status: e.target.value as BookingStatus })} className="field-input">
                      {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </Field>
                  <Field label="Side">
                    <select value={b.side} onChange={(e) => patchNow(b.id, { side: e.target.value as any })} className="field-input">
                      <option value="Both">Both sides</option>
                      <option value="Bride">Anushka's side</option>
                      <option value="Groom">Rohan's side</option>
                    </select>
                  </Field>
                  <Field label="Booking date">
                    <input type="date" value={b.booking_date || ""} onChange={(e) => patchNow(b.id, { booking_date: e.target.value })} className="field-input" />
                  </Field>
                  <Field label="Contract signed">
                    <button onClick={() => patchNow(b.id, { contract_signed: !b.contract_signed })} className="field-input flex items-center gap-2 text-left">
                      {b.contract_signed ? <CheckCircle2 size={16} className="text-[#4c7a3d]" /> : <Circle size={16} className="text-[#a8975f]" />}
                      {b.contract_signed ? "Yes" : "No"}
                    </button>
                  </Field>
                  <Field label="Final payment due">
                    <input type="date" value={b.final_payment_due || ""} onChange={(e) => patchNow(b.id, { final_payment_due: e.target.value })} className="field-input" />
                  </Field>
                  <Field label="Advance paid">
                    <input type="number" defaultValue={b.advance_paid} onBlur={(e) => commit(b.id, { advance_paid: Number(e.target.value) })} className="field-input" />
                  </Field>
                  <Field label="Balance due">
                    <input type="number" defaultValue={b.balance_due} onBlur={(e) => commit(b.id, { balance_due: Number(e.target.value) })} className="field-input" />
                  </Field>
                  <Field label="Contact person">
                    <input defaultValue={b.contact_person} onBlur={(e) => commit(b.id, { contact_person: e.target.value })} className="field-input" />
                  </Field>
                  <Field label="Phone">
                    <div className="flex items-center gap-2">
                      <input defaultValue={b.phone} onBlur={(e) => commit(b.id, { phone: e.target.value })} className="field-input flex-1" />
                      {b.phone && (
                        <a href={`https://wa.me/${b.phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-[#4c7a3d]/10 text-[#4c7a3d]">
                          <MessageCircle size={14} />
                        </a>
                      )}
                    </div>
                  </Field>
                  <Field label="Trial / sample scheduled">
                    <button onClick={() => patchNow(b.id, { trial_scheduled: !b.trial_scheduled })} className="field-input flex items-center gap-2 text-left">
                      {b.trial_scheduled ? <CheckCircle2 size={16} className="text-[#4c7a3d]" /> : <Circle size={16} className="text-[#a8975f]" />}
                      {b.trial_scheduled ? "Scheduled" : "Not scheduled"}
                    </button>
                  </Field>
                  {b.trial_scheduled && (
                    <Field label="Trial date">
                      <input type="date" value={b.trial_date || ""} onChange={(e) => patchNow(b.id, { trial_date: e.target.value })} className="field-input" />
                    </Field>
                  )}
                  <Field label="Fitting dates">
                    <input defaultValue={b.fitting_dates} onBlur={(e) => commit(b.id, { fitting_dates: e.target.value })} placeholder="e.g. 10 Sep, 1 Nov" className="field-input" />
                  </Field>
                  <Field label="Contract upload">
                    <label className="field-input flex items-center gap-2 cursor-pointer text-[#8a8360]">
                      <ClipboardCheck size={14} />
                      {b.contract_file_url ? "File attached" : "Attach file... (wire to Supabase Storage)"}
                      <input type="file" className="hidden" />
                    </label>
                  </Field>
                  <Field label="Notes" full>
                    <textarea defaultValue={b.notes} onBlur={(e) => commit(b.id, { notes: e.target.value })} rows={2} className="field-input resize-none" placeholder="Any details worth remembering..." />
                  </Field>
                  <div className="md:col-span-3 flex justify-end">
                    <button onClick={() => removeBooking(b.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#c0392b] hover:bg-[#c0392b]/10">
                      <Trash2 size={13} /> Remove booking
                    </button>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "md:col-span-3" : ""}>
      <label className="block text-[11px] uppercase tracking-wide text-[#8a8360] mb-1">{label}</label>
      {children}
    </div>
  );
}
