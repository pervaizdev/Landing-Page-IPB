"use client";
import { useEffect, useRef, useState } from "react";
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
import { categoryLabel } from "./FindYourUnit";

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
  if (amount >= 1_000) {
    return `${trim(amount / 1_000)} K`;
  }
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
    <motion.button
      type="button"
      onClick={onSelect}
      aria-pressed={isActive}
      aria-label={`View details for unit ${unit.number}`}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 240, damping: 20 }}
      className={`group/btn inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full bg-[#0f3d20] font-semibold text-white transition-colors hover:bg-[#16562f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c29e6d] focus-visible:ring-offset-2 ${className}`}
    >
      View Details
      <HiArrowUpRight className="text-sm transition-transform duration-300 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" aria-hidden="true" />
    </motion.button>
  );
}
export default function UnitCard({ unit, floor, isActive, onSelect, index = 0 }) {
  const { amount, pct } = downPayment(unit);
  return (
    <motion.article
      initial={{ opacity: 0, y: 36 }}
      whileInView={{
        opacity: 1,
        y: 0,
        transition: { duration: 0.95, delay: (index % 8) * 0.1, ease: [0.22, 1, 0.36, 1] },
      }}
      viewport={{ once: true, amount: 0.18 }}
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className={`flex h-full flex-col rounded-2xl border bg-white p-4 shadow-sm transition-shadow duration-500 hover:shadow-md ${isActive ? "border-[#c29e6d] ring-1 ring-[#c29e6d]" : "border-gray-100"}`}
    >
      <div className="flex min-h-14 flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h4 className="break-words text-md font-bold leading-tight tracking-tight text-[#0f3d20]">
            {unitLabel(unit, floor)}
          </h4>
        </div>

        <StatusBadge status={unit.status} />
      </div>
      <div className="mt-4 rounded-xl bg-[#f7f2ea] p-3.5">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8B5E3C]">Down Payment</p>
        <p className="mt-1 flex flex-wrap items-baseline gap-2 text-2xl font-extrabold tabular-nums text-[#0f3d20]">
          {formatMillions(amount)}
          {pct != null && <span className="text-xs font-semibold text-[#8B5E3C]">{pct}%</span>}
        </p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Metric label="Area" value={formatArea(unit.areaSqFt)} />
        <Metric label="Monthly" value={formatCompactPKR(unit.monthlyInstallmentPkr)} />
      </div>
      <DetailsButton unit={unit} isActive={isActive} onSelect={onSelect} className="mt-5 w-full px-4 py-2.5 text-sm" />
    </motion.article>
  );
}

export function UnitRow({ unit, floor, isActive, onSelect, index = 0 }) {
  const { amount } = downPayment(unit);

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{
        opacity: 1,
        y: 0,
        transition: { duration: 0.9, delay: (index % 8) * 0.08, ease: [0.22, 1, 0.36, 1] },
      }}
      viewport={{ once: true, amount: 0.2 }}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 220, damping: 22 }}
      className={`grid grid-cols-3 items-center gap-x-2 gap-y-3 rounded-2xl border bg-white p-3 shadow-sm transition-shadow duration-500 hover:shadow-md sm:grid-cols-2 sm:gap-x-4 sm:gap-y-3 sm:px-4 sm:py-3 md:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,1fr))_auto_auto] ${isActive
        ? "border-[#c29e6d] ring-1 ring-[#c29e6d]"
        : "border-gray-100"
        }`}
    >
      {/* Unit title */}
      <div className="col-span-3 flex min-w-0 items-center justify-between gap-2 sm:col-span-2 md:col-span-1">
        <h4 className="text-base font-bold text-[#0f3d20]">
          {unitLabel(unit, floor)}
        </h4>

        {/* Status on mobile */}
        <div className="shrink-0 sm:hidden">
          <StatusBadge status={unit.status} />
        </div>
      </div>

      {/* Metrics in one horizontal row on mobile */}
      <Metric label="Area" value={formatArea(unit.areaSqFt)} />

      <Metric
        label="Down Payment"
        value={formatMillions(amount)}
      />

      <Metric
        label="Monthly"
        value={formatCompactPKR(unit.monthlyInstallmentPkr)}
      />

      {/* Desktop status */}
      <div className="hidden lg:flex lg:items-center lg:justify-end">
        <StatusBadge status={unit.status} />
      </div>

      {/* Details button */}
      <div className="col-span-3 sm:col-span-2 md:col-span-1">
        <DetailsButton
          unit={unit}
          isActive={isActive}
          onSelect={onSelect}
          className="w-full px-4 py-2.5 text-xs md:w-auto md:py-2"
        />
      </div>
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

