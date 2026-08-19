"use client";

import {
  ArrowRightOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  LockOutlined,
  SaveOutlined,
  SafetyCertificateOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { showToast } from "@/src/store/toast.store";
import { getUser } from "@/src/features/onboarding/api";
import { updateComplianceProfile } from "@/src/features/compliance/dashboard/api";
import { getApiErrorMessage } from "@/src/features/compliance/dashboard/lib/documents";

const SESSION_TIMEOUT_MINUTES: Record<string, number> = {
  "15 minutes": 15,
  "30 minutes": 30,
  "45 minutes": 45,
  "1 hour": 60,
};

function minutesToLabel(minutes: number | undefined) {
  if (!minutes) return "30 minutes";
  const match = Object.entries(SESSION_TIMEOUT_MINUTES).find(([, v]) => v === minutes);
  return match ? match[0] : `${minutes} minutes`;
}

type ActiveSessionRow = {
  user: string;
  initials: string;
  avatarTone: string;
  location: string;
  lastLogin: string;
};

type LoginHistoryRow = {
  dateTime: string;
  user: string;
  initials: string;
  avatarTone: string;
  location: string;
  status: "successful" | "failed" | "suspicious";
};

const appliesToRoles = [
  "Compliance Admin",
  "Compliance Officer",
  "Reviewer",
  "Auditor",
];

const timeoutOptions = ["15 minutes", "30 minutes", "45 minutes", "1 hour"];

const activeSessions: ActiveSessionRow[] = [
  {
    user: "Floyd Miles",
    initials: "FM",
    avatarTone: "bg-[#f1e2d3]",
    location: "Lagos, Nigeria",
    lastLogin: "4 hours ago",
  },
  {
    user: "Cody Fisher",
    initials: "CF",
    avatarTone: "bg-[#edf1f6]",
    location: "Kwara, Nigeria",
    lastLogin: "3 mins ago",
  },
  {
    user: "Courtney Henry",
    initials: "CH",
    avatarTone: "bg-[#f0d9ed]",
    location: "Abuja, Nigeria",
    lastLogin: "-",
  },
  {
    user: "Brooklyn Simmons",
    initials: "BS",
    avatarTone: "bg-[#ffe2b8]",
    location: "Kwara, Nigeria",
    lastLogin: "1 day ago",
  },
];

const loginHistoryRows: LoginHistoryRow[] = [
  {
    dateTime: "2026-04-21  14:32",
    user: "Floyd Miles",
    initials: "FM",
    avatarTone: "bg-[#f1e2d3]",
    location: "Kwara, Nigeria",
    status: "successful",
  },
  {
    dateTime: "2026-04-21  14:32",
    user: "Cody Fisher",
    initials: "CF",
    avatarTone: "bg-[#edf1f6]",
    location: "Lagos, Nigeria",
    status: "failed",
  },
  {
    dateTime: "2026-04-21  14:32",
    user: "Courtney Henry",
    initials: "CH",
    avatarTone: "bg-[#f0d9ed]",
    location: "Abuja, Nigeria",
    status: "suspicious",
  },
  {
    dateTime: "2026-04-21  14:32",
    user: "Brooklyn Simmons",
    initials: "BS",
    avatarTone: "bg-[#ffe2b8]",
    location: "Kwara, Nigeria",
    status: "successful",
  },
];

const automaticSecurityActions = [
  {
    trigger: "5 failed login attempts",
    action: "Lock account",
  },
  {
    trigger: "Multiple concurrent sessions",
    action: "Alert Super Admin",
  },
  {
    trigger: "Suspicious behavior pattern",
    action: "Force password reset",
  },
];

function ToggleSwitch({
  enabled,
  onToggle,
  ariaLabel,
}: {
  enabled: boolean;
  onToggle: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={ariaLabel}
      onClick={onToggle}
      className={`relative inline-flex h-9 w-[66px] items-center rounded-full border transition-colors ${
        enabled
          ? "border-[#0e214d] bg-[#10285f]"
          : "border-[#d8deea] bg-[#eef2f8]"
      }`}
    >
      <span
        className={`inline-flex h-7 w-7 rounded-full bg-white shadow-sm transition-all ${
          enabled ? "translate-x-[35px]" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function InitialAvatar({
  initials,
  toneClassName,
}: {
  initials: string;
  toneClassName: string;
}) {
  return (
    <span
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-[13px] font-semibold text-[#5f6675] ${toneClassName}`}
    >
      {initials}
    </span>
  );
}

function LoginStatusPill({ status }: { status: LoginHistoryRow["status"] }) {
  if (status === "successful") {
    return (
      <span className="inline-flex rounded-full border border-[#bdeec9] bg-[#e9faef] px-4 py-1 text-[13px] font-medium text-[#1ea43b]">
        Successful
      </span>
    );
  }

  if (status === "failed") {
    return (
      <span className="inline-flex rounded-full border border-[#f7cfd2] bg-[#fff1f2] px-4 py-1 text-[13px] font-medium text-[#ef4444]">
        Failed
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full border border-[#f4dfb6] bg-[#fff5de] px-4 py-1 text-[13px] font-medium text-[#df9b20]">
      Suspicious
    </span>
  );
}

export default function ComplianceSecurityAccessControlsView() {
  const queryClient = useQueryClient();
  const [requires2FAOverride, setRequires2FAOverride] = useState<boolean | null>(null);
  const [maxFailedAttempts, setMaxFailedAttempts] = useState("5");
  const [sessionTimeoutOverride, setSessionTimeoutOverride] = useState<string | null>(null);
  const [suspiciousLoginDetectionEnabled, setSuspiciousLoginDetectionEnabled] =
    useState(true);

  const currentUserQ = useQuery({
    queryKey: ["currentUser"],
    queryFn: getUser,
    retry: false,
  });
  const profile = (currentUserQ.data?.data as { profile?: {
    id?: string;
    require_two_factor_authentication?: boolean;
    session_timeout_minutes?: number;
  } | null } | undefined)?.profile;

  const requires2FA = requires2FAOverride ?? Boolean(profile?.require_two_factor_authentication);
  const sessionTimeout = sessionTimeoutOverride ?? minutesToLabel(profile?.session_timeout_minutes);

  const setRequires2FA = (value: boolean) => setRequires2FAOverride(value);
  const setSessionTimeout = (value: string) => setSessionTimeoutOverride(value);

  const saveMutation = useMutation({
    mutationFn: () => {
      if (!profile?.id) throw new Error("Your compliance profile isn't loaded yet.");
      return updateComplianceProfile(profile.id, {
        require_two_factor_authentication: requires2FA,
        session_timeout_minutes: SESSION_TIMEOUT_MINUTES[sessionTimeout] ?? 30,
      });
    },
    onSuccess: () => {
      showToast("Security settings saved", "success");
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
    onError: (error: unknown) => {
      showToast(getApiErrorMessage(error, "Unable to save security settings right now."), "error");
    },
  });

  return (
    <div className="space-y-8">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2 text-[15px] text-[#8a92a1]">
          <span>Settings</span>
          <ArrowRightOutlined className="text-[12px]" />
          <span className="font-medium text-[#5d6675]">
            Security &amp; Access Controls
          </span>
        </div>

        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h1 className="text-[28px] font-bold tracking-[-0.03em] text-[#2a2f39]">
              Security &amp; Access Controls
            </h1>
            <p className="mt-2 max-w-[760px] text-[15px] text-[#7a8291]">
              Manage authentication, access policies, and account security for your
              institution.
            </p>
          </div>

          <button
            type="button"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || !profile?.id}
            className="inline-flex h-11 items-center gap-3 rounded-[10px] bg-[#13264e] px-4 text-[13px] font-semibold !text-white transition-colors hover:bg-[#182f5f] disabled:cursor-not-allowed disabled:opacity-60"
            style={{ color: "#ffffff" }}
          >
            <SaveOutlined />
            Save Changes
          </button>
        </div>
      </div>

      <section className="rounded-[16px] border border-[#dfe5ef] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)] sm:p-6">
        <div className="flex items-center gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef4ff] text-[18px] text-[#2661d8]">
            <SafetyCertificateOutlined />
          </span>
          <h2 className="text-[24px] font-semibold tracking-[-0.03em] text-[#2a2f39]">
            Authentication &amp; Identity Verification
          </h2>
        </div>

        <div className="mt-7 flex flex-col gap-5 border-b border-[#edf1f6] pb-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h3 className="text-[24px] font-semibold tracking-[-0.03em] text-[#2a2f39]">
              Require Two-Factor Authentication
            </h3>
            <p className="mt-2 text-[15px] text-[#8a92a1]">
              Enforce 2FA for admin roles to prevent unauthorized access
            </p>
          </div>
          <ToggleSwitch
            enabled={requires2FA}
            onToggle={() => setRequires2FA(!requires2FA)}
            ariaLabel="Toggle two-factor authentication requirement"
          />
        </div>

        <div className="mt-6 rounded-[20px] border border-[#e2e7ef] bg-[#fbfcfe] px-5 py-5">
          <div className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#a0a7b5]">
            Applies to:
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {appliesToRoles.map((role) => (
              <div
                key={role}
                className="flex items-center gap-3 text-[16px] font-medium text-[#4d5565]"
              >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#bdeec9] bg-[#e9faef] text-[11px] text-[#1ea43b]">
                  ✓
                </span>
                <span>{role}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[16px] border border-[#dfe5ef] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)] sm:p-6">
        <h2 className="text-[16px] font-semibold text-[#2a2f39]">
          Access &amp; Login Restrictions
        </h2>

        <div className="mt-7 grid gap-6 border-b border-[#edf1f6] pb-7 xl:grid-cols-[420px_1fr] xl:items-center">
          <div>
            <h3 className="text-[15px] font-medium text-[#4d5565]">
              Maximum Failed Login Attempts
            </h3>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <input
                type="number"
                min={1}
                value={maxFailedAttempts}
                onChange={(event) => setMaxFailedAttempts(event.target.value)}
                className="h-14 w-[96px] rounded-[14px] border border-[#d8dfe9] bg-white px-4 text-[20px] font-medium text-[#2a2f39] outline-none transition-colors focus:border-[#9cb2dc]"
              />
              <span className="text-[16px] text-[#7a8291]">
                attempts before account lockout
              </span>
            </div>
            <p className="mt-3 text-[14px] text-[#a0a7b5]">
              After this threshold, the account will be locked and require admin
              intervention.
            </p>
          </div>
        </div>

        <div className="mt-6 max-w-[460px]">
          <h3 className="text-[15px] font-medium text-[#4d5565]">
            Automatic Session Timeout
          </h3>

          <div className="mt-3 relative">
            <select
              value={sessionTimeout}
              onChange={(event) => setSessionTimeout(event.target.value)}
              className="h-14 w-full appearance-none rounded-[14px] border border-[#d8dfe9] bg-white px-4 pr-12 text-[18px] font-medium text-[#2a2f39] outline-none transition-colors focus:border-[#9cb2dc]"
            >
              {timeoutOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#7a8291]">
              <ArrowRightOutlined rotate={90} />
            </span>
          </div>

          <p className="mt-3 text-[14px] text-[#a0a7b5]">
            Users will be automatically logged out after this period of
            inactivity.
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-[16px] border border-[#dfe5ef] bg-white shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)]">
        <div className="flex flex-col gap-4 border-b border-[#edf1f6] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef4ff] text-[18px] text-[#2661d8]">
              <LockOutlined />
            </span>
            <h2 className="text-[24px] font-semibold tracking-[-0.03em] text-[#2a2f39]">
              Active Sessions &amp; Device Control
            </h2>
          </div>

          <button
            type="button"
            onClick={() =>
              showToast("Mock sign out for other sessions. API wiring is pending.", "info")
            }
            className="inline-flex h-12 items-center justify-center rounded-[10px] border border-[#f3d6d7] bg-[#fff3f3] px-4 text-[13px] font-medium text-[#ef4444] transition-colors hover:bg-[#fff8f8]"
          >
            Log out all other sessions
          </button>
        </div>

        <div className="p-5 sm:p-6">
          <div className="overflow-hidden rounded-[22px] border border-[#dfe5ef]">
            <div className="overflow-x-auto">
              <table className="min-w-[960px] w-full border-separate border-spacing-0 text-left">
                <thead>
                  <tr className="bg-[#f7f9fc] text-[15px] font-medium text-[#2f3541]">
                    <th className="border-b border-[#edf1f6] px-5 py-4">User</th>
                    <th className="border-b border-[#edf1f6] px-5 py-4">Location</th>
                    <th className="border-b border-[#edf1f6] px-5 py-4">Last Login</th>
                    <th className="border-b border-[#edf1f6] px-5 py-4 text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {activeSessions.map((row, index) => (
                    <tr
                      key={row.user}
                      className={index % 2 === 0 ? "bg-white" : "bg-[#fcfdff]"}
                    >
                      <td className="border-b border-[#edf1f6] px-5 py-5">
                        <div className="flex items-center gap-3">
                          <InitialAvatar
                            initials={row.initials}
                            toneClassName={row.avatarTone}
                          />
                          <span className="text-[16px] font-medium text-[#2a2f39]">
                            {row.user}
                          </span>
                        </div>
                      </td>
                      <td className="border-b border-[#edf1f6] px-5 py-5 text-[16px] text-[#4d5565]">
                        <span className="inline-flex items-center gap-2">
                          <EnvironmentOutlined className="text-[#a0a7b5]" />
                          {row.location}
                        </span>
                      </td>
                      <td className="border-b border-[#edf1f6] px-5 py-5 text-[16px] text-[#4d5565]">
                        {row.lastLogin}
                      </td>
                      <td className="border-b border-[#edf1f6] px-5 py-5 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            showToast(
                              `Mock terminate action for ${row.user}. API wiring is pending.`,
                              "info",
                            )
                          }
                          className="inline-flex h-10 items-center justify-center rounded-[10px] border border-[#f3d6d7] bg-[#fff3f3] px-4 text-[13px] font-medium text-[#ef4444] transition-colors hover:bg-[#fff8f8]"
                        >
                          Terminate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[16px] border border-[#dfe5ef] bg-white shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)]">
        <div className="flex items-center gap-4 border-b border-[#edf1f6] px-5 py-5 sm:px-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef4ff] text-[18px] text-[#2661d8]">
            <ClockCircleOutlined />
          </span>
          <h2 className="text-[24px] font-semibold tracking-[-0.03em] text-[#2a2f39]">
            Login History
          </h2>
        </div>

        <div className="p-5 sm:p-6">
          <div className="overflow-hidden rounded-[22px] border border-[#dfe5ef]">
            <div className="overflow-x-auto">
              <table className="min-w-[980px] w-full border-separate border-spacing-0 text-left">
                <thead>
                  <tr className="bg-[#f7f9fc] text-[15px] font-medium text-[#2f3541]">
                    <th className="border-b border-[#edf1f6] px-5 py-4">Date &amp; Time</th>
                    <th className="border-b border-[#edf1f6] px-5 py-4">User</th>
                    <th className="border-b border-[#edf1f6] px-5 py-4">Location</th>
                    <th className="border-b border-[#edf1f6] px-5 py-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loginHistoryRows.map((row, index) => (
                    <tr
                      key={`${row.user}-${row.dateTime}-${row.status}`}
                      className={index % 2 === 0 ? "bg-white" : "bg-[#fcfdff]"}
                    >
                      <td className="border-b border-[#edf1f6] px-5 py-5 text-[16px] text-[#4d5565]">
                        {row.dateTime}
                      </td>
                      <td className="border-b border-[#edf1f6] px-5 py-5">
                        <div className="flex items-center gap-3">
                          <InitialAvatar
                            initials={row.initials}
                            toneClassName={row.avatarTone}
                          />
                          <span className="text-[16px] font-medium text-[#2a2f39]">
                            {row.user}
                          </span>
                        </div>
                      </td>
                      <td className="border-b border-[#edf1f6] px-5 py-5 text-[16px] text-[#4d5565]">
                        {row.location}
                      </td>
                      <td className="border-b border-[#edf1f6] px-5 py-5">
                        <LoginStatusPill status={row.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[16px] border border-[#dfe5ef] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)] sm:p-6">
        <div className="flex flex-col gap-5 border-b border-[#edf1f6] pb-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex items-start gap-4">
            <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-[#eef4ff] text-[18px] text-[#2661d8]">
              <WarningOutlined />
            </span>
            <div>
              <h2 className="text-[24px] font-semibold tracking-[-0.03em] text-[#2a2f39]">
                Security Alerts &amp; Risk Detection
              </h2>
              <h3 className="mt-5 text-[26px] font-semibold tracking-[-0.04em] text-[#2a2f39]">
                Suspicious Login Detection
              </h3>
              <p className="mt-2 text-[15px] text-[#8a92a1]">
                Monitor and alert on unusual login patterns
              </p>
            </div>
          </div>

          <ToggleSwitch
            enabled={suspiciousLoginDetectionEnabled}
            onToggle={() =>
              setSuspiciousLoginDetectionEnabled((current) => !current)
            }
            ariaLabel="Toggle suspicious login detection"
          />
        </div>

        <div className="mt-6 rounded-[20px] border border-[#e2e7ef] bg-[#fbfcfe] px-5 py-5">
          <div className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#a0a7b5]">
            Detection triggers:
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3 text-[16px] font-medium text-[#4d5565]">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#bdeec9] bg-[#e9faef] text-[11px] text-[#1ea43b]">
                ✓
              </span>
              <span>Login from unknown device</span>
            </div>
            <div className="flex items-center gap-3 text-[16px] font-medium text-[#4d5565]">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#bdeec9] bg-[#e9faef] text-[11px] text-[#1ea43b]">
                ✓
              </span>
              <span>Multiple failed login attempts</span>
            </div>
          </div>
        </div>

        <div className="mt-7 border-t border-[#edf1f6] pt-7">
          <h3 className="text-[24px] font-semibold tracking-[-0.03em] text-[#2a2f39]">
            Automatic Security Actions
          </h3>

          <div className="mt-5 overflow-hidden rounded-[22px] border border-[#dfe5ef]">
            <div className="overflow-x-auto">
              <table className="min-w-[760px] w-full border-separate border-spacing-0 text-left">
                <thead>
                  <tr className="bg-[#f7f9fc] text-[15px] font-medium text-[#2f3541]">
                    <th className="border-b border-[#edf1f6] px-5 py-4">Trigger</th>
                    <th className="border-b border-[#edf1f6] px-5 py-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {automaticSecurityActions.map((row, index) => (
                    <tr
                      key={row.trigger}
                      className={index % 2 === 0 ? "bg-white" : "bg-[#fcfdff]"}
                    >
                      <td className="border-b border-[#edf1f6] px-5 py-6 text-[16px] text-[#2a2f39]">
                        {row.trigger}
                      </td>
                      <td className="border-b border-[#edf1f6] px-5 py-6 text-[16px] text-[#4d5565]">
                        {row.action}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
