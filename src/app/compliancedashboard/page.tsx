"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import {
  type AdminPipelineRow,
  ADMIN_PIPELINE_ROWS,
  PARTNER_DIRECTORY_ROWS,
  REGULATORY_READINESS_METRICS,
  REGULATORY_RISK_STATES,
  REGULATORY_STATUS_DISTRIBUTION,
  COMPLIANCE_NOTIFICATIONS,
} from "@/src/features/compliance/dashboard/mock";
import {
  claimComplianceReview,
  getComplianceDashboardSummary,
  getComplianceMinerDetail,
  getComplianceMyTasks,
  getComplianceReviewDetail,
  getComplianceReviewQueue,
  getComplianceReviews,
  getComplianceReviewDashboardCards,
  submitComplianceReviewWorkflow,
  type ComplianceReviewItem,
} from "@/src/features/compliance/dashboard/api";
import { showToast } from "@/src/store/toast.store";
import { RegulatoryAlertsView } from "@/src/features/compliance/dashboard/components/RegulatoryAlertsView";
import type {
  ComplianceView,
  DashboardPersona,
  ComplianceReviewSelection,
  ReviewActionType,
  ComplianceMinerDetailState,
} from "@/src/features/compliance/dashboard/types";
import {
  filterBySearchTerm,
  mapComplianceAlert,
  mapComplianceMetrics,
  mapAdminCardMetrics,
  mapAdminReviewRows,
  mapComplianceQueueRows,
  mapComplianceActiveTaskCards,
  buildSelectionFromItem,
  buildSelectionFromAlert,
  getWorkflowStatus,
  getWorkflowMessage,
} from "@/src/features/compliance/dashboard/lib/mappers";
import { getApiErrorMessage } from "@/src/features/compliance/dashboard/lib/documents";
import DashboardSidebar from "@/src/features/compliance/dashboard/components/layout/DashboardSidebar";
import DashboardTopBar from "@/src/features/compliance/dashboard/components/layout/DashboardTopBar";
import PageHero from "@/src/features/compliance/dashboard/components/layout/PageHero";
import ComplianceProfileView from "@/src/features/compliance/dashboard/components/profile/ComplianceProfileView";
import ComplianceInstitutionProfileView from "@/src/features/compliance/dashboard/components/profile/ComplianceInstitutionProfileView";
import ComplianceSettingsView from "@/src/features/compliance/dashboard/components/settings/ComplianceSettingsView";
import AdminDashboardView from "@/src/features/compliance/dashboard/components/admin/AdminDashboardView";
import AdminMinerPipelineView from "@/src/features/compliance/dashboard/components/admin/AdminMinerPipelineView";
import AdminMinerDetailView from "@/src/features/compliance/dashboard/components/admin/AdminMinerDetailView";
import AdminPartnerDirectoryView from "@/src/features/compliance/dashboard/components/admin/AdminPartnerDirectoryView";
import AdminRegulatoryReadinessView from "@/src/features/compliance/dashboard/components/admin/AdminRegulatoryReadinessView";
import ComplianceDashboardView from "@/src/features/compliance/dashboard/components/open-task-pool/ComplianceDashboardView";
import ComplianceReviewsView from "@/src/features/compliance/dashboard/components/reviews/ComplianceReviewsView";
import ComplianceReviewDrawer from "@/src/features/compliance/dashboard/components/reviews/ComplianceReviewDrawer";
import ComplianceClaimConflictModal from "@/src/features/compliance/dashboard/components/reviews/ComplianceClaimConflictModal";
import EscalateToSeniorReviewModal from "@/src/features/compliance/dashboard/components/reviews/EscalateToSeniorReviewModal";
import RequestComplianceDocumentModal from "@/src/features/compliance/dashboard/components/reviews/RequestComplianceDocumentModal";
import ComplianceMinerDetailView from "@/src/features/compliance/dashboard/components/miner-detail/ComplianceMinerDetailView";
import ComplianceNotificationsView from "@/src/features/compliance/dashboard/components/notifications/ComplianceNotificationsView";

