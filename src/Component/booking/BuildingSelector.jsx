
"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { HiLocationMarker } from "react-icons/hi";

const PROJECT_META = {
  "prime-mall": {
    status: "Delivered Project",
    subtitle: "Commercial",
    availability: "Resale Available",
  },
  "prime-mall-and-suites": {
    status: "Ongoing Project",
    subtitle: "Commercial & Furnished Apartments",
    availability: "Booking Available",
  },
  "prime-gold": {
    status: "Coming Soon",
    subtitle: "Premium Residential",
    availability: "Booking Available",
  },
};

const cardContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.18, delayChildren: 0.12 } },
};

const cardFade = {
  hidden: { opacity: 0, y: 48 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 1.05, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function BuildingSelector({
  buildings,
  selectedId,
  onSelect,
}) {
  return (
    <motion.div
      className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-5 md:grid-cols-3 lg:gap-6"
      variants={cardContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
    >
      {buildings.map((building) => {
        const selected = selectedId === building.id;
        const meta = PROJECT_META[building.id];

        const isAmberTitle = [
          "prime-mall-and-suites",
          "prime-gold",
        ].includes(building.id);

        return (
          <motion.button
            key={building.id}
            type="button"
            onClick={() => onSelect(building.id, "overview")}
            aria-pressed={selected}
            aria-label={`Explore ${building.name}`}
            variants={cardFade}
            whileTap={{ scale: 0.99 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className={`
              relative block w-full
              h-[380px] md:h-[430px] lg:h-[510px]
              cursor-pointer overflow-hidden
              rounded-2xl lg:rounded-[28px]
              border-4 text-left
              transition-all duration-500
              focus-visible:outline-none
              focus-visible:ring-4
              focus-visible:ring-[#c29e6d]/40
              ${selected
                ? "border-[#c29e6d] ring-2 ring-[#c29e6d]/30 shadow-[0_12px_40px_rgba(194,158,109,0.35)]"
                : "border-transparent shadow-lg"
              }
            `}
          >
            {/* Building Image */}
            {building.image && (
              <Image
                src={building.image}
                alt={building.name}
                fill
                sizes="(max-width: 767px) 100vw, (max-width: 1023px) 33vw, 33vw"
                className="object-cover"
              />
            )}

            {/* Image Gradient */}
            <div
              className="
                absolute inset-0
                bg-gradient-to-t
                from-black/95 via-black/30 to-black/15
              "
            />

            {/* Top Badges */}
            <div
              className="
                absolute inset-x-0 top-0
                flex flex-wrap items-start
                justify-between gap-2
                p-3 lg:p-5
              "
            >
              <span
                className="
                  rounded-full
                  border border-white/15
                  bg-black/65
                  px-3 py-1.5
                  text-[10px] lg:text-xs
                  font-semibold text-white
                  backdrop-blur-md
                  whitespace-nowrap
                "
              >
                {meta?.status ?? "Project"}
              </span>

              <span
                className="
                  rounded-full
                  bg-[#c29e6d]
                  px-3 py-1.5
                  text-[10px] lg:text-xs
                  font-bold text-black
                  shadow-sm
                  whitespace-nowrap
                "
              >
                {meta?.availability ?? "Booking Available"}
              </span>
            </div>

            {/* Bottom Building Details */}
            <div
              className="
                absolute inset-x-0 bottom-0
                p-4 lg:p-6
                pb-6 lg:pb-9
                text-white
              "
            >
              {/* Gold Accent */}
              <div className="mb-3 h-[2px] w-14 bg-[#c29e6d] lg:w-16" />

              {/* Building Name */}
              <h3
                className={`
                  parisienne-font
                  text-3xl lg:text-4xl
                  font-bold leading-tight
                  ${isAmberTitle
                    ? "text-amber-400"
                    : "text-white"
                  }
                `}
              >
                {building.name}
              </h3>

              {/* Building Type */}
              <p
                className="
                  mt-2
                  text-sm lg:text-base
                  font-medium tracking-wide
                  text-white/85
                  leading-relaxed
                "
              >
                {meta?.subtitle ?? building.projectType}
              </p>

              {/* Dynamic Location */}
              {building.location && (
                <div className="mt-3 flex items-start gap-2 text-white/75">
                  <HiLocationMarker
                    className="mt-0.5 shrink-0 text-base text-[#c29e6d]"
                  />

                  <p
                    className="
                      min-w-0
                      line-clamp-2
                      text-xs lg:text-sm
                      leading-relaxed
                    "
                  >
                    {building.location}
                  </p>
                </div>
              )}
            </div>
          </motion.button>
        );
      })}
    </motion.div>
  );
}
