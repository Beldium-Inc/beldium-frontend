import { authApi } from "@/src/lib/axiosInstance";

export type ComplianceMetricDirection = "up" | "down" | "neutral";

export type ComplianceSummaryMetric = {
  value: number;
  change_percent?: number;
  change_direction?: ComplianceMetricDirection;
  unit?: string;
};

export type ComplianceLatestAlert = {
  review_id: string;
  miner_id: string | null;
  miner_name: string | null;
  message: string;
  created_at: string;
};

export type ComplianceDashboardSummaryResponse = {
  status: string;
  message: string;
  data: {
    active_tasks: ComplianceSummaryMetric;
    avg_review_time: ComplianceSummaryMetric;
    quality_score: ComplianceSummaryMetric;
    queue_load: ComplianceSummaryMetric;
    latest_alert: ComplianceLatestAlert | null;
  };
};

export type ReviewDashboardCardTrend = {
  percentage: number;
  trend: ComplianceMetricDirection;
};

export type ReviewDashboardCardMetric = {
  count: number;
  percentage_change: ReviewDashboardCardTrend;
};

export type ComplianceReviewDashboardCardsResponse = {
  status: string;
  message: string | null;
  data: {
    total_miners_onboarded: ReviewDashboardCardMetric;
    under_review: ReviewDashboardCardMetric;
    compliance_ready: ReviewDashboardCardMetric;
    action_required: ReviewDashboardCardMetric;
  };
};

export type ComplianceReviewItem = {
  id: string;
  miner: string;
  miner_company_name: string;
  miner_email: string;
  state_of_operation: string | null;
  local_government_area: string | null;
  status: string;
  compliance_score: number | null;
  risk_level: string | null;
  assigned_to: string | null;
  assigned_to_email?: string | null;
  claimed_at: string | null;
  reviewed_at: string | null;
  created_at: string;
  miner_code: string;
  updated_at: string;
};

export type ComplianceReviewsResponse = {
  status: string;
  message: string;
  data: {
    next: string | null;
    previous: string | null;
    count: number;
    total_pages: number;
    page_number: number;
    per_page: number;
    from: number;
    to: number;
    results: ComplianceReviewItem[];
  };
};

export type ComplianceReviewClaimResponse = {
  status: string;
  message: string | null;
  data?: unknown;
};

export type ComplianceReviewClaimRequest = {
  pathId: string;
  bodyId?: string;
};

export type ComplianceReviewDetail = {
  id: string;
  status: string;
  risk_level: string | null;
  compliance_score: number | null;
  notes: string;
  assigned_to: string | null;
  claimed_at: string | null;
  reviewed_at: string | null;
};

export type ComplianceReviewWorkflowAction =
  | "approve"
  | "reject"
  | "start_review";

export type ComplianceReviewWorkflowRequest = {
  reviewId: string;
  action: ComplianceReviewWorkflowAction;
  reason?: string;
};

export type ComplianceWorkflowResponse = {
  status?: string;
  message?: string | null;
  data?: unknown;
  [key: string]: unknown;
};

export type ComplianceMinerDetailResponse = {
  status?: string;
  message?: string | null;
  data?:
    | (Partial<ComplianceDashboardSummaryResponse["data"]> & Record<string, unknown>)
    | null;
  [key: string]: unknown;
};

export const DEFAULT_COMPLIANCE_DASHBOARD_SUMMARY: ComplianceDashboardSummaryResponse = {
  status: "success",
  message: "Compliance dashboard summary fetched successfully.",
  data: {
    active_tasks: {
      value: 1,
      change_percent: 100,
      change_direction: "up",
    },
    avg_review_time: {
      value: 0,
      change_percent: 0,
      change_direction: "neutral",
      unit: "minutes",
    },
    quality_score: {
      value: 0,
      unit: "percent",
    },
    queue_load: {
      value: 3,
    },
    latest_alert: {
      review_id: "52fec003-6b02-4543-ba36-08ff8e702db6",
      miner_id: null,
      miner_name: null,
      message: "New Miner Onboarded - Ready for Review",
      created_at: "2026-03-15T17:20:11.111321Z",
    },
  },
};

export const DEFAULT_COMPLIANCE_REVIEW_DASHBOARD_CARDS: ComplianceReviewDashboardCardsResponse = {
  status: "success",
  message: null,
  data: {
    total_miners_onboarded: {
      count: 9,
      percentage_change: {
        percentage: 100,
        trend: "up",
      },
    },
    under_review: {
      count: 1,
      percentage_change: {
        percentage: 100,
        trend: "up",
      },
    },
    compliance_ready: {
      count: 0,
      percentage_change: {
        percentage: 0,
        trend: "up",
      },
    },
    action_required: {
      count: 3,
      percentage_change: {
        percentage: 200,
        trend: "up",
      },
    },
  },
};

