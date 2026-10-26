"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { HiChevronDown, HiOutlineListBullet, HiOutlineSquares2X2, HiXMark } from "react-icons/hi2";
import UnitCard, { UnitRow, StatusDot, statusColors, unitClass, unitTypeKey, MobileFiltersDrawer, MobileFiltersButton } from "./UnitCard";
import UnitDetail from "./UnitDetail";
import { categoryLabel, getBuildingTypeIds } from "./FindYourUnit";

const byNumber = (a, b) => String(a.number).localeCompare(String(b.number), undefined, { numeric: true });
// Missing values sort last in either direction.
const byField = (field, dir) => (a, b) => {
  const x = Number.isFinite(Number(a[field])) && a[field] != null ? Number(a[field]) : null;
  const y = Number.isFinite(Number(b[field])) && b[field] != null ? Number(b[field]) : null;
  if (x == null || y == null) return x == null ? (y == null ? 0 : 1) : -1;
  return (x - y) * dir;
};
const SORTS = [
  { id: "floor", label: "Unit Order", cmp: byNumber },
  { id: "price-asc", label: "Price: Low to High", cmp: byField("pricePkr", 1) },
  { id: "price-desc", label: "Price: High to Low", cmp: byField("pricePkr", -1) },
  { id: "size-asc", label: "Size: Small to Large", cmp: byField("areaSqFt", 1) },
  { id: "size-desc", label: "Size: Large to Small", cmp: byField("areaSqFt", -1) },
];

