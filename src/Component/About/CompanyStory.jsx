"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function CompanyStory() {
  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const fadeLeft = {
    hidden: { opacity: 0, x: -40 },
    show: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const fadeUpSoft = {
    hidden: { opacity: 0, y: 35 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1.0,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <div className="container mx-auto py-16 lg:py-24 overflow-hidden">
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center px-3"
      >
        <motion.div
          variants={fadeLeft}
          className="relative h-[320px] lg:h-[550px] overflow-hidden rounded-3xl shadow-xl"
        >
          <Image
            src="/images/pg6.jpeg"
            alt="Company Story"
            fill
            className="object-cover transition-transform duration-700 hover:scale-105"
          />
        </motion.div>

        <motion.div variants={container} className="text-center lg:text-start">
          <motion.span
            variants={fadeUpSoft}
            className="inline-flex items-center gap-2 rounded-full border px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] shadow-sm"
            style={{
              borderColor: "#d1b38c",
              color: "#8B5E3C",
              background: "rgba(209,179,140,0.1)",
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: "#d1b38c" }}
            />
            Our Story
          </motion.span>

          <motion.h2
            variants={fadeUp}
            className="mt-3 text-3xl lg:text-4xl parisienne-font text-gray-900 leading-tight"
          >
            Building spaces with purpose, trust, and long term value
          </motion.h2>

          <motion.p variants={fadeUp} className="mt-6 text-gray-600 leading-8">
            Our company was founded with a vision to create modern residential
            and commercial developments that meet evolving lifestyle and
            business needs. From the beginning, our focus has been on quality
            construction, smart planning, and delivering projects that create
            real value for clients and communities.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="rounded-2xl border border-gray-200 p-6 bg-gray-50 hover:border-yellow-300 hover:shadow-md transition-all">
              <h3 className="text-xl parisienne-font font-bold text-gray-900">Our Vision</h3>
              <p className="mt-3 text-gray-600 leading-7">
                To be a trusted name in real estate and construction, known for
                innovation, quality, and community-focused development.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 p-6 bg-gray-50 hover:border-yellow-300 hover:shadow-md transition-all">
              <h3 className="text-xl parisienne-font font-bold text-gray-900">Our Mission</h3>
              <p className="mt-3 text-gray-600 leading-7">
                To deliver reliable real estate solutions and well-planned
                developments that enhance modern living and business growth.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
