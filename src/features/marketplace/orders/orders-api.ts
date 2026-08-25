import { authApi } from "@/src/lib/axiosInstance";
import { getMockOrderById, getMockOrders, MockOrder } from "./mock-data";

/**
 * The order LIST here is still mocked - `MinerDashboardViewSet.list()`
 * (miners/views.py) has the right buyer/miner branching in get_queryset,
 * but the class-level `IsMinerUser` permission blocks a buyer before that
 * ever runs, and there's no per-action override for `list` the way there
 * now is for the detail action below. getBuyerOrders() below still tries a
 * nonexistent `/marketplace/orders/` endpoint and falls back to mock data.
 *
 * getBuyerOrderDetail() IS real: it hits `/miner/dashboard/{id}/detail/`,
 * whose `order_detail` action now has `permission_classes=[IsAuthenticated]`
 * (see the comment on that action) specifically so a buyer's own accepted
 * quote -> paid -> order flow (app/marketplace/rfqs/[id]/page.tsx) has
 * somewhere real to land instead of a client-only mock order that
 * disappeared on refresh.
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

type RealOrderDetail = {
  id: string;
  order_code: string;
  mineral_type: string;
  miner_name: string;
  miner_location: string;
  agreed_tonnage: string;
  total_value: string;
  currency: string;
  status: string;
  shipment_status: "pending" | "shipped" | "delivered";
  created_at: string;
  rfq: string;
};

// This backend has no "quality verification" / "preparing" concept yet -
// once a real order exists, escrow is already LOCKED (a precondition in
// RFQViewSet.confirm_bank_transfer), so there's no real "awaiting payment"
// state for a real order either. Collapses the richer 7-step mock timeline
// down to what the backend can actually attest to.
function realOrderToMockOrder(order: RealOrderDetail, destination: string | null): MockOrder {
  const currentStep =
    order.status === "completed"
      ? "payment_released"
      : order.shipment_status === "delivered"
        ? "delivered"
        : order.shipment_status === "shipped"
          ? "in_transit"
          : "payment_secured";

  return {
    id: order.id,
    order_code: order.order_code,
    mineral_type: order.mineral_type,
    supplier_name: order.miner_name,
    agreed_tonnage: `${Number(order.agreed_tonnage).toLocaleString()} DMT (Dry Metric Tonnes)`,
    quantity_display: `${Number(order.agreed_tonnage).toLocaleString()} MT (Metric Tonnes)`,
    total_value: order.total_value,
    currency: order.currency,
    status: "payment_secured",
    created_at: order.created_at,
    current_step: currentStep,
    escrow_secured: true,
    documents: [{ label: "Sales contract" }],
    origin: { label: `${order.miner_location} state, NIG`, sublabel: `${order.miner_location} depot`, lat: 9.082, lng: 8.6753 },
    destination: { label: destination ?? "—", sublabel: "", lat: 6.4531, lng: 3.3592 },
  };
}

export async function getBuyerOrderDetail(id: string) {
  try {
    const { data } = await authApi.get<{ status: string; message: string | null; data: RealOrderDetail }>(
      `/miner/dashboard/${id}/detail/`,
    );
    const order = data.data;
    // The Order record has no destination field - it's on the RFQ that
    // spawned it, one extra cheap lookup rather than leaving this blank.
    let destination: string | null = null;
    try {
      const rfqRes = await authApi.get<{ data: { destination: string } }>(`/rfqs/${order.rfq}/`);
      destination = rfqRes.data.data.destination;
    } catch {
      // Non-fatal - the order itself still renders without it.
    }
    return realOrderToMockOrder(order, destination);
  } catch {
    return getMockOrderById(id) ?? null;
  }
}

export type { MockOrder };
