"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import {
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
import { getUser } from "@/src/features/onboarding/api";
import { RegulatoryAlertsView } from "@/src/features/compliance/dashboard/components/RegulatoryAlertsView";
import {
  REGULATED_SECTORS,
  parseRegulatedSector,
  type ComplianceView,
  type DashboardPersona,
  type ComplianceReviewSelection,
  type ReviewActionType,
  type ComplianceMinerDetailState,
  type RegulatedSector,
} from "@/src/features/compliance/dashboard/types";
import {
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
import AdminPartnerDirectoryView from "@/src/features/compliance/dashboard/components/admin/AdminPartnerDirectoryView";
import AdminRegulatoryReadinessView from "@/src/features/compliance/dashboard/components/admin/AdminRegulatoryReadinessView";
import ComplianceDashboardView from "@/src/features/compliance/dashboard/components/open-task-pool/ComplianceDashboardView";
import ComplianceReviewsView from "@/src/features/compliance/dashboard/components/reviews/ComplianceReviewsView";
import ComplianceReviewDrawer from "@/src/features/compliance/dashboard/components/reviews/ComplianceReviewDrawer";
import ComplianceClaimConflictModal from "@/src/features/compliance/dashboard/components/reviews/ComplianceClaimConflictModal";
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const personaParam = searchParams.get("persona");
  const complianceViewParam = searchParams.get("view");
  const sector = parseRegulatedSector(searchParams.get("sector"));
  const sectorMeta = REGULATED_SECTORS.find((option) => option.value === sector);
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
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

  const currentUserQ = useQuery({
    queryKey: ["currentUser"],
    queryFn: getUser,
    enabled: hasAccessToken,
    retry: false,
  });
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
  const adminRows = mapAdminReviewRows(adminReviewsQ.data?.data?.results ?? []);
  const complianceSummary =
    complianceSummaryQ.data?.data ?? EMPTY_DASHBOARD_SUMMARY;
  const complianceAlert = mapComplianceAlert(complianceSummary.latest_alert);
  const complianceAlertKey = complianceAlert.reviewId ?? "none";
  const isComplianceAlertDismissed = dismissedAlertKey === complianceAlertKey;
  const dismissComplianceAlert = () => {
    setDismissedAlertKey(complianceAlertKey);
  };
  const complianceMetrics = mapComplianceMetrics(complianceSummary);
  const complianceQueueRows = mapComplianceQueueRows(
    complianceQueueQ.data?.data?.results ?? [],
    now,
  );
  const complianceQueuePreviewRows = complianceQueueRows.slice(0, 5);
  const complianceQueueCount =
    complianceQueueQ.data?.data?.count ?? 0;
  const showViewFullQueue = complianceQueueCount > 5;
  const complianceActiveTaskCards = mapComplianceActiveTaskCards(
    complianceMyTasksQ.data?.data?.results ?? [],
  );
  const complianceReviewRows = mapAdminReviewRows(adminReviewsQ.data?.data?.results ?? []);
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

  const handleSectorChange = (nextSector: RegulatedSector) => {
    resetCompliancePanels();

    const params = new URLSearchParams(searchParams.toString());
    if (nextSector === "miners") {
      params.delete("sector");
    } else {
      params.set("sector", nextSector);
    }

    const query = params.toString();
    router.push(query ? `/compliancedashboard?${query}` : "/compliancedashboard");
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

  const currentUserData = currentUserQ.data?.data as
    | {
        id?: string;
        email?: string;
        phone_number?: string | null;
        profile_picture?: string | null;
        account_verified?: boolean;
        onboarding_completed_at?: string | null;
        profile?: {
          id?: string;
          full_name?: string;
          role?: string;
          organization_name?: string;
          require_two_factor_authentication?: boolean;
        } | null;
      }
    | undefined;
  const topBarUser = {
    name: currentUserData?.profile?.full_name || currentUserData?.email || "",
    role: currentUserData?.profile?.role || "Compliance Officer",
    email: currentUserData?.email || "",
    avatarSrc: currentUserData?.profile_picture || null,
    isVerified: Boolean(currentUserData?.account_verified),
  };
  const profileUser = {
    ...topBarUser,
    userId: currentUserData?.id || null,
    profileId: currentUserData?.profile?.id || null,
    phone: currentUserData?.phone_number || "",
    department: currentUserData?.profile?.organization_name || "",
    isVerified: Boolean(currentUserData?.account_verified),
    twoFactorEnabled: Boolean(currentUserData?.profile?.require_two_factor_authentication),
    joinedLabel: currentUserData?.onboarding_completed_at
      ? `Joined ${new Date(currentUserData.onboarding_completed_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
      : "",
  };

  return (
    <div className="h-screen overflow-hidden bg-[#f5f7fb] text-[#202534]">
      <div className="flex h-screen">
        <DashboardSidebar
          persona={persona}
          complianceView={complianceView}
          mobileOpen={mobileNavOpen}
          onMobileClose={() => setMobileNavOpen(false)}
        />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <DashboardTopBar
            key={`${persona}-${complianceView}`}
            persona={persona}
            complianceView={complianceView}
            onMenuNavigate={resetCompliancePanels}
            onOpenMobileNav={() => setMobileNavOpen(true)}
            user={topBarUser}
          />

          <main className="flex-1 overflow-y-auto px-5 py-8 sm:px-8 xl:px-10">
            <div className="mx-auto max-w-[1600px] space-y-8">
              {sectorMeta && !sectorMeta.available ? (
                <div className="rounded-[20px] border border-[#e8ecf4] bg-white px-8 py-16 text-center">
                  <h2 className="text-[22px] font-semibold text-[#1f2430]">
                    {sectorMeta.label} compliance is not available yet
                  </h2>
                  <p className="mx-auto mt-3 max-w-[560px] text-[15px] leading-6 text-[#7a8291]">
                    Compliance reviews are currently only modelled for miners. Once
                    {" "}{sectorMeta.label.toLowerCase()} onboarding and review records exist on the
                    backend, this workspace will populate here.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleSectorChange("miners")}
                    className="mt-6 inline-flex h-11 items-center rounded-[12px] bg-[#14244a] px-5 text-[14px] font-semibold !text-white"
                  >
                    Back to Miners
                  </button>
                </div>
              ) : showMinerDetailView && openedMinerDetail ? (
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
              ) : persona === "admin" ? (
                <>
                  {complianceView !== "regulatory-alerts" && complianceView !== "reviews" ? (
                    <PageHero persona={persona} complianceView={complianceView} />
                  ) : null}
                  {complianceView === "miner-pipeline" ? (
                    <AdminMinerPipelineView
                      rows={adminRows}
                      onSelectMiner={(row) => {
                        const matchedItem = (adminReviewsQ.data?.data?.results ?? []).find(
                          (item) => item.id === row.id,
                        );
                        if (!matchedItem) {
                          showToast("Miner detail is unavailable for this row.", "error");
                          return;
                        }
                        setOpenedMinerDetail({
                          selection: buildSelectionFromItem(matchedItem),
                          reviewDetail: undefined,
                        });
                      }}
                    />
                  ) : complianceView === "partner-directory" ? (
                    <AdminPartnerDirectoryView />
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
                <ComplianceProfileView user={profileUser} />
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
    </div>
  );
}