// Real, empty-safe fallbacks used only while a query hasn't resolved yet -
// never mock/sample data, so the UI never silently shows content that looks
// real but isn't.
const EMPTY_METRIC = { count: 0, percentage_change: { percentage: 0, trend: "neutral" as const } };
const EMPTY_REVIEW_DASHBOARD_CARDS = {
  total_miners_onboarded: EMPTY_METRIC,
  under_review: EMPTY_METRIC,
  compliance_ready: EMPTY_METRIC,
  action_required: EMPTY_METRIC,
};
const EMPTY_SUMMARY_METRIC = { value: 0, change_percent: 0, change_direction: "neutral" as const };
const EMPTY_DASHBOARD_SUMMARY = {
  active_tasks: EMPTY_SUMMARY_METRIC,
  avg_review_time: EMPTY_SUMMARY_METRIC,
  quality_score: EMPTY_SUMMARY_METRIC,
  queue_load: EMPTY_SUMMARY_METRIC,
  latest_alert: null,
};

export default function ComplianceDashboardPage() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const personaParam = searchParams.get("persona");
  const complianceViewParam = searchParams.get("view");
  const persona: DashboardPersona =
    personaParam === "compliance" ? "compliance" : "admin";
  const complianceView: ComplianceView =
    complianceViewParam === "settings"
      ? "settings"
      : complianceViewParam === "organization-profile"
        ? "organization-profile"
      : complianceViewParam === "regulatory-scope"
        ? "regulatory-scope"
      : complianceViewParam === "teams-roles"
        ? "teams-roles"
      : complianceViewParam === "verification-rules-thresholds"
        ? "verification-rules-thresholds"
      : complianceViewParam === "documents-data-controls"
        ? "documents-data-controls"
      : complianceViewParam === "notifications-alerts"
        ? "notifications-alerts"
      : complianceViewParam === "security-access-controls"
        ? "security-access-controls"
      : complianceViewParam === "audits-legal-records"
        ? "audits-legal-records"
      : complianceViewParam === "notifications"
        ? "notifications"
      : complianceViewParam === "regulatory-alerts"
        ? "regulatory-alerts"
      : persona === "admin"
        ? complianceViewParam === "miner-pipeline"
          ? "miner-pipeline"
          : complianceViewParam === "partner-directory"
            ? "partner-directory"
          : complianceViewParam === "regulatory-readiness"
            ? "regulatory-readiness"
            : "dashboard"
      : complianceViewParam === "reviews"
        ? "reviews"
        : complianceViewParam === "compliance-profile"
          ? "compliance-profile"
        : complianceViewParam === "profile"
          ? "profile"
          : "dashboard";
  const isComplianceProfileSurface =
    complianceView === "profile" || complianceView === "compliance-profile";
  const isComplianceSettingsSurface =
    complianceView === "settings" ||
    complianceView === "organization-profile" ||
    complianceView === "regulatory-scope" ||
    complianceView === "teams-roles" ||
    complianceView === "verification-rules-thresholds" ||
    complianceView === "documents-data-controls" ||
    complianceView === "notifications-alerts" ||
    complianceView === "security-access-controls" ||
    complianceView === "audits-legal-records";
  const isComplianceStaticSurface =
    isComplianceProfileSurface || isComplianceSettingsSurface;
  const [now, setNow] = useState(() => Date.now());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReview, setSelectedReview] =
    useState<ComplianceReviewSelection | null>(null);
  const [openedMinerDetail, setOpenedMinerDetail] =
    useState<ComplianceMinerDetailState | null>(null);
  const [claimConflictTask, setClaimConflictTask] =
    useState<ComplianceReviewSelection | null>(null);
  const [claimConflictLoggedAt, setClaimConflictLoggedAt] = useState<Date | null>(
    null,
  );
  const [dismissedAlertKey, setDismissedAlertKey] = useState<string | null>(
    null,
  );
  const [selectedAdminMiner, setSelectedAdminMiner] =
    useState<AdminPipelineRow | null>(null);
  const [escalateModalMiner, setEscalateModalMiner] =
    useState<AdminPipelineRow | null>(null);
  const [requestDocumentModalMiner, setRequestDocumentModalMiner] =
    useState<AdminPipelineRow | null>(null);
  const hasAccessToken =
    typeof window !== "undefined" &&
    Boolean(window.sessionStorage.getItem("accessToken"));

  useEffect(() => {
    if (persona !== "compliance") {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 60000);

    return () => window.clearInterval(timer);
  }, [persona]);

  const adminCardsQ = useQuery({
    queryKey: ["complianceReviewDashboardCards"],
    queryFn: getComplianceReviewDashboardCards,
    enabled: persona === "admin" && !isComplianceSettingsSurface && hasAccessToken,
    retry: false,
  });
  const adminReviewsQ = useQuery({
    queryKey: ["complianceReviews", { page: 1 }],
    queryFn: () => getComplianceReviews({ page: 1, per_page: 10 }),
    enabled:
      ((persona === "admin" && !isComplianceSettingsSurface) ||
        (persona === "compliance" && complianceView === "reviews")) &&
      hasAccessToken,
    retry: false,
  });
  const complianceSummaryQ = useQuery({
    queryKey: ["complianceDashboardSummary"],
    queryFn: getComplianceDashboardSummary,
    enabled:
      persona === "compliance" &&
      !isComplianceStaticSurface &&
      hasAccessToken,
    retry: false,
  });
  const complianceQueueQ = useQuery({
    queryKey: ["complianceReviewQueue", { page: 1 }],
    queryFn: () => getComplianceReviewQueue({ page: 1, per_page: 10 }),
    enabled:
      persona === "compliance" &&
      !isComplianceStaticSurface &&
      hasAccessToken,
    retry: false,
  });
  const complianceMyTasksQ = useQuery({
    queryKey: ["complianceMyTasks", { page: 1 }],
    queryFn: () => getComplianceMyTasks({ page: 1, per_page: 10 }),
    enabled:
      persona === "compliance" &&
      !isComplianceStaticSurface &&
      hasAccessToken,
    retry: false,
  });
  const selectedReviewDetailQ = useQuery({
    queryKey: ["complianceReviewDetail", selectedReview?.reviewId],
    queryFn: () => getComplianceReviewDetail(selectedReview!.reviewId),
    enabled: Boolean(selectedReview?.reviewId) && hasAccessToken,
    retry: false,
  });
  const claimReviewMutation = useMutation({
    mutationFn: claimComplianceReview,
    onSuccess: async (response, variables) => {
      showToast(
        response.message?.trim() || "Review claimed successfully.",
        "success",
      );
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["complianceReviewQueue"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["complianceDashboardSummary"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["complianceReviews"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["complianceMyTasks"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["complianceReviewDetail", variables.pathId],
        }),
      ]);

      await selectedReviewDetailQ.refetch();
      setSelectedReview((current) =>
        current && current.reviewId === variables.pathId
          ? { ...current, claimRequired: false }
          : current,
      );
    },
    onError: (error: unknown) => {
      showToast(
        getApiErrorMessage(error, "Unable to claim this review right now."),
        "error",
      );
    },
  });
  const complianceMinerDetailQ = useQuery({
    queryKey: ["complianceMinerDetail", openedMinerDetail?.selection.minerId],
    queryFn: () =>
      getComplianceMinerDetail(openedMinerDetail!.selection.minerId!),
    enabled:
      Boolean(openedMinerDetail?.selection.minerId) && hasAccessToken,
    retry: false,
  });
  const reviewWorkflowMutation = useMutation({
    mutationFn: submitComplianceReviewWorkflow,
    onSuccess: async (response, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["complianceReviewQueue"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["complianceDashboardSummary"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["complianceReviews"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["complianceMyTasks"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["complianceReviewDetail", variables.reviewId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["complianceMinerDetail"],
        }),
      ]);

      if (variables.action === "reject") {
        showToast(getWorkflowMessage(response, "Task passed successfully."), "success");
        setSelectedReview(null);
        return;
      }

      if (variables.action === "approve") {
        showToast(
          getWorkflowMessage(response, "Review task accepted successfully."),
          "success",
        );
        await selectedReviewDetailQ.refetch();
        return;
      }

      const status = getWorkflowStatus(response);

      if (status === "claimed") {
        setClaimConflictTask(selectedReview);
        setClaimConflictLoggedAt(new Date());
        setSelectedReview(null);
        return;
      }

      if (selectedReview?.minerId) {
        showToast(getWorkflowMessage(response, "Review started successfully."), "success");
        setOpenedMinerDetail({
          selection: selectedReview,
          reviewDetail: selectedReviewDetailQ.data,
        });
        setSelectedReview(null);
        return;
      }

      showToast("Miner detail is unavailable for this review.", "error");
    },
    onError: (error: unknown) => {
      const message = getApiErrorMessage(
        error,
        "Unable to update this review right now.",
      );

      if (
        reviewWorkflowMutation.variables?.action === "start_review" &&
        message.toLowerCase().includes("task must be claim first")
      ) {
        setSelectedReview((current) =>
          current ? { ...current, claimRequired: true } : current,
        );
      }

      showToast(
        message,
        "error",
      );
    },
  });
  const adminMetrics = mapAdminCardMetrics(
    adminCardsQ.data?.data ?? EMPTY_REVIEW_DASHBOARD_CARDS,
  );
  const adminRows = filterBySearchTerm(
    mapAdminReviewRows(
      adminReviewsQ.data?.data?.results ?? [],
    ),
    searchTerm,
    ["minerId", "company", "location"],
  );
  const complianceSummary =
    complianceSummaryQ.data?.data ?? EMPTY_DASHBOARD_SUMMARY;
  const complianceAlert = mapComplianceAlert(complianceSummary.latest_alert);
  const complianceAlertKey = complianceAlert.reviewId ?? "none";
  const isComplianceAlertDismissed = dismissedAlertKey === complianceAlertKey;
  const dismissComplianceAlert = () => {
    setDismissedAlertKey(complianceAlertKey);
  };
  const complianceMetrics = mapComplianceMetrics(complianceSummary);
  const complianceQueueRows = filterBySearchTerm(
    mapComplianceQueueRows(
      complianceQueueQ.data?.data?.results ?? [],
      now,
    ),
    searchTerm,
    ["minerId", "company", "location"],
  );
  const complianceQueuePreviewRows = complianceQueueRows.slice(0, 5);
  const complianceQueueCount =
    complianceQueueQ.data?.data?.count ?? 0;
  const showViewFullQueue = complianceQueueCount > 5;
  const complianceActiveTaskCards = mapComplianceActiveTaskCards(
    complianceMyTasksQ.data?.data?.results ?? [],
  );
  const complianceReviewRows = filterBySearchTerm(
    mapAdminReviewRows(
      adminReviewsQ.data?.data?.results ?? [],
    ),
    searchTerm,
    ["minerId", "company", "location"],
  );
  const reviewLookup = new Map<string, ComplianceReviewItem>();
  for (const item of [
    ...(complianceQueueQ.data?.data?.results ?? []),
    ...(complianceMyTasksQ.data?.data?.results ?? []),
    ...(adminReviewsQ.data?.data?.results ?? []),
  ]) {
    if (!reviewLookup.has(item.id)) {
      reviewLookup.set(item.id, item);
    }
  }

  const activeReviewId = selectedReview?.reviewId;
  const activeReviewAction =
    reviewWorkflowMutation.isPending &&
    reviewWorkflowMutation.variables.reviewId === selectedReview?.reviewId
      ? reviewWorkflowMutation.variables.action
      : claimReviewMutation.isPending &&
          claimReviewMutation.variables.pathId === selectedReview?.reviewId
        ? "claim"
      : undefined;

  const resetCompliancePanels = () => {
    setSelectedReview(null);
    setOpenedMinerDetail(null);
    setClaimConflictTask(null);
    setClaimConflictLoggedAt(null);
  };

  const openReviewPanel = (selection: ComplianceReviewSelection | null) => {
    if (!selection) {
      return;
    }

    if (!hasAccessToken) {
      showToast(
        "Your browser session is not authenticated. Log in again.",
        "error",
      );
      return;
    }

    resetCompliancePanels();
    setSelectedReview(selection);
  };

  const openReviewById = (reviewId: string) => {
    const matchedItem = reviewLookup.get(reviewId);

    openReviewPanel(
      matchedItem
        ? buildSelectionFromItem(matchedItem)
        : {
            reviewId,
            minerCode: reviewId.slice(0, 8).toUpperCase(),
          },
    );
  };

  const openAlertReview = () => {
    openReviewPanel(
      buildSelectionFromAlert(
        complianceAlert,
        complianceAlert.reviewId
          ? reviewLookup.get(complianceAlert.reviewId)
          : undefined,
      ),
    );
  };

  const handleReviewAction = (action: ReviewActionType) => {
    if (!selectedReview) {
      return;
    }

    if (action === "open_detail") {
      if (!selectedReview.minerId) {
        showToast("Miner detail is unavailable for this review.", "error");
        return;
      }

      setOpenedMinerDetail({
        selection: selectedReview,
        reviewDetail: selectedReviewDetailQ.data,
      });
      setSelectedReview(null);
      return;
    }

    if (action === "claim") {
      claimReviewMutation.mutate({
        pathId: selectedReview.reviewId,
        bodyId: selectedReview.reviewId,
      });
      return;
    }

    reviewWorkflowMutation.mutate({
      reviewId: selectedReview.reviewId,
      action,
      ...(action === "reject" ? { reason: "Not Okay" } : {}),
    });
  };

  const showMinerDetailView =
    Boolean(openedMinerDetail) && !isComplianceStaticSurface;

  return (
    <div className="h-screen overflow-hidden bg-[#f5f7fb] text-[#202534]">
      <div className="flex h-screen">
        <DashboardSidebar persona={persona} complianceView={complianceView} />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <DashboardTopBar
            key={`${persona}-${complianceView}`}
            persona={persona}
            complianceView={complianceView}
            onMenuNavigate={resetCompliancePanels}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
          />

          <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 xl:px-8">
            <div className="mx-auto max-w-[1600px] space-y-6">
              {showMinerDetailView && openedMinerDetail ? (
                <ComplianceMinerDetailView
                  selection={openedMinerDetail.selection}
                  reviewDetail={openedMinerDetail.reviewDetail}
                  minerDetail={complianceMinerDetailQ.data}
                  isLoading={complianceMinerDetailQ.isLoading}
                  onBack={() => setOpenedMinerDetail(null)}
                  activeAction={
                    reviewWorkflowMutation.isPending &&
                    reviewWorkflowMutation.variables.reviewId === openedMinerDetail.selection.reviewId &&
                    (reviewWorkflowMutation.variables.action === "approve" ||
                      reviewWorkflowMutation.variables.action === "reject")
                      ? reviewWorkflowMutation.variables.action
                      : undefined
                  }
                  onAction={(action) => {
                    if (action === "request_information") {
                      showToast("Request Information isn't connected to the backend yet.", "error");
                      return;
                    }

                    reviewWorkflowMutation.mutate({
                      reviewId: openedMinerDetail.selection.reviewId,
                      action,
                      ...(action === "reject" ? { reason: "Not Okay" } : {}),
                    });
                  }}
                />
              ) : isComplianceSettingsSurface ? (
                <ComplianceSettingsView
                  persona={persona}
                  view={
                    complianceView === "organization-profile"
                      ? "organization-profile"
                      : complianceView === "regulatory-scope"
                      ? "regulatory-scope"
                      : complianceView === "teams-roles"
                      ? "teams-roles"
                      : complianceView === "documents-data-controls"
                      ? "documents-data-controls"
                      : complianceView === "notifications-alerts"
                        ? "notifications-alerts"
                      : complianceView === "security-access-controls"
                        ? "security-access-controls"
                      : complianceView === "audits-legal-records"
                        ? "audits-legal-records"
                      : complianceView === "verification-rules-thresholds"
                        ? "verification-rules-thresholds"
                      : "settings"
                  }
                  onNavigate={resetCompliancePanels}
                />
              ) : persona === "admin" && complianceView === "miner-pipeline" && selectedAdminMiner ? (
                <AdminMinerDetailView
                  row={selectedAdminMiner}
                  onBack={() => setSelectedAdminMiner(null)}
                  onEscalate={() => setEscalateModalMiner(selectedAdminMiner)}
                  onRequestDocuments={() => setRequestDocumentModalMiner(selectedAdminMiner)}
                />
              ) : persona === "admin" ? (
                <>
                  {complianceView !== "regulatory-alerts" && complianceView !== "reviews" ? (
                    <PageHero persona={persona} complianceView={complianceView} />
                  ) : null}
                  {complianceView === "miner-pipeline" ? (
                    <AdminMinerPipelineView
                      rows={filterBySearchTerm(ADMIN_PIPELINE_ROWS, searchTerm, [
                        "minerId",
                        "company",
                        "location",
                      ])}
                      onSelectMiner={setSelectedAdminMiner}
                    />
                  ) : complianceView === "partner-directory" ? (
                    <AdminPartnerDirectoryView rows={PARTNER_DIRECTORY_ROWS} />
                  ) : complianceView === "regulatory-readiness" ? (
                    <AdminRegulatoryReadinessView
                      metrics={REGULATORY_READINESS_METRICS}
                      states={REGULATORY_RISK_STATES}
                      statusDistribution={REGULATORY_STATUS_DISTRIBUTION}
                    />
                  ) : complianceView === "regulatory-alerts" ? (
                    <RegulatoryAlertsView />
                  ) : complianceView === "notifications" ? (
                    <ComplianceNotificationsView rows={COMPLIANCE_NOTIFICATIONS} />
                  ) : (
                    <AdminDashboardView
                      metrics={adminMetrics}
                      rows={adminRows}
                      activeReviewId={activeReviewId}
                      onOpenReview={openReviewById}
                    />
                  )}
                </>
              ) : complianceView === "compliance-profile" ? (
                <ComplianceInstitutionProfileView />
              ) : complianceView === "profile" ? (
                <ComplianceProfileView />
              ) : (
                <>
                  {complianceView !== "regulatory-alerts" && complianceView !== "reviews" ? (
                    <PageHero persona={persona} complianceView={complianceView} />
                  ) : null}
                  {complianceView === "reviews" ? (
                    <ComplianceReviewsView rows={complianceReviewRows} />
                  ) : complianceView === "regulatory-alerts" ? (
                    <RegulatoryAlertsView />
                  ) : complianceView === "notifications" ? (
                    <ComplianceNotificationsView rows={COMPLIANCE_NOTIFICATIONS} />
                  ) : (
                    <ComplianceDashboardView
                      alert={complianceAlert}
                      alertDismissed={isComplianceAlertDismissed}
                      metrics={complianceMetrics}
                      queueRows={complianceQueuePreviewRows}
                      activeTaskCards={complianceActiveTaskCards}
                      showViewFullQueue={showViewFullQueue}
                      activeReviewId={activeReviewId}
                      onOpenQueueReview={openReviewById}
                      onOpenAlertReview={openAlertReview}
                      onDismissAlert={dismissComplianceAlert}
                      onOpenActiveTask={openReviewById}
                    />
                  )}
                </>
              )}
            </div>
          </main>
        </div>
      </div>

      {!isComplianceStaticSurface && selectedReview ? (
        <ComplianceReviewDrawer
          selection={selectedReview}
          detail={selectedReviewDetailQ.data}
          isLoading={selectedReviewDetailQ.isLoading}
          now={now}
          activeAction={activeReviewAction}
          onClose={() => setSelectedReview(null)}
          onAction={handleReviewAction}
        />
      ) : null}

      {!isComplianceStaticSurface && claimConflictTask && claimConflictLoggedAt ? (
        <ComplianceClaimConflictModal
          minerCode={claimConflictTask.minerCode}
          loggedAt={claimConflictLoggedAt}
          onBack={() => {
            setClaimConflictTask(null);
            setClaimConflictLoggedAt(null);
          }}
        />
      ) : null}

      {escalateModalMiner ? (
        <EscalateToSeniorReviewModal
          minerCode={escalateModalMiner.minerId}
          onClose={() => setEscalateModalMiner(null)}
          onConfirm={() => setEscalateModalMiner(null)}
        />
      ) : null}

      {requestDocumentModalMiner ? (
        <RequestComplianceDocumentModal
          minerCode={requestDocumentModalMiner.minerId}
          onClose={() => setRequestDocumentModalMiner(null)}
          onConfirm={() => setRequestDocumentModalMiner(null)}
        />
      ) : null}
    </div>
  );
}
