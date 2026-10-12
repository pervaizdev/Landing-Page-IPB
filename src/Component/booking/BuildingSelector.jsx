"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { HiLocationMarker } from "react-icons/hi";
import { HiArrowRight, HiCheck, HiOutlineInformationCircle } from "react-icons/hi2";
import { allUnits } from "./BuildingOverview";
import { projects } from "@/data/card";

// Buildings that have a matching /projects/[slug] detail page
const projectIds = new Set(projects.map((p) => p.id));

const BUILDING_META = {
  "prime-mall": {
    statusTag: "Completed",
    tagStyle: "bg-[#c29e6d] text-black border border-[#e5c488]/60 shadow-sm",
    location: "Plot # 5, Kunwar TopCity-1, Sahara Kashmir Rd",
  },
  "prime-mall-and-suites": {
    statusTag: "On Progress",
    tagStyle: "bg-[#c29e6d] text-black border border-[#e5c488]/60 shadow-sm",
    location: "Plot # 3, K-Block TopCity-1, Islamabad",
  },
  "prime-gold": {
    statusTag: "Coming Soon",
    tagStyle: "bg-[#c29e6d] text-black border border-[#e5c488]/60 shadow-sm",
    location: "TopCity-1, Islamabad",
  },
};

const getBuildingMeta = (building) => {
  if (BUILDING_META[building.id]) return BUILDING_META[building.id];
  const normalized = (building.name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  if (normalized.includes("primemallandsuites")) return BUILDING_META["prime-mall-and-suites"];
  if (normalized.includes("primemall")) return BUILDING_META["prime-mall"];
  if (normalized.includes("primegold")) return BUILDING_META["prime-gold"];
  return null;
};

/**
 * onSelect(id, target) — target is "overview" (card click) or "floors" (Explore Building).
 * Details links to the building's project page.
 */
export default function BuildingSelector({ buildings, selectedId, onSelect }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
      {buildings.map((building, i) => {
        const units = allUnits(building);
        const isActive = building.id === selectedId;
        const meta = getBuildingMeta(building);
        const location = meta?.location || building.location;

        const handle = (target) => (e) => {
          e.stopPropagation();
          onSelect(building.id, target);
        };

        return (
          <motion.div
            key={building.id}
            role="button"
            tabIndex={0}
            onClick={() => onSelect(building.id, "overview")}
            onKeyDown={(e) => {
              if (e.target !== e.currentTarget) return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(building.id, "overview");
              }
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -6 }}
            aria-pressed={isActive}
            className={`group relative h-[380px] sm:h-[420px] lg:h-[460px] w-full cursor-pointer overflow-hidden rounded-[26px] sm:rounded-[30px] text-left shadow-xl outline-none transition-shadow focus-visible:ring-4 focus-visible:ring-[#c29e6d]/60 ${
              isActive ? "ring-4 ring-[#c29e6d] shadow-[#c29e6d]/30" : ""
            }`}
          >
            <Image
              src={building.image}
              alt={building.name}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/45 to-transparent" />
            <div
              className={`absolute inset-0 bg-black/40 transition-opacity duration-500 ${
                selectedId && !isActive ? "opacity-100 group-hover:opacity-0" : "opacity-0"
              }`}
            />

            <div className="absolute inset-0 flex flex-col p-5 sm:p-6 text-white">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="rounded-full px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold bg-black/60 border border-white/20 backdrop-blur-md">
                  {building.projectType}
                </span>
                {meta?.statusTag && (
                  <span
                    className={`rounded-full px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold ${meta.tagStyle}`}
                  >
                    {meta.statusTag}
                  </span>
                )}
              </div>

              <div className="mt-auto">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-white/85">
                  <HiLocationMarker className="text-lg sm:text-xl text-[#c29e6d] shrink-0" />
                  <span className="line-clamp-1" title={location}>{location}</span>
                </div>
                <hr className="my-3 sm:my-4 border-white/25" />
                <h3 className="text-2xl sm:text-3xl font-extrabold leading-tight">{building.name}</h3>

                {/* Action buttons — bottom right */}
                <div className="mt-5 sm:mt-6 flex items-center justify-end gap-2 sm:gap-2.5 flex-wrap">
                  <button
                    type="button"
                    className={`group/btn inline-flex items-center gap-2 rounded-full px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold shadow-lg transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c29e6d]/70 ${
                      isActive
                        ? "bg-linear-to-r from-[#d1b38c] to-[#a8824f] text-black shadow-[#c29e6d]/40"
                        : "bg-[#c29e6d] text-black hover:bg-[#d8b986] hover:shadow-[#c29e6d]/50"
                    }`}
                  >
                    {isActive ? "Selected" : "Explore Building"}
                  </button>
                  {projectIds.has(building.id) && (
                    <Link
                      href={`/projects/${building.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-white/10 px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white backdrop-blur-md transition-all duration-300 hover:border-white hover:bg-white hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                    >
                      Details
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
