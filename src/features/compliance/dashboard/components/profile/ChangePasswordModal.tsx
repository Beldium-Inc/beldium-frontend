"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { CloseOutlined } from "@ant-design/icons";
import { showToast } from "@/src/store/toast.store";
import { changePassword } from "@/src/features/compliance/dashboard/api";
import { getApiErrorMessage } from "@/src/features/compliance/dashboard/lib/documents";

export default function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const canSubmit = oldPassword.length > 0 && newPassword.length >= 8 && passwordsMatch;

  const mutation = useMutation({
    mutationFn: () => changePassword({ old_password: oldPassword, new_password: newPassword }),
    onSuccess: () => {
      showToast("Password changed successfully", "success");
      onClose();
    },
    onError: (error: unknown) => {
      showToast(getApiErrorMessage(error, "Unable to change your password right now."), "error");
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(22,28,36,0.6)] px-4 py-8">
      <div className="relative w-full max-w-[440px] rounded-[20px] bg-white shadow-[0_40px_120px_-56px_rgba(15,23,42,0.75)]">
        <div className="flex items-center justify-between border-b border-[#edf1f6] px-6 py-5">
          <h2 className="text-[17px] font-semibold text-[#252b37]">Change password</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[16px] text-[#303744] hover:bg-[#f7f9fc]"
            aria-label="Close change password modal"
          >
            <CloseOutlined />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div>
            <label className="text-[13px] font-medium text-[#2f3541]">Current password</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="mt-1.5 h-11 w-full rounded-[10px] border border-[#dfe4ec] bg-white px-3 text-[13px] text-[#2d3441] outline-none focus:border-[#101e3d]"
            />
          </div>
          <div>
            <label className="text-[13px] font-medium text-[#2f3541]">New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1.5 h-11 w-full rounded-[10px] border border-[#dfe4ec] bg-white px-3 text-[13px] text-[#2d3441] outline-none focus:border-[#101e3d]"
            />
            <p className="mt-1 text-[12px] text-[#8a92a1]">At least 8 characters.</p>
          </div>
          <div>
            <label className="text-[13px] font-medium text-[#2f3541]">Confirm new password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1.5 h-11 w-full rounded-[10px] border border-[#dfe4ec] bg-white px-3 text-[13px] text-[#2d3441] outline-none focus:border-[#101e3d]"
            />
            {confirmPassword.length > 0 && !passwordsMatch ? (
              <p className="mt-1 text-[12px] text-[#ef2f32]">Passwords do not match.</p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-[#edf1f6] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 items-center rounded-[10px] border border-[#e1e5ee] bg-white px-4 text-[13px] font-semibold text-[#2f3541] hover:bg-[#f7f9fc]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => mutation.mutate()}
            disabled={!canSubmit || mutation.isPending}
            className="inline-flex h-10 items-center rounded-[10px] bg-[#14244a] px-4 text-[13px] font-semibold !text-white hover:bg-[#182c57] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {mutation.isPending ? "Updating..." : "Update password"}
          </button>
        </div>
      </div>
    </div>
  );
}
