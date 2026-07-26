export type Role = "admin" | "family" | "volunteer";
export type Side = "Bride" | "Groom" | "Both";

export type Profile = {
  id: string;
  full_name: string;
  phone: string | null;
  role: Role;
  created_at: string;
};

export type EventRow = {
  id: string;
  name: string;
  event_date: string | null;
  archived: boolean;
  created_at: string;
};

export type TaskStatus =
  | "Not Started"
  | "In Progress"
  | "Waiting"
  | "Blocked"
  | "Completed"
  | "Cancelled";

export type TaskPriority = "Critical" | "High" | "Medium" | "Low";

export type Task = {
  id: string;
  side: Side;
  event_id: string | null;
  name: string;
  description: string;
  category: string;
  assignee_name: string;
  assignee_id: string | null;
  priority: TaskPriority;
  due_date: string | null;
  status: TaskStatus;
  completion_pct: number;
  created_at: string;
  updated_at: string;
};

export type BookingStatus =
  | "Not Booked"
  | "Enquired"
  | "Negotiating"
  | "Booked"
  | "Confirmed"
  | "Cancelled";

export type Booking = {
  id: string;
  side: Side;
  category: string;
  is_custom: boolean;
  lead_months: number;
  vendor_name: string;
  event_id: string | null;
  status: BookingStatus;
  booking_date: string | null;
  contract_signed: boolean;
  advance_paid: number;
  balance_due: number;
  final_payment_due: string | null;
  contact_person: string;
  phone: string;
  trial_needed: boolean;
  trial_scheduled: boolean;
  trial_date: string | null;
  fitting_needed: boolean;
  fitting_dates: string;
  contract_file_url: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
};

export type BudgetItem = {
  id: string;
  side: Side;
  event_id: string | null;
  category: string;
  planned: number;
  actual: number;
  created_at: string;
};

export type ShoppingItem = {
  id: string;
  side: Side;
  event_id: string | null;
  category: string;
  name: string;
  qty: number;
  remaining_qty: number;
  budget: number;
  actual: number;
  store: string;
  purchased: boolean;
  assignee_name: string;
  receipt_url: string | null;
  created_at: string;
};

export type Guest = {
  id: string;
  name: string;
  side: "Bride" | "Groom";
  type: "Family" | "Friend" | "VIP";
  rsvp: "Pending" | "Confirmed" | "Declined";
  invited: boolean;
  food_preference: string;
  phone: string;
  created_at: string;
};

export type Vendor = {
  id: string;
  side: Side;
  name: string;
  category: string;
  phone: string;
  advance_paid: number;
  balance_due: number;
  rating: number;
  notes: string;
  created_at: string;
};

export const BOOKING_CATEGORIES: { name: string; leadMonths: number }[] = [
  { name: "Venue", leadMonths: 9 },
  { name: "Food Catering", leadMonths: 9 },
  { name: "Photographer", leadMonths: 6 },
  { name: "Videographer", leadMonths: 6 },
  { name: "Decoration", leadMonths: 5 },
  { name: "DJ / Sound", leadMonths: 4 },
  { name: "Lighting", leadMonths: 4 },
  { name: "Makeup Artist", leadMonths: 4 },
  { name: "Wedding Clothes / Tailor", leadMonths: 4 },
  { name: "Mehendi Artist", leadMonths: 3 },
  { name: "Jeweler", leadMonths: 3 },
  { name: "Transportation", leadMonths: 3 },
  { name: "Invitation Cards Printing", leadMonths: 3 },
  { name: "Accommodation / Guest Hotel", leadMonths: 5 },
  { name: "Flowers", leadMonths: 2 },
];

export const EVENT_THEME: Record<string, { grad: string; chip: string; emoji: string }> = {
  Mehendi: { grad: "from-[#3f6b3a] to-[#7c9a4b]", chip: "#4c7a3d", emoji: "🌿" },
  Haldi: { grad: "from-[#e8ab1f] to-[#f4c542]", chip: "#d99a12", emoji: "🌼" },
  Nikah: { grad: "from-[#0b4a3a] to-[#c9a227]", chip: "#0b4a3a", emoji: "💍" },
  Reception: { grad: "from-[#8a6d3a] to-[#e8d9a8]", chip: "#a8842f", emoji: "🥂" },
};
export function themeFor(name: string) {
  return EVENT_THEME[name] || { grad: "from-[#0b4a3a] to-[#c9a227]", chip: "#0b4a3a", emoji: "✨" };
}