export const DEFAULT_COMPLIANCE_REVIEWS: ComplianceReviewsResponse = {
  status: "success",
  message: "",
  data: {
    next: null,
    previous: null,
    count: 4,
    total_pages: 1,
    page_number: 1,
    per_page: 10,
    from: 1,
    to: 4,
    results: [
      {
        id: "52fec003-6b02-4543-ba36-08ff8e702db6",
        miner: "16691080-f8c7-4f1a-8f90-87e5fa09b78c",
        miner_company_name: "Beldium Inc (Miner1)",
        miner_email: "miner1@yopmail.com",
        state_of_operation: "Lagos",
        local_government_area: "Alimosho",
        status: "pending",
        compliance_score: null,
        risk_level: null,
        assigned_to: null,
        claimed_at: null,
        reviewed_at: null,
        created_at: "2026-03-15T17:20:11.111321Z",
        miner_code: "BLD-00008",
        updated_at: "2026-03-15T17:20:11.111334Z",
      },
      {
        id: "7e031fa5-0af8-482d-8078-d537d9e2fead",
        miner: "0ab6dc7c-fa78-47a8-8728-2e1771946f7a",
        miner_company_name: "Beldium Inc (Miner1)",
        miner_email: "miner2@yopmail.com",
        state_of_operation: "Lagos",
        local_government_area: "Alimosho",
        status: "pending",
        compliance_score: null,
        risk_level: null,
        assigned_to: null,
        claimed_at: null,
        reviewed_at: null,
        created_at: "2026-03-15T17:17:56.952857Z",
        miner_code: "BLD-00007",
        updated_at: "2026-03-15T17:17:56.952871Z",
      },
      {
        id: "3af43e3c-cd45-4f57-8e5f-30c431c28b5d",
        miner: "be932f39-65b3-47b0-8214-25cb539c304b",
        miner_company_name: "Beldium Inc (Miner3)",
        miner_email: "miner3@yopmail.com",
        state_of_operation: "Lagos",
        local_government_area: "Alimosho",
        status: "under_review",
        compliance_score: null,
        risk_level: null,
        assigned_to: "c9fd43dd-6c4f-432a-a7d8-30703e0807ca",
        assigned_to_email: "compliance@yopmail.com",
        claimed_at: "2026-03-18T07:37:22.439039Z",
        reviewed_at: null,
        created_at: "2026-03-15T17:15:02.136044Z",
        miner_code: "BLD-00006",
        updated_at: "2026-03-18T07:37:22.439213Z",
      },
      {
        id: "cef41077-86cb-4a00-8f19-3f4825ce98a4",
        miner: "e4aca286-dcf6-4cc0-99f4-38cff9460ee6",
        miner_company_name: "Miner Inc",
        miner_email: "miner@yopmail.com",
        state_of_operation: "Lagos",
        local_government_area: "Eti osa",
        status: "pending",
        compliance_score: null,
        risk_level: null,
        assigned_to: null,
        claimed_at: null,
        reviewed_at: null,
        created_at: "2026-02-25T07:44:10.359617Z",
        miner_code: "BLD-00001",
        updated_at: "2026-02-25T07:44:10.359628Z",
      },
    ],
  },
};

export const DEFAULT_COMPLIANCE_REVIEW_QUEUE: ComplianceReviewsResponse = {
  status: "success",
  message: "",
  data: {
    next: null,
    previous: null,
    count: 3,
    total_pages: 1,
    page_number: 1,
    per_page: 10,
    from: 1,
    to: 3,
    results: [
      {
        id: "52fec003-6b02-4543-ba36-08ff8e702db6",
        miner: "16691080-f8c7-4f1a-8f90-87e5fa09b78c",
        miner_company_name: "Beldium Inc (Miner1)",
        miner_email: "miner1@yopmail.com",
        state_of_operation: "Lagos",
        local_government_area: "Alimosho",
        status: "pending",
        compliance_score: null,
        risk_level: null,
        assigned_to: null,
        claimed_at: null,
        reviewed_at: null,
        created_at: "2026-03-15T17:20:11.111321Z",
        miner_code: "BLD-00008",
        updated_at: "2026-03-15T17:20:11.111334Z",
      },
      {
        id: "7e031fa5-0af8-482d-8078-d537d9e2fead",
        miner: "0ab6dc7c-fa78-47a8-8728-2e1771946f7a",
        miner_company_name: "Beldium Inc (Miner1)",
        miner_email: "miner2@yopmail.com",
        state_of_operation: "Lagos",
        local_government_area: "Alimosho",
        status: "pending",
        compliance_score: null,
        risk_level: null,
        assigned_to: null,
        claimed_at: null,
        reviewed_at: null,
        created_at: "2026-03-15T17:17:56.952857Z",
        miner_code: "BLD-00007",
        updated_at: "2026-03-15T17:17:56.952871Z",
      },
      {
        id: "cef41077-86cb-4a00-8f19-3f4825ce98a4",
        miner: "e4aca286-dcf6-4cc0-99f4-38cff9460ee6",
        miner_company_name: "Miner Inc",
        miner_email: "miner@yopmail.com",
        state_of_operation: "Lagos",
        local_government_area: "Eti osa",
        status: "pending",
        compliance_score: null,
        risk_level: null,
        assigned_to: null,
        claimed_at: null,
        reviewed_at: null,
        created_at: "2026-02-25T07:44:10.359617Z",
        miner_code: "BLD-00001",
        updated_at: "2026-02-25T07:44:10.359628Z",
      },
    ],
  },
};

