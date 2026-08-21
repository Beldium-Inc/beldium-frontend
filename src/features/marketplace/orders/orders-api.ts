import { authApi } from "@/src/lib/axiosInstance";
import { getMockOrderById, getMockOrders, MockOrder } from "./mock-data";

/**
 * NEEDED ON BACKEND: no buyer-facing order-list/detail endpoint exists yet.
 * `MinerOrderViewSet` (miners/views.py, registered at /miner/orders/) is
 * hardcoded to `request.user.miner_profile` and would 500 for a buyer
 * (BuyerProfile has no such attribute). `MinerDashboardViewSet.get_queryset`
 * (same file) already has the right buyer/miner branching logic, but that
 * viewset is gated by `IsMinerUser` and lives under a miner-only URL.
 *
 * Until that ships, every function here tries the real `/marketplace/orders/`
 * endpoint first and silently falls back to `mock-data.ts` on any failure
 * (404, 401, network error) - so the Orders list + detail + logistics-map
 * pages are fully buildable/demoable now, and will start showing real data
 * automatically the moment the backend endpoint exists, with no frontend
 * changes required.
 */
export type BuyerOrderRow = {
  id: string;
  order_code: string;
  mineral_type: string;
  supplier_name: string;
  agreed_tonnage: string;
  total_value: string;
  currency: string;
  status: string;
  created_at: string;
};

export type BuyerOrdersResponse = {
  status: string;
  message: string | null;
  data: {
    count: number;
    page_number: number;
    per_page: number;
    results: BuyerOrderRow[];
  };
};

function mockToRow(order: MockOrder): BuyerOrderRow {
  return {
    id: order.id,
    order_code: order.order_code,
    mineral_type: order.mineral_type,
    supplier_name: order.supplier_name,
    agreed_tonnage: order.agreed_tonnage,
    total_value: order.total_value,
    currency: order.currency,
    status: order.status,
    created_at: order.created_at,
  };
}

export async function getBuyerOrders(params: { page?: number; search?: string }) {
  try {
    const { data } = await authApi.get<BuyerOrdersResponse>("/marketplace/orders/", {
      params: { page: params.page ?? 1, search: params.search || undefined },
    });
    return data;
  } catch {
    const results = getMockOrders(params.search ?? "").map(mockToRow);
    return {
      status: "success",
      message: null,
      data: { count: results.length, page_number: 1, per_page: results.length || 10, results },
    } satisfies BuyerOrdersResponse;
  }
}

export async function getBuyerOrderDetail(id: string) {
  try {
    const { data } = await authApi.get<{ status: string; message: string | null; data: MockOrder }>(
      `/marketplace/orders/${id}/`,
    );
    return data.data;
  } catch {
    return getMockOrderById(id) ?? null;
  }
}

export type { MockOrder };
