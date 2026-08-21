"use client";

import { useState } from "react";
import type { PublicListingDetail } from "@/src/features/marketplace/public-api";

export default function ListingGallery({ listing }: { listing: PublicListingDetail }) {
  // `gallery` isn't on PublicListingSerializer yet (see public-api.ts) - falls
  // back to the single `image` field, then to an empty state.
  const images = listing.gallery?.length ? listing.gallery : listing.image ? [listing.image] : [];
  const [active, setActive] = useState(0);

  return (
    <div className="bg-white border border-[#E9ECF2] rounded-xl p-4">
      <div className="aspect-[16/10] rounded-lg border border-[#E9ECF2] bg-gray-50 overflow-hidden flex items-center justify-center">
        {images[active] ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote S3 host isn't in next.config.ts remotePatterns
          <img src={images[active]} alt={listing.mineral_type} className="w-full h-full object-cover" />
        ) : (
          <span className="text-gray-300 text-sm">No image available</span>
        )}
      </div>

      <div className="flex gap-3 mt-3">
        {Array.from({ length: Math.max(images.length, 3) }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => images[i] && setActive(i)}
            className={`w-20 h-16 rounded-lg border overflow-hidden shrink-0 bg-gray-50 ${
              active === i ? "border-[#101E3D]" : "border-[#E9ECF2]"
            }`}
          >
            {images[i] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={images[i]} alt="" className="w-full h-full object-cover" />
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
}
