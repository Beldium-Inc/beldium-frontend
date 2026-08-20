"use client";

import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircleOutlined,
  ArrowRightOutlined,
  SafetyCertificateOutlined,
  UsergroupAddOutlined,
  SolutionOutlined,
} from "@ant-design/icons";
import { classNames } from "@/src/features/compliance/dashboard/lib/style";
import { getComplianceReviewDashboardCards, getComplianceTeamMembers } from "@/src/features/compliance/dashboard/api";
import { getUser } from "@/src/features/onboarding/api";

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
  const isActive = label.toLowerCase() === "active";
  return (
    <span
      className={classNames(
        "inline-flex items-center justify-center rounded-full border px-3 py-1 text-[11px] font-semibold",
        isActive
          ? "border-[#caebd1] bg-[#ecfaf0] text-[#1ea43b]"
          : "border-[#e1e5ee] bg-[#f7f8fb] text-[#7a8291]"
      )}
    >
      {label}
    </span>
  );
}

type ComplianceProfileData = {
  organization_name?: string | null;
  country_of_operation?: string | null;
  sector_coverage?: string[] | null;
};

export default function ComplianceInstitutionProfileView() {
  const { data: userRes } = useQuery({
    queryKey: ["compliance-profile-user"],
    queryFn: getUser,
  });
  const { data: dashboardCards } = useQuery({
    queryKey: ["compliance-review-dashboard-cards"],
    queryFn: getComplianceReviewDashboardCards,
  });
  const { data: teamRes } = useQuery({
    queryKey: ["compliance-team-members"],
    queryFn: getComplianceTeamMembers,
  });

  const profile = userRes?.data?.profile as ComplianceProfileData | undefined;
  const accountVerified = Boolean(userRes?.data?.account_verified);
  const complianceDomains = profile?.sector_coverage ?? [];

  const teamRaw = teamRes?.data;
  const teamMembers = Array.isArray(teamRaw) ? teamRaw : teamRaw?.results ?? [];

  const overviewCards = [
    {
      title: "Total miners",
      value: dashboardCards?.data?.total_miners_onboarded?.count,
      footnote: "Registered",
      footnoteClassName: "text-[#7a8291]",
    },
    {
      title: "Under review",
      value: dashboardCards?.data?.under_review?.count,
      footnote: "In Progress",
      footnoteClassName: "text-[#ea9b2e]",
    },
    {
      title: "Compliance ready",
      value: dashboardCards?.data?.compliance_ready?.count,
      footnote: "Verified",
      footnoteClassName: "text-[#1ea43b]",
    },
    {
      title: "Action required",
      value: dashboardCards?.data?.action_required?.count,
      footnote: "Urgent",
      footnoteClassName: "text-[#ef2f32]",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-bold tracking-[-0.03em] text-[#2a2f39]">
          Compliance Profile
        </h1>
        <p className="mt-1 max-w-[560px] text-[14px] text-[#7a8291]">
          Institutional regulatory identity and compliance authority overview
        </p>

        <div className="mt-4 inline-flex flex-wrap items-center gap-2 rounded-[10px] border border-[#dce3ef] bg-white px-3 py-2 text-[13px] text-[#7a8291]">
          <span className="font-medium text-[#5b6472]">
            Role: {profile?.organization_name ? "Compliance Officer" : "—"}
          </span>
          <span className="text-[#c0c5cf]">•</span>
          <span>You are acting under this institution</span>
        </div>
      </div>

      <section className="rounded-[16px] border border-[#e8ecf4] bg-white p-6 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)]">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#ff3e72] text-[24px] font-semibold italic leading-none !text-white">
              {(profile?.organization_name ?? "?").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="text-[18px] font-semibold text-[#2a2f39]">
                {profile?.organization_name || "Organization name not set"}
              </div>
              <div className="mt-1 text-[13px] text-[#8a92a1]">
                {profile?.country_of_operation || "Jurisdiction not set"}
              </div>
            </div>
          </div>

          {accountVerified && (
            <div className="flex flex-col items-start gap-2 xl:items-end">
              <ComplianceInstitutionBadge
                icon={<CheckCircleOutlined />}
                label="Verified Institution"
              />
            </div>
          )}
        </div>
      </section>

      {/*
        License renewal banner and the old "Verification & Integrity" panel
        (last verified / next review / audit status) are removed — there is
        no license or audit-tracking model behind ComplianceProfile yet, so
        rather than show fabricated dates, these sections are hidden until
        that data actually exists on the backend.
      */}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.03fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <section className="rounded-[16px] border border-[#e8ecf4] bg-white p-6 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)]">
            <ComplianceSectionHeading
              icon={<SafetyCertificateOutlined />}
              title="Regulatory Authority"
            />

            <div className="mt-5">
              <div className="text-[11px] font-medium uppercase tracking-[0.04em] text-[#8a92a1]">
                Compliance Domains
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {complianceDomains.length > 0 ? (
                  complianceDomains.map((item) => <ComplianceDomainChip key={item} label={item} />)
                ) : (
                  <span className="text-[13px] text-[#a0a7b5]">No sector coverage set yet.</span>
                )}
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

              {teamMembers.length > 0 ? (
                teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_140px] items-center border-t border-[#edf1f7] px-4 py-3 text-[13px] text-[#4b5260]"
                  >
                    <span>{member.full_name}</span>
                    <span>{member.role_detail?.name || "—"}</span>
                    <span>
                      <ComplianceTeamStatus label={member.status} />
                    </span>
                  </div>
                ))
              ) : (
                <div className="border-t border-[#edf1f7] px-4 py-6 text-center text-[13px] text-[#a0a7b5]">
                  No team members invited yet.
                </div>
              )}

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
              {overviewCards.map((item) => (
                <ComplianceOverviewCard
                  key={item.title}
                  title={item.title}
                  value={item.value !== undefined ? String(item.value) : "—"}
                  footnote={item.footnote}
                  footnoteClassName={item.footnoteClassName}
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
