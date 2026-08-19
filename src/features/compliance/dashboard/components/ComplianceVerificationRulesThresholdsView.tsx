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
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ComplianceCreateRuleModal from "@/src/features/compliance/dashboard/components/ComplianceCreateRuleModal";
import {
  getComplianceRules,
  type ComplianceRuleRecord,
} from "@/src/features/compliance/dashboard/api";
import {
  COMPLIANCE_RISK_RULE_CARDS,
  COMPLIANCE_THRESHOLD_CARDS,
  type ComplianceRiskRuleCard,
  type ComplianceThresholdCard,
} from "@/src/features/compliance/dashboard/mock";
import { showToast } from "@/src/store/toast.store";

const CATEGORY_ICON: Record<string, React.ReactNode> = {
  eia: <EnvironmentOutlined />,
  esg: <WarningOutlined />,
  community: <GlobalOutlined />,
  export: <FilePdfOutlined />,
};

type RuleCategorySummary = { value: string; label: string; count: number };

function RuleCategoryCard({ category }: { category: RuleCategorySummary }) {
  return (
    <article className="rounded-[22px] border border-[#dde5ef] bg-white px-5 py-5 shadow-[0_22px_48px_-44px_rgba(16,30,61,0.45)]">
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-[16px] border border-[#e8edf4] bg-[#fbfcfe] text-[21px] text-[#2f3541]">
          {CATEGORY_ICON[category.value] ?? <FilePdfOutlined />}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-medium leading-6 text-[#2a2f39]">
            {category.label}
          </h3>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2 text-[12px] text-[#9aa2b0]">
        <span className="h-2.5 w-2.5 rounded-full bg-[#1db32b]" />
        {category.count} active rule{category.count === 1 ? "" : "s"}
      </div>
    </article>
  );
}

function RuleStatusPill({ status }: { status: string }) {
  const isActive = status.toLowerCase() === "active";
  return (
    <span
      className={
        isActive
          ? "inline-flex rounded-full border border-[#bdeec9] bg-[#e9faef] px-3 py-1 text-[11px] font-semibold text-[#1ea43b]"
          : "inline-flex rounded-full border border-[#e5e8ef] bg-[#f6f7fa] px-3 py-1 text-[11px] font-semibold text-[#8a92a1]"
      }
    >
      {status}
    </span>
  );
}

function formatTriggerConditions(rule: ComplianceRuleRecord) {
  if (!rule.trigger_conditions.length) return "—";
  return rule.trigger_conditions
    .map((c) => `${c.field} ${c.operator} ${c.value}${c.unit ? ` ${c.unit}` : ""}`)
    .join("; ");
}

function ActiveRulesTable({
  rows,
  isLoading,
  onEditRule,
}: {
  rows: ComplianceRuleRecord[];
  isLoading: boolean;
  onEditRule: (ruleId: string) => void;
}) {
  return (
    <section className="rounded-[16px] border border-[#dde5ef] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)] sm:p-6">
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
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-[14px] text-[#8a92a1]">
                    Loading rules…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-[14px] text-[#8a92a1]">
                    No compliance rules yet. Click &quot;Create New Rule&quot; to add your first one.
                  </td>
                </tr>
              ) : (
                rows.map((row, index) => (
                  <tr
                    key={row.id}
                    className={index % 2 === 0 ? "bg-white" : "bg-[#fcfdff]"}
                  >
                    <td className="border-b border-[#edf1f6] px-5 py-5">
                      <div className="text-[16px] font-medium leading-6 text-[#2a2f39]">
                        {row.name}
                      </div>
                    </td>
                    <td className="border-b border-[#edf1f6] px-5 py-5 text-[16px] text-[#7c8493]">
                      {row.category_label}
                    </td>
                    <td className="border-b border-[#edf1f6] px-5 py-5 text-[16px] text-[#7c8493]">
                      {formatTriggerConditions(row)}
                    </td>
                    <td className="border-b border-[#edf1f6] px-5 py-5 text-[16px] text-[#4d5565]">
                      {row.action || "—"}
                    </td>
                    <td className="border-b border-[#edf1f6] px-5 py-5">
                      <RuleStatusPill status={row.status} />
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
                ))
              )}
            </tbody>
          </table>
        </div>

        {rows.length > 0 ? (
          <div className="flex items-center justify-between border-t border-[#edf1f6] px-6 py-4 text-[13px] text-[#8a92a1]">
            <span>Showing {rows.length} rule{rows.length === 1 ? "" : "s"}</span>
          </div>
        ) : null}
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
  const rulesQ = useQuery({
    queryKey: ["complianceRules"],
    queryFn: getComplianceRules,
    retry: false,
  });
  const rawRules = rulesQ.data?.data;
  const ruleRows: ComplianceRuleRecord[] = useMemo(
    () => (Array.isArray(rawRules) ? rawRules : rawRules?.results ?? []),
    [rawRules],
  );

  const categorySummaries = useMemo<RuleCategorySummary[]>(() => {
    const byCategory = new Map<string, RuleCategorySummary>();
    for (const rule of ruleRows) {
      const existing = byCategory.get(rule.category);
      if (existing) {
        existing.count += 1;
      } else {
        byCategory.set(rule.category, { value: rule.category, label: rule.category_label, count: 1 });
      }
    }
    return Array.from(byCategory.values());
  }, [ruleRows]);

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
              <h1 className="text-[28px] font-bold tracking-[-0.03em] text-[#2a2f39]">
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
                className="inline-flex h-11 items-center gap-2 rounded-[10px] border border-[#e1e5ee] bg-white px-4 text-[13px] font-medium text-[#2f3541] transition-colors hover:bg-[#f7f9fc]"
              >
                <ClockCircleOutlined />
                View Rule History
              </button>
              <button
                type="button"
                onClick={() => setIsCreateRuleModalOpen(true)}
                className="inline-flex h-11 items-center gap-3 rounded-[10px] bg-[#14244a] px-4 text-[13px] font-semibold !text-white transition-colors hover:bg-[#182c57]"
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
            {categorySummaries.length === 0 ? (
              <p className="text-[13px] text-[#8a92a1]">No rules created yet.</p>
            ) : (
              categorySummaries.map((category) => (
                <RuleCategoryCard key={category.value} category={category} />
              ))
            )}
          </div>
        </section>

        <ActiveRulesTable
          rows={ruleRows}
          isLoading={rulesQ.isLoading}
          onEditRule={() => showToast("Editing rules isn't available yet.", "info")}
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
    </>
  );
}
