"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Autoplay, Pagination } from "swiper/modules";
import { FiImage, FiVideo } from "react-icons/fi";
import FullScreenImageModal from "@/Component/FullscreenImageModal";

const TABS = [
  { key: "photos", label: "Photos", icon: <FiImage /> },
  { key: "videos", label: "Video", icon: <FiVideo /> },
];

function MediaSwiper({ items, onImageClick }) {
  return (
    <div className="w-full pb-12 overflow-visible relative">
      <Swiper
        loop={items.length > 1}
        centeredSlides
        slidesPerView={1.25}
        spaceBetween={30}
        observer={true}
        observeParents={true}
        autoplay={{
          delay: 3500,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          el: ".media-pagination",
        }}
        breakpoints={{
          0: { slidesPerView: 1 },
          768: { slidesPerView: 1.25 },
        }}
        modules={[Autoplay, Pagination]}
        className="mediaSwiper"
      >
        {items.map((item, index) => (
          <SwiperSlide
            key={item.id}
            className="rounded-4xl overflow-hidden"
          >
            <div
              className="relative w-full h-[55vh] md:h-[77vh] cursor-pointer"
              onClick={() => onImageClick(index)}
            >
              <Image
                src={item.src}
                alt={item.alt || "Media"}
                fill
                quality={95}
                className="object-cover rounded-4xl"
                priority
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="media-pagination mt-10 flex justify-center gap-2"></div>

      <style jsx global>{`
        .mediaSwiper {
          padding-top: 10px;
          padding-bottom: 20px;
          overflow: visible !important;
        }

        .mediaSwiper .swiper-slide {
          opacity: 0.4;
          transform: scale(0.85);
          transition: all 0.5s ease;
        }

        .mediaSwiper .swiper-slide-active {
          opacity: 1;
          transform: scale(1.02);
        }

        .media-pagination .swiper-pagination-bullet {
          width: 30px;
          height: 4px;
          border-radius: 4px;
          background: #d1d5db;
          opacity: 1;
          transition: all 0.3s ease;
        }

        .media-pagination .swiper-pagination-bullet-active {
          background: #facc15;
          width: 45px;
        }
      `}</style>
    </div>
  );
}

export default function ProjectMediaSection({ project }) {
  const [activeTab, setActiveTab] = useState("photos");
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

  const media = project?.media ?? { photos: [], plans: [], videos: [] };

  const content = useMemo(() => {
    if (activeTab === "photos") return { type: "images", items: media.photos };
    return { type: "videos", items: media.videos };
  }, [activeTab, media.photos, media.videos]);

  const hasItems = content.items && content.items.length > 0;

  const handleNext = () => {
    if (!media.photos.length) return;
    setSelectedImageIndex((prev) => (prev + 1) % media.photos.length);
  };

  const handlePrev = () => {
    if (!media.photos.length) return;
    setSelectedImageIndex((prev) =>
      prev === 0 ? media.photos.length - 1 : prev - 1
    );
  };

  return (
    <section className="w-full px-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-4xl md:text-5xl lg:ms-8 parisienne-font text-center lg:text-center py-5 lg:py-0 text-black">
          Media
        </h2>

        <div className="grid grid-cols-2 gap-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center justify-center gap-2 rounded-full border md:px-6 px-3 py-3 text-sm md:text-base transition-all duration-300
                  ${
                    isActive
                      ? "bg-green-800 text-white"
                      : "bg-white border-gray-200 text-black hover:bg-gray-50"
                  }
                `}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-18">
        {!hasItems && (
          <div className="rounded-3xl border border-gray-200 bg-white p-8 text-black/60">
            No media available.
          </div>
        )}

        {hasItems && content.type === "images" && (
          <MediaSwiper
            key={activeTab}
            items={content.items}
            onImageClick={setSelectedImageIndex}
          />
        )}

        {content.type === "videos" && (
          <div className="flex flex-col gap-8">
            {content.items.map((video) => (
              <div
                key={video.id}
                className="rounded-4xl overflow-hidden border border-gray-200 bg-black"
              >
                <video
                  controls
                  preload="metadata"
                  className="w-full h-[550px] md:h-[560px] object-cover"
                >
                  {video.src?.endsWith(".webm") ? (
                    <source src={video.src} type="video/webm" />
                  ) : null}
                  <source
                    src={video.fallbackSrc || video.src}
                    type="video/mp4"
                  />
                </video>
                {video.title && (
                  <div className="px-5 py-4 bg-white">
                    <p className="text-sm font-medium text-black">
                      {video.title}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <FullScreenImageModal
        images={media.photos}
        selectedIndex={selectedImageIndex ?? 0}
        isOpen={selectedImageIndex !== null}
        onClose={() => setSelectedImageIndex(null)}
        onNext={handleNext}
        onPrev={handlePrev}
      />
    </section>
  );
}