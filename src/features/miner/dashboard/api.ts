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
  };
};

export type ActiveOrderItem = {
  id: string;
  order_code: string;
  quantity: string;
  buyer_name: string;
  agreed_tonnage: string;
  total_value: string;
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

export async function getMinerOverview() {
  const { data } = await authApi.get<MinerOverview>("/miner/dashboard/dashboard_overview/");
  return data;
}

export async function getOrdersOverview() {
  const { data } = await authApi.get<OrdersOverview>("/miner/dashboard/overview/");
  return data;
}

export async function getActiveOrders(params?: { page?: number; per_page?: number }) {
  const { data } = await authApi.get<ActiveOrdersResponse>("/miner/dashboard/active_orders/", {
    params,
  });
  return data;
}

export async function getOrderHistory(params?: { page?: number; per_page?: number }) {
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
