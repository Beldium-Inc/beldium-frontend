import { authApi } from "@/src/lib/axiosInstance";

export type MinerOverview = {
  status: string;
  message: string | null;
  data: {
    account_health: {
      kyc_status: string;
      compliance_audit: string;
      marketplace_access: string;
    };
    active_orders: {
      count: number;
      percentage_change: number;
    };
    pending_actions: {
      count: number;
    };
  };
};

export type OpenQueueItem = {
  id: string;
  buyer_name: string;
  order_id: string | null;
  mineral_type: string;
  quantity: string;
  proposed_price: string;
  delivery_timeline: string;
  location: string;
  logistics_method: string;
  status: string;
  created_at: string;
};

export type OpenQueueResponse = {
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
    results: OpenQueueItem[];
  };
};

export type OrdersOverview = {
  status: string;
  message: string | null;
  data: {
    incoming_rfqs: number;
    active_orders: number;
    compliance_pending: number;
    completed_orders: number;
    total_volume_sold: string | number;
    total_revenue: string | number;
    last_transaction_date: string | null;
  };
};

export type ActiveOrderItem = {
  id: string;
  order_code: string;
  quantity: string;
  buyer_name: string;
  agreed_tonnage: string;
  total_value: string;
  amount_paid: string;
  status: string;
  shipment_status: string;
  created_at: string;
};

export type ActiveOrdersResponse = {
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
    results: ActiveOrderItem[];
  };
};

export type OrderHistoryItem = {
  id: string;
  order_code: string;
  buyer_name: string;
  agreed_tonnage: string;
  delivered_date: string | null;
  payment_date: string;
  total_value: string;
  amount_paid: string;
  status: string;
};

export type OrderHistoryResponse = {
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
    results: OrderHistoryItem[];
  };
};

export type OrderTransaction = {
  id: string;
  order_id: string;
  payment_reference: string;
  created_at: string;
  transaction_code: string;
  amount: string;
  payment_method: string;
  payment_status: string;
  paid_at: string;
};

export type OrderDetail = {
  id: string;
  buyer: string;
  miner: string;
  transactions: OrderTransaction[];
  amount_paid: string;
  balance: string;
  created_at: string;
  updated_at: string;
  order_number: number;
  order_code: string;
  mineral_type: string | null;
  grade: string | null;
  agreed_tonnage: string;
  agreed_price: string;
  total_value: string;
  subtotal: string;
  shipping_cost: string;
  export_tariffs: string;
  currency: string;
  shipment_status: string;
  shipped_at: string | null;
  delivered_at: string | null;
  archived: boolean;
  dispute_flag: boolean;
  status: string;
  rfq: string;
};

export type OrderDetailResponse = {
  status: string;
  data: OrderDetail;
  message: string | null;
};

export async function getMinerOverview() {
  const { data } = await authApi.get<MinerOverview>("/miner/dashboard/dashboard_overview/");
  return data;
}

export async function getOrdersOverview() {
  const { data } = await authApi.get<OrdersOverview>("/miner/dashboard/overview/");
  return data;
}

export async function getActiveOrders(params?: {
  page?: number;
  per_page?: number;
  shipment_status?: string;
  payment_status?: string;
}) {
  const { data } = await authApi.get<ActiveOrdersResponse>("/miner/dashboard/active_orders/", {
    params,
  });
  return data;
}

export async function getOrderHistory(params?: {
  page?: number;
  per_page?: number;
  status?: string;
  shipment_status?: string;
  delivered_after?: string;
  delivered_before?: string;
  payment_status?: string;
}) {
  const { data } = await authApi.get<OrderHistoryResponse>("/miner/dashboard/history/", {
    params,
  });
  return data;
}

export async function getOpenQueue(params?: { page?: number; per_page?: number }) {
  const { data } = await authApi.get<OpenQueueResponse>("/miner/dashboard/new_requests/", {
    params,
  });
  return data;
}

export async function getOrderDetail(id: string) {
  const { data } = await authApi.get<OrderDetailResponse>(`/miner/dashboard/${id}/detail/`);
  return data;
}

// `id` here is the RFQAssignment id (same id as an OpenQueueItem row), not an order id.
export async function acceptRequest(id: string) {
  const { data } = await authApi.post(`/miner/dashboard/${id}/accept/`);
  return data;
}

export async function declineRequest(id: string) {
  const { data } = await authApi.post(`/miner/dashboard/${id}/decline/`);
  return data;
}

export async function downloadInvoice(orderId: string) {
  const { data } = await authApi.get(`/miner/dashboard/${orderId}/invoice/`, { responseType: "blob" });
  return data as Blob;
}
