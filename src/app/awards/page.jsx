"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import FooterSection from "@/Component/Footer/footer";
import AwardSection from "@/Component/AwardSection";

export default function Page() {
  return (
    <>
      {/* FIXED HERO (NOT SCROLLABLE) */}
      <section className="fixed inset-0 -z-10 h-[80vh] lg:h-[98vh] w-full">
        <Image
          src="/images/2b.webp"
          alt="Background"
          fill
          priority
          className="object-cover"
        />

        <div className="absolute inset-0 bg-black/70" />

        <div className="relative z-10 mt-[-50px] lg:mt-0 grid place-items-center h-full text-center px-4">
          <div>
            <motion.h1
              className="text-[#c29e6d] parisienne-font text-5xl lg:text-7xl"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.9,
                delay: 0.25,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              Award
            </motion.h1>

            <motion.p
              className="mt-5 max-w-3xl text-white/70 text-base sm:text-lg mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.4,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              It stands as a symbol of trust, long-term investment value, and a
              commitment to delivering outstanding standards.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Spacer so content starts after hero height */}
      <div className="h-[35vh] lg:h-[98vh]" />

      {/* SCROLLING CONTENT (comes up and hides the hero) */}
      <div className="relative mt-[170px] lg:mt-[-90px] z-20 bg-white rounded-t-3xl lg:rounded-t-[60px] px-4 lg:px-8 pt-12">
        <hr className="border-gray-200 mt-4 lg:mt-6" />
        <AwardSection />
        <FooterSection />
      </div>
    </>
  );
}