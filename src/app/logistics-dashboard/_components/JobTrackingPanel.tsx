"use client";

import { CalendarOutlined, CheckOutlined } from "@ant-design/icons";
import { classNames, statusStyles } from "@/src/features/compliance/dashboard/lib/style";
import { AssignedJob, JobStage } from "./data";
import SlideOver from "./SlideOver";

const stages: JobStage[] = ["Awaiting Pickup", "Loading", "In Transit", "Delivered"];
const stageShortLabel: Record<JobStage, string> = {
  "Awaiting Pickup": "Assigned",
  Loading: "Loading",
  "In Transit": "In Transit",
  Delivered: "Delivered",
};

function stageStyle(stage: JobStage) {
  switch (stage) {
    case "Loading":
      return statusStyles.amber;
    case "In Transit":
      return statusStyles.cyan;
    case "Awaiting Pickup":
      return statusStyles.slate;
    case "Delivered":
      return statusStyles.green;
  }
}

export default function JobTrackingPanel({
  job,
  onClose,
}: {
  job: AssignedJob | null;
  onClose: () => void;
}) {
  const currentIndex = job ? stages.indexOf(job.stage) : -1;

  return (
    <SlideOver open={!!job} onClose={onClose}>
      {job && (
        <>
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-[#8b93a1]">{job.jobId}</span>
              <span
                className={classNames("text-[11px] font-medium px-2 py-0.5 rounded-full", stageStyle(job.stage).container)}
              >
                {job.stage}
              </span>
            </div>

            <h2 className="text-lg font-semibold text-[#172554]">{job.route}</h2>
            <p className="text-sm text-[#8b93a1] mt-1">
              {job.detail.cargoLabel} · {job.detail.shipper}
            </p>

            <div className="flex items-center justify-between mt-6 mb-6">
              {stages.map((stage, i) => {
                const done = i <= currentIndex;
                return (
                  <div key={stage} className="flex flex-col items-center flex-1 relative">
                    {i > 0 && (
                      <div
                        className={classNames(
                          "absolute right-1/2 top-3 h-[2px] w-full -z-10",
                          i <= currentIndex ? "bg-[#101e3d]" : "bg-[#e5e8ef]",
                        )}
                      />
                    )}
                    <div
                      className={classNames(
                        "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-medium border",
                        done ? "bg-[#101e3d] border-[#101e3d] text-white" : "bg-white border-[#dbe0ea] text-[#8b93a1]",
                      )}
                    >
                      {done ? <CheckOutlined className="text-[10px]" /> : i + 1}
                    </div>
                    <span className="text-[10px] text-[#6f7786] mt-1.5 text-center leading-tight">
                      {stageShortLabel[stage]}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-start gap-3 bg-[#edf8fb] border border-[#d6edf4] rounded-lg px-3 py-2.5 mb-5">
              <CalendarOutlined className="text-[#101e3d] mt-0.5 shrink-0" />
              <div className="flex-1">
                <div className="text-sm font-medium text-[#293041]">{job.detail.scheduledLabel}</div>
                <div className="text-xs text-[#6f7786] mt-0.5">{job.detail.scheduledSub}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[10px] text-[#8b93a1] uppercase">ETA</div>
                <div className="text-sm font-medium text-[#293041]">{job.eta}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-4 gap-x-4 text-sm mb-5">
              <div>
                <div className="text-[11px] text-[#8b93a1] uppercase tracking-wide">Pickup</div>
                <div className="text-[#293041] mt-0.5">
                  {job.detail.pickupLocation} · {job.detail.pickupDate}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#8b93a1] uppercase tracking-wide">Delivery</div>
                <div className="text-[#293041] mt-0.5">
                  {job.detail.deliveryLocation} · {job.detail.deliveryDate}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#8b93a1] uppercase tracking-wide">Vehicle</div>
                <div className="text-[#293041] mt-0.5">{job.vehicle}</div>
              </div>
              <div>
                <div className="text-[11px] text-[#8b93a1] uppercase tracking-wide">Job Value</div>
                <div className="text-[#293041] mt-0.5">{job.detail.jobValue}</div>
              </div>
              <div>
                <div className="text-[11px] text-[#8b93a1] uppercase tracking-wide">Escort</div>
                <div className="text-[#293041] mt-0.5">{job.detail.escort}</div>
              </div>
              <div>
                <div className="text-[11px] text-[#8b93a1] uppercase tracking-wide">Waybill</div>
                <div className="text-[#293041] mt-0.5">{job.detail.waybill}</div>
              </div>
            </div>

            <div className="flex items-center justify-between border border-[#edf1f7] rounded-lg p-3 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#e9f0ff] text-[#101e3d] flex items-center justify-center text-xs font-semibold shrink-0">
                  {job.detail.driver.initials}
                </div>
                <div>
                  <div className="text-sm font-medium text-[#172554]">{job.detail.driver.name}</div>
                  <div className="text-xs text-[#8b93a1]">
                    License {job.detail.driver.license} · {job.detail.driver.years} · {job.detail.driver.rating}
                  </div>
                </div>
              </div>
              <button className="text-xs px-3 py-1.5 rounded-lg border border-[#dbe0ea] text-[#293041] hover:bg-[#f9fafc] shrink-0">
                Message
              </button>
            </div>

            <div>
              <h3 className="text-sm font-medium text-[#172554] mb-3">Tracking History</h3>
              <div className="space-y-3">
                {job.detail.history.map((h) => (
                  <div key={h.title} className="flex items-start gap-2.5 text-sm">
                    <span className="w-4 h-4 rounded-full bg-[#ecfaf0] text-[#1ea43b] flex items-center justify-center mt-0.5 shrink-0">
                      <CheckOutlined className="text-[9px]" />
                    </span>
                    <div>
                      <div className="text-[#293041]">{h.title}</div>
                      <div className="text-xs text-[#8b93a1]">{h.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-[#edf1f7] p-4 flex items-center gap-2">
            <button className="px-4 py-2 rounded-lg border border-[#f7d6d7] text-sm text-[#ef2f32] hover:bg-[#fff5f5]">
              Report Issue
            </button>
            <button className="px-4 py-2 rounded-lg border border-[#dbe0ea] text-sm text-[#293041] hover:bg-[#f9fafc]">
              Reschedule
            </button>
            <button className="ml-auto px-4 py-2 rounded-lg bg-[#101e3d] text-white text-sm font-medium hover:bg-[#182a52]">
              View Shipping Instructions
            </button>
          </div>
        </>
      )}
    </SlideOver>
  );
}
