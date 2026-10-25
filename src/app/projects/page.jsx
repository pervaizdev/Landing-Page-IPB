"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import ProjectCard from "../../Component/Cards";
import { projects } from "../../data/card";
import FooterSection from "@/Component/Footer/footer";

export default function ProjectPage() {
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const stagger = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.08, delayChildren: 0.12 },
    },
  };

  return (
    <>
      {/* FIXED HERO (NOT SCROLLABLE) */}
      <section className="fixed inset-0 -z-10 h-[80vh] lg:h-[98vh] w-full">
        <Image
          src="/images/2b.jpg"
          alt="Background"
          fill
          priority
          className="object-cover"
        />

        <div className="absolute inset-0 bg-black/70" />

        <div className="relative z-10 mt-[-50px] lg:mt-12 grid place-items-center h-full text-center px-4">
          <div className="lg:mt-[-100]">
            <motion.h1
              className="parisienne-font text-5xl text-[#c29e6d] lg:text-7xl "
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.9,
                delay: 0.25,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              Our Projects
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
              A showcase of our completed and ongoing projects built with precision,
              transparency, and a commitment to excellence.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Spacer so content starts after hero height */}
      <div className="h-[35vh] lg:h-[98vh]" />

      {/* SCROLLING CONTENT (comes up and hides the hero) */}
      <div className="relative mt-[170px] lg:mt-[-90px] z-20 bg-white rounded-t-3xl lg:rounded-t-[60px] px-4 lg:px-8 pt-12">
        <motion.hr
          className="border-gray-700 mt-5 lg:mt-10"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: "left" }}
        />

        <motion.div
          className="mx-auto container gap-6 grid grid-cols-1 lg:grid-cols-3 mt-13 lg:mt-25 pb-30"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.05 }}
        >
          {projects.map((item) => (
            <motion.div key={item.id} variants={fadeUp}>
              <ProjectCard item={item} />
            </motion.div>
          ))}
        </motion.div>
        <FooterSection />
      </div>
    </>
  );
}