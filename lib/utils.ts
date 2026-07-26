import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Booking, TaskStatus } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const WEDDING_DATE = new Date(
  (process.env.NEXT_PUBLIC_WEDDING_DATE || "2026-12-11") + "T10:00:00"
);
export const PLANNING_START = new Date(
  (process.env.NEXT_PUBLIC_PLANNING_START_DATE || "2026-01-11") + "T00:00:00"
);

export function daysBetween(a: Date, b: Date) {
  return Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

export function currency(n: number | null | undefined) {
  return "₹" + Number(n || 0).toLocaleString("en-IN");
}

export type Urgency = "red" | "orange" | "yellow" | "green" | "none";

export const URGENCY_COLORS: Record<Urgency, string> = {
  red: "#c0392b",
  orange: "#e07a1f",
  yellow: "#d9b021",
  green: "#4c7a3d",
  none: "#9aa39a",
};
export const URGENCY_LABEL: Record<Urgency, string> = {
  red: "Overdue",
  orange: "Critical",
  yellow: "Upcoming",
  green: "Can wait",
  none: "Done",
};

export function urgencyForTask(due: string | null, status: TaskStatus): Urgency {
  if (!due || status === "Completed" || status === "Cancelled") return "none";
  const d = daysBetween(new Date(), new Date(due));
  if (d < 0) return "red";
  if (d <= 7) return "orange";
  if (d <= 21) return "yellow";
  return "green";
}

export function bookingUrgency(b: Pick<Booking, "status" | "lead_months">): Urgency {
  if (["Booked", "Confirmed", "Cancelled"].includes(b.status)) return "none";
  const idealBookBy = new Date(WEDDING_DATE);
  idealBookBy.setMonth(idealBookBy.getMonth() - b.lead_months);
  const d = daysBetween(new Date(), idealBookBy);
  if (d < 0) return "red";
  if (d <= 21) return "orange";
  if (d <= 60) return "yellow";
  return "green";
}

const BOOKING_STAGE_PCT: Record<string, number> = {
  "Not Booked": 0,
  Enquired: 20,
  Negotiating: 45,
  Booked: 80,
  Confirmed: 100,
  Cancelled: 0,
};
export function bookingProgressPct(b: Pick<Booking, "status">) {
  return BOOKING_STAGE_PCT[b.status] ?? 0;
}

export const SIDE_COLORS: Record<string, string> = {
  Bride: "#b5495b",
  Groom: "#2b4c7a",
  Both: "#8a8360",
};

export const PRIORITY_COLOR: Record<string, string> = {
  Critical: "#c0392b",
  High: "#e07a1f",
  Medium: "#d9b021",
  Low: "#4c7a3d",
};

export const STATUS_COLUMNS: TaskStatus[] = [
  "Not Started",
  "In Progress",
  "Waiting",
  "Blocked",
  "Completed",
];
