"use client";

import { AssignedJob, JobStage } from "./data";
import SlideOver from "./SlideOver";
import { IconCalendar, IconCheck } from "./icons";

const stages: JobStage[] = ["Awaiting Pickup", "Loading", "In Transit", "Delivered"];
const stageShortLabel: Record<JobStage, string> = {
  "Awaiting Pickup": "Assigned",
  Loading: "Loading",
  "In Transit": "In Transit",
  Delivered: "Delivered",
};

function stagePill(stage: JobStage) {
  switch (stage) {
    case "Loading":
      return "bg-orange-50 text-orange-600";
    case "In Transit":
      return "bg-blue-50 text-blue-600";
    case "Awaiting Pickup":
      return "bg-gray-100 text-gray-500";
    case "Delivered":
      return "bg-green-50 text-green-600";
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
              <span className="text-xs text-gray-400">{job.jobId}</span>
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${stagePill(job.stage)}`}>
                {job.stage}
              </span>
            </div>

            <h2 className="text-lg font-semibold text-gray-900">{job.route}</h2>
            <p className="text-sm text-gray-400 mt-1">{job.detail.cargoLabel} · {job.detail.shipper}</p>

            <div className="flex items-center justify-between mt-6 mb-6">
              {stages.map((stage, i) => {
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
                        done
                          ? "bg-primary border-primary text-white"
                          : "bg-white border-gray-300 text-gray-400"
                      }`}
                    >
                      {done ? <IconCheck className="w-3 h-3" /> : i + 1}
                    </div>
                    <span className="text-[10px] text-gray-500 mt-1.5 text-center leading-tight">
                      {stageShortLabel[stage]}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-start gap-3 bg-blue-50/60 border border-blue-100 rounded-lg px-3 py-2.5 mb-5">
              <IconCalendar className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-800">{job.detail.scheduledLabel}</div>
                <div className="text-xs text-gray-500 mt-0.5">{job.detail.scheduledSub}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[10px] text-gray-400 uppercase">ETA</div>
                <div className="text-sm font-medium text-gray-800">{job.eta}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-4 gap-x-4 text-sm mb-5">
              <div>
                <div className="text-[11px] text-gray-400 uppercase tracking-wide">Pickup</div>
                <div className="text-gray-800 mt-0.5">
                  {job.detail.pickupLocation} · {job.detail.pickupDate}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-gray-400 uppercase tracking-wide">Delivery</div>
                <div className="text-gray-800 mt-0.5">
                  {job.detail.deliveryLocation} · {job.detail.deliveryDate}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-gray-400 uppercase tracking-wide">Vehicle</div>
                <div className="text-gray-800 mt-0.5">{job.vehicle}</div>
              </div>
              <div>
                <div className="text-[11px] text-gray-400 uppercase tracking-wide">Job Value</div>
                <div className="text-gray-800 mt-0.5">{job.detail.jobValue}</div>
              </div>
              <div>
                <div className="text-[11px] text-gray-400 uppercase tracking-wide">Escort</div>
                <div className="text-gray-800 mt-0.5">{job.detail.escort}</div>
              </div>
              <div>
                <div className="text-[11px] text-gray-400 uppercase tracking-wide">Waybill</div>
                <div className="text-gray-800 mt-0.5">{job.detail.waybill}</div>
              </div>
            </div>

            <div className="flex items-center justify-between border border-gray-100 rounded-lg p-3 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                  {job.detail.driver.initials}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{job.detail.driver.name}</div>
                  <div className="text-xs text-gray-400">
                    License {job.detail.driver.license} · {job.detail.driver.years} · {job.detail.driver.rating}
                  </div>
                </div>
              </div>
              <button className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 shrink-0">
                Message
              </button>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Tracking History</h3>
              <div className="space-y-3">
                {job.detail.history.map((h) => (
                  <div key={h.title} className="flex items-start gap-2.5 text-sm">
                    <span className="w-4 h-4 rounded-full bg-green-50 text-green-600 flex items-center justify-center mt-0.5 shrink-0">
                      <IconCheck className="w-2.5 h-2.5" />
                    </span>
                    <div>
                      <div className="text-gray-800">{h.title}</div>
                      <div className="text-xs text-gray-400">{h.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 p-4 flex items-center gap-2">
            <button className="px-4 py-2 rounded-lg border border-red-200 text-sm text-red-500 hover:bg-red-50">
              Report Issue
            </button>
            <button className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50">
              Reschedule
            </button>
            <button className="ml-auto px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90">
              View Shipping Instructions
            </button>
          </div>
        </>
      )}
    </SlideOver>
  );
}
