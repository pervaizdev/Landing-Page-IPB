"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  LuLayoutGrid,
  LuStore,
  LuUtensilsCrossed,
  LuDumbbell,
  LuHouse,
  LuBedSingle,
  LuBedDouble,
  LuBuilding2,
} from "react-icons/lu";
import { unitTypeKey } from "./UnitCard";

// Preferred display order; types not listed here follow in data order.
const TYPE_ORDER = ["shop", "restaurant", "gym", "office", "studio", "1-bed", "2-bed"];

const TYPE_LABELS = {
  shop: "Shops",
  restaurant: "Restaurants",
  gym: "Gyms",
  office: "Offices",
  studio: "Studios",
};

const TYPE_ICONS = {
  shop: LuStore,
  restaurant: LuUtensilsCrossed,
  gym: LuDumbbell,
  office: LuBuilding2,
  studio: LuHouse,
  "1-bed": LuBedSingle,
  "2-bed": LuBedDouble,
};
function categoryIcon(id) {
  return TYPE_ICONS[id] ?? LuBuilding2;
}

export function categoryLabel(id) {
  const bed = id.match(/^(\d+)-bed$/);
  if (bed) return `${bed[1]} ${Number(bed[1]) === 1 ? "Bedroom" : "Bedrooms"}`;
  return TYPE_LABELS[id] ?? id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Property types present in a building's inventory, as stable ids. */
export function getBuildingTypeIds(building) {
  const ids = new Set();
  (building?.floors ?? []).forEach((f) => (f.units ?? []).forEach((u) => ids.add(unitTypeKey(u))));
  const rank = (id) => (TYPE_ORDER.includes(id) ? TYPE_ORDER.indexOf(id) : TYPE_ORDER.length);
  return [...ids].sort((a, b) => rank(a) - rank(b));
}

const typeContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.18 } },
};

const typeFade = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  },
};

function CategoryCard({ label, Icon, active, onClick }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      variants={typeFade}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
      className={`flex h-24 w-[calc((100%-0.75rem)/2)] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border px-2 text-center transition-all duration-500 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c29e6d] sm:w-[calc((100%-1.5rem)/3)] lg:w-[calc((100%-3rem)/5)] ${active
        ? "border-[#c29e6d] bg-[#c29e6d]/10 shadow-sm"
        : "border-gray-200 bg-white hover:border-[#d1b38c]"
        }`}
    >
      <Icon className={`text-2xl transition-colors ${active ? "text-[#8B5E3C]" : "text-[#c29e6d]"}`} aria-hidden="true" />
      <span className={`text-xs font-semibold md:text-sm ${active ? "text-[#0f3d20]" : "text-gray-700"}`}>{label}</span>
    </motion.button>
  );
}

/**
 * Property-type selector. `selected` is an array of type ids; an empty array
 * means "All Units". Calls `onChange` with the next array.
 */
export default function FindYourUnit({ building, selected, onChange }) {
  const typeIds = useMemo(() => getBuildingTypeIds(building), [building]);
  if (!typeIds.length) return null;

  const toggle = (id) => {
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  };

  return (
    <section className="mx-auto max-w-5xl px-1 mt-[140px] text-center md:px-0" aria-labelledby="find-your-unit-heading">
      <motion.span
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="inline-flex items-center gap-2 rounded-full border border-[#d1b38c] bg-[#d1b38c]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#8B5E3C] shadow-2xs"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[#d1b38c]" />
        {building.name}
      </motion.span>
      <motion.h2
        id="find-your-unit-heading"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.1, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        className="mt-3 text-4xl parisienne-font text-[#0f3d20] lg:text-5xl"
      >
        Choose Your Unit
      </motion.h2>
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.0, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto mt-4 h-[2px] w-20 origin-center bg-linear-to-r from-transparent via-[#c29e6d] to-transparent"
      />
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.0, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className="mt-4 text-sm text-gray-500 md:text-base"
      >
        Explore the spaces designed for you.
      </motion.p>

      <motion.div
        role="group"
        aria-label="Property types"
        className="mt-8 flex flex-wrap justify-center gap-3"
        variants={typeContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
      >
        <CategoryCard label="All Units" Icon={LuLayoutGrid} active={selected.length === 0} onClick={() => onChange([])} />
        {typeIds.map((id) => (
          <CategoryCard key={id} label={categoryLabel(id)} Icon={categoryIcon(id)} active={selected.includes(id)} onClick={() => toggle(id)} />
        ))}
      </motion.div>
    </section>
  );
}
