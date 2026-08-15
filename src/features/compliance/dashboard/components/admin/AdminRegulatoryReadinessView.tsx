"use client";

import type {
  RegulatoryReadinessMetric,
  RegulatoryRiskState,
  REGULATORY_STATUS_DISTRIBUTION,
} from "@/src/features/compliance/dashboard/mock";
import { classNames, primaryActionStyle } from "@/src/features/compliance/dashboard/lib/style";
import { showToast } from "@/src/store/toast.store";

export const regulatoryReadinessToneStroke: Record<RegulatoryReadinessMetric["tone"], string> = {
  blue: "#2661d8",
  green: "#1ea43b",
  amber: "#e09408",
};

export function ReadinessRing({ percentage, tone }: { percentage: number; tone: RegulatoryReadinessMetric["tone"] }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percentage / 100);

  return (
    <svg viewBox="0 0 180 180" className="mx-auto h-[180px] w-[180px] -rotate-90">
      <circle cx="90" cy="90" r={radius} fill="none" stroke="#eef1f6" strokeWidth="16" />
      <circle
        cx="90"
        cy="90"
        r={radius}
        fill="none"
        stroke={regulatoryReadinessToneStroke[tone]}
        strokeWidth="16"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
    </svg>
  );
}

export default function AdminRegulatoryReadinessView({
  metrics,
  states,
  statusDistribution,
}: {
  metrics: RegulatoryReadinessMetric[];
  states: RegulatoryRiskState[];
  statusDistribution: typeof REGULATORY_STATUS_DISTRIBUTION;
}) {
  const riskToneClass: Record<RegulatoryRiskState["risk"], string> = {
    Low: "bg-[#ecfaf0] text-[#1ea43b] border-[#caebd1]",
    Medium: "bg-[#fff4df] text-[#e09408] border-[#f6e3bf]",
    High: "bg-[#ffeff0] text-[#ef2f32] border-[#f7d6d7]",
  };
  const distributionToneClass: Record<"green" | "amber" | "red", string> = {
    green: "bg-[#ecfaf0] text-[#1ea43b]",
    amber: "bg-[#fff4df] text-[#e09408]",
    red: "bg-[#ffeff0] text-[#ef2f32]",
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => showToast("Export isn't connected to the backend yet.", "error")}
          className="inline-flex h-12 items-center gap-2 rounded-[14px] bg-[#14244a] px-5 text-[15px] font-semibold !text-white"
          style={primaryActionStyle}
        >
          Export regulatory report
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {metrics.map((metric) => (
          <section
            key={metric.id}
            className="rounded-[16px] border border-[#e8ecf4] bg-white p-6 text-center shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)]"
          >
            <div className="text-[15px] font-medium text-[#2a2f39]">{metric.title}</div>
            <div className="mt-1 text-[26px] font-semibold text-[#2a2f39]">{metric.percentage}%</div>
            <ReadinessRing percentage={metric.percentage} tone={metric.tone} />
            <div className="mt-4 space-y-2 text-left text-[13px] text-[#5d6675]">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: regulatoryReadinessToneStroke[metric.tone] }}
                />
                {metric.legendReady}
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#e5e9f1]" />
                {metric.legendNotReady}
              </div>
            </div>
          </section>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <section className="rounded-[16px] border border-[#e8ecf4] bg-white p-6 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)]">
          <div className="text-[18px] font-semibold text-[#2a2f39]">Risk Distribution by State</div>
          <div className="mt-5 space-y-3">
            {states.map((state) => (
              <div
                key={state.state}
                className="flex items-center justify-between gap-4 rounded-[16px] border border-[#e8ecf4] bg-[#fafbfd] px-4 py-3"
              >
                <span className="text-[15px] font-medium text-[#2a2f39]">{state.state}</span>
                <div className="flex items-center gap-4 text-[13px] text-[#7b8392]">
                  <span>{state.compliancePartners} compliance partners</span>
                  <span>{state.totalMiners} total miners</span>
                  <span className={classNames("rounded-full border px-3 py-1 font-medium", riskToneClass[state.risk])}>
                    {state.risk}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[16px] border border-[#e8ecf4] bg-white p-6 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)]">
          <div className="text-[18px] font-semibold text-[#2a2f39]">Miner Compliance Pipeline</div>
          <div className="mt-2 text-[13px] text-[#8a92a1]">Status Distribution</div>
          <div className="mt-5 space-y-4">
            {statusDistribution.map((item) => (
              <div key={item.id} className={classNames("rounded-[18px] p-5", distributionToneClass[item.tone])}>
                <div className="text-[28px] font-semibold">{item.percentage}%</div>
                <div className="mt-1 text-[14px] font-medium">
                  {item.label} ({item.count} miners)
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-[12px] text-[#8a92a1]">
            Aggregated data updated every 24 hours. Individual miner data is protected.
          </div>
        </section>
      </div>
    </div>
  );
}

