"use client";
import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  HiArrowUpRight,
  HiAdjustmentsHorizontal,
  HiChevronDown,
  HiOutlineListBullet,
  HiOutlineSquares2X2,
  HiXMark,
} from "react-icons/hi2";
import bookingData from "@/data/booking.json";

const bookingConfig = bookingData.config;
export const statusStyle = (status) => statusStyles?.[status] ?? fallbackStatusStyle ?? {};
export const unitCategory = (unit) => {
  const type = String(unit?.type ?? "").toLowerCase().trim();
  return ["1 bed", "2 bed", "studio"].includes(type) || /apartment|residential|penthouse|flat|\d+\s*bed/.test(type) ? "Apartment" : "Commercial";
};
// Stable property-type id (e.g. "shop", "studio", "1-bed") independent of display labels.
export const unitTypeKey = (unit) => {
  const type = String(unit?.type ?? "").toLowerCase().replace(/['’]s$/, "").trim();
  const bed = type.match(/^(\d+)\s*-?\s*bed/);
  if (bed) return `${bed[1]}-bed`;
  return type.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "other";
};
export const unitTypeLabel = (type) => {
  if (!type) return "";
  if (type === "Shop's") return "Shop";
  if (type.toUpperCase() === "GYM") return "Gym";
  if (/^\d+ bed$/i.test(type)) return `${type.replace(/bed/i, "Bed")} Apartment`;
  if (/^studio$/i.test(type)) return "Studio Apartment";
  return type;
};
// Short property-type name used on cards and list rows (Shop, Studio, 1 Bedroom...).
export const unitTypeShort = (unit) => {
  const key = unitTypeKey(unit);
  const bed = key.match(/^(\d+)-bed$/);
  if (bed) return `${bed[1]} Bedroom`;
  return unit?.type ? unitTypeLabel(unit.type).replace(/ Apartment$/, "") : "";
};
export function formatPKR(value) {
  return value == null || !Number.isFinite(Number(value)) ? "—" : Math.round(Number(value)).toLocaleString("en-PK");
}
export function formatCompactPKR(value) {
  if (value == null || !Number.isFinite(Number(value))) return "—";
  const amount = Number(value);
  const trim = (n) => n.toFixed(2).replace(/\.?0+$/, "");
  if (amount >= 1_000_000_000) return `${trim(amount / 1_000_000_000)} B`;
  if (amount >= 1_000_000) return `${trim(amount / 1_000_000)} M`;
  return formatPKR(amount);
}
// Display-only: 429722 -> "0.43 M", 1250000000 -> "1.25 B". Never alters the stored value.
export function formatMillions(value) {
  if (value == null || value === "" || !Number.isFinite(Number(value))) return "—";
  const amount = Number(value);
  if (amount <= 0) return "—";
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(2)} B`;
  return `${(amount / 1_000_000).toFixed(2)} M`;
}
export const formatArea = (sqFt) => sqFt == null || !Number.isFinite(Number(sqFt)) ? "—" : `${Number(sqFt).toLocaleString("en-PK", { maximumFractionDigits: 1 })} sq.ft`;
// Single source of truth for Available/Booked colours (filters, badges, floor counts).
export const STATUS_COLORS = {
  Available: { bg: "#EAF9F1", text: "#008C50", dot: "#00A565" },
  Booked: { bg: "#F7F1E9", text: "#A57943", dot: "#C09A67" },
};
export const statusColors = (status) => STATUS_COLORS[status] ?? { bg: "#f3f4f6", text: "#374151", dot: "#6b7280" };
export function StatusDot({ status }) {
  return <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: statusColors(status).dot }} />;
}
// "Commercial" / "Residential" for recognised types only; unknown types return null.
export const unitClass = (unit) => {
  const type = String(unit?.type ?? "").toLowerCase();
  if (/studio|apartment|residential|penthouse|flat|\d+\s*bed/.test(type)) return "Residential";
  if (/shop|restaurant|gym|office|retail|showroom|cafe|store|clinic|bank/.test(type)) return "Commercial";
  return null;
};
// Customer-facing label, e.g. L03 -> "Shop 03", F116 -> "Shop 16", 305 -> "1 Bedroom 05".
// The numeric part is only derived when the code matches the confirmed convention for the
// unit's floor (L/G + 2 digits, or [F]<floor level> + 2 digits); otherwise the original code is kept.
export function unitLabel(unit, floor) {
  const code = String(unit?.number ?? "");
  const type = unitTypeShort(unit);
  if (!type) return code;
  const level = floor?.level;
  // Prime Mall lower-ground inventory uses S01/S02 codes; display Shop 01, Restaurant 05, etc.
  if (level === -1 && /^S\d{2}$/i.test(code)) return `${type} ${code.slice(1)}`;
  let m = code.match(/^([LG])(\d{2})$/i);
  if (m && ((m[1].toUpperCase() === "L" && level === -1) || (m[1].toUpperCase() === "G" && level === 0))) return `${type} ${m[2]}`;
  m = code.match(/^F?(\d)(\d{2})$/i);
  if (m && Number.isInteger(level) && level > 0 && Number(m[1]) === level) return `${type} ${m[2]}`;
  return `${type} ${code}`;
}
// Down payment = the unit's stored booking amount; percentage only when both figures are valid.
function downPayment(unit) {
  const amount = unit?.bookingAmountPkr;
  const price = Number(unit?.pricePkr);
  const pct = Number(amount) > 0 && price > 0 ? Math.round((Number(amount) / price) * 100) : null;
  return { amount, pct };
}
function StatusBadge({ status, className = "" }) {
  const c = statusColors(status);
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${className}`} style={{ backgroundColor: c.bg, color: c.text }}>
      <StatusDot status={status} />
      {status}
    </span>
  );
}
function Metric({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">{label}</p>
      <p className="mt-0.5 text-sm font-semibold tabular-nums text-gray-800">{value}</p>
    </div>
  );
}
function DetailsButton({ unit, isActive, onSelect, className = "" }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isActive}
      aria-label={`View details for unit ${unit.number}`}
      className={`group/btn inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full bg-[#0f3d20] font-semibold text-white transition-colors hover:bg-[#16562f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c29e6d] focus-visible:ring-offset-2 ${className}`}
    >
      View Details
      <HiArrowUpRight className="text-sm transition-transform group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" aria-hidden="true" />
    </button>
  );
}
const cardMotion = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, scale: 0.97 },
  transition: { duration: 0.22 },
};
export default function UnitCard({ unit, floor, isActive, onSelect }) {
  const { amount, pct } = downPayment(unit);
  return (
    <motion.article
      {...cardMotion}
      whileHover={{ y: -3 }}
      className={`flex h-full flex-col rounded-2xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md ${isActive ? "border-[#c29e6d] ring-1 ring-[#c29e6d]" : "border-gray-100"}`}
    >
      <div className="flex min-h-14 items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className="text-xl font-bold leading-tight tracking-tight text-[#0f3d20]">{unitLabel(unit, floor)}</h4>
        </div>
        <StatusBadge status={unit.status} />
      </div>
      <div className="mt-4 rounded-xl bg-[#f7f2ea] p-3.5">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8B5E3C]">Down Payment</p>
        <p className="mt-1 flex items-baseline gap-2 text-2xl font-extrabold tabular-nums text-[#0f3d20]">
          {formatMillions(amount)}
          {pct != null && <span className="text-xs font-semibold text-[#8B5E3C]">{pct}%</span>}
        </p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Metric label="Area" value={formatArea(unit.areaSqFt)} />
        <Metric label="Monthly" value={formatMillions(unit.monthlyInstallmentPkr)} />
      </div>
      <DetailsButton unit={unit} isActive={isActive} onSelect={onSelect} className="mt-5 w-full px-4 py-2.5 text-sm" />
    </motion.article>
  );
}
export function UnitRow({ unit, floor, isActive, onSelect }) {
  const { amount } = downPayment(unit);
  return (
    <motion.article
      {...cardMotion}
      className={`flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:grid sm:grid-cols-2 sm:items-center sm:gap-x-4 sm:gap-y-3 sm:px-4 sm:py-3 md:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,1fr))_auto_auto] ${isActive ? "border-[#c29e6d] ring-1 ring-[#c29e6d]" : "border-gray-100"}`}
    >
      <div className="flex min-w-0 items-start justify-between gap-2 sm:block">
        <h4 className="text-base font-bold text-[#0f3d20]">{unitLabel(unit, floor)}</h4>
      </div>
      <Metric label="Area" value={formatArea(unit.areaSqFt)} />
      <Metric label="Down Payment" value={formatMillions(amount)} />
      <Metric label="Monthly" value={formatMillions(unit.monthlyInstallmentPkr)} />
      <StatusBadge status={unit.status} className="hidden sm:inline-flex" />
      <DetailsButton unit={unit} isActive={isActive} onSelect={onSelect} className="w-full px-4 py-2.5 text-xs sm:w-auto sm:py-2" />
    </motion.article>
  );
}

