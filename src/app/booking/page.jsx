"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useLenis } from "lenis/react";
import FooterSection from "@/Component/Footer/footer";
import BuildingSelector from "@/Component/booking/BuildingSelector";
import FindYourUnit from "@/Component/booking/FindYourUnit";
import FloorExplorer from "@/Component/booking/FloorExplorer";
import BrochureBook from "@/Component/booking/BrochureBook";
import bookingData from "@/data/booking.json";

const BROCHURE_PAGES = Array.from(
  { length: 60 },
  (_, i) => `/brochure/page-${i + 1}.webp`
);

export default function BookingPage() {
  const lenis = useLenis();
  useEffect(() => {
    // Prevent the browser from restoring the previous scroll position
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    // Move to the hero section immediately
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    // Also reset Lenis when it is initialized
    lenis?.scrollTo(0, {
      immediate: true,
      force: true,
    });

    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, [lenis]);
  const [buildingId, setBuildingId] = useState(null);
  const [selectedTypes, setSelectedTypes] = useState([]); 
  const building = bookingData.buildings.find((b) => b.id === buildingId) ?? null;

  const selectBuilding = (id, target = "overview") => {
    setBuildingId(id);
    setSelectedTypes([]);
    const anchor = target === "floors" ? "#floor-explorer" : "#building-overview";
    setTimeout(() => {
      lenis?.scrollTo(anchor, {
        offset: -100,
        duration: 1.45,
        easing: (t) => 1 - Math.pow(1 - t, 3),
      });
    }, 80);
  };

  return (
    <>
      <section className="fixed inset-0 -z-10 h-[80vh] lg:h-[98vh] w-full">
        <Image
          src="/images/2b.jpg"
          alt="Booking background"
          fill
          priority
          className="object-cover"
        />

        <div className="absolute inset-0 bg-black/70" />

        <div className="relative z-10 mt-[-20px] lg:mt-0 grid place-items-center h-full text-center px-4">
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
              Book Your Unit
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
              Browse available shops, offices, and residences across Prime Mall,
              Prime Mall &amp; Suites, and Prime Gold — floor by floor.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Spacer so content starts after hero height */}
      <div className="h-[35vh] lg:h-[98vh]" />

      {/* SCROLLING CONTENT */}
      <div className="relative z-20 mt-[170px] lg:mt-[-90px] bg-white rounded-t-3xl lg:rounded-t-[60px] pt-12">
        <hr className="border-gray-700 mt-5 lg:mt-10 mx-4 lg:mx-8" />
        <div className="mx-auto w-full max-w-[1504px] px-4 lg:px-8 pb-24 mt-15 space-y-14">
          <section>
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <motion.span
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="inline-flex items-center gap-2 rounded-full border border-[#d1b38c] bg-[#d1b38c]/10 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#8B5E3C] shadow-sm"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#d1b38c]" />
                For Booking
              </motion.span>

              <motion.h2
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
                className="mt-6 text-4xl lg:text-5xl parisienne-font text-[#0f3d20]"
              >
                Choose a Building
              </motion.h2>

              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="mx-auto mt-5 h-[2px] w-24 origin-center bg-linear-to-r from-transparent via-[#c29e6d] to-transparent"
              />

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="mx-auto mt-5 max-w-2xl leading-7 text-gray-500 md:text-base"
              >
                Select a project to see its details, live inventory and
                floor-by-floor availability.
              </motion.p>
            </div>
            <BuildingSelector
              buildings={bookingData.buildings}
              selectedId={buildingId}
              onSelect={selectBuilding}
            />
          </section>

          <AnimatePresence mode="wait">
            {building && (
              <motion.div
                key={building.id}
                id="building-overview"
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-14"
              >

                <FindYourUnit building={building} selected={selectedTypes} onChange={setSelectedTypes} />

                <div id="floor-explorer">
                  <FloorExplorer
                    key={building.id}
                    building={building}
                    selectedTypes={selectedTypes}
                    onTypesChange={setSelectedTypes}
                  />
                </div>

                {building.name?.trim().toLowerCase() === "prime mall & suites" && (
                  <section>
                    <div className="mx-auto mb-12 mt-[120px] lg:mt-[180px] max-w-3xl text-center">
                      <motion.span
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                        className="inline-flex items-center gap-2 rounded-full border border-[#d1b38c] bg-[#d1b38c]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#8B5E3C] shadow-2xs"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-[#d1b38c]" />
                        Our Brochure
                      </motion.span>
                      <motion.h2
                        initial={{ opacity: 0, y: 28 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 1.1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                        className="mt-5 text-4xl parisienne-font text-[#0f3d20] lg:text-5xl"
                      >
                        {building?.name} Brochure
                      </motion.h2>
                      <motion.div
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 1.0, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="mx-auto mt-5 h-[2px] w-24 origin-center bg-linear-to-r from-transparent via-[#c29e6d] to-transparent"
                      />
                      <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 1.0, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="mx-auto mt-5 max-w-2xl leading-7 text-gray-500 text-sm md:text-base"
                      >
                        Explore the {building?.name} brochure. Drag a page to discover more about the project.
                      </motion.p>
                    </div>
                    <BrochureBook
                      pages={BROCHURE_PAGES}
                      building={building}
                      title="Prime Mall & Suites brochure"
                      pageAspect={1}
                    />
                  </section>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <FooterSection />
      </div>
    </>
  );
}
