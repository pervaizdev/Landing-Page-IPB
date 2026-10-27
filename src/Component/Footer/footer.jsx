"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { FaInstagram, FaYoutube, FaFacebookF, FaWhatsapp, FaPhoneAlt } from "react-icons/fa";

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.08 } },
};

const footerLinks = [
  { name: "Home", href: "/" },
  { name: "Projects", href: "/projects" },
  { name: "Booking", href: "/booking" },
  { name: "Awards", href: "/awards" },
  { name: "Services", href: "/services" },
  { name: "About Us", href: "/about" },
  { name: "Contact", href: "/contact" },
];

const socials = [
  {
    icon: FaInstagram,
    label: "Instagram",
    href: "https://www.instagram.com/IslamabadPrimeBuilders",
    color: "#E4405F",
  },
  {
    icon: FaYoutube,
    label: "YouTube",
    href: "https://www.youtube.com/@IslamabadPrimeBuilders",
    color: "#FF0000",
  },
  {
    icon: FaFacebookF,
    label: "Facebook",
    href: "https://www.facebook.com/islamabadprimebuilders", // <-- replace with your real link
    color: "#1877F2",
  },
];

export default function FooterSection() {
  return (
    <footer className="bg-white px-3">
      <div className="mx-auto max-w-6xl md:px-6 pb-16">
        {/* Card */}

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="relative z-1 rounded-[32px] bg-white/95 backdrop-blur-xl px-8 py-12 md:px-12 md:py-14 shadow-[0_30px_90px_rgba(0,0,0,0.12)] border border-black/5"
        >
          {/* Top */}
          <motion.div
            variants={stagger}
            className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-12"
          >
            {/* Brand */}
            <motion.div
              variants={fadeUp}
              className="flex flex-col items-center text-center md:items-start md:text-left"
            >
              <div className="flex items-center gap-3">
                <Image
                  src="/images/logo.png"
                  alt="Islamabad Prime Builder"
                  width={72}
                  height={72}
                  className="h-16 w-auto select-none"
                  priority={false}
                />
                <div className="parisienne-font">
                  <p className="text-lg text-black">
                    Islamabad Prime
                  </p>
                  <p className="text-md  text-[#c29e6d]">Builders</p>
                </div>
              </div>

              <p className="mt-5 text-sm text-gray-600 leading-relaxed max-w-sm">
                We build modern homes and landmark developments—designed for
                lifestyle, built for long-term value, and delivered with
                transparency.
              </p>
            </motion.div>

            {/* Links */}
            <motion.div
              variants={fadeUp}
              className="text-center md:text-left md:justify-self-center"
            >
              <p className="text-sm font-bold text-black mb-4">
                Quick Links
              </p>

              <ul className="space-y-3 text-sm text-gray-600 flex flex-col items-center md:items-start">
                {footerLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="inline-flex items-center gap-2 hover:text-black transition"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-[#c29e6d]" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Contact */}
            <motion.div
              variants={fadeUp}
              className="md:justify-self-end text-center md:text-left"
            >
              <p className="text-sm font-bold text-black mb-4">Contact</p>

              <div className="space-y-3">
                {/* WhatsApp */}
                <a
                  href="https://wa.me/923122222321"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center md:justify-start gap-3 group transition"
                >
                  <span className="flex text-[#25D366] transition duration-200">
                    <FaWhatsapp className="text-2xl" />
                  </span>
                  <div className="text-left">
                    <span className="block text-base font-bold text-black">
                      +92 312 2222 321
                    </span>
                   
                  </div>
                </a>

                {/* Telephone / PTCL */}
                <a
                  href="tel:+92517234000"
                  className="flex items-center justify-center md:justify-start gap-3 group transition"
                >
                  <span className="flex text-[#8B5E3C] transition duration-200">
                    <FaPhoneAlt className="text-lg" />
                  </span>
                  <div className="text-left">
                    <span className="block text-base ms-1.5 font-bold text-black">
                      +92 51 7234000
                    </span>
                   
                  </div>
                </a>
              </div>

              <a
                href="mailto:Info@IslamabadPrimeBuilders.com"
                className="mt-4 inline-block text-sm font-semibold text-black underline underline-offset-4 hover:text-[#8B5E3C] transition"
              >
                Info@IslamabadPrimeBuilders.com
              </a>

              <div className="mt-6 flex justify-center md:justify-start gap-3">
                {socials.map((s, i) => (
                  <a
                    key={i}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f5f2ea] hover:bg-[#c6bda7] transition-all duration-300"
                  >
                    <s.icon className="text-lg" style={{ color: s.color }} />
                  </a>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Divider */}
          <motion.div
            variants={fadeUp}
            className="my-10 border-t border-gray-200/80"
          />

          {/* Bottom */}
          <motion.p
            variants={fadeUp}
            className="text-center text-xs text-gray-500"
          >
            © 2026{" "}
            <span className="font-semibold text-black">
              Islamabad Prime Builders
            </span>
            . All Rights Reserved.
          </motion.p>
        </motion.div>
      </div>
    </footer>
  );
}