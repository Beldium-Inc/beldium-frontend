"use client";

import { CloseOutlined, DownOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { showToast } from "@/src/store/toast.store";
import { getComplianceRoles, inviteTeamMember } from "@/src/features/compliance/dashboard/api";
import { getApiErrorMessage } from "@/src/features/compliance/dashboard/lib/documents";

export default function ComplianceInviteTeamMemberModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [roleId, setRoleId] = useState("");
  const [department, setDepartment] = useState("");
  const [accessNotes, setAccessNotes] = useState("");

  const rolesQ = useQuery({
    queryKey: ["complianceRoles"],
    queryFn: getComplianceRoles,
    retry: false,
  });
  const rawRoles = rolesQ.data?.data;
  const roles = Array.isArray(rawRoles) ? rawRoles : rawRoles?.results ?? [];

  const mutation = useMutation({
    mutationFn: () =>
      inviteTeamMember({
        full_name: fullName,
        email: workEmail,
        role: roleId,
        department: department || undefined,
        access_notes: accessNotes || undefined,
      }),
    onSuccess: () => {
      showToast(`Invite sent to ${workEmail}`, "success");
      queryClient.invalidateQueries({ queryKey: ["complianceTeamMembers"] });
      onClose();
    },
    onError: (error: unknown) => {
      showToast(getApiErrorMessage(error, "Unable to send this invite right now."), "error");
    },
  });

  const canSubmit = fullName.trim() && workEmail.trim() && roleId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(22,28,36,0.74)] px-4 py-8">
      <div className="relative max-h-[90vh] w-full max-w-[760px] overflow-y-auto rounded-[20px] bg-white shadow-[0_40px_120px_-56px_rgba(15,23,42,0.75)]">
        <div className="flex items-center justify-between border-b border-[#edf1f6] px-7 py-6">
          <h2 className="text-[18px] font-semibold text-[#252b37] sm:text-[20px]">
            Invite Team Member
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[20px] text-[#303744] transition-colors hover:bg-[#f7f9fc]"
            aria-label="Close invite team member modal"
          >
            <CloseOutlined />
          </button>
        </div>

        <div className="space-y-5 px-7 py-6">
          <div>
            <label className="text-[15px] font-medium text-[#303744]">
              Full Name <span className="text-[#ef4444]">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Enter full name"
              className="mt-3 h-14 w-full rounded-[18px] border border-[#d9e0ec] px-5 text-[16px] text-[#2a2f39] outline-none transition-shadow placeholder:text-[#9aa2b0] focus:shadow-[0_0_0_4px_rgba(16,30,61,0.06)]"
            />
          </div>

          <div>
            <label className="text-[15px] font-medium text-[#303744]">
              Work Email <span className="text-[#ef4444]">*</span>
            </label>
            <input
              type="email"
              value={workEmail}
              onChange={(event) => setWorkEmail(event.target.value)}
              placeholder="name@email.com"
              className="mt-3 h-14 w-full rounded-[18px] border border-[#d9e0ec] px-5 text-[16px] text-[#2a2f39] outline-none transition-shadow placeholder:text-[#9aa2b0] focus:shadow-[0_0_0_4px_rgba(16,30,61,0.06)]"
            />
          </div>

          <div>
            <label className="text-[15px] font-medium text-[#303744]">
              Role Assignment <span className="text-[#ef4444]">*</span>
            </label>
            {roles.length === 0 && !rolesQ.isLoading ? (
              <p className="mt-3 text-[14px] text-[#8a92a1]">
                No roles have been created for your organization yet. Create a role first before inviting team members.
              </p>
            ) : (
              <div className="relative mt-3">
                <select
                  value={roleId}
                  onChange={(event) => setRoleId(event.target.value)}
                  className="h-14 w-full appearance-none rounded-[18px] border border-[#d9e0ec] bg-white px-5 pr-14 text-[16px] text-[#2a2f39] outline-none transition-shadow focus:shadow-[0_0_0_4px_rgba(16,30,61,0.06)]"
                >
                  <option value="">{rolesQ.isLoading ? "Loading roles…" : "Select a role"}</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
                <DownOutlined className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-[18px] text-[#24324c]" />
              </div>
            )}
          </div>

          <div>
            <label className="text-[15px] font-medium text-[#303744]">
              Department <span className="text-[#8a92a1]">(optional)</span>
            </label>
            <input
              type="text"
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
              placeholder="e.g. Compliance, Legal, Operations"
              className="mt-3 h-14 w-full rounded-[18px] border border-[#d9e0ec] px-5 text-[16px] text-[#2a2f39] outline-none transition-shadow placeholder:text-[#9aa2b0] focus:shadow-[0_0_0_4px_rgba(16,30,61,0.06)]"
            />
          </div>

          <div>
            <label className="text-[15px] font-medium text-[#303744]">
              Access Notes <span className="text-[#8a92a1]">(optional)</span>
            </label>
            <textarea
              value={accessNotes}
              onChange={(event) => setAccessNotes(event.target.value)}
              rows={4}
              placeholder="Add any notes about this user’s access requirements"
              className="mt-3 w-full rounded-[18px] border border-[#d9e0ec] px-5 py-4 text-[16px] text-[#2a2f39] outline-none transition-shadow placeholder:text-[#9aa2b0] focus:shadow-[0_0_0_4px_rgba(16,30,61,0.06)]"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-[#edf1f6] px-7 py-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-16 items-center justify-center rounded-[18px] px-8 text-[16px] font-medium text-[#24324c] transition-colors hover:bg-[#f7f9fc]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => mutation.mutate()}
            disabled={!canSubmit || mutation.isPending}
            className="inline-flex h-11 items-center justify-center rounded-[10px] bg-[#13264e] px-4 text-[13px] font-semibold !text-white transition-colors hover:bg-[#182f5f] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {mutation.isPending ? "Sending..." : "Send Invitation"}
          </button>
        </div>
      </div>
    </div>
  );
}
