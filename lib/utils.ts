import { format, parseISO } from "date-fns";
import { clsx, type ClassValue } from "clsx";

// ─── className helper ────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// ─── Sana formatlash ─────────────────────────────────────────
export function formatMatchDate(utcDate: string): string {
  return format(parseISO(utcDate), "dd MMM, HH:mm");
}

export function formatDateOnly(utcDate: string): string {
  return format(parseISO(utcDate), "dd MMMM yyyy");
}

export function formatTimeOnly(utcDate: string): string {
  return format(parseISO(utcDate), "HH:mm");
}

// ─── Match status rangi ──────────────────────────────────────
export function getStatusColor(status: string): string {
  switch (status) {
    case "LIVE":
    case "IN_PLAY":
      return "bg-red-500 text-white";
    case "PAUSED":
      return "bg-yellow-500 text-white";
    case "FINISHED":
      return "bg-gray-400 text-white";
    case "SCHEDULED":
    case "TIMED":
      return "bg-blue-500 text-white";
    default:
      return "bg-gray-200 text-gray-700";
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case "LIVE":
    case "IN_PLAY":
      return "JONLI";
    case "PAUSED":
      return "TANAFFUS";
    case "FINISHED":
      return "TUGADI";
    case "SCHEDULED":
    case "TIMED":
      return "REJALASHTIRILGAN";
    default:
      return status;
  }
}

// ─── Forma (W/D/L) rangi ─────────────────────────────────────
export function getFormColor(char: string): string {
  switch (char) {
    case "W":
      return "bg-green-500 text-white";
    case "D":
      return "bg-yellow-400 text-white";
    case "L":
      return "bg-red-500 text-white";
    default:
      return "bg-gray-200 text-gray-600";
  }
}

// ─── Yosh hisoblash ──────────────────────────────────────────
export function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = parseISO(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// ─── Liga nomi ───────────────────────────────────────────────
export function getLeagueName(code: string): string {
  const map: Record<string, string> = {
    PL: "Premier League",
    CL: "Champions League",
    PD: "La Liga",
  };
  return map[code] || code;
}