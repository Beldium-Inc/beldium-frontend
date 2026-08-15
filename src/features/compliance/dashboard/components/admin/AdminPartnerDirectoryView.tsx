"use client";

import { useState } from "react";
import {
  ApartmentOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  EnvironmentOutlined,
  SafetyCertificateOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";
import type {
  PartnerDirectoryRow,
  PartnerCategory,
  PartnerAvailability,
} from "@/src/features/compliance/dashboard/mock";
import { classNames, primaryActionStyle } from "@/src/features/compliance/dashboard/lib/style";
import { StatusBadgePill } from "@/src/features/compliance/dashboard/components/shared/DashboardMetricCard";
import { ReviewInfoTile } from "@/src/features/compliance/dashboard/components/shared/ReviewTiles";

export const PARTNER_CATEGORY_FILTERS: Array<{ key: "All" | PartnerCategory; label: string }> = [
  { key: "All", label: "All" },
  { key: "Environmental", label: "Environmental" },
  { key: "Legal", label: "Legal/Regulatory" },
  { key: "ESG Auditors", label: "ESG Auditors" },
  { key: "Govt Liaison", label: "Govt Liaison" },
];

export const partnerAvailabilityDot: Record<PartnerAvailability, string> = {
  Available: "bg-[#1fb538]",
  "Near capacity": "bg-[#f3a000]",
  Busy: "bg-[#ef2f32]",
};

export default function AdminPartnerDirectoryView({ rows }: { rows: PartnerDirectoryRow[] }) {
  const [activeCategory, setActiveCategory] = useState<"All" | PartnerCategory>("All");
  const [search, setSearch] = useState("");
  const [openedPartner, setOpenedPartner] = useState<PartnerDirectoryRow | null>(null);

  const filteredRows = rows.filter((row) => {
    const matchesCategory = activeCategory === "All" || row.category === activeCategory;
    const matchesSearch = search.trim()
      ? row.partnerEntity.toLowerCase().includes(search.trim().toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
  });

  if (openedPartner) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 text-[14px] text-[#7b8392]">
          <button
            type="button"
            onClick={() => setOpenedPartner(null)}
            className="inline-flex items-center gap-2 rounded-full border border-[#dce3ef] bg-white px-4 py-2 text-[14px] font-medium text-[#4e5665] shadow-sm"
          >
            <ArrowLeftOutlined />
            Partner Directory
          </button>
          <ArrowRightOutlined className="text-[12px]" />
          <span className="font-semibold text-[#2a2f39]">{openedPartner.partnerEntity}</span>
        </div>

        <section className="rounded-[16px] border border-[#e8ecf4] bg-white p-6 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-[24px] font-semibold text-[#2a2f39]">{openedPartner.partnerEntity}</div>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <StatusBadgePill badge={{ label: openedPartner.category, tone: "cyan" }} />
                <StatusBadgePill
                  badge={{
                    label: openedPartner.availability,
                    tone:
                      openedPartner.availability === "Available"
                        ? "green"
                        : openedPartner.availability === "Near capacity"
                          ? "amber"
                          : "red",
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <ReviewInfoTile icon={<SafetyCertificateOutlined />} label="Accreditation Status" value={openedPartner.accreditationStatus} />
            <ReviewInfoTile icon={<EnvironmentOutlined />} label="Regions Covered" value={openedPartner.regionsCovered} />
            <ReviewInfoTile icon={<UsergroupAddOutlined />} label="Active Assignments" value={String(openedPartner.activeAssignments)} />
            <ReviewInfoTile icon={<ApartmentOutlined />} label="Category" value={openedPartner.category} />
          </div>
        </section>
      </div>
    );
  }

  return (
    <section className="rounded-[16px] border border-[#e8ecf4] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)] sm:p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex flex-wrap items-center gap-2 rounded-[16px] border border-[#e7ebf2] bg-[#fafbfd] p-1.5">
          {PARTNER_CATEGORY_FILTERS.map((tab) => {
            const isActive = activeCategory === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveCategory(tab.key)}
                className={classNames(
                  "rounded-[12px] px-4 py-2 text-[14px] font-medium transition-colors",
                  isActive ? "bg-[#14244a]" : "text-[#5d6675] hover:bg-white",
                )}
                style={isActive ? primaryActionStyle : undefined}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search partner by name or license"
          className="h-11 w-full max-w-[320px] rounded-full border border-[#dbe0ea] bg-white px-5 text-[14px] text-[#293041] outline-none"
        />
      </div>

      <div className="overflow-hidden rounded-[24px] border border-[#e5e9f1]">
        <div className="overflow-x-auto">
          <table className="min-w-[960px] w-full border-separate border-spacing-0 text-left">
            <thead>
              <tr className="bg-[#fbfcfe] text-[15px] font-medium text-[#353b47]">
                <th className="border-b border-[#e5e9f1] px-5 py-5">Partner Entity</th>
                <th className="border-b border-[#e5e9f1] px-5 py-5">Category</th>
                <th className="border-b border-[#e5e9f1] px-5 py-5">Accreditation Status</th>
                <th className="border-b border-[#e5e9f1] px-5 py-5">Regions Covered</th>
                <th className="border-b border-[#e5e9f1] px-5 py-5">Availability</th>
                <th className="border-b border-[#e5e9f1] px-5 py-5">Active Assignments</th>
                <th className="border-b border-[#e5e9f1] px-5 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, index) => (
                <tr
                  key={row.id}
                  className={classNames(
                    "text-[15px] text-[#4b5260]",
                    index % 2 === 0 ? "bg-white" : "bg-[#fcfdff]",
                  )}
                >
                  <td className="border-b border-[#edf1f7] px-5 py-6 font-medium text-[#2f3541]">
                    {row.partnerEntity}
                  </td>
                  <td className="border-b border-[#edf1f7] px-5 py-6">
                    <StatusBadgePill badge={{ label: row.category, tone: "cyan" }} />
                  </td>
                  <td className="border-b border-[#edf1f7] px-5 py-6">{row.accreditationStatus}</td>
                  <td className="border-b border-[#edf1f7] px-5 py-6">{row.regionsCovered}</td>
                  <td className="border-b border-[#edf1f7] px-5 py-6">
                    <span className="inline-flex items-center gap-2">
                      <span className={classNames("h-2.5 w-2.5 rounded-full", partnerAvailabilityDot[row.availability])} />
                      {row.availability}
                    </span>
                  </td>
                  <td className="border-b border-[#edf1f7] px-5 py-6">{row.activeAssignments}</td>
                  <td className="border-b border-[#edf1f7] px-5 py-6 text-right">
                    <button
                      type="button"
                      onClick={() => setOpenedPartner(row)}
                      className="inline-flex h-9 items-center justify-center rounded-[10px] border border-[#dce3ef] bg-white px-4 text-[13px] font-medium text-[#2b3140]"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-[14px] text-[#8a92a1]">
                    No partners match this filter.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}


