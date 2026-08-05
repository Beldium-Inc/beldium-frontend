"use client";

import {
  CarOutlined,
  CheckCircleOutlined,
  ToolOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { showToast } from "@/src/store/toast.store";

const STAT_CARDS = [
  { label: "Total Fleet", caption: "Registered vehicles", icon: <CarOutlined /> },
  { label: "Available", caption: "Ready for assignment", icon: <CheckCircleOutlined /> },
  { label: "Assigned", caption: "Currently on jobs", icon: <ClockCircleOutlined /> },
  { label: "Maintenance", caption: "Unavailable", icon: <ToolOutlined /> },
];

export default function FleetManagementView() {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[#172554]">Fleet Management</h1>
          <p className="text-sm text-[#8b93a1] mt-1">
            Manage your vehicles, documents, drivers, and maintenance
          </p>
        </div>
        <button
          type="button"
          onClick={() => showToast("Fleet management isn't connected to the backend yet.", "info")}
          className="inline-flex h-11 items-center gap-2 rounded-[10px] bg-[#101e3d] px-4 text-[14px] font-semibold text-white"
        >
          <PlusOutlined /> Add vehicle
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STAT_CARDS.map((card) => (
          <div
            key={card.label}
            className="rounded-[16px] border border-[#e8ecf4] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)]"
          >
            <div className="flex items-center gap-3 text-[#3b414d]">
              <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#f4f7fb] text-[16px] text-[#5e6777]">
                {card.icon}
              </span>
              <span className="text-[14px] font-medium text-[#696f7a]">{card.label}</span>
            </div>
            <div className="mt-4 text-[28px] font-semibold text-[#293041]">0</div>
            <div className="mt-1 text-[12px] text-[#8b93a1]">{card.caption}</div>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-3 rounded-[16px] border border-[#e8ecf4] bg-[#fafbfd] p-4 text-[13px] text-[#8b93a1]">
        <WarningOutlined className="mt-0.5 text-[#e09408]" />
        <span>
          Fleet alerts (insurance/roadworthiness expiry, maintenance due) will appear here once vehicle
          records exist. No vehicles are registered yet.
        </span>
      </div>

      <div className="overflow-hidden rounded-[18px] border border-[#e8ecf4] bg-white">
        <div className="border-b border-[#edf1f7] px-5 py-4">
          <div className="text-[15px] font-semibold text-[#293041]">Vehicles</div>
          <div className="text-[12px] text-[#8b93a1]">Your registered fleet and their current status</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-[13px]">
            <thead>
              <tr className="border-b border-[#edf1f7] bg-[#fafbfd] text-left text-[#8b93a1]">
                <th className="px-5 py-3 font-medium">Vehicle</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Insurance</th>
                <th className="px-5 py-3 font-medium">Roadworthiness</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-[#8b93a1]">
                  No vehicles registered yet. Fleet management requires backend support that
                  doesn&apos;t exist yet, so this list is empty rather than showing sample data.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
