"use client";

import Image from "next/image";
import { HiLocationMarker } from "react-icons/hi";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ProjectCard({ item }) {
  const isCompleted = item.status === "Completed";

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 200, damping: 18 }}
      className="group"
    >
      <Link href={`/projects/${item.id}`} className="block">
        <div className="relative h-[520px] w-full overflow-hidden rounded-[30px] shadow-xl">

          {/* Image */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover"
            />
          </motion.div>

          {/* Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent transition-all duration-500 group-hover:from-black/80" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col p-7 text-white">

            {/* Top Badges */}
            <div className="flex items-start justify-between gap-3">

              {/* Status Badge */}
              <span
                className={`rounded-full px-2 py-2 text-xs font-semibold backdrop-blur-md border transition ${
                  isCompleted
                    ? "bg-white/90 text-black border-white/40"
                    : "bg-black/60 text-white border-white/20"
                }`}
              >
                {item.status}
              </span>

              {/* Availability Badge (Luxury Gold) */}
              <span
                className="rounded-full px-4 py-2 text-xs font-semibold 
                bg-[#c29e6d] text-black border border-[#e5c488]/60"
              >
                {item.availability}
              </span>
            </div>

            {/* Bottom Content */}
            <div className="mt-auto">
              <div className="flex items-center gap-3">
                <HiLocationMarker className="text-2xl text-[#c29e6d]" />
                <p className="font-semibold text-sm tracking-wide">
                  {item.location}
                </p>
              </div>

              <hr className="my-5 border-white/30" />

              <h3 className="text-3xl lg:text-4xl font-extrabold leading-tight">
                {item.title}
              </h3>
            </div>

          </div>
        </div>
      </Link>
    </motion.div>
  );
}