"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { HiXMark } from "react-icons/hi2";
import {
  StatusDot,
  formatArea,
  formatMillions,
  formatPKR,
  statusColors,
  unitClass,
  unitLabel,
  unitTypeShort,
} from "./UnitCard";

const hasNumber = (value) => value != null && value !== "" && Number.isFinite(Number(value));
const formatMillionBillion = (value) => {
  const num = Number(value);

  if (!Number.isFinite(num)) return "—";

  const format = (amount) =>
    parseFloat(amount.toFixed(2)).toLocaleString("en-US");

  if (Math.abs(num) >= 1_000_000_000) {
    return `${format(num / 1_000_000_000)} B`;
  }

  if (Math.abs(num) >= 1_000_000) {
    return `${format(num / 1_000_000)} M`;
  }

  if (Math.abs(num) >= 1_000) {
    return `${format(num / 1_000)} K`;
  }

  return format(num);
};
const propertyType = (unit) => [unitClass(unit), unitTypeShort(unit)].filter(Boolean).join(" ");

function DetailRow({ label, value, prominent = false }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-100 py-2 last:border-b-0">
      <span className="min-w-0 text-sm leading-5 text-gray-600">{label}</span>
      <span className={`min-w-0 max-w-[58%] text-right leading-5 text-[#153D2A] ${prominent ? "text-base font-bold" : "text-sm font-semibold"}`}>
        {value}
      </span>
    </div>
  );
}

export default function UnitDetail({ building, floor, unit, onClose, layout = "modal" }) {
  const isSidebar = layout === "sidebar";
  const closeRef = useRef(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const trigger = !isSidebar ? document.activeElement : null;
    if (!isSidebar) closeRef.current?.focus({ preventScroll: true });
    const onKey = (event) => event.key === "Escape" && onCloseRef.current?.();
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      if (!isSidebar && trigger instanceof HTMLElement && document.contains(trigger)) {
        trigger.focus({ preventScroll: true });
      }
    };
  }, [isSidebar]);

  const title = unitLabel(unit, floor);
  const colors = statusColors(unit.status);
  const months = Number(unit.installmentMonths) || 0;
  const hasDown = hasNumber(unit.bookingAmountPkr) && Number(unit.bookingAmountPkr) > 0;
  const hasMonthly = hasNumber(unit.monthlyInstallmentPkr) && Number(unit.monthlyInstallmentPkr) > 0;
  const installmentsTotal = hasMonthly && months > 0 ? Number(unit.monthlyInstallmentPkr) * months : null;
  const downPct = hasDown && Number(unit.pricePkr) > 0
    ? `${Number(((Number(unit.bookingAmountPkr) / Number(unit.pricePkr)) * 100).toFixed(1))}%`
    : null;
  const paidSum = installmentsTotal != null && hasDown ? Number(unit.bookingAmountPkr) + installmentsTotal : null;
  const discrepancy = paidSum != null && hasNumber(unit.pricePkr) && Math.abs(paidSum - Number(unit.pricePkr)) > 100;

  return (
    <motion.div
      key={unit.id}
      role={isSidebar ? "region" : "dialog"}
      aria-label={`${title} details`}
      data-lenis-prevent
      initial={{ opacity: 0, y: isSidebar ? 12 : 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: isSidebar ? 0.7 : 0.55, ease: [0.16, 1, 0.3, 1] }}
      className={`flex w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[#E8DFD2] bg-white shadow-sm ${isSidebar ? "max-h-[calc(100dvh-1.5rem)]" : ""}`}
    >
      <div className={`flex min-h-0 flex-1 flex-col ${isSidebar ? "p-3" : "p-4 sm:p-5"}`}>
        <div className="shrink-0 border-b border-gray-200 pb-2.5">
          <div className="flex items-start justify-between gap-3">
            <p className="min-w-0 pt-1 text-sm font-semibold text-[#A58253]">{building.name}</p>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close details"
              className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c29e6d]"
            >
              <HiXMark className="text-lg" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-1 flex items-center justify-between gap-3">
            <h3 className="min-w-0 break-words text-xl font-bold leading-tight text-[#153D2A]">{title}</h3>
            <span
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
              style={{ backgroundColor: colors.bg, color: colors.text }}
            >
              <StatusDot status={unit.status} />
              {unit.status}
            </span>
          </div>
        </div>
        <div className={`min-h-0 flex-1 overscroll-contain ${isSidebar ? "overflow-y-auto pr-1 [scrollbar-width:thin]" : ""}`} data-lenis-prevent>
        <div className="pt-2">
          {hasNumber(unit.pricePkr) && <DetailRow label="Total Price" value={`${formatMillionBillion(unit.pricePkr)}`} prominent />}
          <DetailRow label="Property Type" value={propertyType(unit) || "—"} />
          <DetailRow label="Floor" value={floor.name} />
          {hasNumber(unit.areaSqFt) && <DetailRow label="Area" value={formatArea(unit.areaSqFt)} />}
          {hasNumber(unit.pricePerSqFt) && <DetailRow label="Price Per Sq Ft" value={`${formatMillionBillion(unit.pricePerSqFt)}`} />}
          {unit.facing && <DetailRow label="Facing" value={unit.facing} />}
          {unit.position && <DetailRow label="Position" value={unit.position} />}
          {unit.features?.length > 0 && (
            <DetailRow label="Features" value={unit.features.join(", ")} />
          )}
        </div>

        {(hasDown || hasMonthly) && (
          <section aria-label="Payment details" className="mt-2.5">
            <h4 className="border-b border-gray-200 pb-1.5 text-base font-bold text-[#153D2A]">Payment details</h4>
            {hasDown && (
              <DetailRow
                label={downPct ? `Initial Down Payment (${downPct})` : "Initial Down Payment"}
                value={`${formatMillionBillion(unit.bookingAmountPkr)}`}
              />
            )}
            {hasMonthly && <DetailRow label="Monthly Installment" value={`${formatMillionBillion(unit.monthlyInstallmentPkr)}`} />}
            {months > 0 && <DetailRow label="Payment Period" value={`${months} months`} />}
            {installmentsTotal != null && <DetailRow label="Total Monthly Installments" value={`${formatMillionBillion(installmentsTotal)}`} />}
            {discrepancy && (
              <p className="mt-2 text-xs leading-relaxed text-[#946b39]">
                Note: the initial down payment plus total monthly installments ({formatMillionBillion(paidSum)} PKR) differs from the listed total price ({formatMillionBillion(unit.pricePkr)} PKR).
              </p>
            )}
          </section>
        )}

        {unit.note && <p className="mt-3 text-sm leading-relaxed text-gray-600">{unit.note}</p>}

        </div>
        <Link
          href="/contact"
          className="mt-2.5 flex min-h-11 w-full shrink-0 items-center justify-center rounded-full bg-[#153D2A] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1d5238] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A06B] focus-visible:ring-offset-2"
        >
          Contact Us
        </Link>
      </div>
    </motion.div>
  );
}
