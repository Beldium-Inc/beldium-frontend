"use client";

import { CloseOutlined, DownOutlined } from "@ant-design/icons";
import { useState } from "react";
import { showToast } from "@/src/store/toast.store";

const ROLE_OPTIONS = [
  "Super Admin",
  "Compliance Officer",
  "Reviewer",
  "Auditor",
] as const;

export default function ComplianceInviteTeamMemberModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const [fullName, setFullName] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [role, setRole] = useState<(typeof ROLE_OPTIONS)[number]>(
    ROLE_OPTIONS[1],
  );
  const [department, setDepartment] = useState("");
  const [accessNotes, setAccessNotes] = useState("");

  const handleSubmit = () => {
    showToast(
      `Mock invite sent to ${workEmail || fullName || "team member"}. API wiring is pending.`,
      "success",
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(22,28,36,0.74)] px-4 py-8">
      <div className="relative max-h-[90vh] w-full max-w-[760px] overflow-y-auto rounded-[32px] bg-white shadow-[0_40px_120px_-56px_rgba(15,23,42,0.75)]">
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
            <div className="relative mt-3">
              <select
                value={role}
                onChange={(event) =>
                  setRole(event.target.value as (typeof ROLE_OPTIONS)[number])
                }
                className="h-14 w-full appearance-none rounded-[18px] border border-[#d9e0ec] bg-white px-5 pr-14 text-[16px] text-[#2a2f39] outline-none transition-shadow focus:shadow-[0_0_0_4px_rgba(16,30,61,0.06)]"
              >
                {ROLE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <DownOutlined className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-[18px] text-[#24324c]" />
            </div>
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
            onClick={handleSubmit}
            className="inline-flex h-16 items-center justify-center rounded-[18px] bg-[#13264e] px-10 text-[16px] font-semibold text-white shadow-[0_22px_44px_-28px_rgba(19,38,78,0.85)] transition-colors hover:bg-[#182f5f]"
            style={{ color: "#ffffff" }}
          >
            Send Invitation
          </button>
        </div>
      </div>
    </div>
  );
}
