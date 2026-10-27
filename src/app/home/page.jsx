"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import dynamic from "next/dynamic";

// Critical components kept as direct imports for SEO and LCP
import HeroSection from "@/Component/HeroSection/HeroSection";
import BackgroundVideo from "@/Component/BackgroundVideo";

// All below-the-fold components are loaded dynamically
const WeAre = dynamic(() => import("@/Component/Whoweare/weare"), {
  loading: () => <div className="min-h-[400px] bg-white" />,
  ssr: true,
});

const Services = dynamic(() => import("@/Component/OurServices/servicespage"), {
  ssr: true,
});

const FeaturesProjects = dynamic(() => import("@/Component/FeaturesProjects"), {
  ssr: true,
});

const WhoWeAreStats = dynamic(() => import("@/Component/Whoweare/WhoWeAreStats"), {
  ssr: true,
});

const ClientsSwiper = dynamic(() => import("@/Component/Swiper/ClientsSwiper"), {
  ssr: false, // Swiper usually needs client-side only
});

const TestimonialsSection = dynamic(() => import("@/Component/Testimonials/Testimonials"), {
  ssr: true,
});

const CallBackSection = dynamic(() => import("@/Component/CallBackSection/callbacksection"), {
  ssr: true,
});

const FooterSection = dynamic(() => import("@/Component/Footer/footer"), {
  ssr: true,
});

// Import project data
import { projects } from "@/data/card.js";

function Intro({ onDone }) {
  const logo = useAnimation();
  const overlay = useAnimation();

  useEffect(() => {
    const run = async () => {
      // Set initial state via animation for better control
      await logo.start({
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        transition: {
          duration: 0.9,
          ease: [0.22, 1, 0.36, 1],
        },
      });

      await new Promise((r) => setTimeout(r, 220));

      overlay.start({
        opacity: 0,
        transition: {
          duration: 1.0,
          ease: [0.22, 1, 0.36, 1],
        },
      });

      await logo.start({
        scale: 6,
        opacity: 0,
        filter: "blur(10px)",
        transition: {
          duration: 1.25,
          ease: [0.22, 1, 0.36, 1],
        },
      });

      await new Promise((r) => setTimeout(r, 80));
      onDone();
    };

    run();
  }, [logo, overlay, onDone]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
      initial={{ opacity: 1 }}
      animate={overlay}
      exit={{ opacity: 0, transition: { duration: 0.4 } }}
    >
      <motion.img
        src="/images/logo.png"
        alt="Logo"
        className="h-24 w-24 md:h-32 md:w-32 select-none"
        style={{
          willChange: "transform, opacity, filter",
          transformOrigin: "center",
        }}
        initial={{ opacity: 0, scale: 0.92, filter: "blur(6px)" }}
        animate={logo}
        draggable={false}
      />
    </motion.div>
  );
}

export default function HomePage() {
  const [introDone, setIntroDone] = useState(false);

  // Soft fade up animation for section headers
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
    <div className="relative min-h-screen selection:bg-[#d1b38c]/30">
      <AnimatePresence mode="wait">
        {!introDone && <Intro onDone={() => setIntroDone(true)} />}
      </AnimatePresence>

      {introDone && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          {/* Hero Section with Sticky Video Background */}
          <section className="sticky top-0 h-screen w-full overflow-hidden z-0">
            <BackgroundVideo src="https://res.cloudinary.com/dvke7vpu8/video/upload/v1776626925/Islamabad_Prime_Builder/Landing_page/cedu26gxhtzlzbjyflxd.webm" />
            <HeroSection />
          </section>

          {/* Content Sections */}
          <main className="relative z-10 bg-white rounded-t-[40px] md:rounded-t-[60px] shadow-[0_-20px_50px_rgba(0,0,0,0.1)]">
            <WeAre />
            <Services />
            
            <div className="mx-auto max-w-3xl text-center pt-20">
              <motion.span
                variants={fadeUpSoft}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.8 }}
                className="inline-flex items-center gap-2 rounded-full border px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] shadow-sm"
                style={{
                  borderColor: "#d1b38c",
                  color: "#8B5E3C",
                  background: "rgba(209,179,140,0.1)",
                }}
              >
                <div className="h-1.5 w-1.5 rounded-full bg-[#d1b38c]" />
                Featured Projects
              </motion.span>

              <motion.h2
                className="text-4xl lg:text-6xl text-black mt-7 parisienne-font text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{
                  duration: 0.9,
                  delay: 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                Our Projects
              </motion.h2>
            </div>

            <div className="container mx-auto bg-white grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16 pb-20 justify-items-center mt-12 px-4">
              {projects.map((item, index) => (
                <div key={item.id}
                  className={index % 2 === 0 ? "lg:justify-self-end" : "lg:justify-self-start"}>
                  <FeaturesProjects item={item} index={index} />
                </div>
              ))}
            </div>

            <WhoWeAreStats />
            <ClientsSwiper />
            <TestimonialsSection />
            <CallBackSection />
            <FooterSection />
          </main>
        </motion.div>
      )}
    </div>
  );
}