export function MobileFiltersButton({
  onClick,
  activeCount = 0,
  open = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      aria-label={open ? "Close filters" : "Open filters"}
      className="inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full border border-[#153D29] bg-[#153D29] px-4 py-2.5 text-xs font-semibold text-white shadow-lg transition-colors hover:bg-[#16562f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c29e6d]"
    >
      {open ? (
        <>
          <HiXMark className="text-lg text-[#c29e6d]" />
          Close
        </>
      ) : (
        <>
          <HiAdjustmentsHorizontal className="text-base text-[#c29e6d]" />
          Filters
          {activeCount > 0 && (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#c29e6d] px-1 text-[10px] font-bold text-[#0f3d20]">
              {activeCount}
            </span>
          )}
        </>
      )}
    </button>
  );
}


export function MobileFiltersDrawer({
  open,
  onClose,
  statusFilter,
  onStatusFilter,
  sortId,
  onSortId,
  view,
  onView,
  sorts,
}) {
  const options = ["All", "Available", "Booked"];


  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, x: 12, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 12, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className="absolute right-[calc(100%+8px)] top-22 z-10 flex w-[min(215px,calc(100vw-125px))] -translate-y-1/2 flex-col items-end gap-2"
          style={{ y: "-50%" }}
        >
          <div className="flex justify-center gap-1">
            {["All", "Available", "Booked"].map((name) => {
              const active =
                name === "All"
                  ? !statusFilter
                  : statusFilter === name;

              const colors =
                name === "All" ? null : statusColors(name);

              return (
                <button
                  key={name}
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    onStatusFilter(name === "All" ? null : name)
                  }
                  className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 py-2 text-[11px] font-semibold shadow-md transition-colors ${active
                      ? "border-[#0f3d20] bg-[#0f3d20] text-white"
                      : "border-[#E8DFD2] bg-white text-[#153D2A]"
                    }`}
                >
                  {colors && (
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        backgroundColor: active
                          ? "#ffffff"
                          : colors.dot,
                      }}
                    />
                  )}
                  {name}
                </button>
              );
            })}
          </div>

          <div className="relative w-full">
            <select
              value={sortId}
              onChange={(e) => onSortId(e.target.value)}
              aria-label="Sort units"
              className="h-10 w-full cursor-pointer appearance-none rounded-full border border-[#d1b38c] bg-white py-2 pl-3 pr-8 text-xs font-semibold text-[#153D2A] shadow-md outline-none focus:ring-2 focus:ring-[#c29e6d]"
            >
              {sorts.map((sort) => (
                <option key={sort.id} value={sort.id}>
                  {sort.label}
                </option>
              ))}
            </select>
            <HiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8B5E3C]" />
          </div>

          <div className="flex items-center gap-1.5">
            {[
              ["grid", HiOutlineSquares2X2, "Grid"],
              ["list", HiOutlineListBullet, "List"],
            ].map(([id, Icon, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => onView(id)}
                aria-pressed={view === id}
                className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold shadow-md ${view === id
                    ? "border-[#0f3d20] bg-[#0f3d20] text-white"
                    : "border-[#E8DFD2] bg-white text-[#153D2A]"
                  }`}
              >
                <Icon className="text-sm" />
                {label}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

}

