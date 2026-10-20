
"use client";

import { useState } from "react";
import FindYourUnit from "@/Component/booking/FindYourUnit";
import FloorExplorer from "@/Component/booking/FloorExplorer";
import bookingData from "@/data/booking.json";

export default function ProjectUnitExplorer({ project }) {
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [showInventory, setShowInventory] = useState(false);

  const building = bookingData.buildings.find(
    (item) => item.id === project?.id
  );

  if (!building || !building.floors?.length) {
    return null;
  }

  const handleTypeChange = (types) => {
    // Remove the visual-only placeholder.
    const cleanTypes = types.filter(
      (type) => type !== "__none__"
    );

    // Clicking All Units again hides the inventory.
    if (
      cleanTypes.length === 0 &&
      showInventory &&
      selectedTypes.length === 0
    ) {
      setSelectedTypes([]);
      setShowInventory(false);
      return;
    }

    setSelectedTypes(cleanTypes);
    setShowInventory(true);
  };

  return (
    <section className="mx-auto w-full max-w-[1504px] px-4 py-12 lg:px-8 lg:py-20">
      <FindYourUnit
        building={building}
        selected={
          !showInventory && selectedTypes.length === 0
            ? ["__none__"]
            : selectedTypes
        }
        onChange={handleTypeChange}
      />

      {showInventory && (
        <div
          id="project-unit-explorer"
          className="mt-10 lg:mt-16"
        >
          <FloorExplorer
            key={building.id}
            building={building}
            selectedTypes={selectedTypes}
            onTypesChange={handleTypeChange}
          />
        </div>
      )}
    </section>
  );
}
