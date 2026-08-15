"use client";

import { useState } from "react";
import { SearchOutlined, DownOutlined, ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
import type {
  NotificationSeverity,
  ComplianceNotificationRow,
} from "@/src/features/compliance/dashboard/mock";
import { classNames } from "@/src/features/compliance/dashboard/lib/style";

export const notificationSeverityBar: Record<NotificationSeverity, string> = {
  high_risk: "bg-[#ef2f32]",
  action_required: "bg-[#f3a000]",
  informational: "bg-[#c7ccd6]",
};

export const notificationFilterTabs: Array<{
  key: "all" | NotificationSeverity;
  label: string;
}> = [
  { key: "all", label: "All" },
  { key: "high_risk", label: "High Risk" },
  { key: "action_required", label: "Action Required" },
  { key: "informational", label: "Informational" },
];

export default function ComplianceNotificationsView({
  rows,
}: {
  rows: ComplianceNotificationRow[];
}) {
  const [activeFilter, setActiveFilter] = useState<"all" | NotificationSeverity>(
    "all",
  );
  const [search, setSearch] = useState("");

  const counts: Record<"all" | NotificationSeverity, number> = {
    all: rows.length,
    high_risk: rows.filter((row) => row.severity === "high_risk").length,
    action_required: rows.filter((row) => row.severity === "action_required")
      .length,
    informational: rows.filter((row) => row.severity === "informational")
      .length,
  };

  const filteredRows = rows.filter((row) => {
    const matchesFilter =
      activeFilter === "all" || row.severity === activeFilter;
    const matchesSearch = search.trim()
      ? row.minerName.toLowerCase().includes(search.trim().toLowerCase())
      : true;

    return matchesFilter && matchesSearch;
  });

  return (
    <section className="rounded-[16px] border border-[#e8ecf4] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)] sm:p-6">
      <div className="mb-6 inline-flex flex-wrap items-center gap-2 rounded-[16px] border border-[#e7ebf2] bg-[#fafbfd] p-1.5">
        {notificationFilterTabs.map((tab) => {
          const isActive = activeFilter === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveFilter(tab.key)}
              className={classNames(
                "inline-flex items-center gap-2 rounded-[12px] px-4 py-2.5 text-[14px] font-medium transition-colors",
                isActive
                  ? "bg-white text-[#202534] shadow-sm"
                  : "text-[#7a8291] hover:text-[#404655]",
              )}
            >
              {tab.label}
              <span
                className={classNames(
                  "inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[12px] font-semibold",
                  isActive
                    ? "bg-[#101e3d] !text-white"
                    : "bg-[#e8ecf4] text-[#5f6675]",
                )}
              >
                {counts[tab.key]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full max-w-[320px]">
          <SearchOutlined className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#a0a6b3]" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search miners..."
            className="h-11 w-full rounded-[12px] border border-[#dfe4ec] bg-white pl-11 pr-4 text-[14px] text-[#2d3441] outline-none transition-colors placeholder:text-[#a0a6b3] focus:border-[#101e3d]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {["All status", "All states", "Most recent"].map((label) => (
            <button
              key={label}
              type="button"
              className="inline-flex h-11 items-center gap-2 rounded-[12px] border border-[#dfe4ec] bg-white px-4 text-[14px] font-medium text-[#4b5260] transition-colors hover:bg-[#f9fafc]"
            >
              {label}
              <DownOutlined className="text-[11px] text-[#8a92a1]" />
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-[#d7dce6] bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full border-separate border-spacing-0 text-left">
            <thead>
              <tr className="bg-[#fbfcfe] text-[15px] font-medium text-[#353b47]">
                <th className="border-b border-[#dfe4ec] px-5 py-5">Miner</th>
                <th className="border-b border-[#dfe4ec] px-5 py-5">Alert Type</th>
                <th className="border-b border-[#dfe4ec] px-5 py-5">Description</th>
                <th className="border-b border-[#dfe4ec] px-5 py-5">Assigned</th>
                <th className="border-b border-[#dfe4ec] px-5 py-5">Triggered</th>
                <th className="border-b border-[#dfe4ec] px-5 py-5">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row.id} className="text-[15px] text-[#4b5260]">
                  <td className="relative border-b border-[#edf1f7] px-5 py-6">
                    <span
                      className={classNames(
                        "absolute left-0 top-2 bottom-2 w-1 rounded-full",
                        notificationSeverityBar[row.severity],
                      )}
                    />
                    <div className="font-medium text-[#2d3441]">
                      {row.minerName}
                    </div>
                    <div className="mt-1 text-[13px] text-[#8a92a1]">
                      {row.minerCode}
                    </div>
                  </td>
                  <td className="border-b border-[#edf1f7] px-5 py-6">
                    {row.alertType}
                  </td>
                  <td className="border-b border-[#edf1f7] px-5 py-6">
                    <div className="max-w-[260px] truncate">
                      {row.description}
                    </div>
                  </td>
                  <td className="border-b border-[#edf1f7] px-5 py-6">
                    {row.assignedTo ? (
                      row.assignedTo
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-[#f3c9c9] bg-[#fdf1f1] px-3 py-1 text-[12px] font-medium text-[#c8433a]">
                        Unassigned
                      </span>
                    )}
                  </td>
                  <td className="border-b border-[#edf1f7] px-5 py-6 whitespace-nowrap">
                    {row.triggeredAt}
                  </td>
                  <td className="border-b border-[#edf1f7] px-5 py-6">
                    <button
                      type="button"
                      className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#dfe3eb] bg-white px-4 text-[14px] font-medium text-[#404655] shadow-sm transition-colors hover:bg-[#f9fafc]"
                    >
                      View miner
                    </button>
                  </td>
                </tr>
              ))}

              {filteredRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-[14px] text-[#8a92a1]"
                  >
                    No notifications match this filter.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-[#edf1f7] px-5 py-4 text-[14px] text-[#7a8291] sm:flex-row">
          <span>
            You have {rows.length} orders (Displaying {filteredRows.length} per
            page)
          </span>
          <div className="inline-flex items-center gap-1">
            <button
              type="button"
              disabled
              className="inline-flex h-9 items-center gap-1 rounded-[10px] px-3 text-[13px] font-medium text-[#a0a6b3] disabled:cursor-not-allowed"
            >
              <ArrowLeftOutlined className="text-[11px]" />
              Previous
            </button>
            {["1", "2", "3", "…", "8", "9", "10"].map((page, index) => (
              <button
                key={`${page}-${index}`}
                type="button"
                disabled={page === "…"}
                className={classNames(
                  "inline-flex h-9 min-w-[36px] items-center justify-center rounded-[10px] px-2 text-[13px] font-medium transition-colors",
                  page === "1"
                    ? "bg-[#101e3d] !text-white"
                    : page === "…"
                      ? "cursor-default text-[#a0a6b3]"
                      : "text-[#4b5260] hover:bg-[#f4f6fa]",
                )}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              className="inline-flex h-9 items-center gap-1 rounded-[10px] px-3 text-[13px] font-medium text-[#4b5260] hover:bg-[#f4f6fa]"
            >
              Next
              <ArrowRightOutlined className="text-[11px]" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