export const DEFAULT_COMPLIANCE_MY_TASKS: ComplianceReviewsResponse = {
  status: "success",
  message: "",
  data: {
    next: null,
    previous: null,
    count: 3,
    total_pages: 1,
    page_number: 1,
    per_page: 10,
    from: 1,
    to: 3,
    results: [
      {
        id: "52fec003-6b02-4543-ba36-08ff8e702db6",
        miner: "16691080-f8c7-4f1a-8f90-87e5fa09b78c",
        miner_company_name: "Beldium Inc (Miner1)",
        miner_email: "miner1@yopmail.com",
        state_of_operation: "Lagos",
        local_government_area: "Alimosho",
        status: "claimed",
        compliance_score: null,
        risk_level: null,
        assigned_to: "c9fd43dd-6c4f-432a-a7d8-30703e0807ca",
        assigned_to_email: "compliance@yopmail.com",
        claimed_at: "2026-03-31T23:34:37.056065Z",
        reviewed_at: null,
        created_at: "2026-03-15T17:20:11.111321Z",
        miner_code: "BLD-00008",
        updated_at: "2026-03-31T23:34:37.056375Z",
      },
      {
        id: "7e031fa5-0af8-482d-8078-d537d9e2fead",
        miner: "0ab6dc7c-fa78-47a8-8728-2e1771946f7a",
        miner_company_name: "Beldium Inc (Miner1)",
        miner_email: "miner2@yopmail.com",
        state_of_operation: "Lagos",
        local_government_area: "Alimosho",
        status: "claimed",
        compliance_score: null,
        risk_level: null,
        assigned_to: "c9fd43dd-6c4f-432a-a7d8-30703e0807ca",
        assigned_to_email: "compliance@yopmail.com",
        claimed_at: "2026-04-01T00:14:06.325935Z",
        reviewed_at: null,
        created_at: "2026-03-15T17:17:56.952857Z",
        miner_code: "BLD-00007",
        updated_at: "2026-04-01T00:14:06.326038Z",
      },
      {
        id: "3af43e3c-cd45-4f57-8e5f-30c431c28b5d",
        miner: "be932f39-65b3-47b0-8214-25cb539c304b",
        miner_company_name: "Beldium Inc (Miner3)",
        miner_email: "miner3@yopmail.com",
        state_of_operation: "Lagos",
        local_government_area: "Alimosho",
        status: "under_review",
        compliance_score: null,
        risk_level: null,
        assigned_to: "c9fd43dd-6c4f-432a-a7d8-30703e0807ca",
        assigned_to_email: "compliance@yopmail.com",
        claimed_at: "2026-03-18T07:37:22.439039Z",
        reviewed_at: null,
        created_at: "2026-03-15T17:15:02.136044Z",
        miner_code: "BLD-00006",
        updated_at: "2026-03-18T07:37:22.439213Z",
      },
    ],
  },
};

export async function getComplianceDashboardSummary() {
  const { data } = await authApi.get<ComplianceDashboardSummaryResponse>(
    "/compliance/dashboard/summary/",
  );
  return data;
}

export async function getComplianceReviewDashboardCards() {
  const { data } = await authApi.get<ComplianceReviewDashboardCardsResponse>(
    "/compliance/reviews/dashboard_cards/",
  );
  return data;
}

export async function getComplianceReviews(params?: { page?: number; per_page?: number }) {
  const { data } = await authApi.get<ComplianceReviewsResponse>(
    "/compliance/reviews/",
    {
      params,
    },
  );
  return data;
}

