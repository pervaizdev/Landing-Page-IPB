"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { FiTrendingUp } from "react-icons/fi";
import { FaHardHat, FaCity } from "react-icons/fa";

export default function DifferentSection() {
  // Smooth premium fade-up for text/lines
  const fadeUpSoft = {
    hidden: { opacity: 0, y: 18 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 1.0, ease: [0.16, 1, 0.3, 1] },
    },
  };

  // General container stagger (sections / blocks)
  const stagger = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.12, delayChildren: 0.15 },
    },
  };

  // For animating each line inside a heading/paragraph
  const lineStagger = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.12, delayChildren: 0.05 },
    },
  };

  return (
    <section className="bg-[#f5f5f5] text-black py-20">
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        className="max-w-7xl mx-auto md:px-6 px-2 grid lg:grid-cols-2 gap-16 items-center"
      >
        {/* LEFT IMAGE */}
        <motion.div variants={stagger} className="relative">
          <motion.div variants={fadeUpSoft} className="rounded-[40px] overflow-hidden">
            <Image
              src="/images/1 ba night.webp"
              alt="What makes us different"
              width={600}
              height={700}
              className="w-full md:h-[560px] h-[400px] object-cover"
            />
          </motion.div>

          {/* Rating Card */}
          {/* <motion.div
            variants={fadeUpSoft}
            className="
              absolute bottom-10 left-10 w-[240px] rounded-2xl
              bg-white/10 backdrop-blur-xl
              border border-white/20
              shadow-[0_20px_60px_rgba(0,0,0,0.35)]
              p-6 text-center overflow-hidden
            "
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/10" />

            <motion.h3 variants={fadeUpSoft} className="relative text-5xl font-extrabold text-yellow-300">
              4.9
            </motion.h3>

            <motion.div variants={fadeUpSoft} className="relative flex justify-center -space-x-3 mt-4">
              <div className="w-9 h-9 rounded-full bg-blue-400 border-2 border-white/80" />
              <div className="w-9 h-9 rounded-full bg-green-400 border-2 border-white/80" />
              <div className="w-9 h-9 rounded-full bg-pink-400 border-2 border-white/80" />
            </motion.div>

            <motion.div variants={fadeUpSoft} className="relative text-yellow-300 text-base mt-3 tracking-wide">
              ★★★★★
            </motion.div>

            <motion.p variants={fadeUpSoft} className="relative text-sm text-white/80 mt-3 font-medium">
              2k+ satisfied customers
            </motion.p>
          </motion.div> */}
        </motion.div>

        {/* RIGHT CONTENT */}
        <motion.div variants={stagger}>
          {/* Badge */}
          {/* Badge */}
          <motion.span
            variants={fadeUpSoft}
            className="block w-fit mx-auto md:mx-0 px-4 py-1 text-sm border rounded-full mb-6"
          >
            OUR COMMITMENT
          </motion.span>

          {/* Heading - animate each line */}
          <motion.h2 variants={lineStagger} className="text-4xl md:text-start text-center font-bold mb-6 leading-tight">
            <motion.span variants={fadeUpSoft} className="block">
              What makes us
            </motion.span>
            <motion.span variants={fadeUpSoft} className="block">
              different
            </motion.span>
          </motion.h2>

          {/* Paragraph - animate each line */}
          <motion.p variants={lineStagger} className="text-gray-600 mb-10 px-3 md:px-0">
            <motion.span variants={fadeUpSoft} className="block">
              We focus on building projects that combine strong construction, modern
            </motion.span>
            <motion.span variants={fadeUpSoft} className="block">
              design, and prime locations. Whether you are looking to invest your
            </motion.span>
            <motion.span variants={fadeUpSoft} className="block">
              savings or find a place for your family or business, our developments are designed to meet your needs today and increase in value in the future.
            </motion.span>
          </motion.p>

          {/* Items container */}
          <motion.div variants={stagger} className="space-y-8 px-3 md:px-0">
            {/* Item 1 */}
            <motion.div variants={fadeUpSoft} className="flex gap-6 items-start">
              <motion.div variants={fadeUpSoft} className="bg-black p-4 rounded-full">
                <FiTrendingUp className="text-white text-xl" />
              </motion.div>

              <motion.div variants={lineStagger}>
                <motion.h4 variants={fadeUpSoft} className="font-semibold text-lg">
                  Safe & Profitable Investment
                </motion.h4>
                <motion.p variants={fadeUpSoft} className="text-gray-600 text-sm">
                  Property in Islamabad is growing fast. Investing here is a smart and safe way to grow your money over time.
                </motion.p>
              </motion.div>
            </motion.div>

            {/* Item 2 */}
            <motion.div variants={fadeUpSoft} className="flex gap-6 items-start">
              <motion.div variants={fadeUpSoft} className="bg-black p-4 rounded-full">
                <FaHardHat className="text-white text-xl" />
              </motion.div>

              <motion.div variants={lineStagger}>
                <motion.h4 variants={fadeUpSoft} className="font-semibold text-lg">
                  Strong & Modern Construction
                </motion.h4>
                <motion.p variants={fadeUpSoft} className="text-gray-600 text-sm">
                  We build with quality materials and modern designs to make sure our projects are safe, beautiful, and long-lasting.
                </motion.p>
              </motion.div>
            </motion.div>

            {/* Item 3 */}
            <motion.div variants={fadeUpSoft} className="flex gap-6 items-start">
              <motion.div variants={fadeUpSoft} className="bg-black p-4 rounded-full">
                <FaCity className="text-white text-xl" />
              </motion.div>

              <motion.div variants={lineStagger}>
                <motion.h4 variants={fadeUpSoft} className="font-semibold text-lg">
                  Complete Lifestyle in One Place
                </motion.h4>
                <motion.p variants={fadeUpSoft} className="text-gray-600 text-sm">
                  Prime Mall & Suites offers homes, shops, and leisure spaces all in one location giving you comfort, convenience, and luxury together.
                </motion.p>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}