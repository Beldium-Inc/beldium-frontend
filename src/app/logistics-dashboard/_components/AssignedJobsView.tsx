"use client";

import { useMemo, useState } from "react";
import {
  ThunderboltOutlined,
  InboxOutlined,
  CarOutlined,
  CheckCircleOutlined,
  CheckOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import { classNames, statusStyles } from "@/src/features/compliance/dashboard/lib/style";
import { assignedJobsStats, assignedJobCards, fullStages, assignedJobs, AssignedJobCard, FullStage } from "./data";
import JobTrackingPanel from "./JobTrackingPanel";

const statIcons = [ThunderboltOutlined, InboxOutlined, CarOutlined, CheckCircleOutlined];

function stagePill(stage: FullStage) {
  switch (stage) {
    case "In Transit":
      return statusStyles.cyan;
    case "Delivered":
      return statusStyles.green;
    case "Vehicle Assigned":
    case "Assigned":
      return statusStyles.slate;
    case "Loading":
      return statusStyles.amber;
    case "Payment":
      return statusStyles.mint ?? statusStyles.green;
  }
}

function Stepper({ current }: { current: FullStage }) {
  const currentIndex = fullStages.indexOf(current);
  return (
    <div className="flex items-center mt-4">
      {fullStages.map((stage, i) => {
        const done = i <= currentIndex;
        return (
          <div key={stage} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={classNames(
                  "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium border",
                  done ? "bg-[#101e3d] border-[#101e3d] text-white" : "bg-white border-[#dbe0ea] text-[#8b93a1]",
                )}
              >
                {done ? <CheckOutlined className="text-[9px]" /> : i + 1}
              </div>
              <span
                className={classNames(
                  "text-[10px] mt-1 whitespace-nowrap",
                  done ? "text-[#293041] font-medium" : "text-[#8b93a1]",
                )}
              >
                {stage}
              </span>
              <span className="text-[9px] text-[#b7bec9]">
                {stage === current ? "Aug 12, 08:12" : ""}
              </span>
            </div>
            {i < fullStages.length - 1 && (
              <div className={classNames("h-[2px] flex-1 mx-1 mb-4", i < currentIndex ? "bg-[#101e3d]" : "bg-[#e5e8ef]")} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function JobCard({ job, onOpenTimeline }: { job: AssignedJobCard; onOpenTimeline: () => void }) {
  const pill = stagePill(job.currentStage);
  return (
    <div className="rounded-[16px] border border-[#e8ecf4] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)]">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-[#172554]">{job.title}</h3>
            <span className={classNames("text-[11px] font-medium px-2 py-0.5 rounded-full", pill.container)}>
              {job.statusLabel}
            </span>
          </div>
          <p className="text-xs text-[#8b93a1] mt-0.5">
            {job.trpId} · Posted by {job.postedBy}
          </p>
        </div>
        <div className="text-right shrink-0 text-xs text-[#8b93a1]">
          {job.etaLabel === job.etaLabel ? null : null}
          <div>ETA: {job.etaLabel}</div>
        </div>
      </div>

      <Stepper current={job.currentStage} />

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 mt-4">
        <div className="rounded-[12px] border border-[#e8ecf4] bg-[#fafbfd] px-4 py-3">
          <div className="flex items-start gap-2">
            <EnvironmentOutlined className="mt-1 text-[11px] text-[#101e3d]" />
            <div>
              <div className="text-[13px] font-semibold text-[#293041]">{job.origin.name}</div>
              <div className="text-[11px] text-[#8b93a1]">{job.origin.sub}</div>
            </div>
          </div>
          <div className="my-2 ml-[5px] h-3 w-px bg-[#dbe0ea]" />
          <div className="flex items-start gap-2">
            <span className="mt-1 h-2 w-2 rounded-full bg-[#1ea43b]" />
            <div>
              <div className="text-[13px] font-semibold text-[#293041]">{job.destination.name}</div>
              <div className="text-[11px] text-[#8b93a1]">{job.destination.sub}</div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#edf1f7] flex justify-between text-[11px] text-[#8b93a1]">
            <span>
              DISTANCE
              <div className="text-[13px] font-medium text-[#293041]">{job.distanceKm}</div>
            </span>
            <span>
              PROGRESS
              <div className="text-[13px] font-medium text-[#293041]">{job.progressKm}</div>
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 rounded-[12px] bg-[#f9fafc] border border-[#edf1f7] p-4">
        <div>
          <div className="text-[10px] uppercase tracking-wide text-[#8b93a1]">Driver</div>
          <div className="mt-0.5 text-[13px] font-medium text-[#293041]">{job.driver.name}</div>
          <div className="text-[11px] text-[#8b93a1]">{job.driver.phone}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-[#8b93a1]">Assigned Vehicle</div>
          <div className="mt-0.5 text-[13px] font-medium text-[#293041]">{job.vehicle.id}</div>
          <div className="text-[11px] text-[#8b93a1]">{job.vehicle.type}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-[#8b93a1]">Cargo</div>
          <div className="mt-0.5 text-[13px] font-medium text-[#293041]">{job.cargo}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-[#8b93a1]">Pickup/Delivery</div>
          <div className="mt-0.5 text-[13px] font-medium text-[#293041]">{job.pickupDeliveryWindow}</div>
          <div className="text-[11px] text-[#8b93a1]">Window</div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 mt-5 pt-4 border-t border-[#edf1f7]">
        <div className="flex items-center gap-2 text-xs text-[#8b93a1]">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f4f6f9] text-[#8b93a1]">
            <PhoneOutlined />
          </span>
          {job.buyer}
          <span className="text-[#b7bec9]">· {job.buyerRole}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenTimeline}
            className="text-xs px-3 py-1.5 rounded-lg border border-[#dbe0ea] text-[#293041] hover:bg-[#f9fafc]"
          >
            Open Timeline
          </button>
          <button
            type="button"
            onClick={onOpenTimeline}
            className="text-xs px-3 py-1.5 rounded-lg border border-[#dbe0ea] text-[#293041] hover:bg-[#f9fafc]"
          >
            View Job Details
          </button>
          <button
            type="button"
            className="text-xs px-3 py-1.5 rounded-lg bg-[#101e3d] text-white hover:bg-[#182a52]"
          >
            Message Driver
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AssignedJobsView() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [openJobId, setOpenJobId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = assignedJobCards;
    if (statusFilter) {
      list = list.filter((j) => j.currentStage === statusFilter);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (j) =>
          j.trpId.toLowerCase().includes(q) ||
          j.title.toLowerCase().includes(q) ||
          j.origin.name.toLowerCase().includes(q) ||
          j.destination.name.toLowerCase().includes(q),
      );
    }
    return list;
  }, [query, statusFilter]);

  const activeTrackingJob = openJobId ? assignedJobs.find((j) => j.jobId === openJobId) ?? assignedJobs[0] : null;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-[#172554]">Assigned Jobs</h1>
        <p className="text-sm text-[#8b93a1] mt-1">
          Manage transport assignments, monitor delivery progress, coordinate fleet activity, and complete
          deliveries
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {assignedJobsStats.map((s, i) => {
          const Icon = statIcons[i];
          return (
            <div
              key={s.label}
              className="rounded-[16px] border border-[#e8ecf4] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)]"
            >
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-lg bg-[#e9f0ff] flex items-center justify-center text-[#101e3d]">
                  <Icon className="text-[15px]" />
                </span>
                {s.suffix && <span className="text-[11px] text-[#8b93a1]">{s.suffix}</span>}
              </div>
              <div className="text-sm text-[#6f7786] mt-3">{s.label}</div>
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
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#f9fafc] border border-[#e4e9f2] rounded-lg px-3 py-2 text-sm text-[#293041] outline-none"
        >
          <option value="">Job status</option>
          {fullStages.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select className="bg-[#f9fafc] border border-[#e4e9f2] rounded-lg px-3 py-2 text-sm text-[#293041] outline-none">
          <option value="">Driver</option>
        </select>
        <select className="bg-[#f9fafc] border border-[#e4e9f2] rounded-lg px-3 py-2 text-sm text-[#293041] outline-none">
          <option value="">Vehicle</option>
        </select>
        {(query || statusFilter) && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setStatusFilter("");
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
          No assigned jobs match these filters.
        </div>
      )}

      <div className="space-y-5">
        {filtered.map((job, i) => (
          <JobCard
            key={`${job.trpId}-${i}`}
            job={job}
            onOpenTimeline={() => setOpenJobId(assignedJobs[i % assignedJobs.length].jobId)}
          />
        ))}
      </div>

      <JobTrackingPanel job={activeTrackingJob} onClose={() => setOpenJobId(null)} />
    </div>
  );
}
