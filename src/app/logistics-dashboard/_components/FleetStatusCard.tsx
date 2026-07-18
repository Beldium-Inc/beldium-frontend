import { fleetStatus } from "./data";

export default function FleetStatusCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <h2 className="font-semibold text-gray-900 mb-4">Fleet Status</h2>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <div className="text-xs text-gray-400">Available</div>
          <div className="text-xl font-semibold text-green-600 mt-1">{fleetStatus.available}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Assigned</div>
          <div className="text-xl font-semibold text-blue-600 mt-1">{fleetStatus.assigned}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Insurance Expiring</div>
          <div className="text-xl font-semibold text-orange-500 mt-1">{fleetStatus.insuranceExpiring}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Roadworthiness Due</div>
          <div className="text-xl font-semibold text-orange-500 mt-1">{fleetStatus.roadworthinessDue}</div>
        </div>
      </div>

      <div className="mb-5">
        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
          <span>Fleet Readiness</span>
          <span className="font-medium text-gray-800">{fleetStatus.readinessPct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full bg-primary rounded-full"
            style={{ width: `${fleetStatus.readinessPct}%` }}
          />
        </div>
      </div>

      <button className="w-full py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90">
        Manage Fleet
      </button>
    </div>
  );
}
