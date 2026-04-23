"use client";

import {
  AppstoreOutlined,
  EllipsisOutlined,
  GlobalOutlined,
  PlusOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import ComplianceAddJurisdictionModal from "@/src/features/compliance/dashboard/components/ComplianceAddJurisdictionModal";
import { showToast } from "@/src/store/toast.store";

type AuthorityStatus = "approved" | "pending";

const regulatoryScope = {
  title: "Regulatory Scope",
  subtitle: "Define and manage the institutional authority",
  geographicAuthorities: [
    {
      region: "Lagos",
      level: "State",
      status: "approved" as AuthorityStatus,
      effectiveDate: "November 16, 2014",
      expiry: "August 2, 2028",
    },
    {
      region: "Kaduna",
      level: "State",
      status: "approved" as AuthorityStatus,
      effectiveDate: "May 9, 2014",
      expiry: "May 12, 2028",
    },
    {
      region: "Kwara",
      level: "State",
      status: "pending" as AuthorityStatus,
      effectiveDate: "May 29, 2017",
      expiry: "September 9, 2032",
    },
    {
      region: "Nigeria",
      level: "Federal",
      status: "approved" as AuthorityStatus,
      effectiveDate: "March 13, 2014",
      expiry: "August 7, 2028",
    },
  ],
  mineralOversight: {
    mineral: "Lithium",
    status: "Approved",
    authorityLevel: "Full Regulatory Oversight",
  },
  complianceResponsibilities: [
    {
      domain: "Environmental Compliance",
      authorityType: "Enforcement",
      status: "Approved",
    },
    {
      domain: "ESG",
      authorityType: "Enforcement",
      status: "Approved",
    },
    {
      domain: "Licensing & Regulatory Compliance",
      authorityType: "Enforcement",
      status: "Approved",
    },
  ],
};

function ScopeStatusPill({ status }: { status: AuthorityStatus }) {
  const isApproved = status === "approved";

  return (
    <span
      className={
        isApproved
          ? "inline-flex rounded-full border border-[#bdeec9] bg-[#e9faef] px-4 py-1 text-[14px] font-medium text-[#1ea43b]"
          : "inline-flex rounded-full border border-[#f5ddb2] bg-[#fff5de] px-4 py-1 text-[14px] font-medium text-[#d29019]"
      }
    >
      {isApproved ? "Approved" : "Pending Verification"}
    </span>
  );
}

function ActionDotsButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() =>
        showToast(`${label} actions are still using mock data. API wiring is pending.`, "info")
      }
      className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[20px] text-[#c8cbd2] transition-colors hover:bg-[#f7f9fc] hover:text-[#9aa2b0]"
      aria-label={`Open actions for ${label}`}
    >
      <EllipsisOutlined />
    </button>
  );
}

function ApprovedPill({ label }: { label: string }) {
  return (
    <span className="inline-flex rounded-full border border-[#bdeec9] bg-[#e9faef] px-4 py-1 text-[14px] font-medium text-[#1ea43b]">
      {label}
    </span>
  );
}

function AuthorityTypePill({ label }: { label: string }) {
  return (
    <span className="inline-flex rounded-[14px] border border-[#e1e6ef] bg-white px-4 py-2 text-[14px] font-medium text-[#4d5565]">
      {label}
    </span>
  );
}