export async function getComplianceReviewQueue(params?: {
  page?: number;
  per_page?: number;
}) {
  const { data } = await authApi.get<ComplianceReviewsResponse>(
    "/compliance/reviews/queue/",
    {
      params,
    },
  );
  return data;
}

export async function getComplianceMyTasks(params?: {
  page?: number;
  per_page?: number;
}) {
  const { data } = await authApi.get<ComplianceReviewsResponse>(
    "/compliance/reviews/my_tasks/",
    {
      params,
    },
  );
  return data;
}

function getBrowserAccessToken() {
  return typeof window !== "undefined"
    ? window.sessionStorage.getItem("accessToken")
    : null;
}

function getProxyUrl(path: string) {
  return path;
}

function getWorkflowHeaders(accessToken: string | null) {
  return accessToken
    ? {
        Authorization: `Bearer ${accessToken}`,
        "X-Access-Token": accessToken,
      }
    : undefined;
}

export async function getComplianceReviewDetail(reviewId: string) {
  const accessToken = getBrowserAccessToken();

  if (!accessToken) {
    throw new Error("Your browser session is not authenticated. Log in again.");
  }

  const { data } = await authApi.get<ComplianceReviewDetail>(
    getProxyUrl(`/compliance/reviews/${reviewId}/`),
    {
      headers: getWorkflowHeaders(accessToken),
    },
  );

  return data;
}

export async function submitComplianceReviewWorkflow({
  reviewId,
  action,
  reason,
}: ComplianceReviewWorkflowRequest) {
  const accessToken = getBrowserAccessToken();

  if (!accessToken) {
    throw new Error("Your browser session is not authenticated. Log in again.");
  }

  const { data } = await authApi.post<ComplianceWorkflowResponse>(
    getProxyUrl(`/compliance/reviews/${reviewId}/${action}/`),
    {
      ...(reason ? { reason } : {}),
    },
    {
      headers: getWorkflowHeaders(accessToken),
    },
  );

  return data;
}

export async function createComplianceSupportRequest({
  minerId,
  review,
  support_type,
  priority,
  custom_note,
  document_types,
}: {
  minerId: string;
  review: string;
  support_type: string;
  priority: string;
  custom_note?: string;
  document_types: string[];
}) {
  const accessToken = getBrowserAccessToken();

  if (!accessToken) {
    throw new Error("Your browser session is not authenticated. Log in again.");
  }

  const { data } = await authApi.post(
    getProxyUrl(`/compliance/miners/${minerId}/support-request/`),
    { review, support_type, priority, custom_note, document_types },
    {
      headers: getWorkflowHeaders(accessToken),
    },
  );

  return data;
}

export async function getComplianceMinerDetail(minerId: string) {
  const accessToken = getBrowserAccessToken();

  if (!accessToken) {
    throw new Error("Your browser session is not authenticated. Log in again.");
  }

  const { data } = await authApi.get<ComplianceMinerDetailResponse>(
    getProxyUrl(`/compliance/miners/${minerId}/detail/`),
    {
      headers: getWorkflowHeaders(accessToken),
    },
  );

  return data;
}

export async function verifyMinerLicense({
  licenseId,
  verification_status,
  notes,
}: {
  licenseId: string;
  verification_status: string;
  notes?: string;
}) {
  const accessToken = getBrowserAccessToken();

  if (!accessToken) {
    throw new Error("Your browser session is not authenticated. Log in again.");
  }

  const { data } = await authApi.patch(
    getProxyUrl(`/compliance/licenses/${licenseId}/verify/`),
    { verification_status, ...(notes !== undefined ? { notes } : {}) },
    {
      headers: getWorkflowHeaders(accessToken),
    },
  );

  return data;
}

export async function verifyMinerDocument({
  documentId,
  status,
}: {
  documentId: string;
  status: string;
}) {
  const accessToken = getBrowserAccessToken();

  if (!accessToken) {
    throw new Error("Your browser session is not authenticated. Log in again.");
  }

  const { data } = await authApi.patch(
    getProxyUrl(`/compliance/documents/${documentId}/verify/`),
    { status },
    {
      headers: getWorkflowHeaders(accessToken),
    },
  );

  return data;
}

export async function claimComplianceReview({
  pathId,
  bodyId,
}: ComplianceReviewClaimRequest) {
  const claimUrl = getProxyUrl(`/compliance/reviews/${pathId}/claim/`);
  const accessToken = getBrowserAccessToken();

  if (!accessToken) {
    throw new Error("Your browser session is not authenticated. Log in again.");
  }

  const { data } = await authApi.post<ComplianceReviewClaimResponse>(
    claimUrl,
    {
      id: bodyId ?? pathId,
    },
    {
      headers: getWorkflowHeaders(accessToken),
    },
  );
  return data;
}
