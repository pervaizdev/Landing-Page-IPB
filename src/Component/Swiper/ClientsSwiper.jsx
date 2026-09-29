"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const partners = [
  {
    name: "Islamabad Prime Builders",
    src: "/images/logo.png",
    description: "Building modern spaces for living, business, and investment in Islamabad.",
  },
  {
    name: "Islamabad Tea Company",
    src: "/images/partner logo.png",
    description: "Delivering quality tea and unforgettable taste experiences.",
  },

];

export default function ClientsSwiper() {
  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.18, delayChildren: 0.15 } },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 28 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section className="bg-white mt-18 pb-16 md:pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="border-t border-gray-100 pt-16 md:pt-20">

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="text-center mb-14"
          >

            <motion.span
              variants={fadeUp}
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
              Partners
            </motion.span>
            <motion.h2
              variants={fadeUp}
              className="text-4xl parisienne-font text-black mt-8"
            >
              Built on <span className="text-[#e2ceab]">Strong Partnerships</span>
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className="mt-4 text-gray-500 text-sm md:text-base max-w-xl mx-auto"
            >
              We collaborate with world-class organisations to deliver excellence at
              every stage of development.
            </motion.p>
          </motion.div>
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto"
          >
            {partners.map((partner, index) => (
              <motion.div
                key={`${partner.name}-${index}`}
                variants={fadeUp}
                className="group flex flex-col items-center justify-center gap-6 rounded-3xl border border-gray-100 bg-gray-50 px-10 py-12 shadow-sm hover:shadow-md hover:border-[#c29e6d] transition-all duration-300"
              >
                <div className="flex items-center justify-center h-14 w-full">
                  <Image
                    src={partner.src}
                    alt={partner.name}
                    width={160}
                    height={56}
                    className="h-18 w-auto object-contain md:grayscale md:group-hover:grayscale-0 transition-all duration-300 will-change-transform" />
                </div>

                <div className="w-12 h-px bg-yellow-400 group-hover:w-20 transition-all duration-300" />

                <div className="text-center">
                  <p className="text-base font-bold text-black">{partner.name}</p>
                  <p className="text-xs text-gray-400 mt-1 tracking-wide">
                    {partner.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>


        </div>
      </div>
    </section>
  );
}