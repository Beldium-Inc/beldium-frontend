"use client";

import {
  ApartmentOutlined,
  CheckCircleFilled,
  EditOutlined,
  InfoCircleOutlined,
  LockOutlined,
  PlusOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import ComplianceOrganizationChangeRequestModal, {
  type OrganizationIdentityField,
} from "@/src/features/compliance/dashboard/components/ComplianceOrganizationChangeRequestModal";
import { showToast } from "@/src/store/toast.store";

const organizationProfile = {
  title: "Organizational Profile",
  subtitle: "Entity details, office, and global identifiers",
  identityStatus: "Verified Institution",
  identityFields: [
    { label: "Company Name", value: "EcoVerify Nigeria Limited" },
    { label: "Registration Number", value: "COMN/2025/0721" },
    { label: "License Type", value: "Class-A" },
    { label: "Jurisdiction", value: "Nigeria" },
  ],
  contactInformation: {
    officeAddress: "24 McCarthy Street, Boulevard, Lagos",
    phoneNumber: "+234 801 902 1345",
    institutionalAddress: "+234 801 902 1345",
  },
  licenseStatus: {
    validity: "Valid",
    licenseNumber: "ECA-1257-0098",
    issuingAuthority: "Nigerian Mining Agency",
    expiryDate: "January 15, 2028",
  },
  branches: [
    { name: "Kwara Branch", location: "2464 Royal Ln. Mesa" },
    { name: "Oyo Branch", location: "2715 Ash Dr. San Jose" },
    { name: "Ekiti Branch", location: "3517 W. Gray St. Utica" },
  ],
};

function InfoFieldCard({
  label,
  value,
  onRequestChange,
}: {
  label: string;
  value: string;
  onRequestChange: (field: OrganizationIdentityField) => void;
}) {
  return (
    <article className="rounded-[18px] bg-[#f7f9fc] px-5 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[13px] font-medium uppercase tracking-[0.04em] text-[#7f8796]">
            {label}
          </div>
          <div className="mt-3 text-[18px] font-medium text-[#262d39]">
            {value}
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          <LockOutlined className="text-[16px] text-[#b1b8c4]" />
          <button
            type="button"
            onClick={() => onRequestChange({ label, value })}
            className="text-[14px] font-medium text-[#63a6b5] transition-colors hover:text-[#3e899c]"
          >
            Request change
          </button>
        </div>
      </div>
    </article>
  );
}

function ContactField({
  label,
  value,
  fullWidth = false,
}: {
  label: string;
  value: string;
  fullWidth?: boolean;
}) {
  return (
    <div className={fullWidth ? "md:col-span-2" : undefined}>
      <div className="text-[14px] text-[#49505f]">{label}</div>
      <div className="mt-3 rounded-[18px] border border-[#dfe5ef] bg-white px-5 py-4 text-[16px] text-[#2b313d] shadow-[0_16px_32px_-28px_rgba(16,30,61,0.3)]">
        {value}
      </div>
    </div>
  );
}

function LicenseDetailCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-[18px] bg-[#f7f9fc] px-5 py-4">
      <div className="text-[13px] font-medium uppercase tracking-[0.04em] text-[#7f8796]">
        {label}
      </div>
      <div className="mt-3 text-[18px] font-medium text-[#262d39]">{value}</div>
    </article>
  );
}

