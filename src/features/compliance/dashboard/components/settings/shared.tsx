"use client";

import {
  ArrowRightOutlined,
  ArrowLeftOutlined,
  EnvironmentOutlined,
  SafetyOutlined,
  GlobalOutlined,
  FileSearchOutlined,
  AppstoreOutlined,
  EditOutlined,
  WarningFilled,
  ClockCircleOutlined,
  RiseOutlined,
} from "@ant-design/icons";
import type {
  StatusBadge,
  ComplianceRuleCategory,
  ComplianceRuleRow,
  ComplianceDocumentRequirementRow,
  ComplianceDataControlCard,
  ComplianceThresholdCard,
  ComplianceRiskRuleCard,
} from "@/src/features/compliance/dashboard/mock";
import { classNames } from "@/src/features/compliance/dashboard/lib/style";

export const compactToneStyles: Record<StatusBadge["tone"], string> = {
  green: "border border-[#caebd1] bg-[#ebfaef] text-[#1ea43b]",
  amber: "border border-[#f6dfb3] bg-[#fff7e7] text-[#df8b19]",
  red: "border border-[#f6d2d3] bg-[#fff1f2] text-[#ef2f32]",
  slate: "border border-[#e4e8f0] bg-[#f7f9fc] text-[#7a8291]",
  mint: "border border-[#c9efe5] bg-[#ebfbf5] text-[#119c78]",
  cyan: "border border-[#d8ecf4] bg-[#eff8fb] text-[#2387a3]",
  rose: "border border-[#f8d7e6] bg-[#fff0f7] text-[#db2777]",
};

export function CompactStatusTag({
  label,
  tone,
  uppercase = false,
}: {
  label: string;
  tone: StatusBadge["tone"];
  uppercase?: boolean;
}) {
  return (
    <span
      className={classNames(
        "inline-flex items-center justify-center rounded-[10px] px-3 py-1.5 text-[12px] font-semibold",
        uppercase && "uppercase tracking-[0.05em]",
        compactToneStyles[tone],
      )}
    >
      {label}
    </span>
  );
}

