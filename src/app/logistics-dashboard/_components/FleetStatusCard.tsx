import { fleetStatus } from "./data";

export default function FleetStatusCard() {
  return (
    <div className="rounded-[16px] border border-[#e8ecf4] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-[#172554]">Fleet Status</h2>
        <span className="rounded-full bg-[#f4f6f9] text-[#6b7280] text-xs font-medium px-2.5 py-1">
          Not connected yet
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <div className="text-xs text-[#8b93a1]">Available</div>
          <div className="text-xl font-semibold text-[#1ea43b] mt-1">{fleetStatus.available}</div>
        </div>
        <div>
          <div className="text-xs text-[#8b93a1]">Assigned</div>
          <div className="text-xl font-semibold text-[#2387a3] mt-1">{fleetStatus.assigned}</div>
        </div>
        <div>
          <div className="text-xs text-[#8b93a1]">Insurance Expiring</div>
          <div className="text-xl font-semibold text-[#e09408] mt-1">{fleetStatus.insuranceExpiring}</div>
        </div>
        <div>
          <div className="text-xs text-[#8b93a1]">Roadworthiness Due</div>
          <div className="text-xl font-semibold text-[#e09408] mt-1">{fleetStatus.roadworthinessDue}</div>
        </div>
      </div>

      <div className="mb-5">
        <div className="flex justify-between text-xs text-[#6f7786] mb-1.5">
          <span>Fleet Readiness</span>
          <span className="font-medium text-[#293041]">{fleetStatus.readinessPct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-[#f1f2f4] overflow-hidden">
          <div className="h-full bg-[#101e3d] rounded-full" style={{ width: `${fleetStatus.readinessPct}%` }} />
        </div>
      </div>

      <p className="text-xs text-[#8b93a1]">
        Fleet management is not wired to a backend yet, so these figures are illustrative only.
      </p>
    </div>
  );
}