function FilterChip({ name, active, onClick }) {
  const c = name === "All" ? null : statusColors(name);
  const style = !c
    ? undefined
    : { backgroundColor: c.bg, color: c.text, borderColor: active ? c.dot : `${c.text}30`, boxShadow: active ? `0 0 0 2px ${c.dot}33` : undefined };
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={style}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 240, damping: 20 }}
      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c29e6d] ${c ? "" : active ? "border-[#153D29] bg-[#153D29] text-white" : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
        }`}
    >
      {c && <StatusDot status={name} />}
      {name}
    </motion.button>
  );
}
function floorDescription(units) {
  const classes = new Set(units.map(unitClass).filter(Boolean));
  if (classes.size > 1) return "Commercial & Residential Properties";
  if (classes.has("Residential")) return "Residential Properties";
  if (classes.has("Commercial")) return "Commercial Properties";
  return "Properties";
}
function FloorHeading({ floor, units }) {
  const available = units.filter((u) => u.status === "Available").length;
  const booked = units.filter((u) => u.status === "Booked").length;
  return (
    <motion.div
      className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-4 border-b border-gray-200 pb-5"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="w-full text-center md:w-auto md:text-left">
        <h3 className="parisienne-font text-3xl font-normal leading-tight text-[#153D2A] md:text-[40px]">{floor.name}</h3>
        <motion.div
          className="mx-auto mt-2 h-[2px] w-20 origin-center bg-[#c29e6d] md:mx-0 md:origin-left md:w-24"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        />
        <p className="mt-2 text-base text-[#87918B] md:text-[17px]">{floorDescription(units)}</p>
      </div>
      <div className="w-full text-center md:ml-auto md:w-auto md:text-right">
        <p className="flex items-baseline justify-center gap-2 md:justify-end">
          <span className="text-2xl font-normal tabular-nums text-[#153D2A]">{units.length}</span>
          <span className="text-[13px] font-medium uppercase tracking-wider text-[#A58253] md:text-sm">{units.length === 1 ? "Unit" : "Units"}</span>
        </p>
        <p className="mt-1 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-[13px] md:justify-end md:text-sm">
          {available > 0 && (
            <span className="flex items-center gap-1.5 text-[#008E53]">
              <span className="h-2 w-2 rounded-full bg-[#008E53]" />
              {available} Available
            </span>
          )}
          {booked > 0 && (
            <span className="flex items-center gap-1.5 text-[#9E7748]">
              <span className="h-2 w-2 rounded-full bg-[#C5A06B]" />
              {booked} Booked
            </span>
          )}
        </p>
      </div>
    </motion.div>
  );
}


function CustomSortDropdown({ sortId, onSortId, sorts }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const handleOutside = (event) => {
      if (!dropdownRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", handleOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={dropdownRef} className="relative w-full ">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-11 w-full cursor-pointer items-center justify-between gap-4 rounded-xl border border-[#d1b38c] bg-white px-4 py-2.5 text-left text-sm font-semibold text-[#0f3d20] shadow-sm transition-colors hover:border-[#c29e6d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c29e6d]/40"
      >
        <span className="whitespace-nowrap">
          {sorts.find((s) => s.id === sortId)?.label ?? "Unit Order"}
        </span>

        <HiChevronDown
          className={`shrink-0 text-lg text-[#8B5E3C] transition-transform duration-200 ${open ? "rotate-180" : ""
            }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="listbox"
            aria-label="Sort units"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 right-0 top-full z-[1000] mt-2 overflow-hidden rounded-xl border border-[#E8DFD2] bg-white p-1.5 shadow-xl"
          >
            {sorts.map((sort) => {
              const active = sortId === sort.id;

              return (
                <button
                  key={sort.id}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onSortId(sort.id);
                    setOpen(false);
                  }}
                  className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-3 text-left text-xs font-semibold transition-colors ${active
                    ? "bg-[#0f3d20] text-white"
                    : "text-[#153D2A] hover:bg-[#F7F2EA]"
                    }`}
                >
                  {sort.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


function CustomFloorDropdown({ floors, selectedFloorId, onFloorChange }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const handleOutside = (event) => {
      if (!dropdownRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", handleOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const selectedFloor = floors.find(
    (floor) => String(floor.id) === String(selectedFloorId)
  );

  const options = [
    { id: null, name: "All Floors" },
    ...floors,
  ];

  return (
    <div ref={dropdownRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-4 rounded-xl border border-[#d1b38c] bg-white px-4 py-2.5 text-left text-sm font-semibold text-[#0f3d20] shadow-sm transition-colors hover:border-[#c29e6d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c29e6d]/40"
      >
        <span className="whitespace-nowrap">
          {selectedFloor?.name ?? "All Floors"}
        </span>
        <HiChevronDown
          className={`shrink-0 text-lg text-[#8B5E3C] transition-transform duration-200 ${open ? "rotate-180" : ""
            }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="listbox"
            aria-label="Select floor"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 right-0 top-full z-[1000] mt-2 max-h-64 overflow-y-auto rounded-xl border border-[#E8DFD2] bg-white p-1.5 shadow-xl"
          >
            {options.map((floor) => {
              const active =
                floor.id === null
                  ? selectedFloorId === null
                  : String(selectedFloorId) === String(floor.id);

              return (
                <button
                  key={floor.id ?? "all"}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onFloorChange(floor.id);
                    setOpen(false);
                  }}
                  className={`flex w-full cursor-pointer items-center rounded-lg px-3 py-3 text-left text-xs font-semibold transition-colors ${active
                    ? "bg-[#0f3d20] text-white"
                    : "text-[#153D2A] hover:bg-[#F7F2EA]"
                    }`}
                >
                  {floor.name}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


function FloorUnitListing({
  floor,
  units,
  view,
  selectedKey,
  keyOf,
  onSelectUnit,
  Item,
}) {
  const [visibleCount, setVisibleCount] = useState(8);

  // Restart at 7 when this floor's filter or sort results change.
  const unitKeys = units.map((u) => u.id).join("|");

  useEffect(() => {
    setVisibleCount(8);
  }, [unitKeys, view]);

  const visibleUnits = units.slice(0, visibleCount);
  const hasMore = visibleCount < units.length;

  const showMore = () => {
    setVisibleCount((prev) => Math.min(prev + 5, units.length));
  };

  const showAll = () => {
    setVisibleCount(units.length);
  };

  return (
    <div>
      <FloorHeading floor={floor} units={units} />

      <div
        className={
          view === "grid"
            ? selectedKey
              ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-4"
              : "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5"
            : "flex flex-col gap-3"
        }
      >
        <AnimatePresence initial={false}>
          {visibleUnits.map((u, index) => {
            const key = keyOf(floor, u);

            return (
              <div key={key} data-unit-key={key} className="min-w-0">
                <Item
                  unit={u}
                  floor={floor}
                  index={index}
                  isActive={key === selectedKey}
                  onSelect={() => onSelectUnit(key)}
                />
              </div>
            );
          })}
        </AnimatePresence>

        {hasMore && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className={
              view === "grid"
                ? selectedKey
                  ? "flex flex-wrap items-center justify-start gap-3 self-center sm:col-span-2 lg:col-span-1 2xl:col-span-2 lg:pl-3"
                  : "flex flex-wrap items-center justify-start gap-3 self-center sm:col-span-2 lg:col-span-2 lg:pl-4"
                : "flex flex-wrap items-center justify-start gap-3"
            }
          >
            <button
              type="button"
              onClick={showMore}
              className="inline-flex h-10 cursor-pointer items-center justify-center whitespace-nowrap rounded-xl border border-[#c29e6d] bg-white px-5 text-sm font-semibold text-[#0f3d20] transition-colors hover:bg-[#f7f2ea] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c29e6d]"
            >
              See More
            </button>

            <button
              type="button"
              onClick={showAll}
              className="inline-flex h-10 cursor-pointer items-center justify-center whitespace-nowrap rounded-xl bg-[#0f3d20] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#16562f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c29e6d]"
            >
              See All
            </button>
          </motion.div>
        )}

      </div>
    </div>
  );
}

export default function FloorExplorer({ building, selectedTypes = [], onTypesChange }) {
  const unitsRef = useRef(null);
  const floors = Array.isArray(building?.floors) ? building.floors : [];
  const [selectedKey, setSelectedKey] = useState(null); // `${buildingId}:${floorId}:${unitId}`
  const [statusFilter, setStatusFilter] = useState(null);
  const [sortId, setSortId] = useState("floor");
  const [selectedFloorId, setSelectedFloorId] = useState(null);
  const [view, setView] = useState("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const mobileFilterCount = (statusFilter ? 1 : 0) + (sortId !== "floor" ? 1 : 0) + (view !== "grid" ? 1 : 0) + (selectedFloorId !== null ? 1 : 0) +
    selectedTypes.length;
  const explorerRef = useRef(null);
  const [isExplorerVisible, setIsExplorerVisible] = useState(false);

  // Floors in building order with their matching, sorted units.

  const groups = useMemo(() => {
    const cmp = SORTS.find((s) => s.id === sortId)?.cmp ?? byNumber;

    return (building?.floors ?? [])
      .filter(
        (floor) =>
          selectedFloorId === null ||
          String(floor.id) === String(selectedFloorId)
      )
      .map((floor) => ({
        floor,
        units: (floor.units ?? [])
          .filter(
            (u) =>
              !selectedTypes.length ||
              selectedTypes.includes(unitTypeKey(u))
          )
          .filter(
            (u) => !statusFilter || u.status === statusFilter
          )
          .sort(cmp),
      }))
      .filter((g) => g.units.length);
  }, [building, selectedTypes, statusFilter, sortId, selectedFloorId]);

  const keyOf = (f, u) => `${building.id}:${f.id}:${u.id}`;
  const selected = groups.flatMap((g) => g.units.map((u) => ({ floor: g.floor, unit: u }))).find((e) => keyOf(e.floor, e.unit) === selectedKey) ?? null;
  const unit = selected?.unit ?? null;
  const floor = selected?.floor ?? null;


  useEffect(() => {
    const updateVisibility = () => {
      const element = unitsRef.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;

      setIsExplorerVisible(
        rect.top <= viewportCenter &&
        rect.bottom >= viewportCenter
      );
    };

    window.addEventListener("scroll", updateVisibility, {
      passive: true,
    });

    window.addEventListener("resize", updateVisibility);

    updateVisibility();

    return () => {
      window.removeEventListener("scroll", updateVisibility);
      window.removeEventListener("resize", updateVisibility);
    };
  }, []);


  useEffect(() => {
    if (!isExplorerVisible) {
      setFiltersOpen(false);
    }
  }, [isExplorerVisible]);

  useEffect(() => {
    if (!unit || window.matchMedia("(min-width: 1024px)").matches) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [unit]);

  // Some projects do not yet have published floor inventory.
  if (!floors.length) {
    return (
      <motion.div
        className="mt-10 rounded-[26px] border border-[#d1b38c]/40 bg-white px-6 py-14 text-center shadow-lg shadow-black/5 lg:mt-16"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-[#d1b38c] bg-[#d1b38c]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#8B5E3C]">
          Floor Plan
        </span>
        <h2 className="parisienne-font mt-4 text-3xl text-[#0f3d20] lg:text-4xl">
          Floor Plans Coming Soon
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-gray-500">
          Floor plans and unit availability for {building?.name ?? "this project"} are not available yet.
        </p>
      </motion.div>
    );
  }

  const onSelectUnit = (key) => {
    const clickedCard = document.querySelector(
      `[data-unit-key="${CSS.escape(key)}"]`
    );

    const previousTop = clickedCard?.getBoundingClientRect().top ?? null;

    setSelectedKey(key);

    if (previousTop !== null) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const updatedCard = document.querySelector(
            `[data-unit-key="${CSS.escape(key)}"]`
          );

          if (!updatedCard) return;

          const newTop = updatedCard.getBoundingClientRect().top;

          window.scrollBy({
            top: newTop - previousTop,
            behavior: "instant",
          });
        });
      });
    }
  };

  const Item = view === "grid" ? UnitCard : UnitRow;
  return (
    <div
      ref={explorerRef}
      className="space-y-10 md:space-y-14 lg:space-y-16"
    >
      <section ref={unitsRef} className="mt-[130px] lg:mt-[160px]">
        <div className="mx-auto mb-30 md:mb-24 lg:mb-28 max-w-2xl text-center">
          <motion.span
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 rounded-full border border-[#d1b38c] bg-[#d1b38c]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#8B5E3C] shadow-2xs"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#d1b38c]" />
            Explore the Collection
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.1, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="mt-3 text-3xl md:text-4xl lg:text-5xl parisienne-font text-[#0f3d20]"
          >
            Explore Our Units
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.0, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mt-3 h-[2px] w-20 origin-center bg-linear-to-r from-transparent via-[#c29e6d] to-transparent"
          />
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.0, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="mt-3 text-xs md:text-sm text-gray-500 max-w-md mx-auto"
          >
            Find your ideal property, floor by floor.
          </motion.p>
        </div>
        {/* Mobile toolbar */}
        <div className="mb-6 lg:hidden">

          {/* Floating Mobile Filters */}
          <div className="fixed right-3 top-1/2 z-[999] -translate-y-1/2 lg:hidden">
            <div className="relative me-28">
              <MobileFiltersDrawer
                open={filtersOpen}
                onClose={() => setFiltersOpen(false)}
                statusFilter={statusFilter}
                onStatusFilter={setStatusFilter}
                sortId={sortId}
                onSortId={setSortId}
                view={view}
                onView={setView}
                sorts={SORTS}
                floors={floors}
                selectedFloorId={selectedFloorId}
                onFloorChange={setSelectedFloorId}
                selectedTypes={selectedTypes}
                onTypesChange={onTypesChange}
              />

              {/* Floating Mobile Filters */}
              <AnimatePresence>
                {isExplorerVisible && (
                  <motion.div
                    initial={{ opacity: 0, x: 80, y: "-50%" }}
                    animate={{ opacity: 1, x: 0, y: "-50%" }}
                    exit={{ opacity: 0, x: 80, y: "-50%" }}
                    transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                    className="fixed right-3 top-1/2 z-[999] lg:hidden"
                  >
                    <div className="rounded-full bg-white/95 p-1 shadow-lg">
                      <MobileFiltersButton
                        open={filtersOpen}
                        onClick={() => setFiltersOpen((prev) => !prev)}
                        activeCount={mobileFilterCount}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>

        {/* Desktop toolbar */}
        <motion.div
          className="mb-6 hidden flex-col items-stretch gap-4 lg:flex lg:flex-row lg:flex-wrap lg:items-center lg:justify-between lg:gap-3"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex flex-wrap items-center justify-start gap-2">
            <FilterChip name="All" active={!statusFilter} onClick={() => setStatusFilter(null)} />
            <FilterChip name="Available" active={statusFilter === "Available"} onClick={() => setStatusFilter(statusFilter === "Available" ? null : "Available")} />
            <FilterChip name="Booked" active={statusFilter === "Booked"} onClick={() => setStatusFilter(statusFilter === "Booked" ? null : "Booked")} />
            {selectedTypes.map((id) => (
              <span key={id} className="inline-flex items-center gap-1 rounded-full border border-[#c29e6d]/60 bg-white py-1 pl-3 pr-1.5 text-xs font-semibold text-[#8B5E3C]">
                {categoryLabel(id)}
                <button
                  type="button"
                  onClick={() => onTypesChange?.(selectedTypes.filter((t) => t !== id))}
                  aria-label={`Remove ${categoryLabel(id)} filter`}
                  className="grid h-4 w-4 cursor-pointer place-items-center rounded-full transition-colors hover:bg-[#c29e6d]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c29e6d]"
                >
                  <HiXMark className="text-xs" aria-hidden="true" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex w-full flex-row flex-nowrap items-center justify-end gap-2 lg:w-auto">
            {/* Floor dropdown */}
            <div className="w-[210px] shrink-0">
              <CustomFloorDropdown
                floors={floors}
                selectedFloorId={selectedFloorId}
                onFloorChange={setSelectedFloorId}
              />
            </div>

            {/* Unit sort dropdown */}
            <div className="w-[210px] shrink-0">
              <CustomSortDropdown
                sortId={sortId}
                onSortId={setSortId}
                sorts={SORTS}
              />
            </div>

            {/* Grid / List toggle */}
            <div
              role="group"
              aria-label="Layout"
              className="flex shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-white"
            >
              {[
                ["grid", HiOutlineSquares2X2, "Grid view"],
                ["list", HiOutlineListBullet, "List view"],
              ].map(([id, Icon, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setView(id)}
                  aria-pressed={view === id}
                  aria-label={label}
                  className={`grid h-10 w-10 cursor-pointer place-items-center text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#c29e6d] ${view === id
                    ? "bg-[#0f3d20] text-white"
                    : "text-gray-500 hover:text-[#0f3d20]"
                    }`}
                >
                  <Icon aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>

        </motion.div>

        <MobileFiltersDrawer
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          statusFilter={statusFilter}
          onStatusFilter={setStatusFilter}
          sortId={sortId}
          onSortId={setSortId}
          view={view}
          onView={setView}
          sorts={SORTS}
        />

        {/* Unit listing and detail sidebar */}
        <div
          className={
            unit
              ? "lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(300px,24%)] lg:items-stretch lg:gap-4"
              : ""
          }
        >
          {/* Left side: Unit cards */}
          <div className="min-w-0 w-full">
            {groups.length ? (
              <div className="space-y-20 lg:space-y-26">
                {groups.map(({ floor: f, units }) => (
                  <FloorUnitListing
                    key={f.id}
                    floor={f}
                    units={units}
                    view={view}
                    selectedKey={selectedKey}
                    keyOf={keyOf}
                    onSelectUnit={onSelectUnit}
                    Item={Item}
                  />
                ))}
              </div>
            ) : (
              <motion.div
                className="rounded-3xl border border-dashed border-gray-300 p-10 text-center text-sm text-gray-500"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                No units match these filters.
              </motion.div>
            )}
          </div>

          {/* Right side: Sticky Unit Detail */}
          {unit && (
            <aside
              aria-label="Unit details"
              className="hidden min-w-0 lg:block"
            >
              <div className="sticky top-3 flex h-[calc(100dvh-1.5rem)] items-center justify-center">
                <UnitDetail
                  layout="sidebar"
                  building={building}
                  floor={floor}
                  unit={unit}
                  onClose={() => setSelectedKey(null)}
                />
              </div>
            </aside>
          )}
        </div>

      </section>
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {unit && (
              <motion.div
                className="fixed inset-0 z-[10000] flex items-end justify-center bg-black/50 px-0 pb-0 pt-10 sm:items-center sm:px-3 sm:py-3 lg:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => setSelectedKey(null)}
              >
                <motion.div
                  data-lenis-prevent
                  className="max-h-[min(92dvh,720px)] w-full max-w-xl overflow-y-auto rounded-t-3xl sm:rounded-3xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-[env(safe-area-inset-bottom)]"
                  initial={{ y: 36 }}
                  animate={{ y: 0 }}
                  exit={{ y: 28 }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <UnitDetail
                    layout="modal"
                    building={building}
                    floor={floor}
                    unit={unit}
                    onClose={() => setSelectedKey(null)}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
