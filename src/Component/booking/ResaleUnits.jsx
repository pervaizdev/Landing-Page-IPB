"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { HiArrowUpRight } from "react-icons/hi2";
import {
  formatArea,
  formatMillions,
  StatusDot,
  statusColors,
} from "./UnitCard";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.12 } },
};

function saleLabel(unit) {
  const type = String(unit?.type ?? "Unit").trim();
  const code = String(unit?.number ?? "").trim();
  // LG 05 -> Shop 05, 106 -> Office 106
  const short = code.replace(/^LG\s*/i, "").trim();
  return `${type} ${short}`;
}

function StatusBadge({ status = "Available" }) {
  const c = statusColors(status);
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
      style={{ backgroundColor: c.bg, color: c.text }}
    >
      <StatusDot status={status} />
      {status}
    </span>
  );
}

function Metric({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold tabular-nums text-gray-800">
        {value}
      </p>
    </div>
  );
}

function SaleCard({ unit, index }) {
  return (
    <motion.article
      variants={fadeUp}
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm transition-shadow duration-500 hover:shadow-md"
    >
      <div className="flex min-h-14 flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h4 className="break-words text-md font-bold leading-tight tracking-tight text-[#0f3d20]">
            {saleLabel(unit)}
          </h4>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-[#8B5E3C]">
            {unit.floor}
          </p>
        </div>
        <StatusBadge status={unit.status || "Available"} />
      </div>

      <div className="mt-4 rounded-xl bg-[#f7f2ea] p-3.5">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8B5E3C]">
          Total Price
        </p>
        <p className="mt-1 text-2xl font-extrabold tabular-nums text-[#0f3d20]">
          {formatMillions(unit.pricePkr)}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Metric label="Area" value={formatArea(unit.areaSqFt)} />
        <Metric label="Unit" value={unit.number} />
      </div>

      <Link
        href="/contact"
        className="group/btn mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-[#0f3d20] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#16562f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c29e6d] focus-visible:ring-offset-2"
      >
        Contact Us
        <HiArrowUpRight
          className="text-sm transition-transform duration-300 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5"
          aria-hidden="true"
        />
      </Link>
    </motion.article>
  );
}

export default function ResaleUnits({ building }) {
  const units = building?.resaleUnits ?? [];

  return (
    <section
      className="mx-auto max-w-5xl px-1 mt-[140px] text-center md:px-0"
      aria-labelledby="sale-units-heading"
    >
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
        id="sale-units-heading"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.1, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        className="mt-3 text-4xl parisienne-font text-[#0f3d20] lg:text-5xl"
      >
        Units Available for ReSale
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
        className="mx-auto mt-12 max-w-2xl text-sm leading-relaxed text-gray-500 md:text-base"
      >
        Explore selected units currently available for sale at {building.name}.
        Contact us for availability, site visits, and purchase details.
      </motion.p>

      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
        className="mt-20 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3"
      >
        {units.map((unit, index) => (
          <SaleCard key={unit.id} unit={unit} index={index} />
        ))}
      </motion.div>
    </section>
  );
}
