"use client";

import { use } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { projects } from "@/data/card";
import CardDetails from "@/Component/CardDetails.jsx";
import FeaturesAmenities from "@/Component/FeaturesAmenities";
import Description from "@/Component/ProjectDescription.jsx";
import MediaSection from "@/Component/MediaSection";
import Location from "@/Component/Location";
import { motion } from "framer-motion";
import {
  AnimatedSection,
  AnimatedImage,
  AnimatedDivider,
} from "@/Component/AnimationWrappers";
import ProjectUnitExplorer from "@/Component/ProjectUnitExplorer";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
  },
};

const heroContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.13, delayChildren: 0.2 } },
};

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-15 w-15 items-center justify-center rounded-full border border-black/10">
        <Icon className="text-2xl text-black/80" />
      </div>
      <div className="font-sans">
        <p className="font-bold text-black/40">{label}</p>
        <p className="font-bold text-black">{value}</p>
      </div>
    </div>
  );
}

export default function Page({ params }) {
  const { slug } = use(params);

  const project = projects.find((p) => p.id === slug);
  if (!project) return notFound();

  return (
    <>
      <div className="fixed inset-0 -z-10 h-[90vh] lg:h-[95vh] w-full">
        <Image
          src="/images/2b.jpg"
          alt="Background"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/40 "></div>
        <div className="absolute inset-0 mt-[-220px] lg:mt-0 bg-black/40 flex items-center justify-center">
          <motion.div
            className="px-4 lg:px-12"
            variants={heroContainer}
            initial="hidden"
            animate="show"
          >
            <motion.h1
              variants={fadeUp}
              className="parisienne-font text-center text-5xl text-[#c29e6d] lg:text-7xl mt-10 lg:mt-0"
            >
              Project Details
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-5 lg:mt-10 max-w-2xl mx-auto text-center text-lg lg:text-lg text-white/90"
            >
              Built with quality construction and contemporary design, it
              ensures comfort, security, and strong investment value.
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* Spacer so content starts after hero height */}
      <div className="h-[45vh] lg:h-[95vh] " />

      {/* SCROLLING CONTENT (moves up over the fixed hero) */}
      <div className="relative z-10 mt-[85px] lg:mt-[-90px] bg-white rounded-t-[35px] lg:rounded-t-[60px] pb-16">
        <AnimatedSection className="pt-2 container mx-auto">
          <CardDetails project={project} InfoItem={InfoItem} />
        </AnimatedSection>

        <div className="mx-auto px-3 lg:px-10 pt-2 md:pt-14 ">
          <AnimatedImage className="relative container mx-auto mt-12 h-[400px] lg:h-162.5 w-full overflow-hidden rounded-[40px]">
            <Image
              src={project.image}
              alt={project.title}
              fill
              priority
              className="object-cover"
            />
          </AnimatedImage>

          <AnimatedSection className="container mx-auto">
            <Description project={project} />
          </AnimatedSection>
        </div>

        <AnimatedDivider className="border mt-15" />

        <AnimatedSection>
          <FeaturesAmenities />
        </AnimatedSection>

        <AnimatedDivider className="border mt-15 mb-10" />

        <AnimatedSection >
          <MediaSection project={project} />
        </AnimatedSection>

        <ProjectUnitExplorer
          key={project.id}
          project={project}
        />

        <AnimatedSection className="container mx-auto">
          <Location project={project} />
        </AnimatedSection>
      </div>
    </>
  );
}