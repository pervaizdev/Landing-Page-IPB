"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

const FLIP_EASE = [0.645, 0.045, 0.355, 1];
const RELEASE_EASE = [0.22, 1, 0.36, 1];
const FLIP_DURATION = 1;
const JUMP_DURATION = 0.8;
const MAX_CASCADE = 1.2;
const DRAG_THRESHOLD = 6;
const FLICK_VELOCITY = 0.5;
const MAX_EDGE = 8;

function Board({ side, visible }) {
  const isLeft = side === "left";

  return (
    <motion.div
      className={`pointer-events-none absolute -inset-y-3 w-[calc(50%+0.75rem)] ${isLeft ? "-left-3 rounded-l-lg" : "-right-3 rounded-r-lg"
        }`}
      style={{
        background: `linear-gradient(${isLeft ? "270deg" : "90deg"}, #06200f 0%, #0f3d20 6%, #134a28 55%, #0c331a 100%)`,
        boxShadow:
          "0 30px 60px -15px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(194,158,109,0.45), inset 0 0 40px rgba(0,0,0,0.45)",
      }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* gold foil border */}
      <div
        className={`absolute inset-y-1.5 border border-[#c29e6d]/40 ${isLeft ? "left-1.5 right-0 rounded-l-md border-r-0" : "right-1.5 left-0 rounded-r-md border-l-0"
          }`}
      />
    </motion.div>
  );
}

function PageEdges({ side, width }) {
  const isLeft = side === "left";

  return (
    <motion.div
      className={`pointer-events-none absolute inset-y-1 ${isLeft ? "right-full rounded-l-sm" : "left-full rounded-r-sm"
        }`}
      style={{
        background:
          "repeating-linear-gradient(90deg, #f4efe4 0px, #f4efe4 1px, #cfc6b3 1px, #cfc6b3 2px)",
        boxShadow: "0 2px 4px rgba(0,0,0,0.25)",
      }}
      animate={{ width }}
      transition={{ duration: FLIP_DURATION, ease: FLIP_EASE }}
    />
  );
}

function PageFace({ src, alt, side, shade, priority }) {
  const isBack = side === "back";

  return (
    <div
      className="absolute inset-0 overflow-hidden bg-[#f8f5ef]"
      style={{
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        transform: isBack ? "rotateY(180deg)" : undefined,
      }}
    >
      {src && (
        // Pages are pre-compressed WebP, so they're served as-is from /public
        <Image
          src={src}
          alt={alt}
          fill
          unoptimized
          draggable={false}
          loading="eager"
          fetchPriority={priority ? "high" : "low"}
          className="object-cover select-none pointer-events-none"
        />
      )}

      {/* gutter shadow near the spine */}
      <div
        className={`pointer-events-none absolute inset-y-0 w-12 from-black/25 to-transparent ${isBack ? "right-0 bg-linear-to-l" : "left-0 bg-linear-to-r"
          }`}
      />

      <motion.div
        className="pointer-events-none absolute inset-0 bg-black"
        style={{ opacity: shade }}
      />
    </div>
  );
}

function Leaf({ index, total, front, back, flipped, delay, jump, dragging, dragFollow, title }) {
  const rotateY = useMotionValue(flipped ? -180 : 0);

  useEffect(() => {
    if (dragging) {
      return dragFollow.on("change", (v) => rotateY.set(v));
    }
    const target = flipped ? -180 : 0;
    const remaining = Math.abs(rotateY.get() - target) / 180;
    if (remaining === 0) return;

    // Partially turned (released drag) pages ease out; full turns ease in-out
    const fromRest = remaining === 1;
    const controls = animate(rotateY, target, {
      duration: (jump ? JUMP_DURATION : FLIP_DURATION) * Math.max(remaining, 0.4),
      ease: fromRest ? FLIP_EASE : RELEASE_EASE,
      delay: fromRest ? delay : 0,
    });
    return () => controls.stop();
  }, [flipped, delay, jump, dragging, dragFollow, rotateY]);

  // Swap stacking order exactly when the page passes the spine
  const zIndex = useTransform(rotateY, (v) =>
    v < -90 ? index + 1 : total - index
  );
  // Page lifts towards the reader mid-turn
  const z = useTransform(rotateY, [0, -90, -180], [0, 60, 0]);
  const frontShade = useTransform(rotateY, [0, -90], [0, 0.4]);
  const backShade = useTransform(rotateY, [-90, -180], [0.4, 0]);

  return (
    <motion.div
      className="absolute top-0 left-1/2 h-full w-1/2 will-change-transform"
      style={{
        rotateY,
        z,
        zIndex,
        transformOrigin: "left center",
        transformStyle: "preserve-3d",
      }}
    >
      <PageFace
        src={front}
        alt={`${title} page ${index * 2 + 1}`}
        side="front"
        shade={frontShade}
        priority={index < 2}
      />
      <PageFace
        src={back}
        alt={`${title} page ${index * 2 + 2}`}
        side="back"
        shade={backShade}
        priority={index < 2}
      />
    </motion.div>
  );
}

