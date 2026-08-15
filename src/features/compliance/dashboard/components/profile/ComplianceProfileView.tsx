"use client";

import { useState, type ReactNode } from "react";
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
import { classNames } from "@/src/features/compliance/dashboard/lib/style";
import { buildComplianceSecuritySettings, compliancePermissions } from "@/src/features/compliance/dashboard/lib/profile-data";
import EditProfileModal from "@/src/features/compliance/dashboard/components/profile/EditProfileModal";
import ChangePasswordModal from "@/src/features/compliance/dashboard/components/profile/ChangePasswordModal";

export type ComplianceProfileUser = {
  userId: string | null;
  profileId: string | null;
  name: string;
  role: string;
  email: string;
  avatarSrc: string | null;
  phone: string;
  department: string;
  isVerified: boolean;
  twoFactorEnabled: boolean;
  joinedLabel: string;
};

function ProfileStatusBadge({
  tone,
  icon,
  label,
}: {
  tone: "green" | "blue";
  icon: ReactNode;
  label: string;
}) {
  return (
    <span
      className={classNames(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold",
        tone === "green"
          ? "border border-[#caebd1] bg-[#ecfaf0] text-[#1ea43b]"
          : "border border-[#dce7ff] bg-[#eef4ff] text-[#2661d8]",
      )}
    >
      {icon}
      {label}
    </span>
  );
}

function ProfileInfoRow({
  icon,
  value,
}: {
  icon: ReactNode;
  value: string;
}) {
  if (!value) return null;

  return (
    <div className="flex items-center gap-3 text-[13px] text-[#4b5260]">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f4f7fb] text-[14px] text-[#5f6880]">
        {icon}
      </span>
      <span>{value}</span>
    </div>
  );
}

