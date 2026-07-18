import { authApi } from "@/src/lib/axiosInstance";

export type Transaction = {
  id: string;
  order_id: string;
  order_code: string;
  buyer_name: string;
  payment_reference: string;
  reference_number: string;
  created_at: string;
  transaction_code: string;
  amount: string;
  payment_method: string;
  payment_status: string;
  payment_date: string | null;
};

export type TransactionsResponse = {
  status: string;
  data: {
    next: string | null;
    previous: string | null;
    count: number;
    total_pages: number;
    page_number: number;
    per_page: number;
    results: Transaction[];
  };
  message: string | null;
};

export async function getTransactions(params: {
  page?: number;
  per_page?: number;
  payment_status?: string;
  payment_method?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}) {
  const res = await authApi.get<TransactionsResponse>("/transactions/", {
    params: {
      page: params.page ?? 1,
      per_page: params.per_page ?? 20,
      payment_status: params.payment_status || undefined,
      payment_method: params.payment_method || undefined,
      date_from: params.date_from || undefined,
      date_to: params.date_to || undefined,
      search: params.search || undefined,
    },
  });
  return res.data;
}

export type WalletSummary = {
  total_earnings: string;
  pending_payments: string;
  transactions_count: number;
  last_payment_amount: string;
  last_payment_date: string | null;
};

export type WalletSummaryResponse = {
  status: string;
  data: WalletSummary;
  message: string | null;
};

export async function getWalletSummary() {
  const res = await authApi.get<WalletSummaryResponse>("/transactions/summary/");
  return res.data;
}

export type TransactionTimelineEntry = {
  event_type: string;
  label: string;
  timestamp: string | null;
  status: "completed" | "current" | "failed" | "refunded" | string;
};

export type TransactionDetail = Transaction & {
  bank_destination: string;
  timeline: TransactionTimelineEntry[];
};

export type TransactionDetailResponse = {
  status: string;
  data: TransactionDetail;
  message: string | null;
};

export async function getTransactionDetail(id: string) {
  const res = await authApi.get<TransactionDetailResponse>(`/transactions/${id}/`);
  return res.data;
}

// Both return a binary file (CSV/PDF) directly, not the usual JSON envelope.
export async function downloadTransactionsExport() {
  const res = await authApi.get("/transactions/export/", { responseType: "blob" });
  return res.data as Blob;
}

export async function downloadWalletStatement() {
  const res = await authApi.get("/transactions/statement/", { responseType: "blob" });
  return res.data as Blob;
}

export async function downloadTransactionStatement(id: string) {
  const res = await authApi.get(`/transactions/${id}/statement/`, { responseType: "blob" });
  return res.data as Blob;
}
