"use client";

import { useState } from "react";
import { opportunitiesStats, transportListings, TransportListing } from "./data";
import { IconBoard, IconClock, IconTruck, IconBox, IconCheck, IconWarning } from "./icons";

const statIcons = [IconBoard, IconClock, IconTruck, IconBox];

function priorityBadge(priority: TransportListing["priority"]) {
  if (priority === "High Priority") return "bg-red-50 text-red-600";
  if (priority === "Medium Priority") return "bg-amber-50 text-amber-600";
  return "bg-gray-100 text-gray-600";
}

function ListingCard({ listing }: { listing: TransportListing }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{listing.title}</h3>
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${priorityBadge(listing.priority)}`}>
              {listing.priority}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {listing.trpId} · Posted by {listing.postedBy}
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-600 text-xs font-medium px-2.5 py-1 whitespace-nowrap shrink-0">
          <IconClock className="w-3.5 h-3.5" />
          {listing.hoursRemaining}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="flex flex-col gap-3 text-sm">
          <div className="flex items-start gap-2">
            <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
            <div>
              <div className="text-gray-800 font-medium">{listing.origin.name}</div>
              <div className="text-xs text-gray-400">{listing.origin.sub}</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0" />
            <div>
              <div className="text-gray-800 font-medium">{listing.destination.name}</div>
              <div className="text-xs text-gray-400">{listing.destination.sub}</div>
            </div>
          </div>
          <div className="flex gap-6 text-xs text-gray-500">
            <div>
              <div className="text-gray-400 uppercase tracking-wide">Distance</div>
              <div className="text-gray-800 mt-0.5">{listing.distanceKm}</div>
            </div>
            <div>
              <div className="text-gray-400 uppercase tracking-wide">Transit</div>
              <div className="text-gray-800 mt-0.5">{listing.transitDays}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-sm content-start">
          <div>
            <div className="text-[11px] text-gray-400 uppercase tracking-wide">Mineral</div>
            <div className="text-gray-800 mt-0.5">{listing.mineral}</div>
          </div>
          <div>
            <div className="text-[11px] text-gray-400 uppercase tracking-wide">Cargo Weight</div>
            <div className="text-gray-800 mt-0.5">{listing.cargoWeight}</div>
          </div>
          <div>
            <div className="text-[11px] text-gray-400 uppercase tracking-wide">Packaging</div>
            <div className="text-gray-800 mt-0.5">{listing.packaging}</div>
          </div>
          <div>
            <div className="text-[11px] text-gray-400 uppercase tracking-wide">Pickup Window</div>
            <div className="text-gray-800 mt-0.5">{listing.pickupWindow}</div>
          </div>
          <div>
            <div className="text-[11px] text-gray-400 uppercase tracking-wide">Delivery Window</div>
            <div className="text-gray-800 mt-0.5">{listing.deliveryWindow}</div>
          </div>
          <div>
            <div className="text-[11px] text-gray-400 uppercase tracking-wide">Vehicle Requirement</div>
            <div className="text-gray-800 mt-0.5">{listing.vehicleRequirement}</div>
          </div>

          <div className="col-span-3 flex flex-wrap gap-1.5 mt-1">
            {listing.tags.map((t) => (
              <span
                key={t.label}
                className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                  t.met ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"
                }`}
              >
                {t.met ? <IconCheck className="w-2.5 h-2.5" /> : <IconWarning className="w-2.5 h-2.5" />}
                {t.label}
              </span>
            ))}
          </div>
        </div>

        <div className="border border-gray-100 rounded-lg p-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-700">Fleet Compatibility</span>
            <span className="text-sm font-semibold text-primary">{listing.fleetCompatibilityPct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden mb-3">
            <div
              className="h-full bg-primary rounded-full"
              style={{ width: `${listing.fleetCompatibilityPct}%` }}
            />
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 flex items-center gap-1">
                <IconCheck className="w-3 h-3 text-green-600" /> Available Vehicles
              </span>
              <span className="text-gray-800 font-medium">{listing.availableVehicles}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 flex items-center gap-1">
                <IconCheck className="w-3 h-3 text-green-600" /> Certified Drivers
              </span>
              <span className="text-gray-800 font-medium">{listing.certifiedDrivers}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 flex items-center gap-1">
                <IconCheck className="w-3 h-3 text-green-600" /> Insurance Status
              </span>
              <span className="text-gray-800 font-medium">{listing.insuranceStatus}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 flex items-center gap-1">
                <IconCheck className="w-3 h-3 text-green-600" /> Roadworthiness
              </span>
              <span className="text-gray-800 font-medium">{listing.roadworthiness}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <span className="text-xs text-gray-400">{listing.postedAgo}</span>
        <div className="flex gap-2">
          <button className="text-sm px-4 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">
            View Details
          </button>
          <button className="text-sm px-4 py-1.5 rounded-lg bg-primary text-white hover:bg-primary/90">
            Submit Interest
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TransportOpportunitiesView() {
  const [query, setQuery] = useState("");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Transport Opportunities</h1>
        <p className="text-sm text-gray-400 mt-1">
          Browse transport opportunities that match your fleet, operating regions, and delivery capabilities.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {opportunitiesStats.map((s, i) => {
          const Icon = statIcons[i];
          return (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                <span className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center text-primary">
                  <Icon className="w-4 h-4" />
                </span>
                {s.label}
              </div>
              <div className="text-2xl font-semibold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-400 mt-1">{s.sub}</div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Job ID, mineral, buyer, location..."
          className="flex-1 min-w-[220px] bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 outline-none"
        />
        <button className="text-sm px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
          Origin State
        </button>
        <button className="text-sm px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
          Vehicle Type
        </button>
        <button className="text-sm px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
          Response Deadline
        </button>
        <button className="text-sm px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
          Sort · Closing Soon
        </button>
        <button className="text-sm px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-50">
          Clear Filters
        </button>
        <button className="text-sm px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90">
          Apply Filters
        </button>
      </div>

      <div className="space-y-5">
        {transportListings.map((listing, i) => (
          <ListingCard key={`${listing.trpId}-${i}`} listing={listing} />
        ))}
      </div>
    </div>
  );
}
