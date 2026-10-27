"use client";

import { motion } from "framer-motion";
import { HiLocationMarker } from "react-icons/hi";
import {
  HiOutlineCalendarDays,
  HiOutlineBuildingOffice2,
  HiOutlineCircleStack,
  HiOutlineBuildingOffice,
  HiOutlineShoppingBag,
  HiOutlineHomeModern,
  HiOutlineCake,
  HiOutlineHome,
  HiOutlineBolt,
} from "react-icons/hi2";
import {
  LuLayoutGrid,
  LuStore,
  LuUtensilsCrossed,
  LuDumbbell,
  LuHouse,
  LuBedSingle,
  LuBedDouble,
  LuBuilding2,
} from "react-icons/lu";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
  },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.2, delayChildren: 0.3 } },
};

const shouldShow = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const v = value.trim();
    if (v === "") return false;
    const n = Number(v);
    if (!Number.isNaN(n) && n === 0) return false;
    return true;
  }
  return true;
};

export default function CardDetails({ project, InfoItem }) {
  const infoItems = [
    { icon: HiOutlineCircleStack, label: "Status", value: project.status },
    {
      icon: LuLayoutGrid,
      label: "Project Type",
      value: project.projectType,
    },
    { icon: LuBuilding2, label: "Floors", value: project.floor },
    { icon: HiOutlineBuildingOffice, label: "Offices", value: project.offices },
    { icon: LuStore, label: "Shops", value: project.shopes },
    { icon: LuHouse, label: "Studios", value: project.studios },
    { icon: LuUtensilsCrossed, label: "Restaurants", value: project.restaurant },
    { icon: LuBedDouble, label: "Bedrooms", value: project.bedrooms },
    { icon: LuDumbbell, label: "Gym", value: project.gym },
    {
      icon: HiOutlineCalendarDays,
      label: "Commencement date",
      value: project.commencementDate,
    },
  ].filter((item) => shouldShow(item.value));

  return (
    <motion.div
      className="pt-14 md:px-10 px-2"
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
    >
      <motion.div variants={fadeUp} className="flex items-center gap-3">
        <HiLocationMarker className="text-xl lg:text-3xl text-[#c29e6d]" />
        <p className="font-bold text-sm lg:text-lg text-black">
          {project.location}
        </p>
      </motion.div>

      <motion.h1
        variants={fadeUp}
        className="mt-5 lg:text-7xl text-4xl parisienne-font text-black"
      >
        {project.title}
      </motion.h1>

      <motion.hr variants={fadeUp} className="my-12 border-black/20" />

      <motion.div
        variants={stagger}
        className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 px-2"
      >
        {infoItems.map((item) => (
          <motion.div key={item.label} variants={fadeUp}>
            <InfoItem icon={item.icon} label={item.label} value={item.value} />
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
