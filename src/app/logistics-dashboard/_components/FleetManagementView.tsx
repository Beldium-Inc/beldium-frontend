"use client";

import { useMemo, useState } from "react";
import {
  CarOutlined,
  CheckCircleOutlined,
  ToolOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  PlusOutlined,
  MoreOutlined,
  EyeOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import { classNames, statusStyles } from "@/src/features/compliance/dashboard/lib/style";
import { fleetStats, fleetAlerts, fleetVehicles, FleetVehicle } from "./data";
import AddVehicleModal from "./AddVehicleModal";
import VehicleDetailView from "./VehicleDetailView";

const STAT_ICONS = [CarOutlined, CheckCircleOutlined, ClockCircleOutlined, ToolOutlined];

function docPill(status: FleetVehicle["insurance"]) {
  switch (status) {
    case "Valid":
      return statusStyles.green;
    case "Expiring soon":
      return statusStyles.amber;
    case "Expired":
      return statusStyles.red;
  }
}

function statusPill(status: FleetVehicle["status"]) {
  switch (status) {
    case "Available":
      return statusStyles.cyan ?? statusStyles.slate;
    case "Assigned":
      return statusStyles.green;
    case "Maintenance":
      return statusStyles.amber;
  }
}

export default function FleetManagementView() {
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  const typeOptions = useMemo(() => Array.from(new Set(fleetVehicles.map((v) => v.type))), []);

  const filtered = useMemo(() => {
    let list = fleetVehicles;
    if (statusFilter) list = list.filter((v) => v.status === statusFilter);
    if (typeFilter) list = list.filter((v) => v.type === typeFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((v) => v.vehicle.toLowerCase().includes(q) || v.registration.toLowerCase().includes(q));
    }
    return list;
  }, [statusFilter, typeFilter, query]);

  const selectedVehicle = selectedVehicleId ? fleetVehicles.find((v) => v.id === selectedVehicleId) ?? null : null;

  if (selectedVehicle) {
    return <VehicleDetailView vehicle={selectedVehicle} onBack={() => setSelectedVehicleId(null)} />;
  }

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
          onClick={() => setAddOpen(true)}
          className="inline-flex h-11 items-center gap-2 rounded-[10px] bg-[#101e3d] px-4 text-[14px] font-semibold text-white hover:bg-[#182a52]"
        >
          <PlusOutlined /> Add vehicle
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {fleetStats.map((card, i) => {
          const Icon = STAT_ICONS[i];
          return (
            <div
              key={card.label}
              className="rounded-[16px] border border-[#e8ecf4] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)]"
            >
              <div className="flex items-center gap-3 text-[#3b414d]">
                <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#f4f7fb] text-[16px] text-[#5e6777]">
                  <Icon />
                </span>
                <span className="text-[14px] font-medium text-[#696f7a]">{card.label}</span>
              </div>
              <div className="mt-4 text-[28px] font-semibold text-[#293041]">{card.value}</div>
              <div className="mt-1 text-[12px] text-[#8b93a1]">{card.sub}</div>
            </div>
          );
        })}
      </div>

      <div className="flex items-start gap-3 rounded-[16px] border border-[#f6e3bf] bg-[#fffaf0] p-4 text-[13px]">
        <WarningOutlined className="mt-0.5 text-[#e09408]" />
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
          <span className="font-medium text-[#293041]">Fleet alerts</span>
          {fleetAlerts.map((a, i) => (
            <span key={i} className="flex items-center gap-1 text-[#6f7786]">
              <span className="w-1 h-1 rounded-full bg-[#e09408]" />
              {a.label} <span className="text-[#e09408] font-medium">{a.days}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-[16px] border border-[#e8ecf4] bg-white p-4 flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#f9fafc] border border-[#e4e9f2] rounded-lg px-3 py-2 text-sm text-[#293041] outline-none"
        >
          <option value="">Status: All status</option>
          <option value="Available">Available</option>
          <option value="Assigned">Assigned</option>
          <option value="Maintenance">Maintenance</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-[#f9fafc] border border-[#e4e9f2] rounded-lg px-3 py-2 text-sm text-[#293041] outline-none"
        >
          <option value="">Type: All</option>
          {typeOptions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search vehicle"
          className="ml-auto min-w-[200px] bg-[#f9fafc] border border-[#e4e9f2] rounded-lg px-3 py-2 text-sm text-[#293041] placeholder:text-[#8b93a1] outline-none"
        />
      </div>

      <div className="overflow-hidden rounded-[18px] border border-[#e8ecf4] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-[13px]">
            <thead>
              <tr className="border-b border-[#edf1f7] bg-[#fafbfd] text-left text-[#8b93a1]">
                <th className="px-5 py-3 font-medium">Vehicle</th>
                <th className="px-5 py-3 font-medium">Registration</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Insurance</th>
                <th className="px-5 py-3 font-medium">Roadworthiness</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">More</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf1f7]">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-[#8b93a1]">
                    No vehicles match these filters.
                  </td>
                </tr>
              )}
              {filtered.map((v) => {
                const insurancePill = docPill(v.insurance);
                const roadworthinessPill = docPill(v.roadworthiness);
                const statusPillStyle = statusPill(v.status);
                return (
                  <tr key={v.id} className="relative">
                    <td className="px-5 py-3 font-medium text-[#293041]">{v.vehicle}</td>
                    <td className="px-5 py-3 text-[#6f7786]">{v.registration}</td>
                    <td className="px-5 py-3 text-[#6f7786]">{v.type}</td>
                    <td className={classNames("px-5 py-3", v.insurance === "Expired" ? "text-[#ef2f32]" : v.insurance === "Expiring soon" ? "text-[#e09408]" : "text-[#1ea43b]")}>
                      {v.insurance}
                    </td>
                    <td className={classNames("px-5 py-3", v.roadworthiness === "Expired" ? "text-[#ef2f32]" : v.roadworthiness === "Expiring soon" ? "text-[#e09408]" : "text-[#1ea43b]")}>
                      {v.roadworthiness}
                    </td>
                    <td className="px-5 py-3">
                      <span className={classNames("text-xs font-medium px-2.5 py-1 rounded-full", statusPillStyle.container)}>
                        {v.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 relative">
                      <button
                        type="button"
                        onClick={() => setOpenMenuId(openMenuId === v.id ? null : v.id)}
                        className="w-8 h-8 rounded-full flex items-center justify-center border border-[#e4e9f2] text-[#6f7786] hover:bg-[#f9fafc]"
                      >
                        <MoreOutlined />
                      </button>
                      {openMenuId === v.id && (
                        <div className="absolute right-5 top-11 z-10 w-44 rounded-xl border border-[#e8ecf4] bg-white shadow-lg py-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedVehicleId(v.id);
                              setOpenMenuId(null);
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[#293041] hover:bg-[#f9fafc]"
                          >
                            <EyeOutlined /> View vehicle
                          </button>
                          <button
                            type="button"
                            onClick={() => setOpenMenuId(null)}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[#293041] hover:bg-[#f9fafc]"
                          >
                            <UserSwitchOutlined /> Assign driver
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-5 py-3 text-xs text-[#8b93a1] border-t border-[#edf1f7]">
          <span>You have {filtered.length} transactions (Displaying {Math.min(filtered.length, 7)} per page)</span>
          <div className="flex items-center gap-2">
            <button className="px-2.5 py-1 rounded-lg border border-[#e4e9f2]">Previous</button>
            <button className="px-2.5 py-1 rounded-lg border border-[#e4e9f2]">Next</button>
          </div>
        </div>
      </div>

      <AddVehicleModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
