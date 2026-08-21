"use client";

import Image from "next/image";
import Link from "next/link";
import { Drawer, Tooltip } from "antd";
import { useQueryClient } from "@tanstack/react-query";
import {
  CloseOutlined,
  LogoutOutlined,
  DoubleLeftOutlined,
  DoubleRightOutlined,
} from "@ant-design/icons";
import type { DashboardPersona, ComplianceView, NavItem } from "@/src/features/compliance/dashboard/types";
import { classNames } from "@/src/features/compliance/dashboard/lib/style";
import { getAdminNavItems, getComplianceNavItems } from "@/src/features/compliance/dashboard/components/layout/nav";
import { useUIStore } from "@/src/store/ui/ui.store";

function SidebarNavItem({ item, collapsed }: { item: NavItem; collapsed?: boolean }) {
  const className = classNames(
    "flex w-full items-center gap-3 rounded- border-r-4 px-5 py-4 text-left text-[16px] font-medium transition-colors",
    collapsed && "justify-center px-0",
    item.active
      ? "border-r-[#101e3d] bg-[#d9e8ff] text-[#101e3d]"
      : "border-r-transparent text-[#3b4253] hover:bg-white hover:text-[#101e3d]",
  );
  const content = (
    <>
      <span
        className={classNames(
          "text-[20px]",
          item.active ? "text-[#123f8f]" : "text-[#202534]",
        )}
      >
        {item.icon}
      </span>
      {!collapsed && <span>{item.label}</span>}
      {item.showDot && !collapsed ? (
        <span className="ml-auto h-2.5 w-2.5 rounded-full bg-[#ff4726]" />
      ) : null}
    </>
  );

  const inner = item.href ? (
    <Link href={item.href} className={className}>
      {content}
    </Link>
  ) : (
    <button type="button" className={className}>
      {content}
    </button>
  );

  if (collapsed) {
    return <Tooltip title={item.label} placement="right">{inner}</Tooltip>;
  }

  return inner;
}

function SidebarLogo({
  collapsed,
  showToggle,
  onToggle,
}: {
  collapsed?: boolean;
  showToggle?: boolean;
  onToggle?: () => void;
}) {
  return (
    <div
      className={classNames(
        "flex h-[96px] items-center gap-2 px-6",
        collapsed && "justify-center px-0",
      )}
    >
      <Image src="/assets/images/logo.png" alt="Beldium" width={30} height={30} />
      {!collapsed && (
        <span className="text-2xl font-semibold text-primary">BELDIUM</span>
      )}
      {showToggle && (
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={classNames(
            "flex h-8 w-8 items-center justify-center rounded-full bg-[#f9fafc] text-[#2a3142] transition-colors hover:bg-white",
            collapsed ? "mt-2" : "ml-auto",
          )}
        >
          {collapsed ? <DoubleRightOutlined /> : <DoubleLeftOutlined />}
        </button>
      )}
    </div>
  );
}

function SidebarNav({
  navItems,
  collapsed,
  onNavigate,
}: {
  navItems: NavItem[];
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const queryClient = useQueryClient();

  return (
    <>
      <nav
        className={classNames(
          "mt-6 flex flex-1 flex-col gap-4 xl:mt-12 xl:gap-6",
          collapsed ? "pr-0" : "pr-3",
        )}
        onClick={onNavigate}
      >
        {navItems.map((item) => (
          <SidebarNavItem key={item.label} item={item} collapsed={collapsed} />
        ))}
      </nav>

      <div className={classNames("px-6 pb-10", collapsed && "flex justify-center px-0")}>
        <Tooltip title={collapsed ? "Logout" : ""} placement="right">
          <button
            type="button"
            onClick={() => {
              sessionStorage.clear();
              queryClient.clear();
              window.location.href = "/login";
            }}
            className="inline-flex items-center gap-3 text-[16px] font-medium text-[#ef2f32] transition-colors hover:text-[#d72225]"
          >
            <LogoutOutlined className="text-[18px]" />
            {!collapsed && "Logout"}
          </button>
        </Tooltip>
      </div>
    </>
  );
}

export default function DashboardSidebar({
  persona,
  complianceView = "dashboard",
  mobileOpen = false,
  onMobileClose,
}: {
  persona: DashboardPersona;
  complianceView?: ComplianceView;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}) {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const navItems =
    persona === "admin"
      ? getAdminNavItems(complianceView)
      : getComplianceNavItems(complianceView);

  return (
    <>
      <aside
        className={classNames(
          "hidden flex-col border-r border-[#e9edf5] bg-white transition-all duration-300 ease-in-out xl:flex",
          sidebarCollapsed ? "w-20" : "w-[280px]",
        )}
      >
        <SidebarLogo collapsed={sidebarCollapsed} showToggle onToggle={toggleSidebar} />
        <SidebarNav navItems={navItems} collapsed={sidebarCollapsed} />
      </aside>

      <Drawer
        placement="left"
        open={mobileOpen}
        onClose={onMobileClose}
        width={280}
        closeIcon={null}
        styles={{ body: { padding: 0, display: "flex", flexDirection: "column" } }}
        className="xl:hidden"
      >
        <div className="flex items-center justify-between border-b border-[#f0f3f8] px-2">
          <SidebarLogo />
          <button
            type="button"
            onClick={onMobileClose}
            aria-label="Close menu"
            className="mr-4 flex h-9 w-9 items-center justify-center rounded-full text-[16px] text-[#4f5664] hover:bg-[#f7f9fc]"
          >
            <CloseOutlined />
          </button>
        </div>
        <SidebarNav navItems={navItems} onNavigate={onMobileClose} />
      </Drawer>
    </>
  );
}

