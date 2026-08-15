"use client";

import { useEffect, useState } from "react";
import { CheckOutlined, CloseOutlined, DownOutlined } from "@ant-design/icons";
import { classNames, primaryActionStyle } from "@/src/features/compliance/dashboard/lib/style";
import {
  type DocumentRuleDraft,
  type DocumentRuleValidationField,
  DOCUMENT_RULE_JURISDICTION_OPTIONS,
  DOCUMENT_RULE_EXPIRY_TYPE_OPTIONS,
  INITIAL_DOCUMENT_RULE_DRAFT,
} from "@/src/features/compliance/dashboard/components/settings/document-rule-shared";
import {
  CreateRuleFieldLabel,
  CreateRuleErrorText,
} from "@/src/features/compliance/dashboard/components/settings/CreateRuleModal";

export function DocumentRuleChecklistItem({
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
      className="flex items-center gap-4 py-1 text-left"
    >
      <span
        className={classNames(
          "inline-flex h-7 w-7 items-center justify-center rounded-[7px] border text-[14px] transition-colors",
          checked
            ? "border-[#14244a] bg-[#14244a] !text-white"
            : "border-[#bcc8da] bg-white text-transparent",
        )}
      >
        <CheckOutlined />
      </span>
      <span className="text-[16px] text-[#2a2f39]">{label}</span>
    </button>
  );
}

export function DocumentRuleValidationCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-[20px] border border-[#dce3ef] bg-[#fbfcfe] px-5 py-5">
      <div className="text-[16px] text-[#8a92a1]">{title}</div>
      <div className="mt-3 h-px bg-[#e6ebf3]" />
      <div className="mt-4 text-[18px] font-medium text-[#5d6675]">{value}</div>
    </div>
  );
}

