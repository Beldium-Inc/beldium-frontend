"use client";

import {
  CalendarOutlined,
  CloseOutlined,
  DownOutlined,
  InboxOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useRef, useState, type DragEvent } from "react";
import { showToast } from "@/src/store/toast.store";

const REGION_OPTIONS = ["Abuja FCT", "Cross River", "Enugu", "Nasarawa", "Osun"];
const AUTHORITY_OPTIONS = [
  "Federal Mining Commission",
  "Nigerian Mining Agency",
  "State Mineral Resources Bureau",
];
const LEVEL_OPTIONS = ["Federal", "State", "Local"] as const;

type AuthorityLevel = (typeof LEVEL_OPTIONS)[number];

export default function ComplianceAddJurisdictionModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const [region, setRegion] = useState(REGION_OPTIONS[0]);
  const [authorityLevel, setAuthorityLevel] = useState<AuthorityLevel>("Federal");
  const [issuingAuthority, setIssuingAuthority] = useState(AUTHORITY_OPTIONS[0]);
  const [effectiveDate, setEffectiveDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
      `Mock jurisdiction request for ${region} submitted for approval. API wiring is pending.`,
      "success",
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(22,28,36,0.74)] px-4 py-8">
      <div className="relative max-h-[90vh] w-full max-w-[840px] overflow-y-auto rounded-[20px] bg-white shadow-[0_40px_120px_-56px_rgba(15,23,42,0.75)]">
        <div className="flex items-center justify-between border-b border-[#edf1f6] px-7 py-6">
          <h2 className="text-[18px] font-semibold text-[#252b37] sm:text-[20px]">
            Add Jurisdiction
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[20px] text-[#303744] transition-colors hover:bg-[#f7f9fc]"
            aria-label="Close add jurisdiction modal"
          >
            <CloseOutlined />
          </button>
        </div>

        <div className="space-y-6 px-7 py-6">
          <div className="flex items-start gap-3 rounded-[18px] border border-[#f6dfb7] bg-[#fff9ef] px-5 py-4 text-[#d2871f]">
            <WarningOutlined className="mt-0.5 text-[18px]" />
            <p className="text-[14px] leading-6">
              Submitted jurisdictions will be placed in pending status until
              regulatory verification is completed.
            </p>
          </div>

          <div>
            <label className="text-[15px] font-medium text-[#303744]">
              Region Name <span className="text-[#ef4444]">*</span>
            </label>
            <div className="relative mt-3">
              <select
                value={region}
                onChange={(event) => setRegion(event.target.value)}
                className="h-16 w-full appearance-none rounded-[18px] border border-[#d9e0ec] bg-white px-5 pr-14 text-[16px] text-[#2a2f39] outline-none transition-shadow focus:shadow-[0_0_0_4px_rgba(16,30,61,0.06)]"
              >
                {REGION_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <DownOutlined className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-[18px] text-[#24324c]" />
            </div>
          </div>

          <div>
            <div className="text-[15px] font-medium text-[#303744]">
              Authority Level <span className="text-[#ef4444]">*</span>
            </div>
            <div className="mt-3 grid gap-4 sm:grid-cols-3">
              {LEVEL_OPTIONS.map((option) => {
                const active = authorityLevel === option;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setAuthorityLevel(option)}
                    className={
                      active
                        ? "inline-flex h-11 items-center rounded-[10px] border border-[#13264e] bg-[#eef3ff] px-4 text-[13px] font-medium text-[#13264e]"
                        : "inline-flex h-11 items-center rounded-[10px] border border-[#d9e0ec] bg-white px-4 text-[13px] font-medium text-[#2a2f39] transition-colors hover:bg-[#f7f9fc]"
                    }
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-[15px] font-medium text-[#303744]">
              Issuing Authority <span className="text-[#ef4444]">*</span>
            </label>
            <div className="relative mt-3">
              <select
                value={issuingAuthority}
                onChange={(event) => setIssuingAuthority(event.target.value)}
                className="h-16 w-full appearance-none rounded-[18px] border border-[#d9e0ec] bg-white px-5 pr-14 text-[16px] text-[#2a2f39] outline-none transition-shadow focus:shadow-[0_0_0_4px_rgba(16,30,61,0.06)]"
              >
                {AUTHORITY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <DownOutlined className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-[18px] text-[#24324c]" />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="text-[15px] font-medium text-[#303744]">
                Effective Date <span className="text-[#ef4444]">*</span>
              </label>
              <div className="relative mt-3">
                <input
                  type="date"
                  value={effectiveDate}
                  onChange={(event) => setEffectiveDate(event.target.value)}
                  className="h-16 w-full rounded-[18px] border border-[#d9e0ec] bg-white px-5 pr-14 text-[16px] text-[#2a2f39] outline-none transition-shadow focus:shadow-[0_0_0_4px_rgba(16,30,61,0.06)]"
                />
                <CalendarOutlined className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-[22px] text-[#7f8796]" />
              </div>
            </div>

            <div>
              <label className="text-[15px] font-medium text-[#303744]">
                Expiry Date <span className="text-[#ef4444]">*</span>
              </label>
              <div className="relative mt-3">
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(event) => setExpiryDate(event.target.value)}
                  className="h-16 w-full rounded-[18px] border border-[#d9e0ec] bg-white px-5 pr-14 text-[16px] text-[#2a2f39] outline-none transition-shadow focus:shadow-[0_0_0_4px_rgba(16,30,61,0.06)]"
                />
                <CalendarOutlined className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-[22px] text-[#7f8796]" />
              </div>
            </div>
          </div>

          <div>
            <div className="text-[15px] font-medium text-[#303744]">
              Supporting Documentation <span className="text-[#ef4444]">*</span>
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
            className="inline-flex h-11 items-center justify-center rounded-[10px] bg-[#13264e] px-4 text-[13px] font-semibold !text-white transition-colors hover:bg-[#182f5f]"
          >
            Submit approval
          </button>
        </div>
      </div>
    </div>
  );
}
