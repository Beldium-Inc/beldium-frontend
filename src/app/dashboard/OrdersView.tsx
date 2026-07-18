"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Dayjs } from "dayjs";
import {
  getOrdersOverview,
  getOpenQueue,
  getActiveOrders,
  getOrderHistory
} from "@/src/features/miner/dashboard/api";
import OrdersStatsCards from "@/src/features/miner/orders/components/StatsCards";
import NewRequestsList from "@/src/features/miner/orders/components/NewRequestsList";
import ActiveOrdersTable from "@/src/features/miner/orders/components/ActiveOrdersTable";
import OrderHistoryView from "@/src/features/miner/orders/components/OrderHistoryView";
import MobileScrollableTabs from "@/src/features/miner/orders/components/MobileScrollableTabs";

export default function OrdersView() {
  const [activeTab, setActiveTab] = useState<'new_requests' | 'active_orders' | 'history'>('new_requests');
  const [page, setPage] = useState(1);

  // Active Orders filters
  const [activePaymentStatus, setActivePaymentStatus] = useState("all");
  const [activeShipmentStatus, setActiveShipmentStatus] = useState("all");

  // Order History filters
  const [historyStatus, setHistoryStatus] = useState("all");
  const [historyPaymentStatus, setHistoryPaymentStatus] = useState("all");
  const [deliveredFrom, setDeliveredFrom] = useState<Dayjs | null>(null);
  const [deliveredTo, setDeliveredTo] = useState<Dayjs | null>(null);

  // Queries
  const overviewQ = useQuery({
    queryKey: ["ordersOverview"],
    queryFn: getOrdersOverview,
  });

  const newRequestsQ = useQuery({
    queryKey: ["newRequests", { page }],
    queryFn: () => getOpenQueue({ page, per_page: 10 }),
    enabled: activeTab === 'new_requests',
  });

  const activeOrdersQ = useQuery({
    queryKey: ["activeOrders", { page, shipmentStatus: activeShipmentStatus }],
    queryFn: () =>
      getActiveOrders({
        page,
        per_page: 10,
        shipment_status: activeShipmentStatus === "all" ? undefined : activeShipmentStatus,
      }),
    enabled: activeTab === 'active_orders',
  });

  const historyQ = useQuery({
    queryKey: [
      "orderHistory",
      {
        page,
        status: historyStatus,
        deliveredFrom: deliveredFrom?.format("YYYY-MM-DD"),
        deliveredTo: deliveredTo?.format("YYYY-MM-DD"),
      },
    ],
    queryFn: () =>
      getOrderHistory({
        page,
        per_page: 10,
        status: historyStatus === "all" ? undefined : historyStatus,
        delivered_after: deliveredFrom?.format("YYYY-MM-DD"),
        delivered_before: deliveredTo?.format("YYYY-MM-DD"),
      }),
    enabled: activeTab === 'history',
  });

  // Derived Data
  const stats = overviewQ.data?.data;
  const newRequests = newRequestsQ.data?.data?.results || [];
  const activeOrders = activeOrdersQ.data?.data?.results || [];
  const history = historyQ.data?.data?.results || [];

  const handleTabChange = (tab: 'new_requests' | 'active_orders' | 'history') => {
    setActiveTab(tab);
    setPage(1); // Reset page on tab change
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0 px-4 md:px-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl md:text-3xl font- text-gray-900">Orders</h1>
        <p className="text-xs md:text-sm text-gray-500">Track and manage buyer transactions.</p>
      </div>

      {/* Stats Cards */}
      <OrdersStatsCards
        incomingRfqs={stats?.incoming_rfqs || 0}
        activeOrders={stats?.active_orders || 0}
        compliancePending={stats?.compliance_pending || 0}
        completedOrders={stats?.completed_orders || 0}
        loading={overviewQ.isLoading}
      />

      {/* Tabs & Content */}
      <MobileScrollableTabs
        activeTab={activeTab}
        onTabChange={(id) => handleTabChange(id as 'new_requests' | 'active_orders' | 'history')}
        tabs={[
          { id: 'new_requests', label: 'New Requests', badgeCount: stats?.incoming_rfqs || 0 },
          { id: 'active_orders', label: 'Active Orders', badgeCount: stats?.active_orders || 0 },
          { id: 'history', label: 'Order History' },
        ]}
      >
        {activeTab === 'new_requests' && (
          <NewRequestsList
            items={newRequests}
            loading={newRequestsQ.isLoading}
          />
        )}

        {activeTab === 'active_orders' && (
          <ActiveOrdersTable
            items={activeOrders}
            loading={activeOrdersQ.isLoading}
            total={activeOrdersQ.data?.data?.count}
            page={page}
            perPage={10}
            onPageChange={setPage}
            paymentStatus={activePaymentStatus}
            onPaymentStatusChange={setActivePaymentStatus}
            shipmentStatus={activeShipmentStatus}
            onShipmentStatusChange={(value) => {
              setActiveShipmentStatus(value);
              setPage(1);
            }}
          />
        )}

        {activeTab === 'history' && (
          <OrderHistoryView
            items={history}
            loading={historyQ.isLoading}
            total={historyQ.data?.data?.count}
            page={page}
            perPage={10}
            onPageChange={setPage}
            totalVolume={stats?.total_volume_sold != null ? String(stats.total_volume_sold) : undefined}
            totalRevenue={stats?.total_revenue != null ? String(stats.total_revenue) : undefined}
            lastTransactionDate={
              stats?.last_transaction_date
                ? new Date(stats.last_transaction_date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : undefined
            }
            status={historyStatus}
            onStatusChange={(value) => {
              setHistoryStatus(value);
              setPage(1);
            }}
            paymentStatus={historyPaymentStatus}
            onPaymentStatusChange={setHistoryPaymentStatus}
            deliveredFrom={deliveredFrom}
            onDeliveredFromChange={(value) => {
              setDeliveredFrom(value);
              setPage(1);
            }}
            deliveredTo={deliveredTo}
            onDeliveredToChange={(value) => {
              setDeliveredTo(value);
              setPage(1);
            }}
          />
        )}
      </MobileScrollableTabs>
    </div>
  );
}
