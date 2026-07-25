"use client";

import { useState } from "react";
import { assignedJobsStats, assignedJobCards, fullStages, AssignedJobCard, FullStage } from "./data";
import { IconBoard, IconClock, IconTruck, IconBox, IconCheck } from "./icons";

const statIcons = [IconBoard, IconClock, IconTruck, IconBox];

function stagePill(stage: FullStage) {
  switch (stage) {
    case "Loading":
      return "bg-orange-50 text-orange-600";
    case "In Transit":
      return "bg-blue-50 text-blue-600";
    case "Vehicle Assigned":
      return "bg-secondary text-primary";
    case "Assigned":
      return "bg-gray-100 text-gray-500";
    case "Delivered":
    case "Payment":
      return "bg-green-50 text-green-600";
  }
}

function JobCard({ job }: { job: AssignedJobCard }) {
  const currentIndex = fullStages.indexOf(job.currentStage);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{job.title}</h3>
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${stagePill(job.currentStage)}`}>
              {job.statusLabel}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {job.trpId} · Posted by {job.postedBy}
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[11px] text-gray-400">ETA</div>
          <div className="text-sm font-medium text-gray-800">{job.etaLabel}</div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-5 mb-2 px-1">
        {fullStages.map((stage, i) => {
          const done = i <= currentIndex;
          return (
            <div key={stage} className="flex flex-col items-center flex-1 relative">
              {i > 0 && (
                <div
                  className={`absolute right-1/2 top-3 h-[2px] w-full -z-10 ${
                    i <= currentIndex ? "bg-primary" : "bg-gray-200"
                  }`}
                />
              )}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-medium border ${
                  done ? "bg-primary border-primary text-white" : "bg-white border-gray-300 text-gray-400"
                }`}
              >
                {done ? <IconCheck className="w-3 h-3" /> : i + 1}
              </div>
              <span className="text-[10px] text-gray-500 mt-1.5 text-center leading-tight max-w-[64px]">
                {stage}
              </span>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
        <div className="flex flex-col gap-3 text-sm">
          <div className="flex items-start gap-2">
            <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
            <div>
              <div className="text-gray-800 font-medium">{job.origin.name}</div>
              <div className="text-xs text-gray-400">{job.origin.sub}</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0" />
            <div>
              <div className="text-gray-800 font-medium">{job.destination.name}</div>
              <div className="text-xs text-gray-400">{job.destination.sub}</div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>Distance</span>
            <span className="font-medium text-gray-800">
              {job.distanceKm} · {job.progressKm}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: `${job.progressPct}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 text-sm">
        <div>
          <div className="text-[11px] text-gray-400 uppercase tracking-wide">Driver</div>
          <div className="text-gray-800 mt-0.5">{job.driver.name}</div>
          <div className="text-xs text-gray-400">{job.driver.phone}</div>
        </div>
        <div>
          <div className="text-[11px] text-gray-400 uppercase tracking-wide">Assigned Vehicle</div>
          <div className="text-gray-800 mt-0.5">{job.vehicle.id}</div>
          <div className="text-xs text-gray-400">{job.vehicle.type}</div>
        </div>
        <div>
          <div className="text-[11px] text-gray-400 uppercase tracking-wide">Cargo</div>
          <div className="text-gray-800 mt-0.5">{job.cargo}</div>
        </div>
        <div>
          <div className="text-[11px] text-gray-400 uppercase tracking-wide">Pickup/Delivery</div>
          <div className="text-gray-800 mt-0.5">{job.pickupDeliveryWindow}</div>
          <div className="text-xs text-gray-400">Window</div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-secondary text-primary flex items-center justify-center text-xs font-semibold shrink-0">
            {job.buyer.slice(0, 1)}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{job.buyer}</div>
            <div className="text-xs text-gray-400">{job.buyerRole}</div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">
            Open Timeline
          </button>
          <button className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">
            View Job Details
          </button>
          <button className="text-xs px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary/90">
            Message Driver
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AssignedJobsView() {
  const [query, setQuery] = useState("");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Assigned Jobs</h1>
        <p className="text-sm text-gray-400 mt-1">
          Manage transport assignments, monitor delivery progress, coordinate fleet activity, and complete deliveries
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {assignedJobsStats.map((s, i) => {
          const Icon = statIcons[i];
          return (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                <span className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center text-primary">
                  <Icon className="w-4 h-4" />
                </span>
                {s.label}
                {s.suffix && <span className="text-xs text-gray-400">({s.suffix})</span>}
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
          Job status
        </button>
        <button className="text-sm px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
          Driver
        </button>
        <button className="text-sm px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
          Vehicle
        </button>
        <button className="text-sm px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-50">
          Clear Filters
        </button>
        <button className="text-sm px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90">
          Apply Filters
        </button>
      </div>

      <div className="space-y-5">
        {assignedJobCards.map((job, i) => (
          <JobCard key={`${job.trpId}-${i}`} job={job} />
        ))}
      </div>
    </div>
  );
}
