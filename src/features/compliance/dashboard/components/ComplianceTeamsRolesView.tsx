"use client";

import {
  CheckOutlined,
  InfoCircleOutlined,
  LogoutOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  TeamOutlined,
  UserAddOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ComplianceInviteTeamMemberModal from "@/src/features/compliance/dashboard/components/ComplianceInviteTeamMemberModal";
import ComplianceTeamMemberDetailsDrawer from "@/src/features/compliance/dashboard/components/ComplianceTeamMemberDetailsDrawer";
import { getComplianceTeamMembers, type ComplianceTeamMember } from "@/src/features/compliance/dashboard/api";
import { showToast } from "@/src/store/toast.store";

function formatRelativeOrDate(value: string | null | undefined) {
  if (!value) return "-";
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.round(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? "" : "s"} ago`;
  const diffHours = Math.round(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

function initialsFor(name: string) {
  return (
    name
      .split(" ")
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}

const teamRolesData = {
  title: "Teams & Roles",
  subtitle:
    "Manage institutional access, compliance permissions, and user security.",
  permissionRows: [
    {
      permission: "View miner submissions",
      complianceAdmin: true,
      complianceOfficer: true,
      reviewer: true,
      auditor: true,
    },
    {
      permission: "Approve compliance cases",
      complianceAdmin: true,
      complianceOfficer: true,
      reviewer: false,
      auditor: false,
    },
    {
      permission: "Modify verification rules",
      complianceAdmin: true,
      complianceOfficer: false,
      reviewer: false,
      auditor: false,
    },
    {
      permission: "Upload compliance documents",
      complianceAdmin: true,
      complianceOfficer: true,
      reviewer: true,
      auditor: false,
    },
    {
      permission: "Manage Users",
      complianceAdmin: true,
      complianceOfficer: false,
      reviewer: false,
      auditor: false,
    },
    {
      permission: "Flag non-compliant miners",
      complianceAdmin: true,
      complianceOfficer: true,
      reviewer: true,
      auditor: false,
    },
  ],
  safeguards: [
    {
      title: "Minimum Admin Requirement",
      description: "At least one Super Admin must remain active at all times.",
      tone: "blue" as const,
    },
    {
      title: "Self-Removal Protection",
      description: "Super Admin cannot remove themselves if they are the only admin.",
      tone: "violet" as const,
    },
    {
      title: "Immediate Access Revocation",
      description: "Suspended users lose immediate access to all system functions.",
      tone: "rose" as const,
    },
  ],
};

function StatusPill({ status }: { status: string }) {
  const active = status.toLowerCase() === "active";
  return (
    <span
      className={
        active
          ? "inline-flex rounded-full border border-[#bdeec9] bg-[#e9faef] px-3 py-1 text-[11px] font-semibold text-[#1ea43b]"
          : "inline-flex rounded-full border border-[#f5ddb2] bg-[#fff5de] px-3 py-1 text-[11px] font-semibold text-[#d29019]"
      }
    >
      {status}
    </span>
  );
}

function PermissionCell({ allowed }: { allowed: boolean }) {
  return allowed ? (
    <span className="inline-flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#13264e] text-[14px] !text-white">
      <CheckOutlined />
    </span>
  ) : (
    <span className="inline-flex h-8 w-8 rounded-[10px] border border-[#bcc6d5] bg-white" />
  );
}

function SafeguardCard({
  title,
  description,
  tone,
}: {
  title: string;
  description: string;
  tone: "blue" | "violet" | "rose";
}) {
  const toneClassName =
    tone === "blue"
      ? "bg-[#f6f9ff] text-[#4f88ff]"
      : tone === "violet"
      ? "bg-[#faf4ff] text-[#b15dff]"
      : "bg-[#fff4f4] text-[#ef4444]";

  return (
    <article className="rounded-[24px] border border-[#edf1f6] bg-white p-5 shadow-[0_18px_40px_-34px_rgba(16,30,61,0.35)]">
      <div className={`flex h-14 w-14 items-center justify-center rounded-[16px] text-[22px] ${toneClassName}`}>
        {tone === "blue" ? (
          <SafetyCertificateOutlined />
        ) : tone === "violet" ? (
          <UserOutlined />
        ) : (
          <LogoutOutlined />
        )}
      </div>

      <h3 className="mt-5 text-[20px] font-semibold tracking-[-0.04em] text-[#252b37]">
        {title}
      </h3>
      <p className="mt-3 text-[15px] leading-7 text-[#8a92a1]">
        {description}
      </p>
    </article>
  );
}

export default function ComplianceTeamsRolesView() {
  const [requiresAdmin2FA, setRequiresAdmin2FA] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("30 minutes");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<ComplianceTeamMember | null>(
    null,
  );

  const teamMembersQ = useQuery({
    queryKey: ["complianceTeamMembers"],
    queryFn: getComplianceTeamMembers,
    retry: false,
  });
  const rawMembers = teamMembersQ.data?.data;
  const members = Array.isArray(rawMembers) ? rawMembers : rawMembers?.results ?? [];

  return (
    <>
      <div className="space-y-8">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2 text-[15px] text-[#8a92a1]">
              <span>Settings</span>
              <span className="text-[12px] text-[#9aa2b0]">›</span>
              <span className="font-medium text-[#5d6675]">Teams &amp; Roles</span>
            </div>

            <div>
              <h1 className="text-[28px] font-bold tracking-[-0.03em] text-[#2a2f39]">
                {teamRolesData.title}
              </h1>
              <p className="mt-2 text-[15px] text-[#7a8291]">
                {teamRolesData.subtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsInviteModalOpen(true)}
            className="inline-flex h-11 items-center justify-center gap-3 rounded-[10px] bg-[#13264e] px-4 text-[13px] font-semibold !text-white transition-colors hover:bg-[#182f5f]"
            style={{ color: "#ffffff" }}
          >
            <UserAddOutlined />
            Invite Team Member
          </button>
        </div>

        <section className="overflow-hidden rounded-[16px] border border-[#e8ecf4] bg-white shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)]">
          <div className="flex items-center gap-4 border-b border-[#edf1f6] px-5 py-5 sm:px-7">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eef4ff] text-[20px] text-[#2661d8]">
              <TeamOutlined />
            </span>
            <h2 className="text-[18px] font-semibold text-[#2a2f39]">
              Institutional Team Members
            </h2>
          </div>

          <div className="p-5 sm:p-6">
            {teamMembersQ.isLoading ? (
              <div className="px-5 py-12 text-center text-[13px] text-[#8a92a1]">Loading team members…</div>
            ) : members.length === 0 ? (
              <div className="px-5 py-12 text-center text-[13px] text-[#8a92a1]">
                No team members yet. Click &quot;Invite Team Member&quot; to add your first one.
              </div>
            ) : (
              <div className="overflow-hidden rounded-[14px] border border-[#e8ecf4]">
                <div className="overflow-x-auto">
                  <table className="min-w-[900px] w-full border-separate border-spacing-0 text-left">
                    <thead>
                      <tr className="bg-[#f7f9fc] text-[13px] font-medium text-[#2f3541]">
                        <th className="border-b border-[#edf1f6] px-4 py-3">Name</th>
                        <th className="border-b border-[#edf1f6] px-4 py-3">Role</th>
                        <th className="border-b border-[#edf1f6] px-4 py-3">Status</th>
                        <th className="border-b border-[#edf1f6] px-4 py-3">Last Login</th>
                        <th className="border-b border-[#edf1f6] px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((member, index) => (
                        <tr key={member.id} className={index % 2 === 0 ? "bg-white" : "bg-[#fcfdff]"}>
                          <td className="border-b border-[#f0f3f8] px-4 py-3">
                            <div className="flex items-center gap-3">
                              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eef4ff] text-[12px] font-semibold text-[#2661d8]">
                                {initialsFor(member.full_name)}
                              </span>
                              <span className="text-[13px] font-medium text-[#2a2f39]">{member.full_name}</span>
                            </div>
                          </td>
                          <td className="border-b border-[#f0f3f8] px-4 py-3 text-[13px] text-[#4d5565]">
                            {member.role_detail?.name || "Unassigned"}
                          </td>
                          <td className="border-b border-[#f0f3f8] px-4 py-3">
                            <StatusPill status={member.status} />
                          </td>
                          <td className="border-b border-[#f0f3f8] px-4 py-3 text-[13px] text-[#4d5565]">
                            {formatRelativeOrDate(member.last_login)}
                          </td>
                          <td className="border-b border-[#f0f3f8] px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedMember(member)}
                              className="inline-flex h-9 items-center justify-center rounded-[10px] border border-[#dfe5ef] bg-white px-4 text-[13px] font-medium text-[#24324c] transition-colors hover:bg-[#f7f9fc]"
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-[16px] border border-[#e8ecf4] bg-white shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)]">
        <div className="flex items-center gap-4 border-b border-[#edf1f6] px-5 py-5 sm:px-7">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eef4ff] text-[20px] text-[#2661d8]">
            <InfoCircleOutlined />
          </span>
          <h2 className="text-[18px] font-semibold text-[#2a2f39]">
            Role Definition
          </h2>
        </div>

        <div className="p-5 sm:p-6">
          <div className="overflow-hidden rounded-[24px] border border-[#dfe5ef]">
            <div className="overflow-x-auto">
              <table className="min-w-[1200px] w-full border-separate border-spacing-0 text-left">
                <thead>
                  <tr className="bg-[#f7f9fc] text-[15px] font-medium text-[#2f3541]">
                    <th className="border-b border-[#edf1f6] px-5 py-4">Permissions</th>
                    <th className="border-b border-[#edf1f6] px-5 py-4">Compliance Admin</th>
                    <th className="border-b border-[#edf1f6] px-5 py-4">Compliance Officer</th>
                    <th className="border-b border-[#edf1f6] px-5 py-4">Reviewer</th>
                    <th className="border-b border-[#edf1f6] px-5 py-4">Auditor</th>
                  </tr>
                </thead>
                <tbody>
                  {teamRolesData.permissionRows.map((row, index) => (
                    <tr
                      key={row.permission}
                      className={index % 2 === 0 ? "bg-white" : "bg-[#fcfdff]"}
                    >
                      <td className="border-b border-[#edf1f6] px-5 py-6 text-[16px] text-[#2a2f39]">
                        {row.permission}
                      </td>
                      <td className="border-b border-[#edf1f6] px-5 py-6 text-center">
                        <PermissionCell allowed={row.complianceAdmin} />
                      </td>
                      <td className="border-b border-[#edf1f6] px-5 py-6 text-center">
                        <PermissionCell allowed={row.complianceOfficer} />
                      </td>
                      <td className="border-b border-[#edf1f6] px-5 py-6 text-center">
                        <PermissionCell allowed={row.reviewer} />
                      </td>
                      <td className="border-b border-[#edf1f6] px-5 py-6 text-center">
                        <PermissionCell allowed={row.auditor} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-[18px] border border-[#cfe0ff] bg-[#eef5ff] px-5 py-4 text-[14px] text-[#4470b4]">
            <InfoCircleOutlined />
            <span>
              Hover over permission cells to view detailed descriptions of each
              capability.
            </span>
          </div>
        </div>
        </section>

        <section className="rounded-[16px] border border-[#e8ecf4] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)] sm:p-6">
        <div className="flex items-center gap-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eef4ff] text-[20px] text-[#2661d8]">
            <SafetyCertificateOutlined />
          </span>
          <h2 className="text-[18px] font-semibold text-[#2a2f39]">
            Account Security Enforcement
          </h2>
        </div>

        <div className="mt-7 divide-y divide-[#edf1f6] rounded-[24px] border border-[#edf1f6] bg-white">
          <div className="flex flex-col gap-5 px-5 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#eef4ff] text-[24px] text-[#4f88ff]">
                <SafetyCertificateOutlined />
              </span>
              <div>
                <div className="text-[20px] font-semibold tracking-[-0.04em] text-[#252b37]">
                  Require Two-Factor Authentication for Admin Roles
                </div>
                <div className="mt-2 text-[14px] text-[#8a92a1]">
                  Enforce 2FA for Super Admin and Compliance Officer accounts.
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setRequiresAdmin2FA((current) => !current);
                showToast(
                  `Mock admin 2FA requirement ${!requiresAdmin2FA ? "enabled" : "disabled"}. API wiring is pending.`,
                  "success",
                );
              }}
              className={`relative inline-flex h-10 w-[72px] rounded-full p-1 transition-colors ${requiresAdmin2FA ? "bg-[#d7e5ff]" : "bg-[#d9dce2]"}`}
              aria-pressed={requiresAdmin2FA}
            >
              <span
                className={`h-8 w-8 rounded-full bg-white shadow-sm transition-transform ${requiresAdmin2FA ? "translate-x-8" : "translate-x-0"}`}
              />
            </button>
          </div>

          <div className="flex flex-col gap-5 px-5 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#faf4ff] text-[24px] text-[#b15dff]">
                <SettingOutlined />
              </span>
              <div>
                <div className="text-[20px] font-semibold tracking-[-0.04em] text-[#252b37]">
                  Session Timeout Duration
                </div>
                <div className="mt-2 text-[14px] text-[#8a92a1]">
                  Automatically log out inactive users after specified time.
                </div>
              </div>
            </div>

            <div className="relative">
              <select
                value={sessionTimeout}
                onChange={(event) => {
                  setSessionTimeout(event.target.value);
                  showToast(
                    `Mock session timeout set to ${event.target.value}. API wiring is pending.`,
                    "success",
                  );
                }}
                className="h-16 min-w-[220px] appearance-none rounded-[18px] border border-[#13264e] bg-white px-5 pr-12 text-[16px] font-medium text-[#24324c] outline-none transition-shadow focus:shadow-[0_0_0_4px_rgba(16,30,61,0.06)]"
              >
                <option>15 minutes</option>
                <option>30 minutes</option>
                <option>45 minutes</option>
                <option>60 minutes</option>
              </select>
              <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-[18px] text-[#24324c]">
                ▾
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-5 px-5 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#fff4f4] text-[24px] text-[#ef4444]">
                <LogoutOutlined />
              </span>
              <div>
                <div className="text-[20px] font-semibold tracking-[-0.04em] text-[#252b37]">
                  Device Session Management
                </div>
                <div className="mt-2 text-[14px] text-[#8a92a1]">
                  Force logout all active sessions across all devices.
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                showToast(
                  "Mock logout-all-sessions action. API wiring is pending.",
                  "info",
                )
              }
              className="inline-flex h-11 items-center justify-center rounded-[10px] border border-[#ffb7b7] bg-white px-4 text-[13px] font-medium text-[#ef4444] transition-colors hover:bg-[#fff5f5]"
            >
              Logout all active sessions
            </button>
          </div>
        </div>
        </section>

        <section className="rounded-[16px] border border-[#e8ecf4] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)] sm:p-6">
        <div className="flex items-center gap-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eef4ff] text-[20px] text-[#2661d8]">
            <SafetyCertificateOutlined />
          </span>
          <h2 className="text-[18px] font-semibold text-[#2a2f39]">
            Risk &amp; Governance Safeguards
          </h2>
        </div>

        <div className="mt-7 grid gap-5 xl:grid-cols-3">
          {teamRolesData.safeguards.map((item) => (
            <SafeguardCard
              key={item.title}
              title={item.title}
              description={item.description}
              tone={item.tone}
            />
          ))}
        </div>
        </section>
      </div>

      {isInviteModalOpen ? (
        <ComplianceInviteTeamMemberModal
          onClose={() => setIsInviteModalOpen(false)}
        />
      ) : null}

      {selectedMember ? (
        <ComplianceTeamMemberDetailsDrawer
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
        />
      ) : null}
    </>
  );
}
