"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CloseOutlined } from "@ant-design/icons";
import { showToast } from "@/src/store/toast.store";
import { updateComplianceProfile, updateUser } from "@/src/features/compliance/dashboard/api";
import { getApiErrorMessage } from "@/src/features/compliance/dashboard/lib/documents";

export default function EditProfileModal({
  userId,
  profileId,
  initialName,
  initialPhone,
  initialDepartment,
  onClose,
}: {
  userId: string | null;
  profileId: string | null;
  initialName: string;
  initialPhone: string;
  initialDepartment: string;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [department, setDepartment] = useState(initialDepartment);

  const mutation = useMutation({
    mutationFn: async () => {
      const tasks: Promise<unknown>[] = [];
      if (profileId) {
        tasks.push(
          updateComplianceProfile(profileId, {
            full_name: fullName,
            organization_name: department,
          }),
        );
      }
      if (userId) {
        tasks.push(updateUser(userId, { phone_number: phone }));
      }
      await Promise.all(tasks);
    },
    onSuccess: () => {
      showToast("Profile updated successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      onClose();
    },
    onError: (error: unknown) => {
      showToast(getApiErrorMessage(error, "Unable to update your profile right now."), "error");
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(22,28,36,0.6)] px-4 py-8">
      <div className="relative w-full max-w-[480px] rounded-[20px] bg-white shadow-[0_40px_120px_-56px_rgba(15,23,42,0.75)]">
        <div className="flex items-center justify-between border-b border-[#edf1f6] px-6 py-5">
          <h2 className="text-[17px] font-semibold text-[#252b37]">Edit profile</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[16px] text-[#303744] hover:bg-[#f7f9fc]"
            aria-label="Close edit profile modal"
          >
            <CloseOutlined />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div>
            <label className="text-[13px] font-medium text-[#2f3541]">Full name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1.5 h-11 w-full rounded-[10px] border border-[#dfe4ec] bg-white px-3 text-[13px] text-[#2d3441] outline-none focus:border-[#101e3d]"
            />
          </div>
          <div>
            <label className="text-[13px] font-medium text-[#2f3541]">Phone number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1.5 h-11 w-full rounded-[10px] border border-[#dfe4ec] bg-white px-3 text-[13px] text-[#2d3441] outline-none focus:border-[#101e3d]"
            />
          </div>
          <div>
            <label className="text-[13px] font-medium text-[#2f3541]">Organization</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="mt-1.5 h-11 w-full rounded-[10px] border border-[#dfe4ec] bg-white px-3 text-[13px] text-[#2d3441] outline-none focus:border-[#101e3d]"
            />
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
            disabled={mutation.isPending || !fullName.trim()}
            className="inline-flex h-10 items-center rounded-[10px] bg-[#14244a] px-4 text-[13px] font-semibold !text-white hover:bg-[#182c57] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {mutation.isPending ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
