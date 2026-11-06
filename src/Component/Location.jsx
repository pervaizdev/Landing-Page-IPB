import { projects } from "@/data/card.js";

// Component/LocationMapCard.jsx
export default function LocationMapCard({ project }) {
  return (
    <div className="lg:px-6 mt-40 px-2">
      <h2 className="text-4xl lg:text-5xl parisienne-font text-center lg:text-start text-black">
        Location
      </h2>

      <div className="mt-12 h-90 lg:h-110 w-full overflow-hidden rounded-3xl lg:rounded-[36px] bg-white">
        <iframe
          title="Map"
          className="h-full w-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={project?.mapUrl}
        />
      </div>
    </div>
  );
}