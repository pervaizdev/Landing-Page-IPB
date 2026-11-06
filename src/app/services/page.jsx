"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import FooterSection from "@/Component/Footer/footer";
import Services from "@/Component/OurServices/servicespage";

export default function ServicesPage() {
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
              Our Services
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
              Our services turn ideas into powerful results using smart strategy
              and modern technology. We deliver efficient, scalable solutions
              tailored for every client.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Spacer so content starts after hero height */}
      <div className="h-[35vh] lg:h-[98vh]" />

      {/* This section comes up and hides hero content behind it */}
      <div className="relative mt-[170px] lg:mt-[-90px] z-20 bg-white rounded-t-3xl lg:rounded-t-[60px] pt-12">
        <hr className="border-gray-700 mt-5 lg:mt-10" />

        <Services />

        <FooterSection />
      </div>
    </>
  );
}