function MobileCustomDropdown({
  value,
  options,
  onChange,
  ariaLabel,
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event) => {
      if (!dropdownRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const selected = options.find(
    (option) => String(option.value) === String(value)
  );

  return (
    <div
      ref={dropdownRef}
      className={`relative w-full min-w-0 max-w-[215px] ${open ? "z-[1200]" : "z-0"
        }`}
    >
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-[#d1b38c] bg-white px-4 py-2.5 text-left text-sm font-semibold text-[#0f3d20] shadow-sm transition-colors hover:border-[#c29e6d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c29e6d]/40"
      >
        <span className="min-w-0 truncate">
          {selected?.label ?? options[0]?.label}
        </span>

        <HiChevronDown
          aria-hidden="true"
          className={`shrink-0 text-lg text-[#8B5E3C] transition-transform duration-200 ${open ? "rotate-180" : ""
            }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="listbox"
            aria-label={ariaLabel}
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 right-0 top-full z-[1100] mt-2 max-h-[240px] overflow-y-auto overscroll-contain rounded-xl border border-[#E8DFD2] bg-white p-1.5 shadow-xl [scrollbar-width:thin]"
          >
            {options.map((option) => {
              const active =
                String(option.value) === String(value);

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`flex min-h-10 w-full cursor-pointer items-center rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition-colors ${active
                    ? "bg-[#0f3d20] text-white"
                    : "text-[#153D2A] hover:bg-[#F7F2EA]"
                    }`}
                >
                  {option.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
  floors,
  selectedFloorId,
  onFloorChange,
  selectedTypes,
  onTypesChange,
}) {
  const options = ["All", "Available", "Booked"];


  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, x: 16, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 12, scale: 0.96 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="absolute right-[calc(100%+8px)] top-1/2 z-[1000] flex w-[215px] max-w-[calc(100vw-110px)] flex-col items-stretch gap-2 overflow-visible p-1"
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
          {selectedTypes?.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {selectedTypes.map((id) => (
                <span
                  key={id}
                  className="inline-flex items-center gap-1 rounded-full border border-[#c29e6d]/60 bg-white py-1 pl-3 pr-1.5 text-xs font-semibold text-[#8B5E3C]"
                >
                  {categoryLabel(id)}

                  <button
                    type="button"
                    onClick={() =>
                      onTypesChange?.(
                        selectedTypes.filter((t) => t !== id)
                      )
                    }
                    aria-label={`Remove ${categoryLabel(id)} filter`}
                    className="grid h-5 w-5 place-items-center rounded-full hover:bg-[#c29e6d]/20"
                  >
                    <HiXMark className="text-xs" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="relative w-full">
            <MobileCustomDropdown
              ariaLabel="Sort units"
              value={sortId}
              options={sorts.map((sort) => ({
                value: sort.id,
                label: sort.label,
              }))}
              onChange={onSortId}
            />
          </div>

          <div className="w-full">
            <MobileCustomDropdown
              ariaLabel="Select floor"
              value={selectedFloorId ?? ""}
              options={[
                { value: "", label: "All Floors" },
                ...(floors ?? []).map((floor) => ({
                  value: String(floor.id),
                  label: floor.name,
                })),
              ]}
              onChange={(value) =>
                onFloorChange?.(value === "" ? null : value)
              }
            />
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

