"use client";

import Image from "next/image";
import bookingData from "@/data/booking.json";
import { formatArea, statusStyle, unitTypeLabel } from "./UnitCard";

const STATUSES = bookingData.config.statuses;

export const hasRealPlan = (floor) =>
  Boolean(floor.floorPlanImage) && !floor.isDemoPlan && floor.units.some((u) => u.hitArea);

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-600">
      {STATUSES.map((s) => (
        <span key={s} className="flex items-center gap-1.5">
          <span className={`h-2.5 w-2.5 rounded-sm ${statusStyle(s).dot}`} />
          {s}
        </span>
      ))}
    </div>
  );
}

// hitArea is in planViewBox units: { x, y, width, height } or { points: "x1,y1 x2,y2 ..." }
function HitShape({ unit, isActive, onSelect }) {
  const { fill } = statusStyle(unit.status);
  const common = {
    fill,
    fillOpacity: isActive ? 0.75 : 0.35,
    stroke: isActive ? "#111" : fill,
    strokeWidth: isActive ? 4 : 2,
    className: "cursor-pointer transition-opacity hover:opacity-80",
    onClick: () => onSelect(unit.id),
  };
  const { hitArea: h } = unit;

  if (h.points) {
    return (
      <polygon points={h.points} {...common}>
        <title>{`${unit.number} · ${unit.status}`}</title>
      </polygon>
    );
  }
  return (
    <g>
      <rect x={h.x} y={h.y} width={h.width} height={h.height} rx={4} {...common}>
        <title>{`${unit.number} · ${unit.status}`}</title>
      </rect>
      <text
        x={h.x + h.width / 2}
        y={h.y + h.height / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        className="pointer-events-none fill-gray-900 text-[18px] font-bold"
      >
        {unit.number}
      </text>
    </g>
  );
}

function RealPlan({ floor, selectedUnitId, onSelect }) {
  const { width, height } = floor.planViewBox ?? { width: 1000, height: 700 };
  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-50" style={{ aspectRatio: `${width} / ${height}` }}>
      <Image src={floor.floorPlanImage} alt={`${floor.name} plan`} fill className="object-contain" />
      <svg viewBox={`0 0 ${width} ${height}`} className="absolute inset-0 h-full w-full">
        {floor.units
          .filter((u) => u.hitArea)
          .map((u) => (
            <HitShape key={u.id} unit={u} isActive={u.id === selectedUnitId} onSelect={onSelect} />
          ))}
      </svg>
    </div>
  );
}

function IndicativeMap({ floor, selectedUnitId, onSelect }) {
  const units = [...floor.units].sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }));
  return (
    <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-[repeating-linear-gradient(45deg,#fafafa,#fafafa_10px,#f4f4f5_10px,#f4f4f5_20px)] p-3">
      <div className="flex flex-wrap gap-2">
        {units.map((u) => {
          const st = statusStyle(u.status);
          const isActive = u.id === selectedUnitId;
          return (
            <button
              key={u.id}
              type="button"
              onClick={() => onSelect(u.id)}
              title={`${u.number} · ${unitTypeLabel(u.type)} · ${formatArea(u.areaSqFt)} · ${u.status}`}
              style={{
                flexGrow: u.areaSqFt,
                flexBasis: `${Math.max(64, Math.sqrt(u.areaSqFt) * 6)}px`,
                backgroundColor: isActive ? st.fill : st.soft,
                borderColor: st.fill,
              }}
              className={`flex min-h-16 flex-col items-center justify-center rounded-lg border-2 px-2 py-2 text-center transition-all hover:-translate-y-0.5 hover:shadow-md ${
                isActive ? "text-white shadow-lg ring-2 ring-black ring-offset-2" : "text-gray-800"
              }`}
            >
              <span className="text-sm font-bold leading-none">{u.number}</span>
              <span className={`mt-1 text-[10px] leading-none ${isActive ? "text-white/90" : "text-gray-500"}`}>
                {formatArea(u.areaSqFt)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function FloorPlanMap({ floor, selectedUnitId, onSelect }) {
  const real = hasRealPlan(floor);
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{real ? "Floor plan" : "Unit map"}</h3>
          <p className="text-xs text-gray-500">
            {real
              ? "Tap any unit on the plan to see its details."
              : "Indicative view, tile size reflects unit area. Exact positions shown on the approved floor plan, available on request."}
          </p>
        </div>
        <Legend />
      </div>
      {real ? (
        <RealPlan floor={floor} selectedUnitId={selectedUnitId} onSelect={onSelect} />
      ) : (
        <IndicativeMap floor={floor} selectedUnitId={selectedUnitId} onSelect={onSelect} />
      )}
    </div>
  );
}