export default function ComplianceRegulatoryScopeView() {
  const [isAddJurisdictionOpen, setIsAddJurisdictionOpen] = useState(false);

  return (
    <>
      <div className="space-y-8">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2 text-[15px] text-[#8a92a1]">
            <span>Settings</span>
            <span className="text-[12px] text-[#9aa2b0]">›</span>
            <span className="font-medium text-[#5d6675]">Regulatory Scope</span>
          </div>

          <div>
            <h1 className="text-[42px] font-semibold tracking-[-0.06em] text-[#2a2f39]">
              {regulatoryScope.title}
            </h1>
            <p className="mt-2 text-[15px] text-[#7a8291]">
              {regulatoryScope.subtitle}
            </p>
          </div>
        </div>

        <section className="rounded-[32px] border border-[#dfe5ef] bg-white p-5 shadow-[0_28px_60px_-48px_rgba(16,30,61,0.35)] sm:p-7">
          <div className="flex flex-col gap-4 border-b border-[#edf1f6] pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eef4ff] text-[20px] text-[#2661d8]">
                <GlobalOutlined />
              </span>
              <h2 className="text-[18px] font-semibold text-[#2a2f39]">
                Geographic Authority
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setIsAddJurisdictionOpen(true)}
              className="inline-flex h-14 items-center justify-center gap-3 rounded-[18px] bg-[#13264e] px-6 text-[16px] font-semibold text-white shadow-[0_22px_44px_-28px_rgba(19,38,78,0.85)] transition-colors hover:bg-[#182f5f]"
            >
              <PlusOutlined />
              Add jurisdiction
            </button>
          </div>

          <div className="mt-6 overflow-hidden rounded-[24px] border border-[#dfe5ef]">
            <div className="overflow-x-auto">
              <table className="min-w-[1080px] w-full border-separate border-spacing-0 text-left">
                <thead>
                  <tr className="bg-[#f7f9fc] text-[15px] font-medium text-[#2f3541]">
                    <th className="border-b border-[#edf1f6] px-5 py-4">Region</th>
                    <th className="border-b border-[#edf1f6] px-5 py-4">Level</th>
                    <th className="border-b border-[#edf1f6] px-5 py-4">
                      Authority Status
                    </th>
                    <th className="border-b border-[#edf1f6] px-5 py-4">
                      Effective Date
                    </th>
                    <th className="border-b border-[#edf1f6] px-5 py-4">Expiry</th>
                    <th className="border-b border-[#edf1f6] px-5 py-4 text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {regulatoryScope.geographicAuthorities.map((row, index) => (
                    <tr
                      key={`${row.region}-${row.level}`}
                      className={index % 2 === 0 ? "bg-white" : "bg-[#fcfdff]"}
                    >
                      <td className="border-b border-[#edf1f6] px-5 py-6 text-[16px] text-[#2a2f39]">
                        {row.region}
                      </td>
                      <td className="border-b border-[#edf1f6] px-5 py-6 text-[16px] text-[#4d5565]">
                        {row.level}
                      </td>
                      <td className="border-b border-[#edf1f6] px-5 py-6">
                        <ScopeStatusPill status={row.status} />
                      </td>
                      <td className="border-b border-[#edf1f6] px-5 py-6 text-[16px] text-[#4d5565]">
                        {row.effectiveDate}
                      </td>
                      <td className="border-b border-[#edf1f6] px-5 py-6 text-[16px] text-[#4d5565]">
                        {row.expiry}
                      </td>
                      <td className="border-b border-[#edf1f6] px-5 py-6 text-right">
                        <ActionDotsButton label={row.region} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-[#dfe5ef] bg-white p-5 shadow-[0_28px_60px_-48px_rgba(16,30,61,0.35)] sm:p-7">
          <div className="flex items-center gap-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eef4ff] text-[20px] text-[#2661d8]">
              <AppstoreOutlined />
            </span>
            <h2 className="text-[18px] font-semibold text-[#2a2f39]">
              Mineral Oversight
            </h2>
          </div>

          <div className="mt-8 flex flex-col gap-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-[20px] font-semibold text-[#2a2f39]">
                {regulatoryScope.mineralOversight.mineral}
              </div>
              <ApprovedPill label={regulatoryScope.mineralOversight.status} />
            </div>

            <div className="rounded-[20px] bg-[#f7f9fc] px-5 py-5">
              <div className="text-[13px] font-medium uppercase tracking-[0.04em] text-[#a0a7b5]">
                Authority Level
              </div>
              <div className="mt-3 text-[18px] font-medium text-[#2a2f39]">
                {regulatoryScope.mineralOversight.authorityLevel}
              </div>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-[32px] border border-[#dfe5ef] bg-white shadow-[0_28px_60px_-48px_rgba(16,30,61,0.35)]">
          <div className="flex items-center gap-4 border-b border-[#edf1f6] px-5 py-5 sm:px-7">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eef4ff] text-[20px] text-[#2661d8]">
              <SafetyCertificateOutlined />
            </span>
            <h2 className="text-[18px] font-semibold text-[#2a2f39]">
              Compliance Responsibilities
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[980px] w-full border-separate border-spacing-0 text-left">
              <thead>
                <tr className="bg-white text-[15px] font-medium text-[#2f3541]">
                  <th className="border-b border-[#edf1f6] px-6 py-5">
                    Compliance Domains
                  </th>
                  <th className="border-b border-[#edf1f6] px-6 py-5">
                    Authority Type
                  </th>
                  <th className="border-b border-[#edf1f6] px-6 py-5">Status</th>
                  <th className="border-b border-[#edf1f6] px-6 py-5 text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {regulatoryScope.complianceResponsibilities.map((item, index) => (
                  <tr
                    key={item.domain}
                    className={index % 2 === 0 ? "bg-white" : "bg-[#fcfdff]"}
                  >
                    <td className="border-b border-[#edf1f6] px-6 py-6 text-[16px] text-[#2a2f39]">
                      {item.domain}
                    </td>
                    <td className="border-b border-[#edf1f6] px-6 py-6">
                      <AuthorityTypePill label={item.authorityType} />
                    </td>
                    <td className="border-b border-[#edf1f6] px-6 py-6">
                      <ApprovedPill label={item.status} />
                    </td>
                    <td className="border-b border-[#edf1f6] px-6 py-6 text-right">
                      <ActionDotsButton label={item.domain} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {isAddJurisdictionOpen ? (
        <ComplianceAddJurisdictionModal
          onClose={() => setIsAddJurisdictionOpen(false)}
        />
      ) : null}
    </>
  );
}
