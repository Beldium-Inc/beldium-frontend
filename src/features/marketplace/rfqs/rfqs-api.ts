import { authApi } from "@/src/lib/axiosInstance";

// Unlike Orders, this hits a REAL, already-working backend endpoint - no
// mock/bypass needed. RFQViewSet (rfq/views.py, mounted at root "/rfqs/")
// is IsAuthenticated (not miner-only) and already filters by
// `buyer=user.buyer_profile` when the signed-in user has one. Verified
// directly in rfq/views.py:38-48. No filter/search/ordering backends are
// registered on the viewset, so search below is done client-side over the
// fetched page.
export type RfqRow = {
  id: string;
  rfq_code: string;
  mineral_type: string;
  grade_spec: string;
  total_weight: string;
  pricing_structure: string;
  incoterm: string;
  destination: string;
  status: string;
  response_deadline: string | null;
  delivery_deadline: string | null;
  created_at: string;
  updated_at: string;
  buyer: { id: string; company_name: string; email: string };
  // Computed server-side in RFQSerializer (rfq/serializers.py) from the
  // RFQ's real miner assignments - not on the RFQ model itself.
  offers_count: number;
  // Accepted quote's price * quantity, as a decimal string; null until a
  // quote has actually been accepted (there's no "amount" before that).
  total_value: string | null;
  // Folds in RFQAssignment state (quoted/accepted) on top of RFQStatus -
  // see RFQSerializer.get_derived_status for the exact precedence.
  derived_status: "accepted" | "under_review" | "no_match" | "open";
  // The real Order, once ops has confirmed the buyer's bank transfer -
  // null before that. See RFQViewSet.confirm_bank_transfer.
  order: { id: string; order_code: string } | null;
};

export type RfqListResponse = {
  status: string;
  message: string | null;
  data: {
    count: number;
    page_number: number;
    per_page: number;
    results: RfqRow[];
  };
};

export async function getBuyerRfqs(params: { page?: number } = {}) {
  const { data } = await authApi.get<RfqListResponse>("/rfqs/", {
    params: { page: params.page ?? 1, page_size: 50 },
  });
  return data;
}

// Minerals actually supplied by a routable miner (verified + onboarding
// complete) - the exact set RFQDistributionService matches against. The RFQ
// form must only offer these: a free-text mineral field lets a buyer submit
// something that matches no miner, and the RFQ silently dies as NO_MATCH
// with no one - buyer or miner - ever told.
export type BankTransferInstructions = {
  bank_name: string;
  account_name: string;
  account_number: string;
  amount: string;
  reference: string;
};

// Buyer-initiated: bank transfer is the only funding method wired up right
// now. Creates a TransactionRecord and returns the account to pay into -
// an ops/compliance reviewer confirms receipt separately (no back-office
// UI for that yet) and the RFQ's `order` field appears once they do.
export async function fundEscrow(rfqId: string) {
  const { data } = await authApi.post<{
    status: string;
    message: string | null;
    data: { transaction: unknown; bank_transfer: BankTransferInstructions };
  }>(`/rfqs/${rfqId}/fund-escrow/`);
  return data.data;
}

export async function getMineralOptions() {
  const { data } = await authApi.get<{ status: string; message: string | null; data: string[] }>(
    "/rfqs/mineral-options/",
  );
  return data.data;
}

export async function getRfqDetail(id: string) {
  const { data } = await authApi.get<{ status: string; message: string | null; data: RfqRow }>(
    `/rfqs/${id}/`,
  );
  return data.data;
}

export type CreateRfqPayload = {
  mineral_type: string;
  grade_spec: string;
  total_weight: number;
  delivery_deadline?: string | null;
  destination: string;
  incoterm: string;
};

// RFQ.pricing_structure and RFQ.delivery_schedule are required TextFields
// on the backend with no form field on the "Request for quote" design to
// source them from, so they're derived here rather than left for the user
// to fill in - see BACKEND_REQUEST_RFQ_ORDER_FLOW.md for the fields the
// design collects (target price, additional request) that the RFQ model
// has nowhere to store yet, so they aren't sent at all rather than being
// silently dropped into an unrelated column.
export type RfqQuote = {
  id: string;
  rfq_id: string;
  rfq_code: string;
  mineral_type: string;
  miner_name: string;
  miner_location: string;
  quoted_price: string;
  quoted_quantity: string;
  currency: string;
  status: "quoted" | "accepted" | "rejected";
  quoted_at: string;
  accepted_at: string | null;
  created_at: string;
};

export type RfqQuoteListResponse = {
  status: string;
  message: string | null;
  data: {
    count: number;
    results: RfqQuote[];
  };
};

// Real quotes miners have submitted against this RFQ - replaces the mock
// offers table the RFQ detail page used before RFQAssignment.quoted_price/
// quoted_quantity existed (see BACKEND_REQUEST_RFQ_ORDER_FLOW.md item 1).
export async function getRfqQuotes(rfqId: string) {
  const { data } = await authApi.get<RfqQuoteListResponse>("/rfq-assignments/quotes/", {
    params: { rfq_id: rfqId },
  });
  return data.data;
}

export async function acceptRfqQuote(assignmentId: string) {
  const { data } = await authApi.post<{ status: string; message: string | null; data: RfqQuote }>(
    `/rfq-assignments/${assignmentId}/accept-quote/`,
  );
  return data.data;
}

export async function declineRfqQuote(assignmentId: string) {
  const { data } = await authApi.post<{ status: string; message: string | null; data: RfqQuote }>(
    `/rfq-assignments/${assignmentId}/decline-quote/`,
  );
  return data.data;
}

export async function createRfq(payload: CreateRfqPayload) {
  const { data } = await authApi.post<{ status: string; message: string | null; data: RfqRow }>("/rfqs/", {
    mineral_type: payload.mineral_type,
    grade_spec: payload.grade_spec,
    total_weight: payload.total_weight,
    delivery_deadline: payload.delivery_deadline || null,
    destination: payload.destination,
    incoterm: payload.incoterm,
    pricing_structure: payload.incoterm || "Fixed",
    delivery_schedule: payload.delivery_deadline
      ? `One-time delivery by ${payload.delivery_deadline}`
      : "One-time delivery",
  });
  return data.data;
}
