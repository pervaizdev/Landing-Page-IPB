
"use client";

import { useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import { motion } from "framer-motion";
import "swiper/css";
import "swiper/css/free-mode";
import bookingData from "@/data/booking.json";
import { unitCategory } from "./UnitCard";

const STATUSES = bookingData.config.statuses;

/* ---------- Shared unit counting helpers ---------- */

export function countByStatus(units) {
  const counts = Object.fromEntries(
    STATUSES.map((s) => [s, 0])
  );

  units.forEach((u) => {
    counts[u.status] = (counts[u.status] ?? 0) + 1;
  });

  return counts;
}

export function summarizeUnits(units) {
  const commercial = units.filter(
    (u) => unitCategory(u) === "Commercial"
  );

  const apartments = units.filter(
    (u) => unitCategory(u) === "Apartment"
  );

  return {
    total: units.length,
    all: countByStatus(units),
    commercial: {
      total: commercial.length,
      ...countByStatus(commercial),
    },
    apartments: {
      total: apartments.length,
      ...countByStatus(apartments),
    },
  };
}

export const floorShortLabel = (floor) => {
  if (floor.level < 0) return "LG";
  if (floor.level === 0) return "G";
  return String(floor.level);
};

/* ---------- Floor Cards ---------- */

export default function FloorStack({
  floors,
  selectedId,
  onSelect,
}) {
  const swiperRef = useRef(null);
  const ordered = [...floors].sort(
    (a, b) => a.level - b.level
  );

  // Smoothly center or bring the selected floor into view when it changes
  useEffect(() => {
    if (!swiperRef.current || !selectedId) return;
    const index = ordered.findIndex((f) => f.id === selectedId);
    if (index !== -1 && typeof swiperRef.current.slideTo === "function") {
      swiperRef.current.slideTo(index, 450);
    }
  }, [selectedId, ordered]);

  return (
    <div className="relative w-full">
      <Swiper
        modules={[FreeMode]}
        freeMode={{
          enabled: true,
          momentum: true,
          momentumRatio: 0.9,
          momentumBounce: true,
          momentumBounceRatio: 0.7,
        }}
        grabCursor={true}
        slideToClickedSlide={true}
        watchSlidesProgress={true}
        speed={450}
        spaceBetween={10}
        slidesPerView={2.3}
        breakpoints={{
          400: { slidesPerView: 2.6, spaceBetween: 12 },
          640: { slidesPerView: 3.4, spaceBetween: 14 },
          768: { slidesPerView: 4, spaceBetween: 16 },
          1024: { slidesPerView: 5, spaceBetween: 16 },
          1280: { slidesPerView: 6, spaceBetween: 16 },
        }}
        className="w-full !py-2 sm:!py-3 select-none cursor-grab active:cursor-grabbing"
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
      >
        {ordered.map((floor, index) => {
          const isActive = floor.id === selectedId;

          return (
            <SwiperSlide
              key={floor.id}
              className="!h-auto"
            >
              <motion.button
                type="button"
                onClick={() => {
                  onSelect(floor.id);
                  if (swiperRef.current && typeof swiperRef.current.slideTo === "function") {
                    swiperRef.current.slideTo(index, 450);
                  }
                }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                aria-pressed={isActive}
                className={`
                  relative flex h-full min-h-[50px] sm:min-h-[62px] w-full
                  items-center justify-center
                  rounded-xl sm:rounded-2xl border
                  px-3 sm:px-5 py-2 sm:py-3
                  text-center
                  cursor-pointer
                  transition-colors duration-200
                  focus-visible:outline-2
                  focus-visible:outline-offset-2
                  focus-visible:outline-[#c29e6d]
                  ${
                    isActive
                      ? "border-[#c29e6d] shadow-md shadow-[#c29e6d]/15"
                      : "border-[#e8ded2] bg-white shadow-xs hover:border-[#c29e6d]/60 hover:shadow-sm"
                  }
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeFloorTabIndicator"
                    className="absolute inset-0 rounded-xl sm:rounded-2xl bg-linear-to-b from-[#faf4eb] to-[#f6eee2] border border-[#c29e6d] pointer-events-none"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <span
                  className={`
                    relative z-10 text-xs sm:text-sm font-semibold tracking-wide transition-colors duration-200 truncate px-1
                    ${
                      isActive
                        ? "text-[#8B5E3C] font-bold"
                        : "text-gray-900"
                    }
                  `}
                >
                  {floor.name}
                </span>
              </motion.button>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