export function ComplianceSettingsBreadcrumbs({
  currentLabel,
}: {
  currentLabel: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-[15px] text-[#8a92a1]">
      <span>Settings</span>
      <ArrowRightOutlined className="text-[12px]" />
      <span className="font-medium text-[#5d6675]">{currentLabel}</span>
    </div>
  );
}

export function ComplianceRuleCategoryIcon({
  icon,
}: {
  icon: ComplianceRuleCategory["icon"];
}) {
  const sharedClassName =
    "flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#f7f9fc] text-[22px] text-[#2e3441]";

  switch (icon) {
    case "environmental":
      return (
        <span className={sharedClassName}>
          <EnvironmentOutlined />
        </span>
      );
    case "framework":
      return (
        <span className={sharedClassName}>
          <SafetyOutlined />
        </span>
      );
    case "community":
      return (
        <span className={sharedClassName}>
          <GlobalOutlined />
        </span>
      );
    case "trade":
    default:
      return (
        <span className={sharedClassName}>
          <FileSearchOutlined />
        </span>
      );
  }
}

export function ComplianceRuleCategoryCard({
  category,
}: {
  category: ComplianceRuleCategory;
}) {
  return (
    <div className="rounded-[20px] border border-[#dde3ed] bg-white p-4 shadow-[0_18px_36px_-34px_rgba(16,30,61,0.38)]">
      <div className="flex items-start gap-4">
        <ComplianceRuleCategoryIcon icon={category.icon} />
        <div className="min-w-0">
          <div className="text-[15px] font-semibold text-[#2a2f39]">
            {category.title}
          </div>
          <div className="mt-2 text-[13px] leading-5 text-[#8a92a1]">
            {category.description}
          </div>
        </div>
      </div>

      <div className="mt-5 inline-flex items-center gap-2 text-[13px] text-[#a0a7b5]">
        <span className="h-2.5 w-2.5 rounded-full bg-[#1fb538]" />
        <span>{category.activeRules} active rules</span>
      </div>
    </div>
  );
}

export function ComplianceSettingsTable({
  rows,
  onEditRule,
}: {
  rows: ComplianceRuleRow[];
  onEditRule: (ruleId: string) => void;
}) {
  return (
    <section className="rounded-[32px] border border-[#e4e9f1] bg-white p-5 shadow-[0_28px_60px_-48px_rgba(16,30,61,0.35)] sm:p-6">
      <div className="flex items-center gap-3 text-[18px] font-semibold text-[#2a2f39]">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef4ff] text-[#2661d8]">
          <AppstoreOutlined />
        </span>
        Active Compliance Rules
      </div>

      <div className="mt-5 overflow-hidden rounded-[20px] border border-[#dde3ed]">
        <div className="overflow-x-auto">
          <table className="min-w-[1120px] w-full border-separate border-spacing-0 text-left">
            <thead>
              <tr className="bg-[#f8fafc] text-[15px] font-medium text-[#2f3541]">
                <th className="border-b border-[#e5e9f1] px-4 py-4">Rule Name</th>
                <th className="border-b border-[#e5e9f1] px-4 py-4">Category</th>
                <th className="border-b border-[#e5e9f1] px-4 py-4">
                  Trigger Condition
                </th>
                <th className="border-b border-[#e5e9f1] px-4 py-4">Action</th>
                <th className="border-b border-[#e5e9f1] px-4 py-4">Status</th>
                <th className="border-b border-[#e5e9f1] px-4 py-4 text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={row.id}
                  className={classNames(
                    "text-[15px] text-[#5d6675]",
                    index % 2 === 0 ? "bg-white" : "bg-[#fcfdff]",
                  )}
                >
                  <td className="border-b border-[#edf1f7] px-4 py-5">
                    <div className="font-semibold text-[#2a2f39]">{row.name}</div>
                    <div className="mt-1 text-[12px] text-[#9aa1af]">
                      {row.version}
                    </div>
                  </td>
                  <td className="border-b border-[#edf1f7] px-4 py-5">
                    {row.category}
                  </td>
                  <td className="border-b border-[#edf1f7] px-4 py-5">
                    <div className="max-w-[250px] truncate">
                      {row.triggerCondition}
                    </div>
                  </td>
                  <td className="border-b border-[#edf1f7] px-4 py-5">
                    <div className="max-w-[230px] truncate">{row.action}</div>
                  </td>
                  <td className="border-b border-[#edf1f7] px-4 py-5">
                    <CompactStatusTag
                      label={row.status.label}
                      tone={row.status.tone}
                    />
                  </td>
                  <td className="border-b border-[#edf1f7] px-4 py-5 text-right">
                    <button
                      type="button"
                      onClick={() => onEditRule(row.id)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dde3ed] bg-white text-[16px] text-[#6f7786] transition-colors hover:bg-[#f8fafc]"
                    >
                      <EditOutlined />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4 border-t border-[#edf1f7] px-5 py-4 text-[14px] text-[#8a92a1] sm:flex-row sm:items-center sm:justify-between">
          <span>(Displaying {rows.length} per page)</span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-[12px] border border-[#dde3ed] bg-white px-4 text-[#7a8291]"
            >
              <ArrowLeftOutlined />
              Previous
            </button>
            {[1, 2, 3, 8, 9, 10].map((page, index) => (
              <button
                key={`${page}-${index}`}
                type="button"
                className={classNames(
                  "inline-flex h-10 min-w-10 items-center justify-center rounded-[10px] border px-3 text-[14px]",
                  page === 1
                    ? "border-[#dce3ef] bg-[#f7f9fc] text-[#2a2f39]"
                    : "border-transparent bg-transparent text-[#7a8291]",
                )}
              >
                {page}
              </button>
            ))}
            <span className="px-1 text-[#a0a7b5]">...</span>
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-[12px] border border-[#dde3ed] bg-white px-4 text-[#2f3541]"
            >
              Next
              <ArrowRightOutlined />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ComplianceDocumentRequirementsTable({
  rows,
  onEditDocument,
}: {
  rows: ComplianceDocumentRequirementRow[];
  onEditDocument: () => void;
}) {
  return (
    <section className="rounded-[32px] border border-[#e4e9f1] bg-white p-5 shadow-[0_28px_60px_-48px_rgba(16,30,61,0.35)] sm:p-6">
      <div className="flex items-center gap-3 text-[18px] font-semibold text-[#2a2f39]">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef4ff] text-[#2661d8]">
          <FileSearchOutlined />
        </span>
        Compliance Document Requirements
      </div>

      <div className="mt-5 overflow-hidden rounded-[20px] border border-[#dde3ed]">
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full border-separate border-spacing-0 text-left">
            <thead>
              <tr className="bg-[#f8fafc] text-[15px] font-medium text-[#2f3541]">
                <th className="border-b border-[#e5e9f1] px-4 py-4">
                  Document Type
                </th>
                <th className="border-b border-[#e5e9f1] px-4 py-4">Required</th>
                <th className="border-b border-[#e5e9f1] px-4 py-4">Expiry Rule</th>
                <th className="border-b border-[#e5e9f1] px-4 py-4">Status</th>
                <th className="border-b border-[#e5e9f1] px-4 py-4 text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={row.id}
                  className={classNames(
                    "text-[15px] text-[#5d6675]",
                    index % 2 === 0 ? "bg-white" : "bg-[#fcfdff]",
                  )}
                >
                  <td className="border-b border-[#edf1f7] px-4 py-5">
                    <div className="font-semibold text-[#2a2f39]">
                      {row.documentType}
                    </div>
                  </td>
                  <td className="border-b border-[#edf1f7] px-4 py-5">
                    {row.required}
                  </td>
                  <td className="border-b border-[#edf1f7] px-4 py-5">
                    {row.expiryRule}
                  </td>
                  <td className="border-b border-[#edf1f7] px-4 py-5">
                    <CompactStatusTag
                      label={row.status.label}
                      tone={row.status.tone}
                    />
                  </td>
                  <td className="border-b border-[#edf1f7] px-4 py-5 text-right">
                    <button
                      type="button"
                      onClick={onEditDocument}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dde3ed] bg-white text-[16px] text-[#6f7786] transition-colors hover:bg-[#f8fafc]"
                    >
                      <EditOutlined />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export function ComplianceDataControlCardView({
  card,
}: {
  card: ComplianceDataControlCard;
}) {
  return (
    <div className="rounded-[28px] border border-[#e7ebf2] bg-white p-5 shadow-[0_28px_60px_-48px_rgba(16,30,61,0.35)]">
      <div className="text-[18px] font-medium text-[#3a4150]">{card.title}</div>
      <div className="mt-5 h-px bg-[#edf1f7]" />
      <div className="mt-6 text-[42px] font-semibold tracking-[-0.05em] text-[#2a2f39]">
        {card.value}
      </div>
    </div>
  );
}

export function ComplianceThresholdCardView({
  card,
}: {
  card: ComplianceThresholdCard;
}) {
  return (
    <div className="rounded-[28px] border border-[#e7ebf2] bg-white p-5 shadow-[0_28px_60px_-48px_rgba(16,30,61,0.35)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#f4f7fb] text-[20px] text-[#677080]">
            {card.icon === "frequency" ? <ClockCircleOutlined /> : <RiseOutlined />}
          </span>
          <div className="text-[18px] font-medium text-[#2a2f39]">
            {card.title}
          </div>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dde3ed] bg-white text-[16px] text-[#6f7786] transition-colors hover:bg-[#f8fafc]"
        >
          <EditOutlined />
        </button>
      </div>

      <div className="mt-6 rounded-[18px] bg-[#f7f9fc] px-5 py-6">
        <span className="text-[56px] font-semibold tracking-[-0.05em] text-[#2a2f39]">
          {card.value}
        </span>
        <span className="ml-2 text-[22px] text-[#8a92a1]">{card.unit}</span>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 text-[13px] text-[#9aa1af]">
        <span className="font-medium uppercase tracking-[0.06em] text-[#adb4c0]">
          Automated Action:
        </span>
        <CompactStatusTag
          label={card.automatedAction}
          tone={card.automatedActionTone}
          uppercase
        />
      </div>

      <div className="mt-4 text-[16px] text-[#4f5664]">{card.summary}</div>

      <div className="mt-6 h-px bg-[#edf1f7]" />

      <div className="mt-4 text-[12px] uppercase tracking-[0.05em] text-[#b0b6c2]">
        {card.updatedBy}
      </div>
    </div>
  );
}

export function ComplianceRiskRuleCardView({
  card,
}: {
  card: ComplianceRiskRuleCard;
}) {
  const toneClassName =
    card.severityTone === "red"
      ? "border-[#f3d1d2] bg-[#fff7f7]"
      : "border-[#f0dfbf] bg-[#fffaf2]";
  const iconToneClassName =
    card.severityTone === "red"
      ? "bg-[#fff0f1] text-[#ef2f32]"
      : "bg-[#fff6e3] text-[#df8b19]";

  return (
    <div
      className={classNames(
        "rounded-[24px] border p-5 shadow-[0_24px_50px_-44px_rgba(16,30,61,0.4)]",
        toneClassName,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className={classNames(
              "flex h-12 w-12 items-center justify-center rounded-[16px] text-[22px]",
              iconToneClassName,
            )}
          >
            <WarningFilled />
          </span>
          <div>
            <div className="text-[18px] font-medium text-[#2a2f39]">
              {card.title}
            </div>
            <div className="mt-2">
              <CompactStatusTag
                label={card.severityLabel}
                tone={card.severityTone}
                uppercase
              />
            </div>
          </div>
        </div>

        {card.active ? (
          <span className="mt-1 h-3 w-3 rounded-full bg-[#1fb538]" />
        ) : null}
      </div>

      <div className="mt-6">
        <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#b0b6c2]">
          Trigger
        </div>
        <div className="mt-3 text-[17px] leading-7 text-[#505869]">
          {card.trigger}
        </div>
      </div>

      <div className="mt-6 h-px bg-[rgba(160,167,181,0.22)]" />

      <div className="mt-6">
        <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#b0b6c2]">
          Action
        </div>
        <div className="mt-3 text-[17px] leading-7 text-[#505869]">
          {card.action}
        </div>
      </div>
    </div>
  );
}

