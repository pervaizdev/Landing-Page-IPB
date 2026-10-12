"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { HiLocationMarker } from "react-icons/hi";
import { HiBuildingOffice2, HiHomeModern, HiSquares2X2, HiBanknotes } from "react-icons/hi2";
import bookingData from "@/data/booking.json";
import { statusStyle } from "./UnitCard";
import { summarizeUnits } from "./FloorStack";

const STATUSES = bookingData.config.statuses;

export const allUnits = (building) => building.floors.flatMap((f) => f.units);

// Price shown in Million / Billion (e.g. 5.88 Million, 1.2 Billion)
const formatMillionPKR = (value) => {
  if (value == null) return "—";
  const trim = (n) => n.toFixed(2).replace(/\.?0+$/, "");
  if (value >= 1_000_000_000) return `${trim(value / 1_000_000_000)} Billion`;
  if (value >= 1_000_000) return `${trim(value / 1_000_000)} Million`;
  return `${Math.round(value).toLocaleString("en-PK")}`;
};

function StatusBar({ counts, total }) {
  if (!total) return <div className="h-2.5 rounded-full bg-gray-100" />;
  return (
    <div className="flex h-2.5 overflow-hidden rounded-full bg-gray-100">
      {STATUSES.map((s) =>
        counts[s] ? (
          <motion.div
            key={s}
            initial={{ width: 0 }}
            animate={{ width: `${(counts[s] / total) * 100}%` }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            style={{ backgroundColor: statusStyle(s).fill }}
            title={`${s}: ${counts[s]}`}
          />
        ) : null
      )}
    </div>
  );
}

function SummaryCard({ icon: Icon, title, data }) {
  return (
    <div className="group rounded-[26px] sm:rounded-[30px] border border-[#d1b38c]/40 bg-white p-5 sm:p-6 lg:p-7 shadow-lg shadow-black/5 transition-all duration-500 hover:-translate-y-1 hover:border-[#c29e6d] hover:shadow-xl text-left">
      <div className="flex items-center gap-3.5 sm:gap-4">
        <Icon className="text-3xl sm:text-4xl text-[#c29e6d] shrink-0" />
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#8B5E3C]">{title}</p>
          <p className="parisienne-font text-2xl sm:text-3xl lg:text-4xl text-black mt-0.5">{data.total} units</p>
        </div>
      </div>

      <div className="mt-4 sm:mt-5 h-px bg-linear-to-r from-[#c29e6d]/60 via-[#c29e6d]/20 to-transparent" />

      <div className="mt-4 sm:mt-5">
        <StatusBar counts={data} total={data.total} />
      </div>

      <div className="mt-4 sm:mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {STATUSES.map((s) => (
          <div key={s} className="rounded-2xl border border-gray-100 bg-gray-50/70 p-2.5 sm:p-3 transition-colors group-hover:border-[#d1b38c]/40">
            <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-gray-500 font-medium">
              <span className={`h-2 w-2 rounded-full ${statusStyle(s).dot} shrink-0`} />
              <span className="truncate">{s}</span>
            </div>
            <p className="mt-1 text-lg sm:text-xl font-bold text-gray-900">{data[s] ?? 0}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BuildingOverview({ building }) {
  const units = allUnits(building);
  const summary = summarizeUnits(units);
  const isDemo = building.inventoryIsTemporary || building.availabilityIsDemo;

  const facts = [
    { icon: HiSquares2X2, label: "Floors", value: building.totalFloors ?? building.floors.length },
    { icon: HiBuildingOffice2, label: "Total units", value: summary.total },
    { icon: HiBanknotes, label: "Starting from", value: formatMillionPKR(building.startingPricePkr) },
  ];

  return (
    <motion.div
      key={building.id}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="grid grid-cols-1 lg:grid-cols-5 gap-6 text-left"
    >
      <div className="relative lg:col-span-2 overflow-hidden rounded-[26px] sm:rounded-[30px] bg-[#111] p-5 sm:p-7 lg:p-8 text-white shadow-xl flex flex-col justify-between min-h-[460px] sm:min-h-[500px]">
        {building.image && (
          <Image
            src={building.image}
            alt={building.name}
            fill
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/80 to-black/60" />

        <div className="relative z-10 flex flex-wrap items-center gap-2 mb-8 sm:mb-12">
          <span className="rounded-full bg-[#c29e6d] px-3.5 sm:px-4 py-1.5 text-xs font-semibold text-black">
            {building.projectType}
          </span>
          {isDemo && (
            <span className="rounded-full border border-white/30 bg-black/50 px-3.5 sm:px-4 py-1.5 text-xs text-white/90 backdrop-blur-md">
              Booking Available
            </span>
          )}
        </div>

        <div className="relative z-10 mt-auto">
          <h2 className="parisienne-font text-3xl sm:text-4xl lg:text-5xl text-[#c29e6d] leading-tight">{building.name}</h2>
          <p className="mt-3 flex items-center gap-2 text-xs sm:text-sm text-white/85">
            <HiLocationMarker className="text-lg sm:text-xl text-[#c29e6d] shrink-0" />
            <span>{building.location}</span>
          </p>
          <hr className="my-4 sm:my-5 border-white/20" />
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed">{building.description}</p>

          <div className="mt-5 sm:mt-6 grid grid-cols-3 gap-2 sm:gap-3">
            {facts.map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-2xl border border-white/15 bg-black/50 p-2.5 sm:p-3 backdrop-blur-md">
                <Icon className="text-lg sm:text-xl text-[#c29e6d]" />
                <p className="mt-1.5 text-[10px] sm:text-[11px] uppercase tracking-wider text-white/60 truncate">{label}</p>
                <p className="mt-0.5 text-xs sm:text-sm font-semibold truncate text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-3 grid grid-cols-1 gap-5 sm:gap-6">
        <SummaryCard icon={HiBuildingOffice2} title="Commercial (shops, restaurants, gym)" data={summary.commercial} />
        <SummaryCard icon={HiHomeModern} title="Apartments (studio, 1 & 2 bed)" data={summary.apartments} />
      </div>
    </motion.div>
  );
}
