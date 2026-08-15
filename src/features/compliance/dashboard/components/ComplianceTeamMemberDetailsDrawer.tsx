"use client";

import {
  CalendarOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  IdcardOutlined,
  MailOutlined,
  MobileOutlined,
} from "@ant-design/icons";
import type { ReactNode } from "react";
import { showToast } from "@/src/store/toast.store";

export type TeamMemberProfile = {
  name: string;
  role: string;
  status: "active" | "invite-pending";
  lastLogin: string;
  securityLabel: string;
  securityTone: "green" | "rose";
  avatar: {
    type: "initials";
    label: string;
    tone: string;
  };
  email: string;
  department: string;
  joinedDate: string;
  lastActiveLabel: string;
  lastActiveDate: string;
  activeSessions: string;
  permissionsGranted: number;
};

function MemberStatusPill({ status }: { status: TeamMemberProfile["status"] }) {
  return (
    <span
      className={
        status === "active"
          ? "inline-flex rounded-full border border-[#bdeec9] bg-[#e9faef] px-3 py-1 text-[11px] font-semibold text-[#1ea43b]"
          : "inline-flex rounded-full border border-[#f5ddb2] bg-[#fff5de] px-3 py-1 text-[11px] font-semibold text-[#d29019]"
      }
    >
      {status === "active" ? "Active" : "Invite pending"}
    </span>
  );
}

function MemberSecurityPill({
  label,
  tone,
}: {
  label: string;
  tone: TeamMemberProfile["securityTone"];
}) {
  return (
    <span
      className={
        tone === "green"
          ? "inline-flex items-center gap-2 rounded-full border border-[#dde8dd] bg-[#f7faf7] px-3 py-1 text-[12px] font-medium text-[#5e6674]"
          : "inline-flex items-center gap-2 rounded-full border border-[#f3d6d7] bg-[#fff3f3] px-3 py-1 text-[12px] font-medium text-[#9b6d73]"
      }
    >
      <span className="h-3.5 w-3.5 rounded-full border border-[#c4ccd8]" />
      {label}
    </span>
  );
}

function DetailCard({
  icon,
  title,
  children,
  action,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-[24px] border border-[#e8edf4] bg-white p-6 shadow-[0_20px_46px_-40px_rgba(16,30,61,0.35)]">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef4ff] text-[18px] text-[#2661d8]">
            {icon}
          </span>
          <h3 className="text-[18px] font-semibold text-[#2a2f39]">{title}</h3>
        </div>
        {action}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export default function ComplianceTeamMemberDetailsDrawer({
  member,
  onClose,
}: {
  member: TeamMemberProfile;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[rgba(22,28,36,0.54)] backdrop-blur-[2px]">
      <button
        type="button"
        onClick={onClose}
        className="h-full flex-1 cursor-default"
        aria-label="Close user details drawer"
      />

      <aside className="relative flex h-full w-full max-w-[458px] flex-col overflow-y-auto bg-white shadow-[-24px_0_80px_-42px_rgba(15,23,42,0.55)]">
        <div className="flex items-start justify-between border-b border-[#edf1f6] px-7 py-6">
          <div>
            <h2 className="text-[20px] font-semibold text-[#2a2f39]">
              User Details
            </h2>
            <p className="mt-2 text-[15px] text-[#7a8291]">
              Manage user account and permissions
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[20px] text-[#596274] transition-colors hover:bg-[#f7f9fc]"
            aria-label="Close user details"
          >
            <CloseOutlined />
          </button>
        </div>

        <div className="space-y-7 px-6 py-7">
          <section className="rounded-[24px] border border-[#edf1f6] bg-white p-6 shadow-[0_20px_46px_-40px_rgba(16,30,61,0.35)]">
            <div className="flex items-start gap-4">
              <span
                className={`flex h-16 w-16 items-center justify-center rounded-full text-[18px] font-medium text-[#afb6c0] ${member.avatar.tone}`}
              >
                {member.avatar.label}
              </span>

              <div className="min-w-0 flex-1">
                <div className="text-[18px] font-semibold text-[#2a2f39]">
                  {member.name}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <MemberStatusPill status={member.status} />
                  <MemberSecurityPill
                    label={member.securityLabel}
                    tone={member.securityTone}
                  />
                </div>
                <div className="mt-4 space-y-3 text-[15px] text-[#7a8291]">
                  <div className="flex items-center gap-3">
                    <MailOutlined className="text-[#7f8796]" />
                    <span>{member.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <IdcardOutlined className="text-[#7f8796]" />
                    <span>{member.department}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <DetailCard
            icon={<IdcardOutlined />}
            title="Role & Permissions"
            action={
              <button
                type="button"
                onClick={() =>
                  showToast(
                    `Mock change-role flow for ${member.name}. API wiring is pending.`,
                    "info",
                  )
                }
                className="text-[15px] font-medium text-[#2f8ea4] transition-opacity hover:opacity-80"
              >
                Change role
              </button>
            }
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-6">
                <span className="text-[15px] text-[#9aa2b0]">Current Role</span>
                <span className="text-[16px] font-medium text-[#2a2f39]">
                  {member.role}
                </span>
              </div>
              <div className="flex items-center justify-between gap-6">
                <span className="text-[15px] text-[#9aa2b0]">Permissions</span>
                <span className="text-[16px] font-medium text-[#2a2f39]">
                  {member.permissionsGranted} Granted
                </span>
              </div>
            </div>
          </DetailCard>

          <DetailCard icon={<CalendarOutlined />} title="Account Activity">
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <CalendarOutlined className="mt-1 text-[16px] text-[#9aa2b0]" />
                <div>
                  <div className="text-[15px] text-[#9aa2b0]">Joined</div>
                  <div className="mt-1 text-[16px] font-medium text-[#2a2f39]">
                    {member.joinedDate}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ClockCircleOutlined className="mt-1 text-[16px] text-[#9aa2b0]" />
                <div>
                  <div className="text-[15px] text-[#9aa2b0]">
                    {member.lastActiveLabel}
                  </div>
                  <div className="mt-1 text-[16px] font-medium text-[#2a2f39]">
                    {member.lastActiveDate}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MobileOutlined className="mt-1 text-[16px] text-[#9aa2b0]" />
                <div>
                  <div className="text-[15px] text-[#9aa2b0]">
                    Active sessions
                  </div>
                  <div className="mt-1 text-[16px] font-medium text-[#2a2f39]">
                    {member.activeSessions}
                  </div>
                </div>
              </div>
            </div>
          </DetailCard>

          <div className="space-y-4 pt-1">
            <button
              type="button"
              onClick={() =>
                showToast(
                  `Mock password reset triggered for ${member.name}. API wiring is pending.`,
                  "success",
                )
              }
              className="inline-flex h-11 w-full items-center justify-center rounded-[10px] border border-[#dfe5ef] bg-[#f9fbfd] px-4 text-[13px] font-medium text-[#24324c] transition-colors hover:bg-[#f2f6fb]"
            >
              Force Password Reset
            </button>

            <button
              type="button"
              onClick={() =>
                showToast(
                  `Mock suspend-account flow for ${member.name}. API wiring is pending.`,
                  "info",
                )
              }
              className="inline-flex h-11 w-full items-center justify-center rounded-[10px] border border-[#ffd2d2] bg-[#fff9f9] px-4 text-[13px] font-medium text-[#ef4444] transition-colors hover:bg-[#fff2f2]"
            >
              Suspend Account
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