function SectionHeader({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-[15px] font-semibold text-[#2a2f39]">
      <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#eef4ff] text-[16px] text-[#2661d8]">
        {icon}
      </span>
      {label}
    </div>
  );
}

function SecuritySettingRow({
  title,
  description,
  icon,
  tone,
  statusLabel,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  tone: "blue" | "neutral";
  statusLabel?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-[14px] border border-[#e8ecf4] bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span
          className={classNames(
            "flex h-10 w-10 items-center justify-center rounded-[10px] text-[18px]",
            tone === "blue" ? "bg-[#eef4ff] text-[#2661d8]" : "bg-[#f4f6fa] text-[#4f5664]",
          )}
        >
          {icon}
        </span>
        <div>
          <div className="text-[14px] font-medium text-[#2a2f39]">{title}</div>
          <div className="mt-0.5 text-[12px] text-[#8a92a1]">{description}</div>
        </div>
      </div>

      {statusLabel ? (
        <span
          className={classNames(
            "inline-flex items-center justify-center self-start rounded-full border px-3 py-1 text-[11px] font-semibold sm:self-auto",
            statusLabel === "Enabled"
              ? "border-[#caebd1] bg-[#ecfaf0] text-[#1ea43b]"
              : "border-[#e5e8ef] bg-[#f6f7fa] text-[#8a92a1]",
          )}
        >
          {statusLabel}
        </span>
      ) : null}

      {actionLabel ? (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex h-10 items-center justify-center rounded-[10px] bg-[#14244a] px-4 text-[13px] font-semibold !text-white transition-colors hover:bg-[#182c57]"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

function PermissionRow({ label, granted }: { label: string; granted: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-[14px] border border-[#e8ecf4] bg-white px-4 py-4">
      <div className="text-[14px] text-[#2a2f39]">{label}</div>
      <span
        className={classNames(
          "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold",
          granted
            ? "border-[#caebd1] bg-[#ecfaf0] text-[#1ea43b]"
            : "border-[#e5e8ef] bg-[#f6f7fa] text-[#8a92a1]",
        )}
      >
        {granted ? "Granted" : "Not Granted"}
      </span>
    </div>
  );
}

const FALLBACK_PROFILE_USER: ComplianceProfileUser = {
  userId: null,
  profileId: null,
  name: "",
  role: "Compliance Officer",
  email: "",
  avatarSrc: null,
  phone: "",
  department: "",
  isVerified: false,
  twoFactorEnabled: false,
  joinedLabel: "",
};

export default function ComplianceProfileView({
  user = FALLBACK_PROFILE_USER,
}: {
  user?: ComplianceProfileUser;
}) {
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const securitySettings = buildComplianceSecuritySettings(user.twoFactorEnabled);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-bold tracking-[-0.03em] text-[#2a2f39]">My Profile</h1>
        <p className="mt-1 max-w-[560px] text-[14px] text-[#7a8291]">
          Personal account information, security settings, and activity history.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.86fr)_minmax(0,1.64fr)]">
        <section className="rounded-[16px] border border-[#e8ecf4] bg-white p-6 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)]">
          <div className="flex flex-col items-center text-center">
            <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-[#e8ecf4] shadow-sm">
              {user.avatarSrc ? (
                <Image src={user.avatarSrc} alt={user.name} fill className="object-cover" sizes="80px" />
              ) : (
                <span className="text-[26px] text-[#8a92a1]">{user.name ? user.name.charAt(0).toUpperCase() : "?"}</span>
              )}
            </div>
            <div className="mt-4 text-[20px] font-semibold tracking-[-0.02em] text-[#2a2f39]">{user.name || "—"}</div>
            <div className="mt-0.5 text-[13px] text-[#8a92a1]">{user.role}</div>
          </div>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <ProfileStatusBadge
              tone={user.isVerified ? "green" : "blue"}
              icon={<CheckCircleOutlined />}
              label={user.isVerified ? "Verified Institution" : "Verification Pending"}
            />
            <ProfileStatusBadge
              tone="blue"
              icon={<SafetyOutlined />}
              label={user.twoFactorEnabled ? "2FA Enabled" : "2FA Disabled"}
            />
          </div>

          <div className="mt-6 space-y-3 border-t border-[#f0f3f8] pt-5">
            <ProfileInfoRow icon={<MailOutlined />} value={user.email} />
            <ProfileInfoRow icon={<PhoneOutlined />} value={user.phone} />
            <ProfileInfoRow icon={<IdcardOutlined />} value={user.department} />
            <ProfileInfoRow icon={<CalendarOutlined />} value={user.joinedLabel} />
          </div>

          <div className="mt-6 space-y-2 border-t border-[#f0f3f8] pt-5">
            <button
              type="button"
              onClick={() => setShowEditProfile(true)}
              className="inline-flex h-11 w-full items-center justify-center rounded-[10px] bg-[#14244a] px-4 text-[13px] font-semibold !text-white transition-colors hover:bg-[#182c57]"
            >
              Edit profile
            </button>
            {/* <br /> */}
            <button
              type="button"
              onClick={() => setShowChangePassword(true)}
              className="inline-flex !mt-5 h-11 w-full items-center justify-center rounded-[10px] border border-[#e1e5ee] bg-white px-4 text-[13px] font-semibold text-[#2f3541] transition-colors hover:bg-[#f7f9fc]"
            >
              Change password
            </button>
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-[16px] border border-[#e8ecf4] bg-white p-6 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)]">
            <SectionHeader icon={<SafetyOutlined />} label="Security Settings" />

            <div className="mt-4 space-y-3">
              {securitySettings.map((item) => (
                <SecuritySettingRow
                  key={item.title}
                  title={item.title}
                  description={item.description}
                  icon={item.icon}
                  tone={item.tone}
                  statusLabel={item.statusLabel}
                  actionLabel={item.actionLabel}
                  onAction={item.actionLabel === "Change" ? () => setShowChangePassword(true) : undefined}
                />
              ))}
            </div>
          </section>

          <section className="rounded-[16px] border border-[#e8ecf4] bg-white p-6 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)]">
            <SectionHeader icon={<SolutionOutlined />} label="Permissions" />

            <div className="mt-4 space-y-3">
              {compliancePermissions.map((permission) => (
                <PermissionRow key={permission.label} label={permission.label} granted={permission.granted} />
              ))}
            </div>
          </section>
        </div>
      </div>

      {showEditProfile ? (
        <EditProfileModal
          userId={user.userId}
          profileId={user.profileId}
          initialName={user.name}
          initialPhone={user.phone}
          initialDepartment={user.department}
          onClose={() => setShowEditProfile(false)}
        />
      ) : null}

      {showChangePassword ? <ChangePasswordModal onClose={() => setShowChangePassword(false)} /> : null}
    </div>
  );
}
