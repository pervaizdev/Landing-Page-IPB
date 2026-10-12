"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useLenis } from "lenis/react";
import { HiCursorArrowRays, HiChevronDown, HiCheck } from "react-icons/hi2";
import FloorStack, { summarizeUnits } from "./FloorStack";
import UnitCard, { statusStyle, unitCategory } from "./UnitCard";
import UnitDetail from "./UnitDetail";
import bookingData from "@/data/booking.json";

const STATUSES = bookingData.config.statuses;

const CATEGORY_FILTERS = ["All", "Commercial", "Apartment"];

const SORTS = {
  number: { label: "Unit number", fn: (a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }) },
  priceAsc: { label: "Price: low to high", fn: (a, b) => a.pricePkr - b.pricePkr },
  priceDesc: { label: "Price: high to low", fn: (a, b) => b.pricePkr - a.pricePkr },
};

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${active ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
        }`}
    >
      {children}
    </button>
  );
}

function FloorHeader({ floor }) {
  const s = summarizeUnits(floor.units);
  return (
    <div className="rounded-[26px] sm:rounded-[30px] border border-[#d1b38c]/40 bg-white p-5 sm:p-6 lg:p-7 shadow-lg shadow-black/5 text-left">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#8B5E3C]">
            Selected Floor
          </span>
          <h3 className="parisienne-font text-3xl sm:text-4xl lg:text-5xl text-[#0f3d20] mt-1">{floor.name}</h3>
        </div>
        <p className="text-xs sm:text-sm font-semibold text-gray-500">
          Total: <span className="font-bold text-gray-900">{floor.units.length} units</span>
        </p>
      </div>

      <div className="my-4 sm:my-5 h-px bg-linear-to-r from-[#c29e6d]/60 via-[#c29e6d]/20 to-transparent" />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-3 sm:p-3.5 shadow-2xs">
          <p className="text-[11px] sm:text-xs font-medium text-gray-500">Commercial</p>
          <p className="text-xl sm:text-2xl font-black text-gray-900 mt-1">{s.commercial.total}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-3 sm:p-3.5 shadow-2xs">
          <p className="text-[11px] sm:text-xs font-medium text-gray-500">Apartments</p>
          <p className="text-xl sm:text-2xl font-black text-gray-900 mt-1">{s.apartments.total}</p>
        </div>
        {STATUSES.map((st) => (
          <div
            key={st}
            className="rounded-2xl border border-gray-100 p-3 sm:p-3.5 shadow-2xs"
            style={{ backgroundColor: statusStyle(st).soft }}
          >
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-gray-800">
              <span className={`h-2 w-2 rounded-full ${statusStyle(st).dot}`} />
              <span className="truncate">{st}</span>
            </div>
            {/* High contrast, bold text so numbers are clearly visible */}
            <p className="text-xl sm:text-2xl font-black text-gray-900 mt-1 drop-shadow-2xs">{s.all[st] ?? 0}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FloorExplorer({ building }) {
  const lenis = useLenis();
  const unitsRef = useRef(null);
  const [floorId, setFloorId] = useState(() => {
    const ground = building.floors.find((f) => f.level === 0);
    return (ground ?? building.floors[0]).id;
  });
  const [unitId, setUnitId] = useState(null);
  const [category, setCategory] = useState("All");
  const [statusFilter, setStatusFilter] = useState(null);
  const [sort, setSort] = useState("number");
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target)) {
        setSortDropdownOpen(false);
      }
    }
    if (sortDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sortDropdownOpen]);

  const floor = building.floors.find((f) => f.id === floorId);
  const unit = floor.units.find((u) => u.id === unitId) ?? null;

  const visibleUnits = useMemo(
    () =>
      floor.units
        .filter((u) => category === "All" || unitCategory(u) === category)
        .filter((u) => !statusFilter || u.status === statusFilter)
        .sort(SORTS[sort].fn),
    [floor, category, statusFilter, sort]
  );

  const selectFloor = (id) => {
    setFloorId(id);
    setUnitId(null);
  };

  const selectFromMap = (id) => {
    setUnitId(id);
    if (window.matchMedia("(min-width: 1024px)").matches && unitsRef.current) {
      lenis?.scrollTo(unitsRef.current, { offset: -110 });
    }
  };

  return (
    <div className="space-y-10 sm:space-y-14 lg:space-y-16">
      <section className="space-y-6 mt-10 sm:mt-14 lg:mt-16">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#d1b38c] bg-[#d1b38c]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#8B5E3C] shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-[#d1b38c]" />
            Floor Plan
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl parisienne-font text-[#0f3d20]">Choose a Floor</h2>
          <div className="mx-auto mt-3 h-[2px] w-20 origin-center bg-linear-to-r from-transparent via-[#c29e6d] to-transparent" />
          <p className="mt-3 text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
            Select a floor to see its details and unit availability.
          </p>
        </div>

        {/* Floor selector */}
        <FloorStack floors={building.floors} selectedId={floorId} onSelect={selectFloor} />

        {/* Selected floor overview with visible counts */}
        <AnimatePresence mode="wait">
          <motion.div
            key={floor.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <FloorHeader floor={floor} />
          </motion.div>
        </AnimatePresence>
      </section>

      <section ref={unitsRef} className="mt-12 sm:mt-16 lg:mt-20">
        <div className="mx-auto mb-6 sm:mb-8 max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#d1b38c] bg-[#d1b38c]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#8B5E3C] shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-[#d1b38c]" />
            Floor Units
          </span>
          <AnimatePresence mode="wait">
            <motion.h2
              key={floor.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="mt-3 text-3xl sm:text-4xl lg:text-5xl parisienne-font text-[#0f3d20]"
            >
              Units on {floor.name}
            </motion.h2>
          </AnimatePresence>
          <div className="mx-auto mt-3 h-[2px] w-20 origin-center bg-linear-to-r from-transparent via-[#c29e6d] to-transparent" />
          <p className="mt-3 text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
            Select a card to see full pricing, payment plan and booking options.
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Filter Chips grouped cleanly */}
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-2">
            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              {CATEGORY_FILTERS.map((c) => (
                <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
                  {c === "Apartment" ? "Apartments" : c}
                </Chip>
              ))}
            </div>

            <span className="hidden sm:block mx-1 h-5 w-px bg-gray-200" />

            {/* Status Filter Chips */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              {STATUSES.map((s) => (
                <Chip key={s} active={statusFilter === s} onClick={() => setStatusFilter(statusFilter === s ? null : s)}>
                  <span className={`h-2 w-2 rounded-full ${statusStyle(s).dot}`} />
                  {s}
                </Chip>
              ))}
            </div>
          </div>

          {/* Custom Luxury Themed Dropdown */}
          <div ref={sortDropdownRef} className="relative self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setSortDropdownOpen((prev) => !prev)}
              aria-haspopup="listbox"
              aria-expanded={sortDropdownOpen}
              className={`flex items-center gap-2 rounded-full border px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold shadow-2xs transition-all duration-300 cursor-pointer ${sortDropdownOpen
                  ? "border-[#c29e6d] bg-[#faf4eb] text-[#8B5E3C] ring-2 ring-[#c29e6d]/30"
                  : "border-[#d1b38c]/60 bg-white text-gray-800 hover:border-[#c29e6d] hover:bg-[#faf4eb]"
                }`}
            >
              <span>{SORTS[sort]?.label ?? "Sort"}</span>
              <HiChevronDown
                className={`text-sm text-[#8B5E3C] transition-transform duration-300 ${sortDropdownOpen ? "rotate-180" : ""
                  }`}
              />
            </button>

            <AnimatePresence>
              {sortDropdownOpen && (
                <motion.ul
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  role="listbox"
                  className="absolute left-0 sm:left-auto sm:right-0 top-full z-50 mt-2 min-w-48 overflow-hidden rounded-2xl border border-[#d1b38c]/40 bg-white p-1.5 shadow-xl shadow-black/10 backdrop-blur-md"
                >
                  {Object.entries(SORTS).map(([key, { label }]) => {
                    const isSelected = sort === key;
                    return (
                      <li key={key}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => {
                            setSort(key);
                            setSortDropdownOpen(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-xs font-semibold transition-colors cursor-pointer ${isSelected
                              ? "bg-[#faf4eb] text-[#8B5E3C] font-bold"
                              : "text-gray-700 hover:bg-[#faf4eb]/60 hover:text-[#8B5E3C]"
                            }`}
                        >
                          <span>{label}</span>
                          {isSelected && <HiCheck className="text-sm text-[#c29e6d]" />}
                        </button>
                      </li>
                    );
                  })}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Unit cards and Detail Sidebar: smooth animated opening and closing */}
        <div className="flex flex-col lg:flex-row items-start">
          <div className="flex-1 min-w-0 w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={floor.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                {visibleUnits.length ? (
                  <div className="grid gap-3 sm:gap-4 grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-[repeat(auto-fill,minmax(215px,1fr))] max-w-sm min-[420px]:max-w-none mx-auto sm:mx-0">
                    <AnimatePresence>
                      {visibleUnits.map((u) => (
                        <UnitCard key={u.id} unit={u} isActive={u.id === unitId} onSelect={setUnitId} />
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="rounded-3xl border border-dashed border-gray-300 p-10 text-center text-sm text-gray-500">
                    No units match these filters on this floor.
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* 30% viewport detail panel on the right - smooth slide & fade in/out */}
          <AnimatePresence>
            {unit && (
              <motion.aside
                key="desktop-unit-detail"
                initial={{ width: "0%", opacity: 0, x: 36, marginLeft: 0 }}
                animate={{ width: "30%", opacity: 1, x: 0, marginLeft: "1.5rem" }}
                exit={{ width: "0%", opacity: 0, x: 36, marginLeft: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                style={{ minWidth: 0 }}
                className="hidden lg:block shrink-0 sticky top-6 overflow-hidden"
              >
                <div className="w-full min-w-[280px]">
                  <UnitDetail building={building} floor={floor} unit={unit} onClose={() => setUnitId(null)} />
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>
      </section>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {unit && (
              <motion.div
                className="fixed inset-0 z-[10000] flex items-end bg-black/50 lg:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setUnitId(null)}
              >
                <motion.div
                  data-lenis-prevent
                  className="max-h-[88vh] w-full overflow-y-auto rounded-t-3xl"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 30, stiffness: 300 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <UnitDetail building={building} floor={floor} unit={unit} onClose={() => setUnitId(null)} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}

export function SectionTitle({ eyebrow, title, subtitle }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c29e6d]">{eyebrow}</p>
      <h2 className="mt-1 text-3xl lg:text-4xl font-bold text-gray-900">{title}</h2>
      {subtitle && <p className="mt-2 max-w-2xl text-gray-500">{subtitle}</p>}
    </div>
  );
}
