"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import {
  CheckCircleOutlined,
  SafetyOutlined,
  MailOutlined,
  PhoneOutlined,
  IdcardOutlined,
  CalendarOutlined,
  SolutionOutlined,
} from "@ant-design/icons";
import { classNames, primaryActionStyle } from "@/src/features/compliance/dashboard/lib/style";
import {
  complianceProfileCard,
  complianceSecuritySettings,
  compliancePermissions,
} from "@/src/features/compliance/dashboard/lib/profile-data";

function ProfileStatusBanner({
  tone,
  icon,
  label,
}: {
  tone: "green" | "blue";
  icon: ReactNode;
  label: string;
}) {
  return (
    <div
      className={classNames(
        "inline-flex w-full items-center justify-center gap-2 rounded-[14px] px-4 py-3 text-[15px] font-medium",
        tone === "green"
          ? "border border-[#caebd1] bg-[#ebfaef] text-[#1ea43b]"
          : "border border-[#dce7ff] bg-[#eef4ff] text-[#2661d8]",
      )}
    >
      {icon}
      {label}
    </div>
  );
}

function ProfileInfoRow({
  icon,
  value,
}: {
  icon: ReactNode;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 text-[16px] text-[#4b5260]">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4f7fb] text-[18px] text-[#5f6880]">
        {icon}
      </span>
      <span>{value}</span>
    </div>
  );
}

function ProfileActionButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="inline-flex h-14 w-full items-center justify-center rounded-[16px] bg-[#14244a] px-5 text-[16px] font-semibold text-white shadow-[0_18px_36px_-24px_rgba(20,36,74,0.8)] transition-colors hover:bg-[#182c57]"
      style={primaryActionStyle}
    >
      {label}
    </button>
  );
}

function SecuritySettingRow({
  title,
  description,
  icon,
  tone,
  statusLabel,
  actionLabel,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  tone: "blue" | "neutral";
  statusLabel?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-[24px] border border-[#e8ecf4] bg-white px-5 py-5 shadow-[0_24px_40px_-36px_rgba(16,30,61,0.45)] sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <span
          className={classNames(
            "flex h-14 w-14 items-center justify-center rounded-[18px] text-[24px]",
            tone === "blue"
              ? "bg-[#eef4ff] text-[#2661d8]"
              : "bg-[#f4f6fa] text-[#4f5664]",
          )}
        >
          {icon}
        </span>
        <div>
          <div className="text-[18px] font-medium text-[#2a2f39]">{title}</div>
          <div className="mt-1 text-[15px] text-[#6f7786]">{description}</div>
        </div>
      </div>

      {statusLabel ? (
        <span className="inline-flex items-center justify-center rounded-[14px] border border-[#caebd1] bg-[#ebfaef] px-4 py-2 text-[15px] font-medium text-[#1ea43b]">
          {statusLabel}
        </span>
      ) : null}

      {actionLabel ? (
        <button
          type="button"
          className="inline-flex h-14 items-center justify-center rounded-[16px] bg-[#14244a] px-7 text-[16px] font-semibold text-white shadow-[0_18px_36px_-24px_rgba(20,36,74,0.8)] transition-colors hover:bg-[#182c57]"
          style={primaryActionStyle}
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

function PermissionStatusPill({ granted }: { granted: boolean }) {
  return (
    <span
      className={classNames(
        "inline-flex items-center justify-center rounded-[14px] px-4 py-2 text-[15px] font-medium",
        granted
          ? "border border-[#caebd1] bg-[#ebfaef] text-[#1ea43b]"
          : "border border-[#e5e8ef] bg-[#f6f7fa] text-[#8a92a1]",
      )}
    >
      {granted ? "Granted" : "Not Granted"}
    </span>
  );
}

function PermissionRow({
  label,
  granted,
}: {
  label: string;
  granted: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-[22px] border border-[#e8ecf4] bg-white px-5 py-5 shadow-[0_24px_40px_-36px_rgba(16,30,61,0.45)] sm:flex-row sm:items-center sm:justify-between">
      <div className="text-[18px] text-[#2a2f39]">{label}</div>
      <PermissionStatusPill granted={granted} />
    </div>
  );
}

export default function ComplianceProfileView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[42px] font-semibold tracking-[-0.06em] text-[#2a2f39]">
          My Profile
        </h1>
        <p className="mt-2 max-w-[780px] text-[15px] text-[#7a8291]">
          Personal account information, security settings, and activity history
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.86fr)_minmax(0,1.64fr)]">
        <section className="rounded-[32px] border border-[#e8ecf4] bg-white p-6 shadow-[0_28px_60px_-48px_rgba(16,30,61,0.35)]">
          <div className="flex flex-col items-center text-center">
            <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-white shadow-[0_18px_36px_-28px_rgba(16,30,61,0.55)]">
              <Image
                src={complianceProfileCard.avatarSrc}
                alt={complianceProfileCard.name}
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>
            <div className="mt-6 text-[32px] font-semibold tracking-[-0.05em] text-[#2a2f39]">
              {complianceProfileCard.name}
            </div>
            <div className="mt-1 text-[18px] text-[#6f7786]">
              {complianceProfileCard.role}
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <ProfileStatusBanner
              tone="green"
              icon={<CheckCircleOutlined />}
              label="Verified Institution"
            />
            <ProfileStatusBanner
              tone="blue"
              icon={<SafetyOutlined />}
              label="2FA Enabled"
            />
          </div>

          <div className="mt-8 space-y-4">
            <ProfileInfoRow
              icon={<MailOutlined />}
              value={complianceProfileCard.email}
            />
            <ProfileInfoRow
              icon={<PhoneOutlined />}
              value={complianceProfileCard.phone}
            />
            <ProfileInfoRow
              icon={<IdcardOutlined />}
              value={complianceProfileCard.department}
            />
            <ProfileInfoRow
              icon={<CalendarOutlined />}
              value={complianceProfileCard.joinedLabel}
            />
          </div>

          <div className="my-8 h-px bg-[#edf1f7]" />

          <div className="space-y-4">
            <ProfileActionButton label="Edit profile" />
            <ProfileActionButton label="Change password" />
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-[32px] border border-[#e8ecf4] bg-white p-6 shadow-[0_28px_60px_-48px_rgba(16,30,61,0.35)]">
            <div className="flex items-center gap-3 text-[18px] font-semibold text-[#2a2f39]">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef4ff] text-[#2661d8]">
                <SafetyOutlined />
              </span>
              Security Settings
            </div>

            <div className="mt-6 space-y-4">
              {complianceSecuritySettings.map((item) => (
                <SecuritySettingRow
                  key={item.title}
                  title={item.title}
                  description={item.description}
                  icon={item.icon}
                  tone={item.tone}
                  statusLabel={item.statusLabel}
                  actionLabel={item.actionLabel}
                />
              ))}
            </div>
          </section>

          <section className="rounded-[32px] border border-[#e8ecf4] bg-white p-6 shadow-[0_28px_60px_-48px_rgba(16,30,61,0.35)]">
            <div className="flex items-center gap-3 text-[18px] font-semibold text-[#2a2f39]">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef4ff] text-[#2661d8]">
                <SolutionOutlined />
              </span>
              Permissions
            </div>

            <div className="mt-6 space-y-4">
              {compliancePermissions.map((permission) => (
                <PermissionRow
                  key={permission.label}
                  label={permission.label}
                  granted={permission.granted}
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

