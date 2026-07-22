"use client";

import { useState } from "react";
import {
  ClockCircleOutlined,
  PlusOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  WarningFilled,
} from "@ant-design/icons";
import {
  type ComplianceRuleRow,
  COMPLIANCE_ACTIVE_RULE_ROWS,
  COMPLIANCE_RULE_CATEGORIES,
  COMPLIANCE_THRESHOLD_CARDS,
  COMPLIANCE_RISK_RULE_CARDS,
} from "@/src/features/compliance/dashboard/mock";
import { primaryActionStyle } from "@/src/features/compliance/dashboard/lib/style";
import { type CreateRuleDraft, createRuleRowFromDraft } from "@/src/features/compliance/dashboard/lib/rule-drafts";
import { showToast } from "@/src/store/toast.store";
import {
  ComplianceSettingsBreadcrumbs,
  ComplianceRuleCategoryCard,
  ComplianceSettingsTable,
  ComplianceThresholdCardView,
  ComplianceRiskRuleCardView,
} from "@/src/features/compliance/dashboard/components/settings/shared";
import { CreateRuleModal } from "@/src/features/compliance/dashboard/components/settings/CreateRuleModal";
import { RuleConfigurationDrawer } from "@/src/features/compliance/dashboard/components/settings/RuleConfigurationDrawer";

export default function VerificationRulesSettingsView() {
  const [isCreateRuleModalOpen, setIsCreateRuleModalOpen] = useState(false);
  const [ruleRows, setRuleRows] = useState<ComplianceRuleRow[]>(
    COMPLIANCE_ACTIVE_RULE_ROWS,
  );
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);

  const handleCreateRule = (draft: CreateRuleDraft) => {
    setRuleRows((current) => [createRuleRowFromDraft(draft), ...current]);
    setIsCreateRuleModalOpen(false);
    showToast("Mock rule created locally. API integration pending.", "success");
  };

  const handleEditRule = (ruleId: string) => {
    setEditingRuleId(ruleId);
  };

  const handleUpdateRule = (
    draft: CreateRuleDraft,
    mode: "draft" | "publish",
  ) => {
    if (!editingRuleId) {
      return;
    }

    setRuleRows((current) =>
      current.map((rule) =>
        rule.id === editingRuleId
          ? createRuleRowFromDraft(draft, {
              id: rule.id,
              version: rule.version,
              status:
                mode === "publish"
                  ? { label: "Active", tone: "green" }
                  : { label: "Draft", tone: "cyan" },
            })
          : rule,
      ),
    );
    setEditingRuleId(null);
    showToast(
      mode === "publish"
        ? "Mock rule published locally. API integration pending."
        : "Mock rule draft saved locally. API integration pending.",
      "success",
    );
  };

  const editingRule =
    editingRuleId != null
      ? ruleRows.find((rule) => rule.id === editingRuleId) ?? null
      : null;

  return (
    <div className="space-y-8">
      <div className="space-y-5">
        <ComplianceSettingsBreadcrumbs
          currentLabel="Verification Rules & Thresholds"
        />

        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h1 className="text-[42px] font-semibold tracking-[-0.06em] text-[#2a2f39]">
              Verification Rules &amp; Thresholds
            </h1>
            <p className="mt-2 max-w-[760px] text-[15px] text-[#7a8291]">
              Define automated compliance requirements used to evaluate miner
              submissions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="inline-flex h-14 items-center gap-3 rounded-[18px] border border-[#e1e5ee] bg-[#f7f9fc] px-6 text-[16px] font-medium text-[#2f3541] transition-colors hover:bg-white"
            >
              <ClockCircleOutlined />
              View Rule History
            </button>
            <button
              type="button"
              onClick={() => setIsCreateRuleModalOpen(true)}
              className="inline-flex h-14 items-center gap-3 rounded-[18px] bg-[#14244a] px-6 text-[16px] font-semibold text-white shadow-[0_18px_36px_-24px_rgba(20,36,74,0.8)] transition-colors hover:bg-[#182c57]"
              style={primaryActionStyle}
            >
              <PlusOutlined />
              Create New Rule
            </button>
          </div>
        </div>
      </div>

      <section className="space-y-5">
        <div className="flex items-center gap-3 text-[18px] font-semibold text-[#2a2f39]">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef4ff] text-[#2661d8]">
            <SafetyCertificateOutlined />
          </span>
          Compliance Rule Categories
        </div>

        <div className="grid gap-4 xl:grid-cols-3 md:grid-cols-2">
          {COMPLIANCE_RULE_CATEGORIES.map((category) => (
            <ComplianceRuleCategoryCard
              key={category.id}
              category={category}
            />
          ))}
        </div>
      </section>

      <ComplianceSettingsTable rows={ruleRows} onEditRule={handleEditRule} />

      <section className="space-y-5">
        <div>
          <div className="flex items-center gap-3 text-[18px] font-semibold text-[#2a2f39]">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef4ff] text-[#2661d8]">
              <CheckCircleOutlined />
            </span>
            Production &amp; Reporting Thresholds
          </div>
          <p className="mt-2 text-[14px] text-[#8a92a1]">
            Define thresholds used to evaluate miner activity with automated
            enforcement actions.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          {COMPLIANCE_THRESHOLD_CARDS.map((card) => (
            <ComplianceThresholdCardView key={card.id} card={card} />
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div>
          <div className="flex items-center gap-3 text-[18px] font-semibold text-[#2a2f39]">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef4ff] text-[#2661d8]">
              <WarningFilled />
            </span>
            Automated Risk Detection
          </div>
          <p className="mt-2 text-[14px] text-[#8a92a1]">
            System-level compliance flags that automatically detect and respond
            to risk conditions.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          {COMPLIANCE_RISK_RULE_CARDS.map((card) => (
            <ComplianceRiskRuleCardView key={card.id} card={card} />
          ))}
        </div>
      </section>

      {isCreateRuleModalOpen ? (
        <CreateRuleModal
          onClose={() => setIsCreateRuleModalOpen(false)}
          onSubmit={handleCreateRule}
        />
      ) : null}

      {editingRule ? (
        <RuleConfigurationDrawer
          key={editingRule.id}
          rule={editingRule}
          onClose={() => setEditingRuleId(null)}
          onSubmit={handleUpdateRule}
        />
      ) : null}
    </div>
  );
}

