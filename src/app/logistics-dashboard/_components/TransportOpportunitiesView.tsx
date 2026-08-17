"use client";

import { useMemo, useState } from "react";
import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  CheckOutlined,
  InboxOutlined,
  FieldTimeOutlined,
  AimOutlined,
  FileSearchOutlined,
} from "@ant-design/icons";
import { classNames, statusStyles } from "@/src/features/compliance/dashboard/lib/style";
import { opportunitiesStats, transportListings, TransportListing } from "./data";
import { Opportunity, opportunities } from "./data";
import OpportunityDetailPanel from "./OpportunityDetailPanel";
import SubmitInterestModal from "./SubmitInterestModal";

const statIcons = [InboxOutlined, FieldTimeOutlined, AimOutlined, FileSearchOutlined];

function priorityStyle(priority: TransportListing["priority"]) {
  if (priority === "High Priority") return statusStyles.red;
  if (priority === "Medium Priority") return statusStyles.amber;
  return statusStyles.slate;
}

function ListingCard({
  listing,
  onViewDetails,
  onSubmitInterest,
}: {
  listing: TransportListing;
  onViewDetails: () => void;
  onSubmitInterest: () => void;
}) {
  const priority = priorityStyle(listing.priority);
  return (
    <div className="rounded-[16px] border border-[#e8ecf4] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)]">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-[#172554]">{listing.title}</h3>
            <span className={classNames("text-[11px] font-medium px-2 py-0.5 rounded-full", priority.container)}>
              {listing.priority}
            </span>
          </div>
          <p className="text-xs text-[#8b93a1] mt-0.5">
            {listing.trpId} · Posted by {listing.postedBy}
          </p>
        </div>
        <span
          className={classNames(
            "inline-flex items-center gap-1 rounded-full text-xs font-medium px-2.5 py-1 whitespace-nowrap shrink-0",
            statusStyles.amber.container,
          )}
        >
          <ClockCircleOutlined className="text-[12px]" />
          {listing.hoursRemaining}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_240px] gap-4 mt-4">
        <div className="rounded-[12px] border border-[#e8ecf4] bg-[#fafbfd] px-4 py-3">
          <div className="flex items-start gap-2">
            <EnvironmentOutlined className="mt-1 text-[11px] text-[#101e3d]" />
            <div>
              <div className="text-[13px] font-semibold text-[#293041]">{listing.origin.name}</div>
              <div className="text-[11px] text-[#8b93a1]">{listing.origin.sub}</div>
            </div>
          </div>
          <div className="my-2 ml-[5px] h-3 w-px bg-[#dbe0ea]" />
          <div className="flex items-start gap-2">
            <span className="mt-1 h-2 w-2 rounded-full bg-[#1ea43b]" />
            <div>
              <div className="text-[13px] font-semibold text-[#293041]">{listing.destination.name}</div>
              <div className="text-[11px] text-[#8b93a1]">{listing.destination.sub}</div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#edf1f7] flex justify-between text-[11px] text-[#8b93a1]">
            <span>
              DISTANCE
              <div className="text-[13px] font-medium text-[#293041]">{listing.distanceKm}</div>
            </span>
            <span>
              TRANSIT
              <div className="text-[13px] font-medium text-[#293041]">{listing.transitDays}</div>
            </span>
          </div>
        </div>

        <div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-[11px] text-[#8b93a1] uppercase tracking-wide">Mineral</div>
              <div className="text-[#293041] mt-0.5">{listing.mineral}</div>
            </div>
            <div>
              <div className="text-[11px] text-[#8b93a1] uppercase tracking-wide">Cargo Weight</div>
              <div className="text-[#293041] mt-0.5">{listing.cargoWeight}</div>
            </div>
            <div>
              <div className="text-[11px] text-[#8b93a1] uppercase tracking-wide">Packaging</div>
              <div className="text-[#293041] mt-0.5">{listing.packaging}</div>
            </div>
            <div>
              <div className="text-[11px] text-[#8b93a1] uppercase tracking-wide">Pickup Window</div>
              <div className="text-[#293041] mt-0.5">{listing.pickupWindow}</div>
            </div>
            <div>
              <div className="text-[11px] text-[#8b93a1] uppercase tracking-wide">Delivery Window</div>
              <div className="text-[#293041] mt-0.5">{listing.deliveryWindow}</div>
            </div>
            <div>
              <div className="text-[11px] text-[#8b93a1] uppercase tracking-wide">Vehicle Requirement</div>
              <div className="text-[#293041] mt-0.5">{listing.vehicleRequirement}</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {listing.tags.map((tag) => (
              <span
                key={tag.label}
                className={classNames(
                  "inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full",
                  tag.met ? statusStyles.green.container : statusStyles.slate.container,
                )}
              >
                {tag.met ? <CheckOutlined className="text-[10px]" /> : null}
                {tag.label}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-[12px] border border-[#e8ecf4] bg-[#fafbfd] p-4">
          <div className="flex items-center justify-between text-[12px] font-medium text-[#293041]">
            <span>Fleet Compatibility</span>
            <span>{listing.fleetCompatibilityPct}%</span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-[#e5e8ef] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#1ea43b]"
              style={{ width: `${listing.fleetCompatibilityPct}%` }}
            />
          </div>
          <div className="mt-3 space-y-2 text-[12px]">
            <div className="flex items-center justify-between">
              <span className="text-[#6f7786] flex items-center gap-1.5">
                <CheckOutlined className="text-[10px] text-[#1ea43b]" /> Available Vehicles
              </span>
              <span className="font-medium text-[#293041]">{listing.availableVehicles}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#6f7786] flex items-center gap-1.5">
                <CheckOutlined className="text-[10px] text-[#1ea43b]" /> Certified Drivers
              </span>
              <span className="font-medium text-[#293041]">{listing.certifiedDrivers}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#6f7786] flex items-center gap-1.5">
                <CheckOutlined className="text-[10px] text-[#1ea43b]" /> Insurance Status
              </span>
              <span className="font-medium text-[#293041]">{listing.insuranceStatus}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#6f7786] flex items-center gap-1.5">
                <CheckOutlined className="text-[10px] text-[#1ea43b]" /> Roadworthiness
              </span>
              <span className="font-medium text-[#293041]">{listing.roadworthiness}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 mt-4 pt-4 border-t border-[#edf1f7]">
        <span className="text-xs text-[#8b93a1]">{listing.postedAgo}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onViewDetails}
            className="text-sm px-4 py-1.5 rounded-lg border border-[#dbe0ea] text-[#293041] hover:bg-[#f9fafc]"
          >
            View Details
          </button>
          <button
            type="button"
            onClick={onSubmitInterest}
            className="text-sm px-4 py-1.5 rounded-lg bg-[#101e3d] !text-white hover:bg-[#182a52]"
          >
            Submit Interest
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TransportOpportunitiesView() {
  const [query, setQuery] = useState("");
  const [originState, setOriginState] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [deadline, setDeadline] = useState("");
  const [sort, setSort] = useState("closing");
  const [detailOpp, setDetailOpp] = useState<Opportunity | null>(null);
  const [interestOpp, setInterestOpp] = useState<Opportunity | null>(null);

  const originOptions = useMemo(
    () => Array.from(new Set(transportListings.map((l) => l.origin.sub.replace("Origin · ", "")))),
    [],
  );

  const filtered = useMemo(() => {
    let list = transportListings;
    if (originState) {
      list = list.filter((l) => l.origin.sub.includes(originState));
    }
    if (vehicleType) {
      list = list.filter((l) => l.vehicleRequirement.toLowerCase().includes(vehicleType.toLowerCase()));
    }
    if (deadline) {
      list = list.filter((l) => l.hoursRemaining.toLowerCase().includes(deadline.toLowerCase()));
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (l) =>
          l.trpId.toLowerCase().includes(q) ||
          l.mineral.toLowerCase().includes(q) ||
          l.postedBy.toLowerCase().includes(q) ||
          l.origin.name.toLowerCase().includes(q) ||
          l.destination.name.toLowerCase().includes(q),
      );
    }
    if (sort === "compatibility") {
      list = [...list].sort((a, b) => b.fleetCompatibilityPct - a.fleetCompatibilityPct);
    }
    return list;
  }, [query, originState, vehicleType, deadline, sort]);

  const hasFilters = query || originState || vehicleType || deadline;

  const opportunityFor = (listing: TransportListing) =>
    opportunities.find((o) => o.route.includes(listing.origin.name.split(" ")[0])) ?? opportunities[0];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-[#172554]">Transport Opportunities</h1>
        <p className="text-sm text-[#8b93a1] mt-1">
          Browse transport opportunities that match your fleet, operating regions, and delivery capabilities.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {opportunitiesStats.map((s, i) => {
          const Icon = statIcons[i];
          return (
            <div
              key={s.label}
              className="rounded-[16px] border border-[#e8ecf4] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)]"
            >
              <span className="w-8 h-8 rounded-lg bg-[#e9f0ff] flex items-center justify-center text-[#101e3d] mb-3">
                <Icon className="text-[15px]" />
              </span>
              <div className="text-sm text-[#6f7786]">{s.label}</div>
              <div className="text-2xl font-semibold text-[#172554] mt-1">{s.value}</div>
              <div className="text-xs text-[#8b93a1] mt-1">{s.sub}</div>
            </div>
          );
        })}
      </div>

      <div className="rounded-[16px] border border-[#e8ecf4] bg-white p-4 flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Job ID, mineral, buyer, location..."
          className="flex-1 min-w-[220px] bg-[#f9fafc] border border-[#e4e9f2] rounded-lg px-3 py-2 text-sm text-[#293041] placeholder:text-[#8b93a1] outline-none"
        />
        <select
          value={originState}
          onChange={(e) => setOriginState(e.target.value)}
          className="bg-[#f9fafc] border border-[#e4e9f2] rounded-lg px-3 py-2 text-sm text-[#293041] outline-none"
        >
          <option value="">Origin State</option>
          {originOptions.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <select
          value={vehicleType}
          onChange={(e) => setVehicleType(e.target.value)}
          className="bg-[#f9fafc] border border-[#e4e9f2] rounded-lg px-3 py-2 text-sm text-[#293041] outline-none"
        >
          <option value="">Vehicle Type</option>
          <option value="dump">Dump Trucks</option>
          <option value="flatbed">Flatbeds</option>
          <option value="tipper">Tippers</option>
        </select>
        <select
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="bg-[#f9fafc] border border-[#e4e9f2] rounded-lg px-3 py-2 text-sm text-[#293041] outline-none"
        >
          <option value="">Response Deadline</option>
          <option value="Hours">Within hours</option>
          <option value="Days">Within days</option>
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="bg-[#f9fafc] border border-[#e4e9f2] rounded-lg px-3 py-2 text-sm text-[#293041] outline-none"
        >
          <option value="closing">Sort · Closing Soon</option>
          <option value="compatibility">Sort · Best Match</option>
        </select>
        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setOriginState("");
              setVehicleType("");
              setDeadline("");
            }}
            className="text-xs text-[#101e3d] underline underline-offset-2"
          >
            Clear Filters
          </button>
        )}
        <button
          type="button"
          className="ml-auto inline-flex items-center rounded-lg bg-[#101e3d] px-4 py-2 text-xs font-semibold text-white hover:bg-[#182a52]"
        >
          Apply Filters
        </button>
      </div>

      {filtered.length === 0 && (
        <div className="rounded-[16px] border border-[#e8ecf4] bg-white p-10 text-center text-[#8b93a1]">
          No opportunities match these filters.
        </div>
      )}

      <div className="space-y-5">
        {filtered.map((listing) => (
          <ListingCard
            key={listing.trpId + listing.title}
            listing={listing}
            onViewDetails={() => setDetailOpp(opportunityFor(listing))}
            onSubmitInterest={() => setInterestOpp(opportunityFor(listing))}
          />
        ))}
      </div>

      <OpportunityDetailPanel
        opportunity={detailOpp}
        onClose={() => setDetailOpp(null)}
        onSubmitInterest={(opp) => {
          setDetailOpp(null);
          setInterestOpp(opp);
        }}
      />
      <SubmitInterestModal opportunity={interestOpp} onClose={() => setInterestOpp(null)} />
    </div>
  );
}
