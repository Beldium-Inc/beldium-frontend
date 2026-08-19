"use client";

import type { DashboardPersona, ComplianceView } from "@/src/features/compliance/dashboard/types";
import ComplianceSettingsHomeView from "@/src/features/compliance/dashboard/components/ComplianceSettingsHomeView";
import ComplianceOrganizationProfileView from "@/src/features/compliance/dashboard/components/ComplianceOrganizationProfileView";
import ComplianceRegulatoryScopeView from "@/src/features/compliance/dashboard/components/ComplianceRegulatoryScopeView";
import ComplianceTeamsRolesView from "@/src/features/compliance/dashboard/components/ComplianceTeamsRolesView";
import ComplianceVerificationRulesThresholdsView from "@/src/features/compliance/dashboard/components/ComplianceVerificationRulesThresholdsView";
import ComplianceSecurityAccessControlsView from "@/src/features/compliance/dashboard/components/ComplianceSecurityAccessControlsView";
import ComplianceAuditsLegalRecordsView from "@/src/features/compliance/dashboard/components/ComplianceAuditsLegalRecordsView";
import NotificationsAlertsView from "@/src/features/compliance/dashboard/components/settings/NotificationsAlertsView";
import DocumentsDataControlsView from "@/src/features/compliance/dashboard/components/settings/DocumentsDataControlsView";

export default function ComplianceSettingsView({
  persona,
  view,
  onNavigate,
}: {
  persona: DashboardPersona;
  view: Extract<
    ComplianceView,
    | "settings"
    | "organization-profile"
    | "regulatory-scope"
    | "teams-roles"
    | "verification-rules-thresholds"
    | "documents-data-controls"
    | "notifications-alerts"
    | "security-access-controls"
    | "audits-legal-records"
  >;
  onNavigate?: () => void;
}) {
  if (view === "settings") {
    return <ComplianceSettingsHomeView persona={persona} onNavigate={onNavigate} />;
  }

  if (view === "organization-profile") {
    return <ComplianceOrganizationProfileView />;
  }

  if (view === "regulatory-scope") {
    return <ComplianceRegulatoryScopeView />;
  }

  if (view === "teams-roles") {
    return <ComplianceTeamsRolesView />;
  }

  if (view === "verification-rules-thresholds") {
    return <ComplianceVerificationRulesThresholdsView />;
  }

  if (view === "notifications-alerts") {
    return <NotificationsAlertsView />;
  }

  if (view === "security-access-controls") {
    return <ComplianceSecurityAccessControlsView />;
  }

  if (view === "audits-legal-records") {
    return <ComplianceAuditsLegalRecordsView />;
  }

  return <DocumentsDataControlsView />;
}

