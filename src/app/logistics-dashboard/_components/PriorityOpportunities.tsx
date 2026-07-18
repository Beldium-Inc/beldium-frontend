import { Opportunity, opportunities } from "./data";

function severityBadge(severity: Opportunity["severity"]) {
  if (severity === "High") return "bg-red-50 text-red-600";
  if (severity === "Medium") return "bg-amber-50 text-amber-600";
  return "bg-gray-100 text-gray-600";
}

export default function PriorityOpportunities({
  onViewDetails,
  onSubmitInterest,
}: {
  onViewDetails: (opp: Opportunity) => void;
  onSubmitInterest: (opp: Opportunity) => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="font-semibold text-gray-900">Priority Opportunities</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            New transport jobs that match your fleet and service areas.
          </p>
        </div>
        <span className="rounded-full bg-orange-50 text-orange-600 text-xs font-medium px-2.5 py-1 whitespace-nowrap">
          3 new today
        </span>
      </div>

      <div className="divide-y divide-gray-100">
        {opportunities.map((opp) => (
          <div key={opp.id} className="py-4 first:pt-0 last:pb-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-gray-900">{opp.cargo}</h3>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${severityBadge(opp.severity)}`}>
                    {opp.severity}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-0.5">{opp.route}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[11px] text-gray-400">{opp.deadlineLabel}</div>
                <div className="text-xs font-medium text-orange-500 font-mono">{opp.deadlineRemaining}</div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3 mt-3 text-sm">
              <div>
                <div className="text-[11px] text-gray-400 uppercase tracking-wide">Cargo</div>
                <div className="text-gray-800 mt-0.5">{opp.cargoAmount}</div>
              </div>
              <div>
                <div className="text-[11px] text-gray-400 uppercase tracking-wide">Vehicles</div>
                <div className="text-gray-800 mt-0.5">{opp.vehicles}</div>
              </div>
              <div>
                <div className="text-[11px] text-gray-400 uppercase tracking-wide">Pickup Window</div>
                <div className="text-gray-800 mt-0.5">{opp.pickupWindow}</div>
              </div>
              <div>
                <div className="text-[11px] text-gray-400 uppercase tracking-wide">Est. Value</div>
                <div className="text-gray-800 mt-0.5">{opp.estValue}</div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => onViewDetails(opp)}
                className="text-sm px-4 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                View Details
              </button>
              <button
                onClick={() => onSubmitInterest(opp)}
                className="text-sm px-4 py-1.5 rounded-lg bg-primary text-white hover:bg-primary/90"
              >
                Submit Interest
              </button>
            </div>
          </div>
        ))}
      </div>

      <button className="text-sm text-primary font-medium mt-4 hover:underline">
        View All Opportunities →
      </button>
    </div>
  );
}