export function DocumentRuleConfigurationDrawer({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (draft: DocumentRuleDraft) => void;
}) {
  const [draft, setDraft] = useState<DocumentRuleDraft>(
    INITIAL_DOCUMENT_RULE_DRAFT,
  );
  const [errors, setErrors] = useState<
    Partial<Record<DocumentRuleValidationField, string>>
  >({});

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const fieldClassName =
    "w-full rounded-[18px] border border-[#ccd6e5] bg-white px-5 text-[17px] text-[#2a2f39] outline-none transition-shadow placeholder:text-[#8f97a6] focus:shadow-[0_0_0_4px_rgba(16,30,61,0.06)]";

  const updateField = <T extends keyof DocumentRuleDraft>(
    field: T,
    value: DocumentRuleDraft[T],
  ) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current.documentName || field !== "documentName") {
        return current;
      }

      const next = { ...current };
      delete next.documentName;
      return next;
    });
  };

  const toggleMandatoryMetadata = (
    field: keyof DocumentRuleDraft["mandatoryMetadata"],
  ) => {
    setDraft((current) => ({
      ...current,
      mandatoryMetadata: {
        ...current.mandatoryMetadata,
        [field]: !current.mandatoryMetadata[field],
      },
    }));
  };

  const toggleExpiryAction = (
    field: keyof DocumentRuleDraft["expiryActions"],
  ) => {
    setDraft((current) => ({
      ...current,
      expiryActions: {
        ...current.expiryActions,
        [field]: !current.expiryActions[field],
      },
    }));
  };

  const handleSubmit = () => {
    if (!draft.documentName.trim()) {
      setErrors({ documentName: "Document Name is required" });
      return;
    }

    onSubmit(draft);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[rgba(15,23,42,0.28)] backdrop-blur-[4px]">
      <button
        type="button"
        aria-label="Close document rule configuration panel"
        className="absolute inset-0"
        onClick={onClose}
      />

      <aside className="relative flex h-full w-full max-w-[620px] flex-col border-l border-[#e5e9f1] bg-white shadow-[-20px_0_60px_-32px_rgba(16,30,61,0.5)]">
        <div className="border-b border-[#edf1f7] px-7 py-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[20px] font-semibold text-[#2a2f39]">
                Edit Document Rule
              </h2>
              <p className="mt-1 text-[15px] text-[#8a92a1]">
                Configure validation rules and compliance requirements
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full text-[22px] text-[#2a3142] transition-colors hover:bg-[#f7f9fc]"
            >
              <CloseOutlined />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-10 overflow-y-auto px-7 py-8">
          <section className="space-y-5">
            <div className="text-[14px] font-medium uppercase tracking-[0.05em] text-[#7a8291]">
              Document Identity
            </div>

            <div>
              <CreateRuleFieldLabel label="Document Name" required />
              <input
                type="text"
                value={draft.documentName}
                onChange={(event) =>
                  updateField("documentName", event.target.value)
                }
                className={classNames(fieldClassName, "mt-3 h-14")}
              />
              <CreateRuleErrorText message={errors.documentName} />
            </div>

            <div>
              <CreateRuleFieldLabel label="Description" />
              <textarea
                value={draft.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                className={classNames(fieldClassName, "mt-3 h-[88px] py-4")}
              />
            </div>

            <div>
              <CreateRuleFieldLabel label="Applicable Minerals" />
              <input
                type="text"
                value={draft.applicableMinerals}
                onChange={(event) =>
                  updateField("applicableMinerals", event.target.value)
                }
                className={classNames(fieldClassName, "mt-3 h-14")}
              />
            </div>

            <div>
              <CreateRuleFieldLabel label="Applicable Jurisdiction" />
              <div className="relative mt-3">
                <select
                  value={draft.applicableJurisdiction}
                  onChange={(event) =>
                    updateField("applicableJurisdiction", event.target.value)
                  }
                  className={classNames(fieldClassName, "h-14 appearance-none pr-14")}
                >
                  {DOCUMENT_RULE_JURISDICTION_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <DownOutlined className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-[18px] text-[#14244a]" />
              </div>
            </div>
          </section>

          <section className="space-y-5">
            <div className="text-[14px] font-medium uppercase tracking-[0.05em] text-[#7a8291]">
              Validation Rules
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <DocumentRuleValidationCard
                title="Allowed File Formats"
                value={draft.allowedFileFormats}
              />
              <DocumentRuleValidationCard
                title="Maximum File Size"
                value={draft.maximumFileSize}
              />
            </div>

            <div>
              <CreateRuleFieldLabel label="Mandatory Metadata Fields" />
              <div className="mt-4 space-y-5">
                <DocumentRuleChecklistItem
                  checked={draft.mandatoryMetadata.issueDate}
                  label="Issue Date"
                  onToggle={() => toggleMandatoryMetadata("issueDate")}
                />
                <DocumentRuleChecklistItem
                  checked={draft.mandatoryMetadata.issuingAuthority}
                  label="Issuing Authority"
                  onToggle={() => toggleMandatoryMetadata("issuingAuthority")}
                />
                <DocumentRuleChecklistItem
                  checked={draft.mandatoryMetadata.expiryDate}
                  label="Expiry Date"
                  onToggle={() => toggleMandatoryMetadata("expiryDate")}
                />
                <DocumentRuleChecklistItem
                  checked={draft.mandatoryMetadata.documentNumber}
                  label="Document Number"
                  onToggle={() => toggleMandatoryMetadata("documentNumber")}
                />
              </div>
            </div>

            <div>
              <CreateRuleFieldLabel label="Expiry Type" />
              <div className="relative mt-3">
                <select
                  value={draft.expiryType}
                  onChange={(event) =>
                    updateField("expiryType", event.target.value)
                  }
                  className={classNames(fieldClassName, "h-14 appearance-none pr-14")}
                >
                  {DOCUMENT_RULE_EXPIRY_TYPE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <DownOutlined className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-[18px] text-[#14244a]" />
              </div>
            </div>

            <div>
              <CreateRuleFieldLabel label="Validity Period (years)" />
              <input
                type="text"
                value={draft.validityPeriodYears}
                onChange={(event) =>
                  updateField("validityPeriodYears", event.target.value)
                }
                className={classNames(fieldClassName, "mt-3 h-14")}
              />
            </div>
          </section>

          <section className="space-y-5">
            <div className="text-[14px] font-medium uppercase tracking-[0.05em] text-[#7a8291]">
              System Action On Expiry
            </div>

            <div className="space-y-5">
              <DocumentRuleChecklistItem
                checked={draft.expiryActions.sendRenewalReminder}
                label="Send renewal reminder"
                onToggle={() => toggleExpiryAction("sendRenewalReminder")}
              />
              <DocumentRuleChecklistItem
                checked={draft.expiryActions.flagMiner}
                label="Flag Miner"
                onToggle={() => toggleExpiryAction("flagMiner")}
              />
              <DocumentRuleChecklistItem
                checked={draft.expiryActions.blockNewSubmissions}
                label="Block new submissions"
                onToggle={() => toggleExpiryAction("blockNewSubmissions")}
              />
            </div>
          </section>
        </div>

        <div className="border-t border-[#edf1f7] px-7 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 items-center justify-center rounded-[10px] border border-[#d7deea] bg-[#f1f4f8] px-4 text-[13px] font-medium text-[#14244a] transition-colors hover:bg-[#e9eef5]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex h-11 items-center justify-center rounded-[10px] bg-[#14244a] px-4 text-[13px] font-semibold !text-white transition-colors hover:bg-[#182c57]"
              style={primaryActionStyle}
            >
              Save Changes
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

