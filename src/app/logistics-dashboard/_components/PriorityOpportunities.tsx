import { classNames, statusStyles } from "@/src/features/compliance/dashboard/lib/style";
import { Opportunity, opportunities } from "./data";

function severityStyle(severity: Opportunity["severity"]) {
  if (severity === "High") return statusStyles.red;
  if (severity === "Medium") return statusStyles.amber;
  return statusStyles.slate;
}

export default function PriorityOpportunities({
  onViewDetails,
  onSubmitInterest,
}: {
  onViewDetails: (opp: Opportunity) => void;
  onSubmitInterest: (opp: Opportunity) => void;
}) {
  return (
    <div className="rounded-[16px] border border-[#e8ecf4] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)]">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="font-semibold text-[#172554]">Priority Opportunities</h2>
          <p className="text-xs text-[#8b93a1] mt-0.5">
            Sample preview: see the Transport Opportunities tab for your live, backend-connected list.
          </p>
        </div>
        <span className="rounded-full bg-[#fff4df] text-[#e09408] text-xs font-medium px-2.5 py-1 whitespace-nowrap">
          Preview
        </span>
      </div>

      <div className="divide-y divide-[#edf1f7]">
        {opportunities.map((opp) => {
          const pill = severityStyle(opp.severity);
          return (
            <div key={opp.id} className="py-4 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-[#172554]">{opp.cargo}</h3>
                    <span className={classNames("text-[11px] font-medium px-2 py-0.5 rounded-full", pill.container)}>
                      {opp.severity}
                    </span>
                  </div>
                  <p className="text-sm text-[#8b93a1] mt-0.5">{opp.route}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[11px] text-[#8b93a1]">{opp.deadlineLabel}</div>
                  <div className="text-xs font-medium text-[#e09408]">{opp.deadlineRemaining}</div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 mt-3 text-sm">
                <div>
                  <div className="text-[11px] text-[#8b93a1] uppercase tracking-wide">Cargo</div>
                  <div className="text-[#293041] mt-0.5">{opp.cargoAmount}</div>
                </div>
                <div>
                  <div className="text-[11px] text-[#8b93a1] uppercase tracking-wide">Vehicles</div>
                  <div className="text-[#293041] mt-0.5">{opp.vehicles}</div>
                </div>
                <div>
                  <div className="text-[11px] text-[#8b93a1] uppercase tracking-wide">Pickup Window</div>
                  <div className="text-[#293041] mt-0.5">{opp.pickupWindow}</div>
                </div>
                <div>
                  <div className="text-[11px] text-[#8b93a1] uppercase tracking-wide">Est. Value</div>
                  <div className="text-[#293041] mt-0.5">{opp.estValue}</div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-3">
                <button
                  onClick={() => onViewDetails(opp)}
                  className="text-sm px-4 py-1.5 rounded-lg border border-[#dbe0ea] text-[#293041] hover:bg-[#f9fafc]"
                >
                  View Details
                </button>
                <button
                  onClick={() => onSubmitInterest(opp)}
                  className="text-sm px-4 py-1.5 rounded-lg bg-[#101e3d] !text-white hover:bg-[#182a52]"
                >
                  Submit Interest
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
