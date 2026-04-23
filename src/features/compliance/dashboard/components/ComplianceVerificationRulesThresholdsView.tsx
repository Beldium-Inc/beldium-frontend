"use client";

import {
  AppstoreOutlined,
  ClockCircleOutlined,
  EditOutlined,
  EnvironmentOutlined,
  FilePdfOutlined,
  GlobalOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  RiseOutlined,
  SafetyCertificateOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import ComplianceCreateRuleModal from "@/src/features/compliance/dashboard/components/ComplianceCreateRuleModal";
import ComplianceRuleConfigurationDrawer from "@/src/features/compliance/dashboard/components/ComplianceRuleConfigurationDrawer";
import {
  COMPLIANCE_ACTIVE_RULE_ROWS,
  COMPLIANCE_RISK_RULE_CARDS,
  COMPLIANCE_RULE_CATEGORIES,
  COMPLIANCE_THRESHOLD_CARDS,
  type ComplianceRiskRuleCard,
  type ComplianceRuleCategory,
  type ComplianceRuleRow,
  type ComplianceThresholdCard,
} from "@/src/features/compliance/dashboard/mock";
import { showToast } from "@/src/store/toast.store";

function CategoryIcon({ icon }: { icon: ComplianceRuleCategory["icon"] }) {
  const className =
    "flex h-12 w-12 items-center justify-center rounded-[16px] border border-[#e8edf4] bg-[#fbfcfe] text-[21px] text-[#2f3541]";

  if (icon === "environmental") {
    return (
      <span className={className}>
        <EnvironmentOutlined />
      </span>
    );
  }

  if (icon === "framework") {
    return (
      <span className={className}>
        <WarningOutlined />
      </span>
    );
  }

  if (icon === "community") {
    return (
      <span className={className}>
        <GlobalOutlined />
      </span>
    );
  }

  return (
    <span className={className}>
      <FilePdfOutlined />
    </span>
  );
}

function RuleCategoryCard({ category }: { category: ComplianceRuleCategory }) {
  return (
    <article className="rounded-[22px] border border-[#dde5ef] bg-white px-5 py-5 shadow-[0_22px_48px_-44px_rgba(16,30,61,0.45)]">
      <div className="flex items-start gap-4">
        <CategoryIcon icon={category.icon} />
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-medium leading-6 text-[#2a2f39]">
            {category.title}
          </h3>
          <p className="mt-1 text-[12px] leading-5 text-[#9098a7]">
            {category.description}
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2 text-[12px] text-[#9aa2b0]">
        <span className="h-2.5 w-2.5 rounded-full bg-[#1db32b]" />
        {category.activeRules} active rules
      </div>
    </article>
  );
}

function RuleStatusPill({ rule }: { rule: ComplianceRuleRow }) {
  return (
    <span className="inline-flex rounded-full border border-[#bdeec9] bg-[#e9faef] px-4 py-1 text-[14px] font-medium text-[#1ea43b]">
      {rule.status.label}
    </span>
  );
}

function ActiveRulesTable({
  rows,
  onEditRule,
}: {
  rows: ComplianceRuleRow[];
  onEditRule: (ruleId: string) => void;
}) {
  return (
    <section className="rounded-[30px] border border-[#dde5ef] bg-white p-5 shadow-[0_28px_60px_-48px_rgba(16,30,61,0.35)] sm:p-6">
      <div className="flex items-center gap-3 px-1 pb-4 text-[18px] font-semibold text-[#2a2f39]">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eef4ff] text-[18px] text-[#2661d8]">
          <AppstoreOutlined />
        </span>
        Active Compliance Rules
      </div>

      <div className="overflow-hidden rounded-[22px] border border-[#dfe5ef]">
        <div className="overflow-x-auto">
          <table className="min-w-[1120px] w-full border-separate border-spacing-0 text-left">
            <thead>
              <tr className="bg-[#f7f9fc] text-[15px] font-medium text-[#2f3541]">
                <th className="border-b border-[#edf1f6] px-5 py-4">Rule Name</th>
                <th className="border-b border-[#edf1f6] px-5 py-4">Category</th>
                <th className="border-b border-[#edf1f6] px-5 py-4">
                  Trigger Condition
                </th>
                <th className="border-b border-[#edf1f6] px-5 py-4">Action</th>
                <th className="border-b border-[#edf1f6] px-5 py-4">Status</th>
                <th className="border-b border-[#edf1f6] px-5 py-4 text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={row.id}
                  className={index % 2 === 0 ? "bg-white" : "bg-[#fcfdff]"}
                >
                  <td className="border-b border-[#edf1f6] px-5 py-5">
                    <div className="text-[16px] font-medium leading-6 text-[#2a2f39]">
                      {row.name}
                    </div>
                    <div className="mt-1 text-[12px] text-[#a0a8b6]">
                      {row.version}
                    </div>
                  </td>
                  <td className="border-b border-[#edf1f6] px-5 py-5 text-[16px] text-[#7c8493]">
                    {row.category}
                  </td>
                  <td className="border-b border-[#edf1f6] px-5 py-5 text-[16px] text-[#7c8493]">
                    {row.triggerCondition}
                  </td>
                  <td className="border-b border-[#edf1f6] px-5 py-5 text-[16px] text-[#4d5565]">
                    {row.action}
                  </td>
                  <td className="border-b border-[#edf1f6] px-5 py-5">
                    <RuleStatusPill rule={row} />
                  </td>
                  <td className="border-b border-[#edf1f6] px-5 py-5 text-right">
                    <button
                      type="button"
                      onClick={() => onEditRule(row.id)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[18px] text-[#6e7786] transition-colors hover:bg-[#f7f9fc]"
                      aria-label={`Edit ${row.name}`}
                    >
                      <EditOutlined />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4 border-t border-[#edf1f6] px-6 py-4 text-[15px] text-[#8a92a1] lg:flex-row lg:items-center lg:justify-between">
          <div>(Displaying 5 per page)</div>

          <div className="flex flex-wrap items-center gap-0 overflow-hidden rounded-[14px] border border-[#dfe5ef]">
            <button
              type="button"
              onClick={() => showToast("Mock pagination. API wiring is pending.", "info")}
              className="inline-flex h-10 items-center gap-2 border-r border-[#e8edf4] px-4 text-[#9aa2b0]"
            >
              <span>←</span>
              Previous
            </button>
            {["1", "2", "3", "...", "8", "9", "10"].map((page) => (
              <button
                key={page}
                type="button"
                onClick={() =>
                  showToast("Mock pagination. API wiring is pending.", "info")
                }
                className={
                  page === "1"
                    ? "inline-flex h-10 min-w-9 items-center justify-center border-r border-[#e8edf4] bg-[#f2f5f9] px-3 text-[#2a2f39]"
                    : "inline-flex h-10 min-w-9 items-center justify-center border-r border-[#e8edf4] px-3 text-[#2a2f39]"
                }
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              onClick={() => showToast("Mock pagination. API wiring is pending.", "info")}
              className="inline-flex h-10 items-center gap-2 px-4 text-[#2a2f39]"
            >
              Next
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function ThresholdTonePill({ card }: { card: ComplianceThresholdCard }) {
  const className =
    card.automatedActionTone === "red"
      ? "inline-flex rounded-full border border-[#ffd4d5] bg-[#fff1f1] px-3 py-1 text-[12px] font-medium uppercase tracking-[0.02em] text-[#ef4444]"
      : "inline-flex rounded-full border border-[#bdeec9] bg-[#e9faef] px-3 py-1 text-[12px] font-medium uppercase tracking-[0.02em] text-[#1ea43b]";

  return <span className={className}>{card.automatedAction}</span>;
}

function ThresholdCard({ card }: { card: ComplianceThresholdCard }) {
  const icon =
    card.icon === "frequency" ? <ClockCircleOutlined /> : <RiseOutlined />;

  return (
    <article className="rounded-[24px] border border-[#e5ebf4] bg-white p-5 shadow-[0_24px_50px_-44px_rgba(16,30,61,0.38)] sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f6f8fb] text-[18px] text-[#7b8392]">
            {icon}
          </span>
          <h3 className="text-[18px] font-medium text-[#2a2f39]">
            {card.title}
          </h3>
        </div>

        <button
          type="button"
          onClick={() =>
            showToast(
              `Mock edit flow for ${card.title}. API wiring is pending.`,
              "info",
            )
          }
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[18px] text-[#9aa2b0] transition-colors hover:bg-[#f7f9fc]"
          aria-label={`Edit ${card.title}`}
        >
          <EditOutlined />
        </button>
      </div>

      <div className="mt-5 rounded-[18px] bg-[#f7f9fc] px-5 py-5">
        <div className="flex items-end gap-2">
          <span className="text-[54px] font-semibold leading-none tracking-[-0.08em] text-[#2a2f39]">
            {card.value}
          </span>
          <span className="pb-2 text-[18px] text-[#8a92a1]">{card.unit}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-[13px] text-[#8a92a1]">
        <span>Automated Action:</span>
        <ThresholdTonePill card={card} />
      </div>

      <div className="mt-3 text-[16px] text-[#4d5565]">{card.summary}</div>

      <div className="mt-6 border-t border-[#edf1f6] pt-4 text-[12px] font-medium uppercase tracking-[0.08em] text-[#b0b7c3]">
        {card.updatedBy}
      </div>
    </article>
  );
}

function RiskTonePill({ card }: { card: ComplianceRiskRuleCard }) {
  const className =
    card.severityTone === "red"
      ? "inline-flex rounded-[10px] border border-[#ffc9ca] bg-[#fff0f0] px-3 py-1 text-[12px] font-medium uppercase tracking-[0.04em] text-[#ef4444]"
      : "inline-flex rounded-[10px] border border-[#f7d8a6] bg-[#fff4de] px-3 py-1 text-[12px] font-medium uppercase tracking-[0.04em] text-[#f0a31f]";

  return <span className={className}>{card.severityLabel}</span>;
}

function RiskRuleCard({ card }: { card: ComplianceRiskRuleCard }) {
  const toneClassName =
    card.severityTone === "red"
      ? "border-[#ffd1d1] bg-[#fff9f9]"
      : "border-[#f6dfb7] bg-[#fffaf1]";

  return (
    <article
      className={`rounded-[24px] border p-5 shadow-[0_24px_50px_-44px_rgba(16,30,61,0.32)] sm:p-6 ${toneClassName}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span
            className={
              card.severityTone === "red"
                ? "mt-1 flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#fff0f0] text-[18px] text-[#ef4444]"
                : "mt-1 flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#fff5e5] text-[18px] text-[#f0a31f]"
            }
          >
            <WarningOutlined />
          </span>
          <div>
            <h3 className="text-[18px] font-medium text-[#2a2f39]">
              {card.title}
            </h3>
            <div className="mt-3">
              <RiskTonePill card={card} />
            </div>
          </div>
        </div>

        <span className="mt-1 h-3 w-3 rounded-full bg-[#1db32b]" />
      </div>

      <div className="mt-6 space-y-5">
        <div>
          <div className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#b0b7c3]">
            Trigger
          </div>
          <div className="mt-3 text-[16px] leading-7 text-[#4d5565]">
            {card.trigger}
          </div>
        </div>

        <div className="border-t border-[#ebedf2]" />

        <div>
          <div className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#b0b7c3]">
            Action
          </div>
          <div className="mt-3 text-[16px] leading-7 text-[#4d5565]">
            {card.action}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function ComplianceVerificationRulesThresholdsView() {
  const [isCreateRuleModalOpen, setIsCreateRuleModalOpen] = useState(false);
  const [ruleRows, setRuleRows] = useState<ComplianceRuleRow[]>(
    COMPLIANCE_ACTIVE_RULE_ROWS,
  );
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const editingRule =
    editingRuleId != null
      ? ruleRows.find((rule) => rule.id === editingRuleId) ?? null
      : null;

  const handleUpdateRule = (
    updatedRule: ComplianceRuleRow,
    mode: "draft" | "publish",
  ) => {
    setRuleRows((current) =>
      current.map((rule) => (rule.id === updatedRule.id ? updatedRule : rule)),
    );
    setEditingRuleId(null);
    showToast(
      mode === "publish"
        ? `Mock rule ${updatedRule.name} published locally. API wiring is pending.`
        : `Mock draft for ${updatedRule.name} saved locally. API wiring is pending.`,
      "success",
    );
  };

  return (
    <>
      <div className="space-y-10">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2 text-[15px] text-[#8a92a1]">
            <span>Settings</span>
            <span className="text-[12px] text-[#9aa2b0]">›</span>
            <span className="font-medium text-[#5d6675]">
              Verification Rules &amp; Thresholds
            </span>
          </div>

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
                onClick={() =>
                  showToast("Mock rule history view. API wiring is pending.", "info")
                }
                className="inline-flex h-14 items-center gap-3 rounded-[18px] border border-[#e1e5ee] bg-[#f7f9fc] px-6 text-[16px] font-medium text-[#2f3541] transition-colors hover:bg-white"
              >
                <ClockCircleOutlined />
                View Rule History
              </button>
              <button
                type="button"
                onClick={() => setIsCreateRuleModalOpen(true)}
                className="inline-flex h-14 items-center gap-3 rounded-[18px] bg-[#14244a] px-6 text-[16px] font-semibold text-white shadow-[0_18px_36px_-24px_rgba(20,36,74,0.8)] transition-colors hover:bg-[#182c57]"
                style={{ color: "#ffffff" }}
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

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {COMPLIANCE_RULE_CATEGORIES.map((category) => (
              <RuleCategoryCard key={category.id} category={category} />
            ))}
          </div>
        </section>

        <ActiveRulesTable
          rows={ruleRows}
          onEditRule={(ruleId) => setEditingRuleId(ruleId)}
        />

        <section className="space-y-5">
          <div>
            <div className="flex items-center gap-3 text-[18px] font-semibold text-[#2a2f39]">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef4ff] text-[#2661d8]">
                <InfoCircleOutlined />
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
              <ThresholdCard key={card.id} card={card} />
            ))}
          </div>
        </section>

        <section className="space-y-5">
          <div>
            <div className="flex items-center gap-3 text-[18px] font-semibold text-[#2a2f39]">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef4ff] text-[#2661d8]">
                <WarningOutlined />
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
              <RiskRuleCard key={card.id} card={card} />
            ))}
          </div>
        </section>
      </div>

      {isCreateRuleModalOpen ? (
        <ComplianceCreateRuleModal
          onClose={() => setIsCreateRuleModalOpen(false)}
        />
      ) : null}

      {editingRule ? (
        <ComplianceRuleConfigurationDrawer
          rule={editingRule}
          onClose={() => setEditingRuleId(null)}
          onSubmit={handleUpdateRule}
        />
      ) : null}
    </>
  );
}
