"use client";

import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
import { HiXMark } from "react-icons/hi2";
import {
  formatArea,
  formatCompactPKR,
  formatPKR,
  statusStyle,
  unitCategory,
  unitTypeLabel,
} from "./UnitCard";
import bookingData from "@/data/booking.json";

function whatsappLink(building, floor, unit) {
  const text = [
    "Assalam o Alaikum, I am interested in booking:",
    `Project: ${building.name}`,
    `Floor: ${floor.name}`,
    `Unit: ${unit.number} (${unitTypeLabel(unit.type)})`,
    `Area: ${formatArea(unit.areaSqFt)}`,
    `Price: ${formatPKR(unit.pricePkr)}`,
  ].join("\n");
  return `https://wa.me/${bookingData.config.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl bg-gray-50 p-3">
      <p className="text-[11px] uppercase tracking-wider text-gray-400">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}

export default function UnitDetail({ building, floor, unit, onClose }) {
  const st = statusStyle(unit.status);
  const isOpen = unit.status === "Available";
  const installmentsTotal = (unit.monthlyInstallmentPkr ?? 0) * (unit.installmentMonths ?? 0);
  const bookingShare = unit.pricePkr ? (unit.bookingAmountPkr / unit.pricePkr) * 100 : 0;

  return (
    <motion.div
      key={unit.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl shadow-black/5"
    >
      <div className="p-4 sm:p-6 text-left">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] sm:text-xs uppercase tracking-wider text-[#8B5E3C] font-semibold">
              {building.name} · {floor.name}
            </p>
            <h3 className="mt-0.5 sm:mt-1 text-2xl sm:text-3xl font-extrabold text-gray-900">{unit.number}</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              {unitTypeLabel(unit.type)} · {unitCategory(unit)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`rounded-full border px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-semibold ${st.badge}`}>{unit.status}</span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close details"
              className="grid h-8 w-8 place-items-center rounded-full border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-black transition-colors cursor-pointer"
            >
              <HiXMark className="text-lg" />
            </button>
          </div>
        </div>

        {unit.features?.length > 0 && (
          <div className="mt-3 sm:mt-4 flex flex-wrap gap-1.5">
            {unit.features.map((f) => (
              <span key={f} className="rounded-full bg-emerald-50/80 border border-emerald-900/10 px-2.5 py-0.5 sm:py-1 text-[11px] sm:text-xs font-semibold text-[#0f3d20]">
                {f}
              </span>
            ))}
          </div>
        )}

        {/* Clean Luxury Total Price Card */}
        <div className="mt-4 sm:mt-5 rounded-2xl bg-[#faf8f5] border border-[#eee5d8] p-3.5 sm:p-4.5 shadow-2xs">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#8B5E3C]">Total Price</p>
            <span className="text-xs font-semibold text-gray-500">{formatCompactPKR(unit.pricePkr)}</span>
          </div>
          <p className="mt-1 text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#0f3d20] tracking-tight truncate">{formatPKR(unit.pricePkr)}</p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Stat label="Area" value={formatArea(unit.areaSqFt)} />
          <Stat label="Rate / sq.ft" value={formatPKR(unit.pricePerSqFt)} />
          {unit.facing && <Stat label="Facing" value={unit.facing} />}
          {unit.position && <Stat label="Position" value={unit.position} />}
        </div>

        {unit.bookingAmountPkr != null && (
          <div className="mt-5">
            <h4 className="text-sm font-bold text-gray-900">Payment plan</h4>
            <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-gray-100">
              <div className="bg-[#0f3d20]" style={{ width: `${bookingShare}%` }} />
              <div className="flex-1 bg-gray-300" />
            </div>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <span className="flex items-center gap-2 text-gray-600">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#0f3d20]" />
                  Booking ({Math.round(bookingShare)}%)
                </span>
                <span className="font-semibold text-gray-900">{formatPKR(unit.bookingAmountPkr)}</span>
              </div>
              {unit.installmentMonths > 0 && (
                <div className="flex justify-between gap-3">
                  <span className="flex items-center gap-2 text-gray-600">
                    <span className="h-2.5 w-2.5 rounded-full bg-gray-400" />
                    {unit.installmentMonths} monthly installments
                  </span>
                  <span className="font-semibold text-gray-900">{formatPKR(unit.monthlyInstallmentPkr)} / mo</span>
                </div>
              )}
              {installmentsTotal > 0 && (
                <div className="flex justify-between gap-3 border-t border-gray-100 pt-2 text-xs text-gray-500">
                  <span>Installments total</span>
                  <span>{formatPKR(installmentsTotal)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {unit.note && <p className="mt-5 rounded-xl bg-gray-50 p-3 text-xs leading-relaxed text-gray-500">{unit.note}</p>}

        {/* WhatsApp CTA Button */}
        <a
          href={whatsappLink(building, floor, unit)}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-6 flex w-full items-center justify-center gap-2.5 rounded-full px-5 py-3.5 text-sm font-semibold transition-all duration-300 shadow-md hover:shadow-lg active:scale-[0.99] cursor-pointer ${isOpen
              ? "bg-[#0f3d20] text-white hover:bg-[#16562f]"
              : "bg-gray-800 text-white hover:bg-gray-900"
            }`}
        >
          <FaWhatsapp className={`text-xl ${isOpen ? "text-[#25D366]" : "text-gray-300"}`} />
          <span>{isOpen ? "Book this unit on WhatsApp" : `Unit is ${unit.status.toLowerCase()}, ask for similar`}</span>
        </a>
      </div>
    </motion.div>
  );
}
