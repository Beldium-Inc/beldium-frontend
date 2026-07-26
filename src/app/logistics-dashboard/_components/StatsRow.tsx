"use client";

import { FolderOpenOutlined, FileSearchOutlined, CarOutlined, WalletOutlined } from "@ant-design/icons";
import { useRfqAssignments, useRfqTransactions } from "./useLogisticsData";

const icons = [FolderOpenOutlined, FileSearchOutlined, CarOutlined, WalletOutlined];

function formatNaira(value: number) {
  return `₦${value.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
}

export default function StatsRow() {
  const { data: assignments } = useRfqAssignments();
  const { data: transactions } = useRfqTransactions();

  const openOpportunities = assignments?.filter((a) => a.status === "pending").length ?? 0;
  const assignedJobs =
    assignments?.filter((a) => a.status === "accepted" || a.status === "in_progress").length ?? 0;
  const pendingPayout =
    transactions
      ?.filter((t) => t.final_status !== "completed" && t.final_status !== "cancelled")
      .reduce((sum, t) => sum + Number(t.total_value ?? 0), 0) ?? 0;

  const stats = [
    { label: "Open Opportunities", value: String(openOpportunities), sub: "Jobs available to accept" },
    { label: "Assigned Jobs", value: String(assignedJobs), sub: "Currently assigned" },
    { label: "Fleet Availability", value: "N/A", sub: "Fleet management not connected yet" },
    { label: "Pending Payout", value: formatNaira(pendingPayout), sub: "Awaiting settlement" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s, i) => {
        const Icon = icons[i];
        return (
          <div
            key={s.label}
            className="rounded-[16px] border border-[#e8ecf4] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)]"
          >
            <div className="flex items-center gap-2 text-[#6f7786] text-sm mb-4">
              <span className="w-8 h-8 rounded-lg bg-[#e9f0ff] flex items-center justify-center text-[#101e3d]">
                <Icon className="text-[15px]" />
              </span>
              {s.label}
            </div>
            <div className="text-2xl font-semibold text-[#172554]">{s.value}</div>
            <div className="text-xs text-[#8b93a1] mt-1">{s.sub}</div>
          </div>
        );
      })}
    </div>
  );
}
