"use client";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, Skeleton } from "antd";
import { PlusOutlined, ShopOutlined } from "@ant-design/icons";
import { getMinerOverview, getOpenQueue } from "@/src/features/miner/dashboard/api";
import { getUser } from "@/src/features/onboarding/api";
import OverviewCards from "@/src/features/miner/dashboard/components/OverviewCards";
import OpenQueueTable from "@/src/features/miner/dashboard/components/OpenQueueTable";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import OrdersView from "./OrdersView";
import ListingView from "./ListingView";
import CreateListingView from "./CreateListingView";

export default function MinerDashboardPage() {
  const searchParams = useSearchParams();
  const view = searchParams.get('view');

  const userQ = useQuery({
    queryKey: ["userProfile"],
    queryFn: getUser,
  });

  const overviewQ = useQuery({
    queryKey: ["minerOverview"],
    queryFn: () => getMinerOverview(),
  });

  const queueQ = useQuery({
    queryKey: ["openQueue", { page: 1 }],
    queryFn: () => getOpenQueue({ page: 1, per_page: 10 }),
  });

  if (view === 'orders') {
    return <OrdersView />;
  }
  if (view === 'listings') {
    return <ListingView />;
  }
  if (view === 'create_listing') {
    return <CreateListingView />;
  }

  const user = userQ.data?.data;
  const companyName = user?.company_name || "Miner";
  const overview = overviewQ.data?.data;
  const account = overview?.account_health;
  const active = overview?.active_orders;
  const pending = overview?.pending_actions;
  const items = queueQ.data?.data?.results || [];
  // Compliance audit status is reviewed by a compliance officer after documents
  // are uploaded - not something re-visiting the onboarding wizard can "finish"
  // (and the wizard redirects straight back to /dashboard once onboarding is
  // already complete, regardless of any ?step= param). Send miners to the
  // actual Compliance page where they can upload/track required documents.
  const complianceBannerHref = "/dashboard/compliance";

  return (
    <div className="space-y-6 pb-20 md:pb-0 px-4 md:px-6 max-w-full  overflow-x-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="w-full">
          <div className="text-xl md:text-3xl font">Overview</div>
          <div className="text-xs md:text-sm text-gray-500 mt-1">
            {userQ.isLoading ? (
              <Skeleton.Input active size="small" className="!w-48 md:!w-72" />
            ) : (
              `Welcome back, ${companyName}. Your site is operational`
            )}
          </div>
        </div>
      </div>

      <OverviewCards
        kyc={account?.kyc_status || ""}
        compliance={account?.compliance_audit || ""}
        access={(account?.marketplace_access || "").toString()}
        activeCount={active?.count || 0}
        activeChange={active?.percentage_change || 0}
        pendingCount={pending?.count || 0}
        showComplianceBanner={Boolean(account) && account?.compliance_audit !== "approved"}
        complianceBannerHref={complianceBannerHref}
        loading={overviewQ.isLoading}
      />

      {/* Blue Gradient Banner / Mobile CTA */}
      {overviewQ.isLoading ? (
        <Skeleton active paragraph={{ rows: 3 }} className="p-6 rounded-2xl border border-gray-100 bg-white" />
      ) : (
        <>
          {/* Desktop/Tablet Banner */}
          <div className="hidden lg:flex rounded-xl md:rounded-2xl bg-gradient-to-r from-blue-900 to-teal-500 p-5 md:p-8 text-white flex-col md:flex-row items-center justify-between shadow-lg relative overflow-hidden gap-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-4 relative z-10 w-full md:w-auto text-center sm:text-left">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl shrink-0 mx-auto sm:mx-0">
                <ShopOutlined />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Ready to list your resources</h3>
                <p className="text-blue-100 text-sm max-w-md">
                  Increase your market visibility by adding new mineral resources
                </p>
              </div>
            </div>
            
            <div className="relative z-10 w-full md:w-auto flex justify-center md:justify-end">
              <Button 
                type="primary" 
                size="large" 
                icon={<PlusOutlined />}
                className="bg-teal-900 border-none hover:!bg-teal-950 font-medium h-10 px-6 w-full sm:w-auto"
                onClick={() => location.assign('/dashboard?view=create_listing')}
              >
                Create new mineral listing
              </Button>
            </div>

            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
          </div>

          {/* Mobile CTA Only - Enhanced with gradient background */}
          <div className="lg:hidden w-full rounded-xl bg-gradient-to-r from-blue-900 to-teal-500 p-4 shadow-md relative overflow-hidden">
            <div className="relative z-10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
                  <ShopOutlined />
                </div>
                <div className="text-white font-medium text-sm">List your resources</div>
              </div>
              <Button 
                type="primary" 
                size="middle" 
                icon={<PlusOutlined />}
                className="bg-white text-blue-900 border-none font-bold h-9 px-4 rounded-lg shadow-sm hover:!bg-gray-100"
                onClick={() => location.assign('/dashboard?view=create_listing')}
              >
                Create
              </Button>
            </div>
            {/* Minimal decorative circles for mobile */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          </div>
        </>
      )}

      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="text-xl md:text-2xl font-semibold">Recent Orders</div>
          <Link href="/dashboard?view=orders" className="text-blue-600">View all</Link>
        </div>
        <p className="text-xs md:text-sm text-gray-500 -mt-2 mb-4">
          Your latest requests and orders, newest first.
        </p>
        <OpenQueueTable items={items} loading={queueQ.isLoading} />
        <div className="text-xs text-gray-500 mt-3">
          You have {queueQ.data?.data?.count || 0} orders (Displaying {queueQ.data?.data?.per_page || 10} per page)
        </div>
      </Card>
    </div>
  );
}
