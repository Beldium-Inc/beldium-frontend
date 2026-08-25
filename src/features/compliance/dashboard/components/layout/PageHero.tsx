import Link from "next/link";
import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
import type { DashboardPersona, ComplianceView } from "@/src/features/compliance/dashboard/types";
import { primaryActionStyle } from "@/src/features/compliance/dashboard/lib/style";

export default function PageHero({
  persona,
  complianceView = "dashboard",
}: {
  persona: DashboardPersona;
  complianceView?: ComplianceView;
}) {
  const isComplianceReviewsView =
    persona === "compliance" && complianceView === "reviews";
  const isComplianceNotificationsView = complianceView === "notifications";
  const isRegulatoryAlertsView = complianceView === "regulatory-alerts";
  const isAdminMinerPipelineView =
    persona === "admin" && complianceView === "miner-pipeline";
  const isAdminPartnerDirectoryView =
    persona === "admin" && complianceView === "partner-directory";
  const isAdminRegulatoryReadinessView =
    persona === "admin" && complianceView === "regulatory-readiness";
  const showBackAction =
    isComplianceReviewsView ||
    isComplianceNotificationsView ||
    isRegulatoryAlertsView ||
    isAdminMinerPipelineView ||
    isAdminPartnerDirectoryView ||
    isAdminRegulatoryReadinessView;

  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-4">
        {/* <WorkspaceSwitch persona={persona} /> */}
        <div>
          <h1 className="text-[24px] font-semibold tracking-[-0.03em] text-[#2a2f39]">
            {isComplianceReviewsView
              ? "Reviews"
              : isComplianceNotificationsView
                ? "Notifications"
                : isRegulatoryAlertsView
                  ? "Regulatory Alerts"
                  : isAdminMinerPipelineView
                    ? "Miner Pipeline"
                    : isAdminPartnerDirectoryView
                      ? "Partner Directory"
                      : isAdminRegulatoryReadinessView
                        ? "Regulatory Readiness"
                        : persona === "compliance"
                          ? "Your workspace"
                          : "Dashboard"}
          </h1>
          <p className="mt-1.5 max-w-[720px] text-[13px] text-[#7a8291]">
            {isComplianceReviewsView
              ? "Review every compliance task from the full list without losing the workspace context."
              : isComplianceNotificationsView
                ? "Active compliance signals requiring review or action."
                : isRegulatoryAlertsView
                  ? "Monitor regulatory risks, compliance breaches, expiring obligations, and escalated cases across all registered mining operations."
                  : isAdminMinerPipelineView
                    ? "Review onboarding readiness, document status, and reviewer workload at a glance."
                    : isAdminPartnerDirectoryView
                      ? "Find and assign accredited environmental, legal, ESG, and government liaison partners."
                      : isAdminRegulatoryReadinessView
                        ? "Track, retain, and export compliance activity for legal and regulatory accountability."
                        : persona === "admin"
                        ? "Track miner onboarding, reviewer assignments, and regulatory readiness from a single command center."
                        : "Everything assigned to you: open claims, active reviews, and compliance quality, in one place."}
          </p>
        </div>
      </div>

      {/* <Link
        href={
          showBackAction
            ? `/compliancedashboard?persona=${persona}`
            : "#"
        }
        className="relative inline-flex h-[42px] items-center justify-center gap-2 rounded-[12px] bg-[#14244a] px-5 text-[13px] font-semibold !text-white shadow-[0_18px_36px_-24px_rgba(20,36,74,0.8)] transition-transform hover:-translate-y-0.5"
        style={primaryActionStyle}
      >
        {showBackAction ? (
          <>
            <ArrowLeftOutlined />
            Back to workspace
          </>
        ) : (
          <>
            Open Queue
            <ArrowRightOutlined />
            <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#ff4726]" />
          </>
        )}
      </Link> */}
    </div>
  );
}

