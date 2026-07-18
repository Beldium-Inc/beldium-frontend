"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Input, Select, Table, Modal, Skeleton } from "antd";
import type { ColumnsType } from "antd/es/table";
import { DownloadOutlined, ExportOutlined, CloseOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
  getTransactions,
  getTransactionDetail,
  getWalletSummary,
  downloadTransactionsExport,
  downloadWalletStatement,
  downloadTransactionStatement,
  Transaction,
  TransactionDetail,
  TransactionTimelineEntry,
} from "@/src/features/miner/wallet/api";
import { DEFAULT_CURRENCY_SYMBOL } from "@/src/constants";
import { showToast } from "@/src/store/toast.store";

const STATUS_STYLES: Record<string, string> = {
  completed: "bg-green-100 text-green-700",
  success: "bg-green-100 text-green-700",
  pending: "bg-orange-100 text-orange-700",
  processing: "bg-indigo-100 text-indigo-700",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-purple-100 text-purple-700",
  current: "bg-indigo-100 text-indigo-700",
};

function StatusPill({ status }: { status: string }) {
  const key = (status || "").toLowerCase();
  const label = key === "success" ? "Completed" : status ? status[0].toUpperCase() + status.slice(1) : "--";
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[key] || "bg-gray-100 text-gray-600"}`}>
      {label}
    </span>
  );
}

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const TIME_RANGES: Record<string, number | null> = { "7d": 7, "30d": 30, all: null };

export default function WalletPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [timeRange, setTimeRange] = useState<string>("30d");
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [selectedTxnId, setSelectedTxnId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [downloadingStatement, setDownloadingStatement] = useState(false);

  const days = TIME_RANGES[timeRange];
  const dateFrom = days ? dayjs().subtract(days, "day").format("YYYY-MM-DD") : undefined;

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => window.clearTimeout(timer);
  }, [search]);

  // Reset to page 1 whenever a filter changes, otherwise the user can land
  // on a now-empty page (e.g. searching while on page 3 of unfiltered results).
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, dateFrom]);

  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ["walletSummary"],
    queryFn: getWalletSummary,
  });
  const summary = summaryData?.data;

  const { data, isLoading } = useQuery({
    queryKey: ["transactions", { page, status, dateFrom, debouncedSearch }],
    queryFn: () =>
      getTransactions({
        page,
        per_page: 10,
        payment_status: status,
        date_from: dateFrom,
        search: debouncedSearch || undefined,
      }),
  });

  const rows = data?.data?.results || [];

  const formatCurrency = (n: number | string) => `${DEFAULT_CURRENCY_SYMBOL}${Number(n).toLocaleString()}`;

  const handleExport = async () => {
    try {
      setExporting(true);
      const blob = await downloadTransactionsExport();
      downloadBlob(`transactions-${dayjs().format("YYYY-MM-DD")}.csv`, blob);
    } catch {
      showToast("Failed to export transactions", "error");
    } finally {
      setExporting(false);
    }
  };

  const handleStatement = async () => {
    try {
      setDownloadingStatement(true);
      const blob = await downloadWalletStatement();
      downloadBlob(`wallet-statement-${dayjs().format("YYYY-MM-DD")}.pdf`, blob);
    } catch {
      showToast("Failed to generate statement", "error");
    } finally {
      setDownloadingStatement(false);
    }
  };

  const columns: ColumnsType<Transaction> = [
    { title: "Transaction ID", dataIndex: "transaction_code", key: "transaction_code" },
    {
      title: "Order ID",
      dataIndex: "order_code",
      key: "order_code",
      render: (v: string) => <span className="text-blue-600 font-medium">#{v}</span>,
    },
    {
      title: `Amount (${DEFAULT_CURRENCY_SYMBOL})`,
      dataIndex: "amount",
      key: "amount",
      render: (v: string) => Number(v).toLocaleString(),
    },
    {
      title: "Payment Date",
      dataIndex: "payment_date",
      key: "payment_date",
      render: (v: string | null) => (v ? dayjs(v).format("MMM DD, YYYY") : "--"),
    },
    { title: "Reference Number", dataIndex: "reference_number", key: "reference_number" },
    {
      title: "Payment Status",
      dataIndex: "payment_status",
      key: "payment_status",
      render: (v: string) => <StatusPill status={v} />,
    },
  ];

  const selectedTxn = rows.find((t) => t.id === selectedTxnId) || null;

  return (
    <div className="space-y-6 px-4 md:px-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Wallet</h1>
          <p className="text-sm md:text-base text-gray-500">View your transaction history and payment status.</p>
        </div>
        <div className="flex gap-3">
          <Button type="primary" icon={<DownloadOutlined />} loading={downloadingStatement} onClick={handleStatement}>
            Download Statement
          </Button>
          <Button icon={<ExportOutlined />} loading={exporting} onClick={handleExport}>
            Export Transactions
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="text-xs text-gray-400 mb-1">Total Earnings</div>
          {summaryLoading ? <Skeleton.Input active size="small" /> : <div className="text-xl font-bold">{formatCurrency(summary?.total_earnings || 0)}</div>}
          <div className="text-xs text-gray-400 mt-1">All completed payments</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="text-xs text-gray-400 mb-1">Pending Payments</div>
          {summaryLoading ? <Skeleton.Input active size="small" /> : <div className="text-xl font-bold">{formatCurrency(summary?.pending_payments || 0)}</div>}
          <div className="text-xs text-gray-400 mt-1">Awaiting release</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="text-xs text-gray-400 mb-1">Transactions</div>
          {summaryLoading ? <Skeleton.Input active size="small" /> : <div className="text-xl font-bold">{summary?.transactions_count ?? 0}</div>}
          <div className="text-xs text-gray-400 mt-1">Total recorded</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="text-xs text-gray-400 mb-1">Last Payment</div>
          {summaryLoading ? (
            <Skeleton.Input active size="small" />
          ) : (
            <div className="text-xl font-bold">{summary?.last_payment_amount ? formatCurrency(summary.last_payment_amount) : "--"}</div>
          )}
          <div className="text-xs text-gray-400 mt-1">
            {summary?.last_payment_date ? dayjs(summary.last_payment_date).format("MMM DD, YYYY") : "No payments yet"}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 md:p-6">
        <div className="flex flex-col md:flex-row gap-3 md:items-center mb-4">
          <Input
            placeholder="Search transactions"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 h-10"
          />
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 whitespace-nowrap">Time</span>
            <Select
              value={timeRange}
              onChange={(v) => {
                setTimeRange(v);
                setPage(1);
              }}
              className="w-40"
              options={[
                { value: "7d", label: "Last 7 days" },
                { value: "30d", label: "Last 30 days" },
                { value: "all", label: "All time" },
              ]}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 whitespace-nowrap">Status</span>
            <Select
              value={status}
              onChange={(v) => {
                setStatus(v);
                setPage(1);
              }}
              allowClear
              placeholder="All status"
              className="w-40"
              options={[
                { value: "success", label: "Completed" },
                { value: "pending", label: "Pending" },
                { value: "failed", label: "Failed" },
                { value: "refunded", label: "Refunded" },
              ]}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : (
            <Table<Transaction>
              rowKey="id"
              columns={columns}
              dataSource={rows}
              pagination={{
                current: data?.data?.page_number || page,
                pageSize: data?.data?.per_page || 10,
                total: data?.data?.count || 0,
                onChange: setPage,
              }}
              onRow={(record) => ({
                onClick: () => setSelectedTxnId(record.id),
                className: "cursor-pointer hover:bg-[#F8FAFF] transition-colors",
              })}
            />
          )}
        </div>

        {!isLoading && (
          <div className="text-xs text-gray-400 mt-3">
            You have {data?.data?.count ?? 0} transactions (Displaying {data?.data?.per_page ?? 10} per page)
          </div>
        )}
      </div>

      <TransactionDetailModal
        transactionId={selectedTxnId}
        fallback={selectedTxn}
        onClose={() => setSelectedTxnId(null)}
      />
    </div>
  );
}

function TransactionDetailModal({
  transactionId,
  fallback,
  onClose,
}: {
  transactionId: string | null;
  fallback: Transaction | null;
  onClose: () => void;
}) {
  const [downloading, setDownloading] = useState(false);
  const { data } = useQuery({
    queryKey: ["transactionDetail", transactionId],
    queryFn: () => getTransactionDetail(transactionId as string),
    enabled: !!transactionId,
  });

  const detail: TransactionDetail | undefined = data?.data;
  const txn: Transaction | TransactionDetail | null = detail || fallback;
  if (!transactionId || !txn) return null;

  const timeline: TransactionTimelineEntry[] = detail?.timeline || [];
  const bankDestination: string | null = detail?.bank_destination || null;

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const blob = await downloadTransactionStatement(transactionId);
      downloadBlob(`${txn.transaction_code}.pdf`, blob);
    } catch {
      showToast("Failed to generate statement", "error");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Modal open={!!transactionId} onCancel={onClose} footer={null} closeIcon={<CloseOutlined />} width={700}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">{txn.transaction_code}</h2>
        <StatusPill status={txn.payment_status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Transaction Timeline</h3>
          {timeline.length > 0 ? (
            <div className="relative pl-4 space-y-6 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
              {timeline.map((entry, i) => (
                <div key={i} className="relative pl-6">
                  <div
                    className={`absolute left-0 top-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                      entry.status === "failed" ? "bg-red-500" : "bg-indigo-900"
                    }`}
                  />
                  <h4 className="text-sm font-medium text-gray-900">{entry.label}</h4>
                  {entry.timestamp && (
                    <p className="text-xs text-gray-500 mt-1">{dayjs(entry.timestamp).format("MMM DD, YYYY, hh:mm A")}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400">No timeline events recorded yet.</p>
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Transaction Details</h3>
          <div className="divide-y divide-gray-100">
            <div className="py-2.5">
              <div className="text-xs text-gray-400">Order ID</div>
              <div className="text-sm font-medium text-blue-600">#{txn.order_code}</div>
            </div>
            <div className="py-2.5">
              <div className="text-xs text-gray-400">Amount</div>
              <div className="text-sm font-medium text-gray-900">{DEFAULT_CURRENCY_SYMBOL}{Number(txn.amount).toLocaleString()}</div>
            </div>
            <div className="py-2.5">
              <div className="text-xs text-gray-400">Payment Method</div>
              <div className="text-sm font-medium text-gray-900 capitalize">{txn.payment_method || "--"}</div>
            </div>
            <div className="py-2.5">
              <div className="text-xs text-gray-400">Reference Number</div>
              <div className="text-sm font-medium text-gray-900">{txn.reference_number}</div>
            </div>
            <div className="py-2.5">
              <div className="text-xs text-gray-400">Payment Date</div>
              <div className="text-sm font-medium text-gray-900">{dayjs(txn.created_at).format("MMM DD, YYYY")}</div>
            </div>
            {bankDestination && (
              <div className="py-2.5">
                <div className="text-xs text-gray-400">Bank Destination</div>
                <div className="text-sm font-medium text-gray-900">{bankDestination}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Button icon={<DownloadOutlined />} loading={downloading} onClick={handleDownload}>
          Download Statement
        </Button>
      </div>
    </Modal>
  );
}
