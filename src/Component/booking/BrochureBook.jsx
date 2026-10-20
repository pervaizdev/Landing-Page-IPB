"use client";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { animate, motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
const FLIP_EASE = [0.645, 0.045, 0.355, 1];
const FLIP_DURATION = 1;
const JUMP_DURATION = 0.8;
const MAX_CASCADE = 1.2;
const DRAG_THRESHOLD = 6;
const FLICK_VELOCITY = 0.5;
const MAX_EDGE = 3;
const RELEASE_SPRING = { type: "spring", stiffness: 160, damping: 24 };
// A turning leaf is cut into hinged vertical strips so the sheet can bend
const STRIPS = 12;
const PAPER_CURL = 100; // total bend across the sheet at mid-turn, in degrees
const COVER_CURL = 45;
// Building a leaf's strip layers is costly, so the grabbable leaves are prepared once the book is at rest
const WARM_DELAY = 1200;
const DEG = Math.PI / 180;
// Bend is concentrated towards the free edge, like a sheet lifted by its corner
const WEIGHTS = (() => {
  const raw = Array.from({ length: STRIPS }, (_, k) => 0.5 + k / STRIPS);
  const sum = raw.reduce((a, b) => a + b, 0);
  return raw.map((w) => w / sum);
})();
const CUMULATIVE = WEIGHTS.map((_, k) => WEIGHTS.slice(0, k + 1).reduce((a, b) => a + b, 0));

const clampAngle = (a) => Math.min(0, Math.max(-180, a));
const bendOf = (a) => Math.sin((Math.PI * -clampAngle(a)) / 180);

// Lighting for a surface tilted `phi` degrees away from the reader (0 = flat, -90 = edge-on).
// Applied as overlay opacity only, so a turn never repaints the page images.
const facing = (phi) => Math.min(0, Math.max(-90, phi));
const shadeOf = (phi) => 0.45 * (1 - Math.cos(facing(phi) * DEG));
const glintOf = (phi) => 0.14 * Math.max(0, 1 - Math.abs(facing(phi) + 40) / 28);

// How far the sheet reaches over the book, in page widths (+ right of the spine, − left)
function reachOf(spine, curl) {
  let reach = 0;
  for (let k = 0; k < STRIPS; k++) reach += Math.cos((spine + curl * CUMULATIVE[k]) * DEG);
  return reach / STRIPS;
}

function Underlay({ side, visible }) {
  return (
    <motion.div
      className={`pointer-events-none absolute inset-y-0 w-1/2 ${side === "left" ? "left-0" : "right-0"}`}
      style={{ boxShadow: "0 24px 48px -18px rgba(0,0,0,0.45), 0 2px 6px rgba(0,0,0,0.12)" }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.4 }}
    />
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
function StripFace({ src, slice, isBack, overlap, shade, glint }) {
  const gutter = `linear-gradient(${isBack ? 270 : 90}deg, rgba(0,0,0,0.22), transparent 8%)`;
  const strip = `(100% - ${overlap}px)`;
  return (
    // Wider than the strip so neighbouring strips overlap instead of leaving hairline seams
    <div
      className="absolute inset-y-0 left-0 overflow-hidden bg-[#f8f5ef] will-change-transform"
      style={{
        width: `calc(100% + ${overlap}px)`,
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        transform: isBack ? "rotateY(180deg)" : undefined,
      }}
    >
      {/* the full page, offset so this strip shows its own slice; the mirrored back face starts at the overlap */}
      <div
        className="absolute inset-y-0 bg-no-repeat"
        style={{
          width: `calc(${STRIPS} * ${strip})`,
          left: `calc(${-slice} * ${strip} + ${isBack ? overlap : 0}px)`,
          backgroundImage: src ? `${gutter}, url("${src}")` : gutter,
          backgroundSize: "100% 100%",
        }}
      />
      <motion.div className="absolute inset-0 bg-black will-change-[transform,opacity]" style={{ opacity: shade }} />
      <motion.div className="absolute inset-0 bg-white will-change-[transform,opacity]" style={{ opacity: glint }} />
    </div>
  );
}

function Strip({ k, spine, curl, front, back }) {
  const rotateY = useTransform(curl, (c) => c * WEIGHTS[k]);
  const overlap = k < STRIPS - 1 ? 2 : 0;
  const phi = useTransform([spine, curl], ([s, c]) => s + c * CUMULATIVE[k]);
  const frontShade = useTransform(phi, shadeOf);
  const frontGlint = useTransform(phi, glintOf);
  const backShade = useTransform(phi, (p) => shadeOf(-180 - p));
  const backGlint = useTransform(phi, (p) => glintOf(-180 - p));
  return (
    <motion.div
      className="absolute inset-y-0 will-change-transform"
      style={{
        left: k ? "100%" : 0,
        width: k ? "100%" : `${100 / STRIPS}%`,
        rotateY,
        transformOrigin: "left center",
        transformStyle: "preserve-3d",
      }}
    >
      <StripFace src={front} slice={k} overlap={overlap} shade={frontShade} glint={frontGlint} />
      <StripFace src={back} slice={STRIPS - 1 - k} isBack overlap={overlap} shade={backShade} glint={backGlint} />
      {k < STRIPS - 1 && <Strip k={k + 1} spine={spine} curl={curl} front={front} back={back} />}
    </motion.div>
  );
}

const Leaf = memo(function Leaf({ index, total, front, back, flipped, delay, jump, dragging, dragFollow, grabbable, title }) {
  const angle = useMotionValue(flipped ? -180 : 0);
  // Which way the free edge leads; only changed while the leaf is at rest
  const dir = useMotionValue(flipped ? 1 : -1);
  const [moving, setMoving] = useState(false);
  const [warm, setWarm] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setWarm(grabbable), grabbable ? WARM_DELAY : 0);
    return () => clearTimeout(id);
  }, [grabbable]);
  useEffect(() => {
    const offs = [
      angle.on("animationStart", () => setMoving(true)),
      angle.on("animationComplete", () => setMoving(false)),
    ];
    return () => offs.forEach((off) => off());
  }, [angle]);
  useEffect(() => {
    if (dragging) {
      dir.set(flipped ? 1 : -1);
      return dragFollow.on("change", (v) => angle.set(v));
    }
    const target = flipped ? -180 : 0;
    const remaining = Math.abs(angle.get() - target) / 180;
    if (remaining === 0) return;
    // Full turns follow the book's timing; released or interrupted sheets keep their momentum
    const fromRest = remaining === 1;
    if (fromRest) dir.set(flipped ? -1 : 1);
    const controls = fromRest
      ? animate(angle, target, { duration: jump ? JUMP_DURATION : FLIP_DURATION, ease: FLIP_EASE, delay })
      : animate(angle, target, { ...RELEASE_SPRING, velocity: angle.getVelocity() });
    return () => controls.stop();
  }, [flipped, delay, jump, dragging, dragFollow, angle, dir]);

  const maxCurl = index === 0 || index === total - 1 ? COVER_CURL : PAPER_CURL;
  const bend = useTransform(angle, bendOf);
  const curl = useTransform([bend, dir], ([b, d]) => d * maxCurl * b);
  const spine = useTransform([angle, curl], ([a, c]) => clampAngle(a) - c / 2);
  // Shadow cast on the page beneath: fixed gradients that only scale and fade (no repaints)
  const reach = useTransform([spine, curl], ([s, c]) => reachOf(s, c));
  const castRight = useTransform([reach, bend], ([r, b]) => (r >= 0 ? 0.75 * b : 0));
  const castLeft = useTransform([reach, bend], ([r, b]) => (r < 0 ? 0.75 * b : 0));
  const castWidth = useTransform([reach, bend], ([r, b]) => Math.min(1, Math.abs(r) + 0.12 + 0.28 * b));
  const gutter = useTransform(bend, (b) => 0.9 * b);
  // Page lifts towards the reader mid-turn
  const z = useTransform(bend, (b) => b * 30);
  // A sheet in motion sits above both stacks; at rest it swaps sides at the spine
  const zIndex = useTransform([angle, bend], ([a, b]) =>
    (b > 0.001 ? 4 * total : 0) + 2 * (a < -90 ? index + 1 : total - index)
  );
  const shadowZ = useTransform(zIndex, (v) => v - 1);
  const frontShade = useTransform(angle, [0, -90], [0, 0.4]);
  const backShade = useTransform(angle, [-90, -180], [0.4, 0]);
  // Other resting leaves stay single flat layers; fast multi-page jumps riffle flat too
  const bendable = warm || dragging || (moving && !jump);
  return (
    <>
      {bendable && index < total - 1 && (
        <>
          <motion.div
            className="pointer-events-none absolute inset-y-0 left-1/2 w-1/2 origin-left bg-linear-to-r from-black/50 via-black/25 to-transparent will-change-transform"
            style={{ zIndex: shadowZ, opacity: castRight, scaleX: castWidth }}
          />
          <motion.div
            className="pointer-events-none absolute inset-y-0 left-1/2 w-[5%] bg-linear-to-l from-transparent to-black/30 will-change-[opacity]"
            style={{ zIndex: shadowZ, opacity: gutter }}
          />
        </>
      )}
      {bendable && index > 0 && (
        <>
          <motion.div
            className="pointer-events-none absolute inset-y-0 right-1/2 w-1/2 origin-right bg-linear-to-l from-black/50 via-black/25 to-transparent will-change-transform"
            style={{ zIndex: shadowZ, opacity: castLeft, scaleX: castWidth }}
          />
          <motion.div
            className="pointer-events-none absolute inset-y-0 right-1/2 w-[5%] bg-linear-to-r from-transparent to-black/30 will-change-[opacity]"
            style={{ zIndex: shadowZ, opacity: gutter }}
          />
        </>
      )}
      <motion.div
        className="absolute top-0 left-1/2 h-full w-1/2 will-change-transform"
        style={{
          rotateY: bendable ? spine : angle,
          z,
          zIndex,
          transformOrigin: "left center",
          transformStyle: "preserve-3d",
        }}
      >
        {bendable ? (
          <Strip k={0} spine={spine} curl={curl} front={front} back={back} />
        ) : (
          <>
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
          </>
        )}
      </motion.div>
    </>
  );
});
function pageToLeaf(page) {
  return Math.floor(page / 2);
}
function InteractiveBrochureBook({
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
      startY: e.clientY,
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
      const dx = Math.abs(e.clientX - g.startX);
      const dy = Math.abs(e.clientY - g.startY);
      // Mostly-vertical movement is a page scroll, not a turn
      if (dy > DRAG_THRESHOLD && dy > dx) {
        gesture.current = null;
        return;
      }
      if (dx < DRAG_THRESHOLD) return;
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
    // Solve for the turn that keeps the grabbed point under the pointer (x = reach · cos θ)
    const reach = Math.max(Math.abs(g.startX - g.spine), g.pageWidth / 2);
    const offset = (g.forward ? e.clientX - g.spine : g.spine - e.clientX) / reach;
    const progress = Math.acos(Math.min(Math.max(offset, -1), 1)) / Math.PI;
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
  // The browser took over (e.g. a scroll began): let the sheet fall back
  const cancelGesture = () => {
    const g = gesture.current;
    gesture.current = null;
    if (g?.started) setDragIndex(null);
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
          onPointerCancel={cancelGesture}
          animate={{ x: shift }}
          transition={{ duration: bookDuration, ease: FLIP_EASE }}
          className={`relative -ml-[4%] w-[108%] select-none outline-none touch-pan-y md:ml-0 md:w-full ${dragIndex !== null ? "cursor-grabbing" : "cursor-grab"
            }`}
          style={{ aspectRatio: `${pageAspect * 2}`, perspective: 2500 }}
        >
          {/* floor shadow */}
          <div className="pointer-events-none absolute -bottom-10 left-[6%] right-[6%] h-14 rounded-[50%] bg-black/35 blur-2xl" />
          <Underlay side="left" visible={flipped > 0} />
          <Underlay side="right" visible={flipped < total} />
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
              grabbable={i === flipped || i === flipped - 1}
              title={title}
            />
          ))}
          {/* crease where the pages bend into the spine */}
          <motion.div
            className="pointer-events-none absolute inset-y-0 left-1/2 w-24 -translate-x-1/2"
            style={{
              zIndex: 6 * total + 2,
              background:
                "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.12) 35%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.12) 65%, transparent 100%)",
            }}
            animate={{ opacity: isOpen ? 1 : 0 }}
            transition={{ duration: 0.4 }}
          />
        </motion.div>
      </motion.div>

      <div className="mt-15 flex w-full flex-col items-center justify-center gap-3 md:flex-row md:gap-[220px]">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#0f3d20] md:text-sm">
          {label}
          <span className="ml-2 font-normal normal-case tracking-normal text-gray-400">
            of {pageCount}
          </span>
        </p>
        <form onSubmit={onJumpSubmit} className="flex items-center justify-center gap-2 text-xs md:text-sm">
          <label htmlFor="brochure-page" className="text-gray-500">Go to page</label>
          <input
            id="brochure-page"
            type="number"
            inputMode="numeric"
            min={1}
            max={pageCount}
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            placeholder={`1–${pageCount}`}
            className="w-18 rounded-full border border-[#d1b38c] bg-white px-3 py-1.5 text-center text-[#0f3d20] outline-none focus:ring-2 focus:ring-[#c29e6d]/40 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none md:w-20"
          />
          <button type="submit" className="cursor-pointer rounded-full bg-[#0f3d20] px-4 py-1.5 font-semibold text-white transition hover:bg-[#145530]">
            Go
          </button>
        </form>
      </div>

    </div>
  );
}
// Only Prime Mall & Suites has a published brochure.
// If no building is passed, preserve the existing standalone flipbook behavior.
export default function BrochureBook({ building, pages = [], title = "Brochure", pageAspect = 1.1 }) {
  const projectName = typeof building === "string" ? building : building?.name;
  const hasSelectedProject = Boolean(projectName);
  const isSuites = projectName?.trim().toLowerCase() === "prime mall & suites";
  if (hasSelectedProject && !isSuites) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 text-center md:py-12">
        <div className="rounded-3xl border border-[#d1b38c]/35 bg-[#faf8f5] px-6 py-10 md:px-10 md:py-14">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#d1b38c]/15 text-[#8B5E3C]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" aria-hidden="true">
              <path d="M12 7v14M3 18V5a2 2 0 0 1 2-2h3a4 4 0 0 1 4 4 4 4 0 0 1 4-4h3a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2h-3a4 4 0 0 0-4 4 4 4 0 0 0-4-4H5a2 2 0 0 0-2 2Z" />
            </svg>
          </div>
          <h3 className="mt-5 text-xl font-semibold text-[#0f3d20] md:text-2xl">Brochure Coming Soon</h3>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-gray-600 md:text-base">
            We're preparing the brochure for {projectName}. Check back soon for project details and updates.
          </p>
        </div>
      </div>
    );
  }
  return <InteractiveBrochureBook pages={pages} title={title} pageAspect={pageAspect} />;
}
