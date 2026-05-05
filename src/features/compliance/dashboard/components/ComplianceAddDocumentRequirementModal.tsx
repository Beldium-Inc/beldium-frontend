"use client";

import { CloseOutlined, DownOutlined } from "@ant-design/icons";
import { useState } from "react";
import { showToast } from "@/src/store/toast.store";

const JURISDICTION_OPTIONS = [
  "Federal",
  "State",
  "All Jurisdiction",
] as const;

const EXPIRY_TYPE_OPTIONS = [
  "Fixed validity period",
  "No fixed expiry",
  "Renewable document",
] as const;

export default function ComplianceAddDocumentRequirementModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [documentName, setDocumentName] = useState("Mining License");
  const [description, setDescription] = useState(
    "Official license authorizing mineral extraction activities",
  );
  const [applicableMinerals, setApplicableMinerals] = useState("Lithium");
  const [jurisdiction, setJurisdiction] = useState<
    (typeof JURISDICTION_OPTIONS)[number]
  >(JURISDICTION_OPTIONS[0]);
  const [expiryType, setExpiryType] = useState<
    (typeof EXPIRY_TYPE_OPTIONS)[number]
  >(EXPIRY_TYPE_OPTIONS[0]);
  const [validityPeriodYears, setValidityPeriodYears] = useState("1");
  const [mandatoryMetadata, setMandatoryMetadata] = useState({
    issueDate: true,
    issuingAuthority: true,
    expiryDate: true,
    documentNumber: false,
  });
  const [systemActionsOnExpiry, setSystemActionsOnExpiry] = useState({
    sendRenewalReminder: true,
    flagMiner: true,
    blockNewSubmissions: false,
  });

  const handleContinue = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
      return;
    }

    showToast(
      `Mock add-document requirement saved for ${documentName || "new requirement"}.`,
      "success",
    );
    onClose();
  };

  const toggleMandatoryMetadata = (
    key: keyof typeof mandatoryMetadata,
  ) => {
    setMandatoryMetadata((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const toggleSystemAction = (
    key: keyof typeof systemActionsOnExpiry,
  ) => {
    setSystemActionsOnExpiry((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(22,28,36,0.74)] px-4 py-8">
      <div className="relative max-h-[90vh] w-full max-w-[940px] overflow-y-auto rounded-[32px] bg-white shadow-[0_40px_120px_-56px_rgba(15,23,42,0.75)]">
        <div className="flex items-start justify-between border-b border-[#edf1f6] px-8 py-7">
          <div>
            <h2 className="text-[20px] font-semibold text-[#252b37] sm:text-[22px]">
              Add Document Requirement
            </h2>
            <p className="mt-1 text-[15px] text-[#8a92a1]">
              Step {currentStep} of 2
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[20px] text-[#303744] transition-colors hover:bg-[#f7f9fc]"
            aria-label="Close add document requirement modal"
          >
            <CloseOutlined />
          </button>
        </div>

        <div className="space-y-8 px-8 py-8">
          {currentStep === 1 ? (
            <section className="space-y-6">
              <div className="text-[14px] font-medium uppercase tracking-[0.05em] text-[#7a8291]">
                Document Identity
              </div>

              <div>
                <label className="block text-[16px] font-medium text-[#2a2f39]">
                  Document Name <span className="text-[#ef2f32]">*</span>
                </label>
                <input
                  type="text"
                  value={documentName}
                  onChange={(event) => setDocumentName(event.target.value)}
                  className="mt-3 h-16 w-full rounded-[20px] border border-[#ccd6e5] bg-white px-6 text-[18px] text-[#2a2f39] outline-none transition-shadow placeholder:text-[#8f97a6] focus:shadow-[0_0_0_4px_rgba(16,30,61,0.06)]"
                />
              </div>

              <div>
                <label className="block text-[16px] font-medium text-[#2a2f39]">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="mt-3 h-[112px] w-full rounded-[20px] border border-[#ccd6e5] bg-white px-6 py-5 text-[18px] text-[#2a2f39] outline-none transition-shadow placeholder:text-[#8f97a6] focus:shadow-[0_0_0_4px_rgba(16,30,61,0.06)]"
                />
              </div>

              <div>
                <label className="block text-[16px] font-medium text-[#2a2f39]">
                  Applicable Minerals
                </label>
                <input
                  type="text"
                  value={applicableMinerals}
                  onChange={(event) => setApplicableMinerals(event.target.value)}
                  className="mt-3 h-16 w-full rounded-[20px] border border-[#ccd6e5] bg-white px-6 text-[18px] text-[#2a2f39] outline-none transition-shadow placeholder:text-[#8f97a6] focus:shadow-[0_0_0_4px_rgba(16,30,61,0.06)]"
                />
              </div>

              <div>
                <label className="block text-[16px] font-medium text-[#2a2f39]">
                  Applicable Jurisdiction
                </label>
                <div className="relative mt-3">
                  <select
                    value={jurisdiction}
                    onChange={(event) =>
                      setJurisdiction(
                        event.target.value as (typeof JURISDICTION_OPTIONS)[number],
                      )
                    }
                    className="h-16 w-full appearance-none rounded-[20px] border border-[#ccd6e5] bg-white px-6 pr-16 text-[18px] text-[#2a2f39] outline-none transition-shadow focus:shadow-[0_0_0_4px_rgba(16,30,61,0.06)]"
                  >
                    {JURISDICTION_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <DownOutlined className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 text-[22px] text-[#14244a]" />
                </div>
              </div>
            </section>
          ) : (
            <section className="space-y-8">
              <div className="text-[14px] font-medium uppercase tracking-[0.05em] text-[#7a8291]">
                Validation Rules
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="rounded-[24px] border border-[#d8e0ee] bg-white px-8 py-6">
                  <div className="border-b border-[#e5eaf3] pb-4 text-[16px] text-[#81899a]">
                    Allowed File Formats
                  </div>
                  <div className="pt-4 text-[18px] font-medium text-[#3a4353]">
                    PDF, JPG, PNG
                  </div>
                </div>
                <div className="rounded-[24px] border border-[#d8e0ee] bg-white px-8 py-6">
                  <div className="border-b border-[#e5eaf3] pb-4 text-[16px] text-[#81899a]">
                    Maximum File Size
                  </div>
                  <div className="pt-4 text-[18px] font-medium text-[#3a4353]">
                    20 MB
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="text-[16px] font-medium text-[#2a2f39]">
                  Mandatory Metadata Fields
                </div>
                <div className="space-y-4">
                  <CheckboxRow
                    checked={mandatoryMetadata.issueDate}
                    label="Issue Date"
                    onToggle={() => toggleMandatoryMetadata("issueDate")}
                  />
                  <CheckboxRow
                    checked={mandatoryMetadata.issuingAuthority}
                    label="Issuing Authority"
                    onToggle={() => toggleMandatoryMetadata("issuingAuthority")}
                  />
                  <CheckboxRow
                    checked={mandatoryMetadata.expiryDate}
                    label="Expiry Date"
                    onToggle={() => toggleMandatoryMetadata("expiryDate")}
                  />
                  <CheckboxRow
                    checked={mandatoryMetadata.documentNumber}
                    label="Document Number"
                    onToggle={() => toggleMandatoryMetadata("documentNumber")}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[16px] font-medium text-[#2a2f39]">
                  Expiry Type
                </label>
                <div className="relative mt-3">
                  <select
                    value={expiryType}
                    onChange={(event) =>
                      setExpiryType(
                        event.target.value as (typeof EXPIRY_TYPE_OPTIONS)[number],
                      )
                    }
                    className="h-16 w-full appearance-none rounded-[20px] border border-[#ccd6e5] bg-white px-6 pr-16 text-[18px] text-[#2a2f39] outline-none transition-shadow focus:shadow-[0_0_0_4px_rgba(16,30,61,0.06)]"
                  >
                    {EXPIRY_TYPE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <DownOutlined className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 text-[22px] text-[#14244a]" />
                </div>
              </div>

              <div>
                <label className="block text-[16px] font-medium text-[#2a2f39]">
                  Validity Period (years)
                </label>
                <input
                  type="text"
                  value={validityPeriodYears}
                  onChange={(event) => setValidityPeriodYears(event.target.value)}
                  className="mt-3 h-16 w-full rounded-[20px] border border-[#ccd6e5] bg-white px-6 text-[18px] text-[#2a2f39] outline-none transition-shadow placeholder:text-[#8f97a6] focus:shadow-[0_0_0_4px_rgba(16,30,61,0.06)]"
                />
              </div>

              <div className="space-y-5">
                <div className="text-[14px] font-medium uppercase tracking-[0.05em] text-[#7a8291]">
                  System Action On Expiry
                </div>
                <div className="space-y-4">
                  <CheckboxRow
                    checked={systemActionsOnExpiry.sendRenewalReminder}
                    label="Send renewal reminder"
                    onToggle={() => toggleSystemAction("sendRenewalReminder")}
                  />
                  <CheckboxRow
                    checked={systemActionsOnExpiry.flagMiner}
                    label="Flag Miner"
                    onToggle={() => toggleSystemAction("flagMiner")}
                  />
                  <CheckboxRow
                    checked={systemActionsOnExpiry.blockNewSubmissions}
                    label="Block new submissions"
                    onToggle={() => toggleSystemAction("blockNewSubmissions")}
                  />
                </div>
              </div>
            </section>
          )}
        </div>

        <div className="flex flex-col gap-4 border-t border-[#edf1f6] px-8 py-7 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-16 items-center justify-center rounded-[18px] px-6 text-[16px] font-medium text-[#24324c] transition-colors hover:bg-[#f7f9fc]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleContinue}
            className="inline-flex h-16 items-center justify-center rounded-[18px] bg-[#13264e] px-12 text-[16px] font-semibold text-white shadow-[0_22px_44px_-28px_rgba(19,38,78,0.85)] transition-colors hover:bg-[#182f5f]"
            style={{ color: "#ffffff" }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

function CheckboxRow({
  checked,
  label,
  onToggle,
}: {
  checked: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center gap-4 text-left"
    >
      <span
        className={`inline-flex h-8 w-8 items-center justify-center rounded-[8px] border transition-colors ${
          checked
            ? "border-[#13264e] bg-[#13264e] text-white"
            : "border-[#9aa4b5] bg-white text-transparent"
        }`}
        style={checked ? { color: "#ffffff" } : undefined}
      >
        ✓
      </span>
      <span className="text-[16px] font-medium text-[#2a2f39]">{label}</span>
    </button>
  );
}
