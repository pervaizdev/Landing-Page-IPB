"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { HiBars3BottomRight, HiXMark } from "react-icons/hi2";

const NAV_ITEMS = [
  { name: "Home", path: "/" },
  { name: "Projects", path: "/projects" },
  { name: "Booking", path: "/booking" },
  { name: "Awards", path: "/awards" },
  { name: "Services", path: "/services" },
  { name: "About Us", path: "/about" },
  { name: "Contact", path: "/contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/" || pathname === "/home";
  const isTransparentNavbar =
    isHome ||
    pathname === "/projects" ||
    pathname === "/booking" ||
    pathname === "/services" ||
    pathname === "/about" ||
    pathname === "/contact" ||
    pathname === "/awards" ||
    pathname.startsWith("/projects/");

  const [open, setOpen] = useState(false);
  const [scrolledMobile, setScrolledMobile] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth < 768) {
        setScrolledMobile(window.scrollY > 600);
      } else {
        setScrolledMobile(false);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const closeMenu = () => setOpen(false);

  return (
    <motion.header
      id="main-navbar"
      className={[
        "w-full z-[9999] md:z-1",
        isTransparentNavbar
          ? "fixed top-0 mt-6 md:mt-10"
          : "sticky top-0 mt-0 backdrop-blur",
      ].join(" ")}
      initial={{ y: -150 }}
      animate={{ y: 0 }}
      transition={{
        duration: 0.8,
        delay: isHome ? 1.8 : 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <nav className="mx-auto w-[95%] max-w-7xl 2xl:max-w-[1440px]">
        <motion.div
          animate={
            scrolledMobile
              ? {
                width: "72px",
                borderRadius: "0px",
              }
              : {
                width: "100%",
                borderRadius: "80px",
              }
          }
          transition={{
            duration: 0.45,
            ease: [0.22, 1, 0.36, 1],
            borderRadius: { duration: 0.15 }
          }}
          className="premium-border-glow ml-auto overflow-hidden"
        >
          <motion.div
            animate={
              scrolledMobile
                ? {
                  border: "1px solid #111",
                  borderRadius: "10px",
              
                }
                : {
                  paddingLeft: 24,
                  paddingRight: 24,
                  paddingTop: 12,
                  paddingBottom: 12,
                  backgroundColor: "#ffffff",
                }
            }
            transition={{
              duration: 0.45,
              ease: [0.22, 1, 0.36, 1],
              borderRadius: { duration: 0.15 }
            }}
            className="inner-content relative flex items-center justify-between"
          >
            <AnimatePresence>
              {!scrolledMobile && (
                <motion.div
                  key="full-mobile-navbar"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="flex w-full items-center justify-between"
                >
                  {/* LEFT: Logo + Brand */}
                  <Link
                    href="/"
                    onClick={closeMenu}
                    className="flex min-w-0 items-center gap-3 md:min-w-[260px]"
                  >
                    <Image
                      src="/images/logo.png"
                      alt="Logo"
                      width={44}
                      height={44}
                    />
                    <div className="min-w-0 ">
                      <span className="block truncate text-lg  text-black lg:text-lg">
                        Islamabad Prime
                      </span>
                      <span className="block text-md text-gray-700 lg:text-md">
                        Builders
                      </span>
                    </div>
                  </Link>

                  {/* CENTER: Desktop Links */}
                  <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex">
                    {NAV_ITEMS.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.path}
                          className="text-sm font-semibold text-gray-900 transition hover:text-gray-600"
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>

                  {/* RIGHT: Desktop CTA + Mobile Hamburger */}
                  <div className="flex items-center gap-2">
                    <Link
                      href="https://islamabad-prime-builder-dashboard.vercel.app"
                      className="hidden rounded-full bg-[#e2ceab] px-6 py-3 text-sm font-bold text-black transition hover:bg-[#d1b38c] md:inline-flex"
                    >
                      Client Portal

                    </Link>

                    <button
                      type="button"
                      onClick={() => setOpen((v) => !v)}
                      className="inline-flex items-center justify-center rounded-full p-2 text-black transition-colors hover:bg-black/5 md:hidden"
                      aria-expanded={open}
                      aria-controls="mobile-menu"
                    >
                      {open ? (
                        <HiXMark className="h-6 w-6" />
                      ) : (
                        <HiBars3BottomRight className="h-6 w-6" />
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {scrolledMobile && (
                <motion.div
                  key="collapsed-mobile-navbar"
                  initial={{ opacity: 0, scale: 0.85, rotate: -8 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.85, rotate: 8 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="flex w-full items-center justify-center md:hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    className="inline-flex h-12 w-12 items-center justify-center rounded-none text-black transition-colors hover:bg-black/5"
                    aria-expanded={open}
                    aria-controls="mobile-menu"
                  >
                    {open ? (
                      <HiXMark className="h-6 w-6" />
                    ) : (
                      <HiBars3BottomRight className="h-6 w-6" />
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {open && (
            <motion.div
              id="mobile-menu"
              initial={{ height: 0, opacity: 0, scale: 0.95 }}
              animate={{ height: "auto", opacity: 1, scale: 1 }}
              exit={{ height: 0, opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="mt-2 origin-top overflow-hidden md:hidden"
            >
              <div className="rounded-3xl border border-black/5 bg-white/90 p-4 shadow-2xl shadow-black/10 backdrop-blur-xl">
                <div className="flex flex-col gap-2">
                  {NAV_ITEMS.map((item, i) => (
                    <motion.div
                      key={item.name}
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -10, opacity: 0 }}
                      transition={{ delay: i * 0.05 + 0.1 }}
                    >
                      <Link
                        href={item.path}
                        onClick={closeMenu}
                        className="flex items-center justify-between rounded-2xl px-4 py-3 text-base font-semibold text-gray-900 transition-all hover:bg-black/5 active:bg-black/10"
                      >
                        {item.name}
                        <span className="opacity-30">→</span>
                      </Link>
                    </motion.div>
                  ))}

                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 10, opacity: 0 }}
                    transition={{ delay: NAV_ITEMS.length * 0.05 + 0.1 }}
                  >
                    <Link
                      href="https://islamabad-prime-builder-dashboard.vercel.app"
                      onClick={closeMenu}
                      className="mt-4 flex items-center justify-center rounded-2xl primary-bg px-4 py-4 text-base font-bold text-gray-900 transition-all hover:shadow-lg hover:shadow-yellow-500/20 active:scale-[0.98]"
                    >
                      Client Portal
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
}