function pageToLeaf(page) {
  return Math.floor(page / 2);
}

export default function BrochureBook({
  pages,
  title = "Brochure",
  pageAspect = 1.1,
}) {
  const leaves = useMemo(() => {
    const result = [];
    for (let i = 0; i < pages.length; i += 2) {
      result.push({ front: pages[i], back: pages[i + 1] });
    }
    return result;
  }, [pages]);

  const total = leaves.length;
  const pageCount = pages.length;
  const [view, setView] = useState({ flipped: 0, from: 0 });
  const { flipped, from } = view;
  const [dragIndex, setDragIndex] = useState(null);
  const [pageInput, setPageInput] = useState("");
  const dragRotate = useMotionValue(0);
  const dragFollow = useSpring(dragRotate, { stiffness: 500, damping: 45, mass: 0.6 });
  const gesture = useRef(null);
  const ref = useRef(null);
  const bookRef = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });

  const goTo = (target) =>
    setView((v) => {
      const next = Math.min(Math.max(target, 0), total);
      return next === v.flipped ? v : { flipped: next, from: v.flipped };
    });
  // Jump duration and page animation stagger
  const distance = Math.abs(flipped - from);
  const isJump = distance > 1;
  const stagger = isJump ? Math.min(0.08, MAX_CASCADE / distance) : 0;
  const delayFor = (i) => {
    if (!isJump) return 0;
    if (flipped > from && i >= from && i < flipped) return (i - from) * stagger;
    if (flipped < from && i >= flipped && i < from) return (from - 1 - i) * stagger;
    return 0;
  };

  const onPointerDown = (e) => {
    if (e.button !== 0) return;
    const rect = bookRef.current.getBoundingClientRect();
    const spine = rect.left + rect.width / 2;
    const forward = e.clientX >= spine;

    if (forward ? flipped >= total : flipped <= 0) return;

    e.currentTarget.setPointerCapture(e.pointerId);
    gesture.current = {
      forward,
      spine,
      pageWidth: rect.width / 2,
      startX: e.clientX,
      lastX: e.clientX,
      lastT: e.timeStamp,
      velocity: 0,
      started: false,
    };
  };

  const onPointerMove = (e) => {
    const g = gesture.current;
    if (!g) return;

    if (!g.started) {
      if (Math.abs(e.clientX - g.startX) < DRAG_THRESHOLD) return;
      g.started = true;
      const start = g.forward ? 0 : -180;
      dragRotate.jump(start);
      dragFollow.jump(start);
      setDragIndex(g.forward ? flipped : flipped - 1);
    }

    const dt = e.timeStamp - g.lastT;
    if (dt > 0) g.velocity = (e.clientX - g.lastX) / dt;
    g.lastX = e.clientX;
    g.lastT = e.timeStamp;

    // Full turn = dragging the grab point to its mirror across the spine
    const span = Math.max(2 * Math.abs(g.startX - g.spine), g.pageWidth);
    const travel = g.forward ? g.startX - e.clientX : e.clientX - g.startX;
    const progress = Math.min(Math.max(travel / span, 0), 1);

    dragRotate.set(g.forward ? -180 * progress : -180 + 180 * progress);
  };

  const endGesture = () => {
    const g = gesture.current;
    gesture.current = null;
    if (!g?.started) return;

    const angle = dragFollow.get();
    const flick = g.forward
      ? g.velocity < -FLICK_VELOCITY
      : g.velocity > FLICK_VELOCITY;
    const turned = g.forward ? angle < -70 : angle > -110;

    if (turned || flick) goTo(flipped + (g.forward ? 1 : -1));
    setDragIndex(null);
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowRight") goTo(flipped + 1);
    if (e.key === "ArrowLeft") goTo(flipped - 1);
  };

  const onJumpSubmit = (e) => {
    e.preventDefault();
    const page = parseInt(pageInput, 10);
    if (Number.isNaN(page)) return;
    goTo(pageToLeaf(Math.min(Math.max(page, 1), pageCount)));
    setPageInput("");
    e.currentTarget.querySelector("input")?.blur();
  };

  // Keep a closed book centred (only one half is visible)
  const shift = flipped === 0 ? "-25%" : flipped === total ? "25%" : "0%";
  const isOpen = flipped > 0 && flipped < total;
  const leftEdge = (flipped / total) * MAX_EDGE;
  const rightEdge = ((total - flipped) / total) * MAX_EDGE;
  const bookDuration = isJump ? JUMP_DURATION + distance * stagger : FLIP_DURATION;

  const label =
    flipped === 0
      ? "Front cover"
      : flipped === total
        ? "Back cover"
        : `Pages ${flipped * 2} – ${Math.min(flipped * 2 + 1, pageCount)}`;

  return (
    <div ref={ref} className="flex flex-col items-center px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 60, rotateX: 25 }}
        whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-6xl"
        style={{ perspective: 2500 }}
      >
        <motion.div
          ref={bookRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endGesture}
          onPointerCancel={endGesture}
          animate={{ x: shift }}
          transition={{ duration: bookDuration, ease: FLIP_EASE }}
          className={`relative w-full select-none outline-none touch-pan-y ${dragIndex !== null ? "cursor-grabbing" : "cursor-grab"
            }`}
          /* Flat (no preserve-3d) so leaves stack by z-index, not by depth */
          style={{ aspectRatio: `${pageAspect * 2}`, perspective: 2500 }}
        >
          {/* floor shadow */}
          <div className="pointer-events-none absolute -bottom-10 left-[6%] right-[6%] h-14 rounded-[50%] bg-black/35 blur-2xl" />

          <Board side="left" visible={flipped > 0} />
          <Board side="right" visible={flipped < total} />

          {/* spine */}
          <motion.div
            className="pointer-events-none absolute -inset-y-4 left-1/2 w-8 -translate-x-1/2 rounded-sm"
            style={{
              background:
                "linear-gradient(90deg, #072512 0%, #145530 35%, #1c6a3d 50%, #145530 65%, #072512 100%)",
            }}
            animate={{ opacity: isOpen ? 1 : 0 }}
            transition={{ duration: 0.4 }}
          />

          {/* ribbon bookmark */}
          <motion.div
            className="pointer-events-none absolute -bottom-12 left-[calc(50%+2.5rem)] h-16 w-3 bg-[#c29e6d] shadow-md"
            style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 82%, 0 100%)" }}
            animate={{ opacity: isOpen ? 1 : 0 }}
            transition={{ duration: 0.4 }}
          />

          <PageEdges side="left" width={leftEdge} />
          <PageEdges side="right" width={rightEdge} />

          {leaves.map((leaf, i) => (
            <Leaf
              key={i}
              index={i}
              total={total}
              front={leaf.front}
              back={leaf.back}
              flipped={i < flipped}
              delay={delayFor(i)}
              jump={isJump}
              dragging={i === dragIndex}
              dragFollow={dragFollow}
              title={title}
            />
          ))}

          {/* crease where the pages bend into the spine */}
          <motion.div
            className="pointer-events-none absolute inset-y-0 left-1/2 w-24 -translate-x-1/2"
            style={{
              zIndex: total + 2,
              background:
                "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.12) 35%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.12) 65%, transparent 100%)",
            }}
            animate={{ opacity: isOpen ? 1 : 0 }}
            transition={{ duration: 0.4 }}
          />
        </motion.div>
      </motion.div>

      <div className="mt-15 w-full max-w-xl mx-auto">
        <div className="flex flex-col items-center justify-center text-center gap-3">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-[#0f3d20]">
            {label}
            <span className="ml-2 font-normal normal-case tracking-normal text-gray-400">
              of {pageCount}
            </span>
          </p>

          <form onSubmit={onJumpSubmit} className="flex items-center justify-center gap-2 text-xs sm:text-sm">
            <label htmlFor="brochure-page" className="text-gray-500">
              Go to page
            </label>
            <input
              id="brochure-page"
              type="number"
              inputMode="numeric"
              min={1}
              max={pageCount}
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              placeholder={`1–${pageCount}`}
              className="w-18 sm:w-20 rounded-full border border-[#d1b38c] bg-white px-3 py-1.5 text-center text-[#0f3d20] outline-none focus:ring-2 focus:ring-[#c29e6d]/40 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <button
              type="submit"
              className="rounded-full bg-[#0f3d20] px-4 py-1.5 font-semibold text-white transition hover:bg-[#145530] cursor-pointer"
            >
              Go
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
