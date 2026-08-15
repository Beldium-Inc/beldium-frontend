"use client";

import type { ReactNode } from "react";
import {
  CheckCircleOutlined,
  SafetyOutlined,
  WarningFilled,
  ArrowRightOutlined,
  SafetyCertificateOutlined,
  UsergroupAddOutlined,
  SolutionOutlined,
} from "@ant-design/icons";
import { classNames } from "@/src/features/compliance/dashboard/lib/style";
import { complianceInstitutionProfile } from "@/src/features/compliance/dashboard/lib/profile-data";

function ComplianceDomainChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#b9ceff] bg-[#eef4ff] px-3 py-1 text-[12px] font-medium text-[#2661d8]">
      {label}
    </span>
  );
}

function ComplianceInstitutionBadge({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#caebd1] bg-[#ecfaf0] px-3 py-1.5 text-[12px] font-semibold text-[#1ea43b]">
      {icon}
      {label}
    </span>
  );
}

function ComplianceSectionHeading({
  icon,
  title,
}: {
  icon: ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2 text-[15px] font-semibold text-[#2a2f39]">
      <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#eef4ff] text-[16px] text-[#2661d8]">
        {icon}
      </span>
      {title}
    </div>
  );
}

function ComplianceOverviewCard({
  title,
  value,
  footnote,
  footnoteClassName,
}: {
  title: string;
  value: string;
  footnote: string;
  footnoteClassName: string;
}) {
  return (
    <div className="rounded-[14px] border border-[#e8ecf4] bg-[#fbfcfe] px-4 py-4">
      <div className="text-[11px] font-medium uppercase tracking-[0.05em] text-[#8a92a1]">
        {title}
      </div>
      <div className="mt-2 text-[22px] font-bold tracking-[-0.02em] text-[#1c2230]">{value}</div>
      <div className={classNames("mt-0.5 text-[12px]", footnoteClassName)}>
        {footnote}
      </div>
    </div>
  );
}

function ComplianceTeamStatus({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center justify-center rounded-full border border-[#caebd1] bg-[#ecfaf0] px-3 py-1 text-[11px] font-semibold text-[#1ea43b]">
      {label}
    </span>
  );
}

function ComplianceVerificationValue({
  value,
  tone,
}: {
  value: string;
  tone?: "green";
}) {
  if (tone === "green") {
    return (
      <span className="inline-flex items-center justify-center rounded-full border border-[#caebd1] bg-[#ecfaf0] px-3 py-1 text-[11px] font-semibold text-[#1ea43b]">
        {value}
      </span>
    );
  }

  return <span className="text-[13px] font-medium text-[#2a2f39]">{value}</span>;
}

export default function ComplianceInstitutionProfileView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-bold tracking-[-0.03em] text-[#2a2f39]">
          {complianceInstitutionProfile.title}
        </h1>
        <p className="mt-1 max-w-[560px] text-[14px] text-[#7a8291]">
          {complianceInstitutionProfile.subtitle}
        </p>

        <div className="mt-4 inline-flex flex-wrap items-center gap-2 rounded-[10px] border border-[#dce3ef] bg-white px-3 py-2 text-[13px] text-[#7a8291]">
          <span className="font-medium text-[#5b6472]">
            Role: {complianceInstitutionProfile.roleLabel}
          </span>
          <span className="text-[#c0c5cf]">•</span>
          <span>{complianceInstitutionProfile.actingLabel}</span>
        </div>
      </div>

      <section className="rounded-[16px] border border-[#e8ecf4] bg-white p-6 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)]">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#ff3e72] text-[38px] font-semibold italic leading-none !text-white">
              in
            </div>
            <div>
              <div className="text-[18px] font-semibold text-[#2a2f39]">
                {complianceInstitutionProfile.institutionName}
              </div>
              <div className="mt-1 text-[13px] text-[#8a92a1]">
                {complianceInstitutionProfile.jurisdiction}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start gap-2 xl:items-end">
            <ComplianceInstitutionBadge
              icon={<CheckCircleOutlined />}
              label="Verified Institution"
            />
            <ComplianceInstitutionBadge
              icon={<SafetyOutlined />}
              label="License: Valid"
            />
          </div>
        </div>
      </section>

      <section className="rounded-[16px] border border-[#f4dfb4] bg-[#fffaf1] px-5 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-[16px] text-[#df8b19]">
              <WarningFilled />
            </span>
            <div>
              <div className="text-[13px] font-semibold text-[#d58219]">
                {complianceInstitutionProfile.renewalNotice.title}
              </div>
              <div className="mt-0.5 text-[12px] text-[#e3a24b]">
                {complianceInstitutionProfile.renewalNotice.description}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#d58219]"
          >
            {complianceInstitutionProfile.renewalNotice.actionLabel}
            <ArrowRightOutlined />
          </button>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.03fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <section className="rounded-[16px] border border-[#e8ecf4] bg-white p-6 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)]">
            <ComplianceSectionHeading
              icon={<SafetyCertificateOutlined />}
              title="Regulatory Authority"
            />

            <div className="mt-5">
              <div className="text-[11px] font-medium uppercase tracking-[0.04em] text-[#8a92a1]">
                Minerals Covered
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {complianceInstitutionProfile.mineralsCovered.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center rounded-full border border-[#e1e5ee] bg-[#f8fafc] px-3 py-1 text-[12px] text-[#5b6472]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <div className="text-[11px] font-medium uppercase tracking-[0.04em] text-[#8a92a1]">
                Compliance Domains
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {complianceInstitutionProfile.complianceDomains.map((item) => (
                  <ComplianceDomainChip key={item} label={item} />
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-[16px] border border-[#e8ecf4] bg-white p-6 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)]">
            <ComplianceSectionHeading
              icon={<UsergroupAddOutlined />}
              title="Team Overview"
            />

            <div className="mt-5 overflow-hidden rounded-[14px] border border-[#e8ecf4]">
              <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_140px] bg-[#fbfcfe] px-4 py-3 text-[12px] font-semibold text-[#2f3541]">
                <span>Name</span>
                <span>Role</span>
                <span>Status</span>
              </div>

              {complianceInstitutionProfile.teamMembers.map((member) => (
                <div
                  key={member.name}
                  className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_140px] items-center border-t border-[#edf1f7] px-4 py-3 text-[13px] text-[#4b5260]"
                >
                  <span>{member.name}</span>
                  <span>{member.role}</span>
                  <span>
                    <ComplianceTeamStatus label={member.status} />
                  </span>
                </div>
              ))}

              <div className="flex justify-center border-t border-[#edf1f7] px-4 py-3">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-[10px] border border-[#e1e5ee] bg-[#f7f8fb] px-4 py-2 text-[12px] font-medium text-[#5f6675] transition-colors hover:bg-white"
                >
                  View full team
                  <ArrowRightOutlined />
                </button>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-[16px] border border-[#e8ecf4] bg-white p-6 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)]">
            <ComplianceSectionHeading
              icon={<SolutionOutlined />}
              title="Compliance Overview"
            />

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {complianceInstitutionProfile.overviewCards.map((item) => (
                <ComplianceOverviewCard
                  key={item.title}
                  title={item.title}
                  value={item.value}
                  footnote={item.footnote}
                  footnoteClassName={item.footnoteClassName}
                />
              ))}
            </div>
          </section>

          <section className="rounded-[16px] border border-[#e8ecf4] bg-white p-6 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)]">
            <ComplianceSectionHeading
              icon={<SafetyOutlined />}
              title="Verification & Integrity"
            />

            <div className="mt-5 space-y-4">
              {complianceInstitutionProfile.verificationItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-4 border-b border-[#f0f3f8] pb-4 last:border-b-0 last:pb-0"
                >
                  <span className="text-[13px] text-[#8a92a1]">{item.label}</span>
                  <ComplianceVerificationValue
                    value={item.value}
                    tone={item.tone}
                  />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

