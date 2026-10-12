"use client";

import { motion } from "framer-motion";
import bookingData from "@/data/booking.json";

const { statusStyles, fallbackStatusStyle, residentialTypes } = bookingData.config;

/* ---------- Unit / status / formatting helpers (shared by booking components) ---------- */

export const statusStyle = (status) => statusStyles[status] ?? fallbackStatusStyle;

export const unitCategory = (unit) =>
  residentialTypes.includes(unit.type.toLowerCase()) ? "Apartment" : "Commercial";

export const unitTypeLabel = (type) => {
  if (type === "Shop's") return "Shop";
  if (type === "GYM") return "Gym";
  if (/^\d bed$/i.test(type)) return `${type.replace("bed", "Bed")} Apartment`;
  if (type === "Studio") return "Studio Apartment";
  return type;
};

export function formatPKR(value) {
  if (value == null) return "—";
  return `${Math.round(value).toLocaleString("en-PK")}`;
}

export function formatCompactPKR(value) {
  if (value == null) return "—";
  const trim = (n) => n.toFixed(2).replace(/\.?0+$/, "");
  if (value >= 1_000_000_000) return `${trim(value / 1_000_000_000)} Billion`;
  if (value >= 1_000_000) return `${trim(value / 1_000_000)} Million`;
  return `${Math.round(value).toLocaleString("en-PK")}`;
}

export const formatArea = (sqFt) =>
  sqFt == null ? "—" : `${Number(sqFt).toLocaleString("en-PK", { maximumFractionDigits: 1 })} sq.ft`;

export default function UnitCard({ unit, isActive, onSelect }) {
  const st = statusStyle(unit.status);

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(unit.id)}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      whileHover={{ y: -4, transition: { duration: 0.2, ease: "easeOut" } }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.25 }}
      aria-pressed={isActive}
      className={`group relative w-full overflow-hidden rounded-2xl border bg-white p-4 text-left cursor-pointer transition-shadow duration-200 ${
        isActive ? "border-[#0f3d20] shadow-xl ring-2 ring-[#0f3d20]/15" : "border-gray-200/80 shadow-xs hover:border-gray-300 hover:shadow-lg"
      }`}
    >
      <span className="absolute inset-y-0 left-0 w-1" style={{ backgroundColor: st.fill }} />

      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-gray-400">{unitCategory(unit)}</p>
          <p className="text-xl font-extrabold text-gray-900">{unit.number}</p>
        </div>
        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${st.badge}`}>
          {unit.status}
        </span>
      </div>

      <p className="mt-1 text-sm font-medium text-gray-700">{unitTypeLabel(unit.type)}</p>

      {unit.features?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {unit.features.slice(0, 2).map((f) => (
            <span key={f} className="rounded-full bg-emerald-50/80 border border-emerald-900/10 px-2 py-0.5 text-[10px] font-semibold text-[#0f3d20]">
              {f}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 border-t border-gray-100 pt-3">
        <p className="text-xs font-medium text-gray-500">{formatArea(unit.areaSqFt)}</p>
        <p className="mt-1 text-base font-bold text-gray-900">{formatCompactPKR(unit.pricePkr)}</p>
      </div>
    </motion.button>
  );
}