export default function ComplianceOrganizationProfileView() {
  const [selectedChangeField, setSelectedChangeField] =
    useState<OrganizationIdentityField | null>(null);

  return (
    <>
      <div className="space-y-8">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2 text-[15px] text-[#8a92a1]">
            <span>Settings</span>
            <span className="text-[12px] text-[#9aa2b0]">›</span>
            <span className="font-medium text-[#5d6675]">
              Organizational Profile
            </span>
          </div>

          <div>
            <h1 className="text-[28px] font-bold tracking-[-0.03em] text-[#2a2f39]">
              {organizationProfile.title}
            </h1>
            <p className="mt-2 text-[15px] text-[#7a8291]">
              {organizationProfile.subtitle}
            </p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_410px]">
          <section className="rounded-[16px] border border-[#e8ecf4] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)] sm:p-6">
            <div className="flex flex-col gap-5 border-b border-[#edf1f6] pb-7 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eef4ff] text-[20px] text-[#2661d8]">
                  <InfoCircleOutlined />
                </span>
                <h2 className="text-[18px] font-semibold text-[#2a2f39]">
                  Institutional Identity
                </h2>
              </div>

              <span className="inline-flex items-center gap-2 rounded-full border border-[#caebd1] bg-[#ecfaf0] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#1ea43b]">
                <CheckCircleFilled />
                {organizationProfile.identityStatus}
              </span>
            </div>

            <div className="mt-7 grid gap-5 md:grid-cols-2">
              {organizationProfile.identityFields.map((field) => (
                <InfoFieldCard
                  key={field.label}
                  label={field.label}
                  value={field.value}
                  onRequestChange={setSelectedChangeField}
                />
              ))}
            </div>

            <div className="mt-7 border-t border-[#edf1f6] pt-7">
              <div className="text-[15px] font-medium uppercase tracking-[0.04em] text-[#a0a7b5]">
                Contact Information
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <ContactField
                  label="Office Address"
                  value={organizationProfile.contactInformation.officeAddress}
                  fullWidth
                />
                <ContactField
                  label="Phone Number"
                  value={organizationProfile.contactInformation.phoneNumber}
                />
                <ContactField
                  label="Institutional Address"
                  value={organizationProfile.contactInformation.institutionalAddress}
                />
              </div>
            </div>
          </section>

          <aside className="rounded-[16px] border border-[#e8ecf4] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)] sm:p-6">
            <div className="flex items-center gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eef4ff] text-[20px] text-[#2661d8]">
                <SafetyCertificateOutlined />
              </span>
              <h2 className="text-[18px] font-semibold text-[#2a2f39]">
                License Status
              </h2>
            </div>

            <div className="mt-7 rounded-[18px] bg-[#eaf9ef] px-5 py-5">
              <div className="text-[13px] font-medium uppercase tracking-[0.04em] text-[#1ea43b]">
                License Validity
              </div>
              <div className="mt-3 flex items-center justify-between gap-4">
                <span className="text-[20px] font-semibold uppercase text-[#1ea43b]">
                  {organizationProfile.licenseStatus.validity}
                </span>
                <SafetyCertificateOutlined className="text-[20px] text-[#1fb538]" />
              </div>
            </div>

            <div className="mt-5 space-y-5">
              <LicenseDetailCard
                label="License Number"
                value={organizationProfile.licenseStatus.licenseNumber}
              />
              <LicenseDetailCard
                label="Issuing Authority"
                value={organizationProfile.licenseStatus.issuingAuthority}
              />
              <LicenseDetailCard
                label="Expiry Date"
                value={organizationProfile.licenseStatus.expiryDate}
              />
            </div>

            <button
              type="button"
              onClick={() =>
                showToast(
                  "Mock digital certificate preview. API wiring is pending.",
                  "info",
                )
              }
              className="mt-8 inline-flex h-11 w-full items-center justify-center rounded-[10px] border border-[#dfe5ef] bg-[#f7f9fc] px-4 text-[13px] font-medium text-[#24324c] transition-colors hover:bg-white"
            >
              View digital certificate
            </button>
          </aside>
        </div>

        <section className="overflow-hidden rounded-[16px] border border-[#e8ecf4] bg-white shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)]">
          <div className="flex flex-col gap-4 border-b border-[#edf1f6] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <div className="flex items-center gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eef4ff] text-[20px] text-[#2661d8]">
                <ApartmentOutlined />
              </span>
              <h2 className="text-[18px] font-semibold text-[#2a2f39]">
                Institutional Branches
              </h2>
            </div>

            <button
              type="button"
              onClick={() =>
                showToast("Mock add branch flow. API wiring is pending.", "info")
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] border border-[#e1e5ee] bg-white px-4 text-[13px] font-medium text-[#2f3541] transition-colors hover:bg-[#f7f9fc]"
            >
              <PlusOutlined />
              Add branch
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full border-separate border-spacing-0 text-left">
              <thead>
                <tr className="bg-white text-[15px] font-medium text-[#2f3541]">
                  <th className="border-b border-[#edf1f6] px-6 py-5">Branch Name</th>
                  <th className="border-b border-[#edf1f6] px-6 py-5">Location</th>
                  <th className="border-b border-[#edf1f6] px-6 py-5 text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {organizationProfile.branches.map((branch, index) => (
                  <tr
                    key={branch.name}
                    className={index % 2 === 0 ? "bg-white" : "bg-[#fcfdff]"}
                  >
                    <td className="border-b border-[#edf1f6] px-6 py-6 text-[16px] text-[#2a2f39]">
                      {branch.name}
                    </td>
                    <td className="border-b border-[#edf1f6] px-6 py-6 text-[16px] text-[#5d6675]">
                      {branch.location}
                    </td>
                    <td className="border-b border-[#edf1f6] px-6 py-6 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          showToast(
                            `Mock edit flow for ${branch.name}. API wiring is pending.`,
                            "info",
                          )
                        }
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dde3ed] bg-white text-[16px] text-[#6f7786] transition-colors hover:bg-[#f8fafc]"
                        aria-label={`Edit ${branch.name}`}
                      >
                        <EditOutlined />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {selectedChangeField ? (
        <ComplianceOrganizationChangeRequestModal
          field={selectedChangeField}
          onClose={() => setSelectedChangeField(null)}
        />
      ) : null}
    </>
  );
}
