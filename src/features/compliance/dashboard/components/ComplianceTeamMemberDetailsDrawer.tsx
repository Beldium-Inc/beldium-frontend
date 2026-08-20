"use client";

import { useState } from "react";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  DownOutlined,
  IdcardOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { showToast } from "@/src/store/toast.store";
import {
  getComplianceRoles,
  updateTeamMember,
  type ComplianceTeamMember,
} from "@/src/features/compliance/dashboard/api";
import { getApiErrorMessage } from "@/src/features/compliance/dashboard/lib/documents";

function formatDateTime(value: string | null | undefined) {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
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

function MemberStatusPill({ status }: { status: string }) {
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

function DetailCard({
  icon,
  title,
  children,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-[16px] border border-[#e8ecf4] bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#eef4ff] text-[16px] text-[#2661d8]">
            {icon}
          </span>
          <h3 className="text-[15px] font-semibold text-[#2a2f39]">{title}</h3>
        </div>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function ComplianceTeamMemberDetailsDrawer({
  member,
  onClose,
}: {
  member: ComplianceTeamMember;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [isChangingRole, setIsChangingRole] = useState(false);
  const [roleId, setRoleId] = useState(member.role_detail?.id ?? "");

  const rolesQ = useQuery({
    queryKey: ["complianceRoles"],
    queryFn: getComplianceRoles,
    enabled: isChangingRole,
    retry: false,
  });
  const rawRoles = rolesQ.data?.data;
  const roles = Array.isArray(rawRoles) ? rawRoles : rawRoles?.results ?? [];

  const roleMutation = useMutation({
    mutationFn: () => updateTeamMember(member.id, { role: roleId }),
    onSuccess: () => {
      showToast("Role updated successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["complianceTeamMembers"] });
      setIsChangingRole(false);
    },
    onError: (error: unknown) => {
      showToast(getApiErrorMessage(error, "Unable to update this role right now."), "error");
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[rgba(22,28,36,0.54)] backdrop-blur-[2px]">
      <button
        type="button"
        onClick={onClose}
        className="h-full flex-1 cursor-default"
        aria-label="Close user details drawer"
      />

      <aside className="relative flex h-full w-full max-w-[440px] flex-col overflow-y-auto bg-white shadow-[-24px_0_80px_-42px_rgba(15,23,42,0.55)]">
        <div className="flex items-start justify-between border-b border-[#edf1f6] px-6 py-5">
          <div>
            <h2 className="text-[18px] font-semibold text-[#2a2f39]">User Details</h2>
            <p className="mt-1 text-[13px] text-[#7a8291]">Manage user account and permissions</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[16px] text-[#596274] transition-colors hover:bg-[#f7f9fc]"
            aria-label="Close user details"
          >
            <CloseOutlined />
          </button>
        </div>

        <div className="space-y-5 px-6 py-6">
          <section className="rounded-[16px] border border-[#e8ecf4] bg-white p-5">
            <div className="flex items-start gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#eef4ff] text-[16px] font-semibold text-[#2661d8]">
                {initialsFor(member.full_name)}
              </span>

              <div className="min-w-0 flex-1">
                <div className="text-[16px] font-semibold text-[#2a2f39]">{member.full_name}</div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <MemberStatusPill status={member.status} />
                </div>
                <div className="mt-3 space-y-2 text-[13px] text-[#7a8291]">
                  <div className="flex items-center gap-2">
                    <MailOutlined className="text-[#7f8796]" />
                    <span>{member.email}</span>
                  </div>
                  {member.department ? (
                    <div className="flex items-center gap-2">
                      <IdcardOutlined className="text-[#7f8796]" />
                      <span>{member.department}</span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </section>

          <DetailCard
            icon={<IdcardOutlined />}
            title="Role"
            action={
              !isChangingRole ? (
                <button
                  type="button"
                  onClick={() => setIsChangingRole(true)}
                  className="text-[13px] font-semibold text-[#2661d8] transition-opacity hover:opacity-80"
                >
                  Change role
                </button>
              ) : null
            }
          >
            {isChangingRole ? (
              <div className="space-y-3">
                <div className="relative">
                  <select
                    value={roleId}
                    onChange={(e) => setRoleId(e.target.value)}
                    className="h-11 w-full appearance-none rounded-[10px] border border-[#dfe4ec] bg-white px-3 pr-9 text-[13px] text-[#2d3441] outline-none focus:border-[#101e3d]"
                  >
                    <option value="">{rolesQ.isLoading ? "Loading roles…" : "Select a role"}</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                  <DownOutlined className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[#4b5260]" />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsChangingRole(false)}
                    className="inline-flex h-9 items-center rounded-[8px] border border-[#e1e5ee] bg-white px-3 text-[12px] font-medium text-[#2f3541] hover:bg-[#f7f9fc]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!roleId || roleMutation.isPending}
                    onClick={() => roleMutation.mutate()}
                    className="inline-flex h-9 items-center rounded-[8px] bg-[#14244a] px-3 text-[12px] font-semibold !text-white hover:bg-[#182c57] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {roleMutation.isPending ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-6 text-[13px]">
                <span className="text-[#8a92a1]">Current role</span>
                <span className="font-medium text-[#2a2f39]">{member.role_detail?.name || "Unassigned"}</span>
              </div>
            )}
          </DetailCard>

          <DetailCard icon={<CalendarOutlined />} title="Account Activity">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CalendarOutlined className="mt-0.5 text-[14px] text-[#8a92a1]" />
                <div>
                  <div className="text-[12px] text-[#8a92a1]">Invited</div>
                  <div className="mt-0.5 text-[13px] font-medium text-[#2a2f39]">{formatDateTime(member.invited_at)}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ClockCircleOutlined className="mt-0.5 text-[14px] text-[#8a92a1]" />
                <div>
                  <div className="text-[12px] text-[#8a92a1]">Last login</div>
                  <div className="mt-0.5 text-[13px] font-medium text-[#2a2f39]">{formatDateTime(member.last_login)}</div>
                </div>
              </div>
            </div>
          </DetailCard>

          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={() => showToast("Password reset for team members isn't available yet.", "info")}
              className="inline-flex h-11 w-full items-center justify-center rounded-[10px] border border-[#dfe5ef] bg-[#f9fbfd] px-4 text-[13px] font-medium text-[#24324c] transition-colors hover:bg-[#f2f6fb]"
            >
              Force Password Reset
            </button>

            <button
              type="button"
              onClick={() => showToast("Suspending accounts isn't available yet.", "info")}
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
