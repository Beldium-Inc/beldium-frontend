"use client";

import {
  CloseOutlined,
  InfoCircleOutlined,
  InboxOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useRef, useState, type DragEvent } from "react";
import { showToast } from "@/src/store/toast.store";

export type OrganizationIdentityField = {
  label: string;
  value: string;
};

type ChangeRequestContent = {
  title: string;
  newValueLabel: string;
  newValuePlaceholder: string;
  reasonPlaceholder: string;
};

function getChangeRequestContent(label: string): ChangeRequestContent {
  switch (label) {
    case "Company Name":
      return {
        title: "Request Legal Name Change",
        newValueLabel: "New Institutional Name",
        newValuePlaceholder: "Enter new legal institutional name",
        reasonPlaceholder:
          "Provide detailed justification for the name change (e.g. legal restructuring, rebranding)",
      };
    case "Registration Number":
      return {
        title: "Request Registration Number Change",
        newValueLabel: "Updated Registration Number",
        newValuePlaceholder: "Enter corrected registration number",
        reasonPlaceholder:
          "Explain why the registration number should be updated and attach supporting evidence.",
      };
    case "License Type":
      return {
        title: "Request License Type Change",
        newValueLabel: "Updated License Type",
        newValuePlaceholder: "Enter new institutional license type",
        reasonPlaceholder:
          "Explain the change in licensing status or classification and include supporting documents.",
      };
    case "Jurisdiction":
      return {
        title: "Request Jurisdiction Change",
        newValueLabel: "Updated Jurisdiction",
        newValuePlaceholder: "Enter updated jurisdiction",
        reasonPlaceholder:
          "Explain why the operating jurisdiction should change and include regulatory proof.",
      };
    default:
      return {
        title: `Request ${label} Change`,
        newValueLabel: `Updated ${label}`,
        newValuePlaceholder: `Enter updated ${label.toLowerCase()}`,
        reasonPlaceholder:
          "Provide detailed justification for this change request and attach supporting documentation.",
      };
  }
}

export default function ComplianceOrganizationChangeRequestModal({
  field,
  onClose,
}: {
  field: OrganizationIdentityField;
  onClose: () => void;
}) {
  const [newValue, setNewValue] = useState("");
  const [reason, setReason] = useState("");
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const copy = getChangeRequestContent(field.label);

  const handleFileSelect = (file?: File | null) => {
    if (!file) {
      return;
    }

    setSelectedFileName(file.name);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    handleFileSelect(event.dataTransfer.files?.[0] ?? null);
  };

  const handleSubmit = () => {
    showToast(
      `Mock change request for ${field.label.toLowerCase()} submitted. API wiring is pending.`,
      "success",
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(22,28,36,0.74)] px-4 py-8">
      <div className="relative max-h-[90vh] w-full max-w-[760px] overflow-y-auto rounded-[32px] bg-white shadow-[0_40px_120px_-56px_rgba(15,23,42,0.75)]">
        <div className="flex items-center justify-between border-b border-[#edf1f6] px-7 py-6">
          <h2 className="text-[18px] font-semibold text-[#252b37] sm:text-[20px]">
            {copy.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[20px] text-[#303744] transition-colors hover:bg-[#f7f9fc]"
            aria-label="Close change request modal"
          >
            <CloseOutlined />
          </button>
        </div>

        <div className="space-y-5 px-7 py-6">
          <div className="flex items-start gap-3 rounded-[18px] bg-[#f7f9fc] px-5 py-4 text-[#6f7786]">
            <InfoCircleOutlined className="mt-0.5 text-[18px] text-[#7b8392]" />
            <p className="text-[14px] leading-6">
              Changes to institutional data require administrative review and may
              trigger re-verification.
            </p>
          </div>

          <div className="rounded-[20px] bg-[#f7f9fc] px-5 py-4">
            <div className="text-[13px] font-medium uppercase tracking-[0.04em] text-[#b0b7c3]">
              Current {field.label}
            </div>
            <div className="mt-3 text-[18px] font-medium text-[#2a2f39]">
              {field.value}
            </div>
          </div>

          <div>
            <label className="text-[15px] font-medium text-[#303744]">
              {copy.newValueLabel}
            </label>
            <input
              type="text"
              value={newValue}
              onChange={(event) => setNewValue(event.target.value)}
              placeholder={copy.newValuePlaceholder}
              className="mt-3 h-14 w-full rounded-[18px] border border-[#d9e0ec] px-5 text-[16px] text-[#2a2f39] outline-none transition-shadow placeholder:text-[#9aa2b0] focus:shadow-[0_0_0_4px_rgba(16,30,61,0.06)]"
            />
          </div>

          <div>
            <label className="text-[15px] font-medium text-[#303744]">
              Reason for Change
            </label>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder={copy.reasonPlaceholder}
              rows={4}
              className="mt-3 w-full rounded-[18px] border border-[#d9e0ec] px-5 py-4 text-[16px] text-[#2a2f39] outline-none transition-shadow placeholder:text-[#9aa2b0] focus:shadow-[0_0_0_4px_rgba(16,30,61,0.06)]"
            />
          </div>

          <div>
            <div className="text-[15px] font-medium text-[#303744]">
              Supporting Documentation
            </div>
            <div
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
              className="mt-3 rounded-[22px] border border-dashed border-[#d8dee9] bg-[#fbfcfe] px-6 py-10 text-center"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={(event) =>
                  handleFileSelect(event.target.files?.[0] ?? null)
                }
                className="hidden"
              />

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eef3fb] text-[22px] text-[#7f8796]">
                <InboxOutlined />
              </div>
              <div className="mt-5 text-[16px] font-medium text-[#303744]">
                Choose file or drag and drop it here
              </div>
              <div className="mt-2 text-[14px] text-[#9aa2b0]">
                JPEG, PNG, and PDF formats, up to 20 MB.
              </div>

              {selectedFileName ? (
                <div className="mt-4 text-[14px] font-medium text-[#24324c]">
                  Selected: {selectedFileName}
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-6 inline-flex h-12 items-center justify-center rounded-[16px] border border-[#dfe5ef] bg-white px-5 text-[15px] font-medium text-[#303744] transition-colors hover:bg-[#f7f9fc]"
              >
                Browse files
              </button>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-[18px] border border-[#f6dfb7] bg-[#fff9ef] px-5 py-4 text-[#c67a12]">
            <WarningOutlined className="mt-0.5 text-[18px]" />
            <p className="text-[14px] leading-6">
              This change will be visible to all members once approved.
              Verification documents are mandatory.
            </p>
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
          >
            Submit approval
          </button>
        </div>
      </div>
    </div>
  );
}
