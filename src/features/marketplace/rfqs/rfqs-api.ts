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
  buyer: { id: string; company_name: string; email: string };
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

export async function getRfqDetail(id: string) {
  const { data } = await authApi.get<{ status: string; message: string | null; data: RfqRow }>(
    `/rfqs/${id}/`,
  );
  return data.data;
}
