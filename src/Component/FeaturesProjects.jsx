
"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function FeaturesProjects({ item }) {
  const status = item.status?.toLowerCase().trim() || "";

  const isDelivered = status === "delivered project";
  const isOngoing = status === "on going project";
  const isComingSoon = status === "coming soon";

  const isHighlighted = isOngoing || isComingSoon;

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 80,
    },
    show: {
      opacity: 1,
      y: -6,
      transition: {
        duration: 1.1,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
      whileHover={{ y: -12 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 18,
      }}
    >
      <Link href={`/projects/${item.id}`} className="block group">
        <div
          className={`relative h-[450px] w-[320px] lg:w-[400px] overflow-hidden rounded-[30px] shadow-xl transition-all duration-500 ${isHighlighted
            ? "border border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.2)]"
            : isDelivered
              ? "border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.15)]"
              : ""
            }`}
        >
          {/* Project Image */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="absolute inset-0"
          >
            <Image
              src={item.image}
              alt={item.title || "Project"}
              fill
              sizes="(max-width: 1023px) 320px, 400px"
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
          </motion.div>

          {/* Image Overlay */}
          <div
            className={`absolute inset-0 transition-all duration-500 ${isOngoing
              ? "bg-linear-to-t from-black/90 via-black/60 to-transparent"
              : isDelivered
                ? "bg-linear-to-t from-black/90 via-black/40 to-transparent"
                : isComingSoon
                  ? "bg-linear-to-t from-black/90 via-black/60 to-transparent"
                  : "bg-linear-to-t from-black/90 via-black/30 to-transparent lg:from-black/40 lg:via-transparent group-hover:from-black/90 group-hover:via-black/40"
              }`}
          />

          {/* Status Badge */}
          <div className="absolute top-6 left-6 z-20">
            <span
              className={`rounded-full border px-4 py-2 text-xs font-semibold shadow-lg backdrop-blur-md transition-all duration-300 ${isDelivered
                  ? "border-white bg-white text-black"
                  : isHighlighted
                    ? "animate-pulse border-amber-400 bg-amber-500/90 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                    : "border-white/20 bg-black/60 text-white"
                }`}
            >
              {isComingSoon ? "Coming Soon" : item.status}
            </span>
          </div>

          {/* Bottom Project Information */}
          <div className="absolute bottom-0 left-0 right-0 z-20 flex flex-col items-start px-8 pb-8 transition-all duration-500 ease-out translate-y-0 opacity-100 lg:translate-y-6 lg:opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
            <div
              className="mb-4 h-[2px] w-12 origin-left scale-x-100 lg:scale-x-0 transition-transform duration-500 delay-100 group-hover:scale-x-100"
              style={{
                background:
                  "linear-gradient(90deg, #d1b38c, #e8c87a)",
              }}
            />

            <h3
              className={`text-3xl font-bold parisienne-font leading-tight drop-shadow-lg ${isHighlighted ? "text-amber-400" : "text-white"
                }`}
            >
              {item.title}
            </h3>

            <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-white/90 lg:text-white/70 transition-colors duration-300 group-hover:text-white/90">
              View Project

              <svg
                className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 17L17 7M17 7H7M17 7v10"
                />
              </svg>
            </span>
          </div>

          {/* Diagonal Stamp - Ongoing & Coming Soon */}
          {isHighlighted && (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                }}
                className="rotate-[-12deg] rounded-xl border-2 border-amber-300 bg-amber-500 px-6 py-3 text-2xl font-black uppercase tracking-widest text-black shadow-[0_0_40px_rgba(245,158,11,0.6)]"
              >
                {isOngoing ? "On Going Project" : "Coming Soon"}
              </motion.div>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
