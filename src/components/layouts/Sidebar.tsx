"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { useUIStore } from "@/store/ui/ui.store";
import { AppRoutes } from "@/constants/routes";
import { UserOutlined } from "@ant-design/icons";
import { normalizePath } from "@/utils";

export default function Sidebar({ isMobile }: { isMobile: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarCollapsed, closeMobileSidebar } = useUIStore();

  return (
    <aside
      className={clsx(
        "relative min-h-screen bg-white flex flex-col transition-all duration-300 ease-in-out",
        sidebarCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-16 px-6 flex items-center font-bungee text-2xl">
        {sidebarCollapsed ? "M" : "MONEXAY"}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-4 flex flex-col gap-4">
        {AppRoutes.map((item) => {
          const currentPath = normalizePath(pathname);
          const itemPath = normalizePath(item.href);

          const isActive =
            currentPath === itemPath || currentPath.endsWith(`${itemPath}/`);

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
                "w-full flex cursor-pointer items-center gap-3 px-4 py-4 rounded-md text-sm transition-colors text-left",
                isActive
                  ? "bg-secondary text-primary font-medium"
                  : "text-slate-800 hover:bg-light-secondary hover:text-white"
              )}
            >
              <Icon className="text-base" />
              {!sidebarCollapsed && item.label}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <Link
        href="/"
        className="flex gap-4 items-center px-6 py-4 text-slate-700 hover:bg-slate-100"
      >
        <UserOutlined />
        {!sidebarCollapsed && "Log out"}
      </Link>
    </aside>
  );
}
