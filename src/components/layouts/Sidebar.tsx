"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";
import { useQueryClient } from "@tanstack/react-query";
import { useUIStore } from "@/src/store/ui/ui.store";
import { AppRoutes } from "@/src/constants/routes";
import { UserOutlined, CustomerServiceOutlined, LogoutOutlined } from "@ant-design/icons";
import { normalizePath } from "@/src/utils";
import Image from "next/image";
import { Button, Tooltip } from "antd";

export default function Sidebar({ isMobile }: { isMobile: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const view = searchParams.get('view');
  const router = useRouter();
  const queryClient = useQueryClient();
  const { sidebarCollapsed, closeMobileSidebar } = useUIStore();

  return (
    <aside
      className={clsx(
        "relative min-h-screen border-0 bg-white flex flex-col transition-all duration-300 ease-in-out",
        sidebarCollapsed ? "w-20" : "w-64 lg:w-56 xl:w-64",
      )}
    >
      {/* Logo */}
      <div className="h-20 px-6 flex items-end font-bungee border-none pb-5 mb-6 text-2xl">
        {sidebarCollapsed ? (
          <>
            <Image
              src="/assets/images/logo.png"
              height={30}
              width={30}
              alt="logo"
            />
            {" Beldium"}
          </>
        ) : (
          <>
            <Image
              src="/assets/images/logo.png"
              height={30}
              width={30}
              alt="logo"
              className="mr-2"
            />
            <span className="text-primary">{" Beldium"}</span>
          </>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 pl-4 py-4 flex flex-col gap-4">
        {AppRoutes.map((item) => {
          const currentPath = normalizePath(pathname);
          const itemPath = normalizePath(item.href.split('?')[0]);
          const isOrders = item.key === 'orders';
          const isListings = item.key === 'listings';
          
          let isActive = false;
          if (isOrders) {
             // Active if view is orders OR we are in a sub-route of orders (like order details)
             isActive = view === 'orders' || currentPath.includes('/dashboard/orders');
          } else if (isListings) {
             // Active if listings/create_listing view is selected, or on a listing detail sub-route
             isActive = view === 'listings' || view === 'create_listing' || currentPath.includes('/dashboard/listings');
          } else {
             // For non-orders, ensure we are not in orders/listings view if on dashboard root
             if (item.href === '/dashboard' && (view === 'orders' || view === 'listings' || view === 'create_listing')) {
               isActive = false;
             } else {
               // Standard path matching, but exclude if we are in orders/listings sub-route
               isActive = (currentPath === itemPath || currentPath.endsWith(`${itemPath}/`)) && !currentPath.includes('/dashboard/orders') && !currentPath.includes('/dashboard/listings');
             }
          }

          const Icon = item.icon;

          return (
            <button
              key={item.key}
              onClick={() => {
                router.push(item.href);

                // ✅ Close drawer AFTER navigation
                if (isMobile) {
                  setTimeout(() => closeMobileSidebar(), 0);
                }
              }}
              className={clsx(
                "w-full flex cursor-pointer items-center gap-3 px-4 py-4 text-sm rounded-l-md transition-colors text-left",
                isActive
                  ? "bg-secondary text-primary font-medium border-r-3"
                  : "text-slate-800 hover:bg-light-secondary hover:text-white",
              )}
            >
              <Icon className="text-base" />
              {!sidebarCollapsed && item.label}
            </button>
          );
        })}
      </nav>

      {/* Logout - moved up and enhanced */}
      <div className="px-4 pb-2">
        <button
          type="button"
          onClick={() => {
            sessionStorage.clear();
            queryClient.clear();
            window.location.href = "/login";
          }}
          className={clsx(
            "flex w-full items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors",
            sidebarCollapsed && "justify-center px-2"
          )}
        >
          <LogoutOutlined className="text-lg" />
          {!sidebarCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>

      {/* Support Card */}
      {!sidebarCollapsed && (
        <div className="mx-4 mb-4 p-4 rounded-xl bg-teal-600 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-white/20">
                <CustomerServiceOutlined />
              </span>
              <span className="font-medium text-xs tracking-wider">SUPPORT</span>
            </div>
            <p className="text-sm mb-3 font-medium">
              Need assistance with your mining permits?
            </p>
            <Tooltip title="Support requests aren't wired to a backend endpoint yet">
              <Button
                block
                disabled
                className="bg-white text-teal-800 border-none font-medium h-9 hover:bg-gray-100! hover:text-teal-900!"
              >
                Contact Expert
              </Button>
            </Tooltip>
          </div>
          {/* Background decoration circles */}
          <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
          <div className="absolute bottom-8 -left-4 w-16 h-16 rounded-full bg-white/10" />
        </div>
      )}
    </aside>
  );
}
