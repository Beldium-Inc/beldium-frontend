"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  ApartmentOutlined,
  ArrowRightOutlined,
  BellOutlined,
  CheckCircleOutlined,
  FilePdfOutlined,
  GlobalOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  SolutionOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";
import { showToast } from "@/src/store/toast.store";

type DashboardPersona = "admin" | "compliance";

type SettingsSummaryCard = {
  label: string;
  value: string;
  icon: ReactNode;
};

type SettingsHubCard = {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  footer: string;
  view?:
    | "organization-profile"
    | "regulatory-scope"
    | "teams-roles"
    | "verification-rules-thresholds"
    | "documents-data-controls"
    | "notifications-alerts"
    | "security-access-controls"
    | "audits-legal-records";
};

const summaryCards: SettingsSummaryCard[] = [
  {
    label: "Active users",
    value: "12",
    icon: <UsergroupAddOutlined />,
  },
  {
    label: "Approvals",
    value: "3",
    icon: <CheckCircleOutlined />,
  },
];

const settingsCards: SettingsHubCard[] = [
  {
    id: "organization-profile",
    title: "Organization Profile",
    description: "Entity details, office, and global identifiers",
    icon: <ApartmentOutlined />,
    footer: "Last updated by Admin O. Bello, Oct 12",
    view: "organization-profile",
  },
  {
    id: "regulatory-scope",
    title: "Regulatory Scope",
    description: "Mineral type, extraction jurisdiction, and legal information",
    icon: <GlobalOutlined />,
    footer: "Last updated by Admin O. Bello, Oct 12",
    view: "regulatory-scope",
  },
  {
    id: "teams-roles",
    title: "Teams & Roles",
    description: "User permissions, access hierarchy, and role definitions",
    icon: <UsergroupAddOutlined />,
    footer: "Last updated by Admin O. Bello, Oct 12",
    view: "teams-roles",
  },
  {
    id: "verification-rules-thresholds",
    title: "Verification Rules & Thresholds",
    description: "Automated compliance logic and validations",
    icon: <SafetyCertificateOutlined />,
    footer: "Last updated by Admin O. Bello, Oct 12",
    view: "verification-rules-thresholds",
  },
  {
    id: "document-data-controls",
    title: "Document & Data Controls",
    description: "Data retention periods and document formats",
    icon: <FilePdfOutlined />,
    footer: "Last updated by Admin O. Bello, Oct 12",
    view: "documents-data-controls",
  },
  {
    id: "notifications-alerts",
    title: "Notifications & Alerts",
    description: "Alert routing, escalation hierarchies, and priority levels",
    icon: <BellOutlined />,
    footer: "Last updated by Admin O. Bello, Oct 12",
    view: "notifications-alerts",
  },
  {
    id: "security-access-controls",
    title: "Security & Access Controls",
    description: "IP restrictions, session logs, and MFA",
    icon: <LockOutlined />,
    footer: "Last updated by Admin O. Bello, Oct 12",
    view: "security-access-controls",
  },
  {
    id: "audits-legal-records",
    title: "Audits & Legal Records",
    description: "Immutable chain of logs and historical compliance records",
    icon: <SolutionOutlined />,
    footer: "Last updated by Admin O. Bello, Oct 12",
    view: "audits-legal-records",
  },
];

const settingsCardClassName =
  "group flex h-full flex-col rounded-[28px] border border-[#e8ecf4] bg-white p-5 text-left shadow-[0_24px_60px_-48px_rgba(16,30,61,0.45)] transition-all hover:-translate-y-0.5 hover:border-[#d7e0f0] hover:shadow-[0_32px_70px_-44px_rgba(16,30,61,0.38)]";

function SummaryCard({ card }: { card: SettingsSummaryCard }) {
  return (
    <article className="rounded-[22px] border border-[#e8ecf4] bg-white px-5 py-4 shadow-[0_20px_45px_-42px_rgba(16,30,61,0.55)]">
      <div className="flex items-center gap-3 text-[15px] text-[#7b8392]">
        <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#eef4ff] text-[20px] text-[#2463eb]">
          {card.icon}
        </span>
        <span>{card.label}</span>
      </div>

      <div className="mt-5 text-[34px] font-semibold tracking-[-0.06em] text-[#252b37]">
        {card.value}
      </div>
    </article>
  );
}

function SettingsCardItem({
  card,
  persona,
  onNavigate,
}: {
  card: SettingsHubCard;
  persona: DashboardPersona;
  onNavigate?: () => void;
}) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-[16px] bg-[#eef4ff] text-[25px] text-[#2463eb]">
          {card.icon}
        </span>
        {card.view ? (
          <Link
            href={`/compliancedashboard?persona=${persona}&view=${card.view}`}
            onClick={onNavigate}
            aria-label={`Open ${card.title}`}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#e6ebf4] text-[18px] text-[#2f3541] transition-colors group-hover:border-[#cfd9e8] group-hover:bg-[#f8fafc]"
          >
            <ArrowRightOutlined />
          </Link>
        ) : (
          <button
            type="button"
            onClick={() =>
              showToast(
                `${card.title} is still using mock data. API wiring is pending.`,
                "info",
              )
            }
            aria-label={`Open ${card.title}`}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#e6ebf4] text-[18px] text-[#2f3541] transition-colors group-hover:border-[#cfd9e8] group-hover:bg-[#f8fafc]"
          >
            <ArrowRightOutlined />
          </button>
        )}
      </div>

      <div className="mt-8 flex-1">
        <h2 className="text-[20px] font-semibold tracking-[-0.05em] text-[#252b37]">
          {card.title}
        </h2>
        <p className="mt-2 text-[15px] leading-7 text-[#727b8c]">
          {card.description}
        </p>
      </div>

      <div className="mt-7 border-t border-[#edf1f6] pt-5 text-[12px] font-medium uppercase tracking-[0.12em] text-[#9aa2b0]">
        {card.footer}
      </div>
    </>
  );

  return (
    <article className={`${settingsCardClassName} w-full`}>
      {content}
    </article>
  );
}

export default function ComplianceSettingsHomeView({
  persona,
  onNavigate,
}: {
  persona: DashboardPersona;
  onNavigate?: () => void;
}) {
  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[32px] border border-[#e8ecf4] bg-white shadow-[0_28px_60px_-48px_rgba(16,30,61,0.35)]">
        <div className="space-y-8 px-6 py-8 sm:px-8 sm:py-10 xl:px-10">
          <div>
            <h1 className="text-[38px] font-semibold tracking-[-0.06em] text-[#2a2f39] sm:text-[46px]">
              Settings
            </h1>
            <p className="mt-3 max-w-[780px] text-[16px] leading-7 text-[#70798a]">
              Manage institutional configuration, rules, and access controls.
            </p>
          </div>

          <div className="grid gap-4 md:max-w-[760px] md:grid-cols-2">
            {summaryCards.map((card) => (
              <SummaryCard key={card.label} card={card} />
            ))}
          </div>
        </div>

        <div className="border-t border-[#edf1f6]" />
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {settingsCards.map((card) => (
          <SettingsCardItem
            key={card.id}
            card={card}
            persona={persona}
            onNavigate={onNavigate}
          />
        ))}
      </section>
    </div>
  );
}
