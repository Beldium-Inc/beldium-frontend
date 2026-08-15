"use client";

import { useState } from "react";
import { ClockCircleOutlined, PlusOutlined } from "@ant-design/icons";
import {
  COMPLIANCE_DOCUMENT_REQUIREMENT_ROWS,
  COMPLIANCE_DATA_CONTROL_CARDS,
} from "@/src/features/compliance/dashboard/mock";
import { primaryActionStyle } from "@/src/features/compliance/dashboard/lib/style";
import { showToast } from "@/src/store/toast.store";
import {
  ComplianceSettingsBreadcrumbs,
  ComplianceDocumentRequirementsTable,
  ComplianceDataControlCardView,
} from "@/src/features/compliance/dashboard/components/settings/shared";
import type { DocumentRuleDraft } from "@/src/features/compliance/dashboard/components/settings/document-rule-shared";
import { DocumentRuleConfigurationDrawer } from "@/src/features/compliance/dashboard/components/settings/DocumentRuleConfigurationDrawer";
import ComplianceAddDocumentRequirementModal from "@/src/features/compliance/dashboard/components/ComplianceAddDocumentRequirementModal";

function ComplianceDocumentControlsSurface({
  currentLabel,
  title,
  description,
}: {
  currentLabel: string;
  title: string;
  description: string;
}) {
  const [isAddDocumentRequirementOpen, setIsAddDocumentRequirementOpen] =
    useState(false);
  const [isDocumentRuleDrawerOpen, setIsDocumentRuleDrawerOpen] = useState(false);

  const openDocumentRuleDrawer = () => {
    setIsDocumentRuleDrawerOpen(true);
  };

  const handleSaveDocumentRule = (draft: DocumentRuleDraft) => {
    setIsDocumentRuleDrawerOpen(false);
    showToast(
      `Mock document rule for ${draft.documentName} saved locally. API integration pending.`,
      "success",
    );
  };

  return (
    <div className="space-y-8">
      <div className="space-y-5">
        <ComplianceSettingsBreadcrumbs currentLabel={currentLabel} />

        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h1 className="text-[28px] font-bold tracking-[-0.03em] text-[#2a2f39]">
              {title}
            </h1>
            <p className="mt-2 max-w-[760px] text-[15px] text-[#7a8291]">
              {description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="inline-flex h-11 items-center gap-2 rounded-[10px] border border-[#e1e5ee] bg-white px-4 text-[13px] font-medium text-[#2f3541] transition-colors hover:bg-[#f7f9fc]"
            >
              <ClockCircleOutlined />
              View Document Audit Logs
            </button>
            <button
              type="button"
              onClick={() => setIsAddDocumentRequirementOpen(true)}
              className="inline-flex h-11 items-center gap-3 rounded-[10px] bg-[#14244a] px-4 text-[13px] font-semibold !text-white transition-colors hover:bg-[#182c57]"
              style={primaryActionStyle}
            >
              <PlusOutlined />
              Add required Document
            </button>
          </div>
        </div>
      </div>

      <ComplianceDocumentRequirementsTable
        rows={COMPLIANCE_DOCUMENT_REQUIREMENT_ROWS}
        onEditDocument={openDocumentRuleDrawer}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        {COMPLIANCE_DATA_CONTROL_CARDS.map((card) => (
          <ComplianceDataControlCardView key={card.id} card={card} />
        ))}
      </div>

      {isDocumentRuleDrawerOpen ? (
        <DocumentRuleConfigurationDrawer
          onClose={() => setIsDocumentRuleDrawerOpen(false)}
          onSubmit={handleSaveDocumentRule}
        />
      ) : null}

      {isAddDocumentRequirementOpen ? (
        <ComplianceAddDocumentRequirementModal
          onClose={() => setIsAddDocumentRequirementOpen(false)}
        />
      ) : null}
    </div>
  );
}

export default function DocumentsDataControlsView() {
  return (
    <ComplianceDocumentControlsSurface
      currentLabel="Documents & Data Controls"
      title="Documents & Data Controls"
      description="Configure evidence requirements, file validation rules, and compliance data governance policies."
    />
  );
}

