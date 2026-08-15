"use client";

import Image from "next/image";
import Link from "next/link";
import { Drawer } from "antd";
import { useQueryClient } from "@tanstack/react-query";
import { CloseOutlined, LogoutOutlined } from "@ant-design/icons";
import type { DashboardPersona, ComplianceView, NavItem } from "@/src/features/compliance/dashboard/types";
import { classNames } from "@/src/features/compliance/dashboard/lib/style";
import { getAdminNavItems, getComplianceNavItems } from "@/src/features/compliance/dashboard/components/layout/nav";

function SidebarNavItem({ item }: { item: NavItem }) {
  const className = classNames(
    "flex w-full items-center gap-3 rounded- border-r-4 px-5 py-4 text-left text-[16px] font-medium transition-colors",
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
      <span>{item.label}</span>
      {item.showDot ? (
        <span className="ml-auto h-2.5 w-2.5 rounded-full bg-[#ff4726]" />
      ) : null}
    </>
  );

  if (item.href) {
    return (
      <Link href={item.href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={className}>
      {content}
    </button>
  );
}

function SidebarLogo() {
  return (
    <div className="flex h-[96px] items-center gap-2 px-6 font-bungee">
      <Image src="/assets/images/logo.png" alt="Beldium" width={30} height={30} />
      <span className="text-2xl text-primary">Beldium</span>
    </div>
  );
}

function SidebarNav({
  navItems,
  onNavigate,
}: {
  navItems: NavItem[];
  onNavigate?: () => void;
}) {
  const queryClient = useQueryClient();

  return (
    <>
      <nav className="mt-6 flex flex-1 flex-col gap-4 pr-3 xl:mt-12 xl:gap-6" onClick={onNavigate}>
        {navItems.map((item) => (
          <SidebarNavItem key={item.label} item={item} />
        ))}
      </nav>

      <div className="px-6 pb-10">
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
          Logout
        </button>
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
  const navItems =
    persona === "admin"
      ? getAdminNavItems(complianceView)
      : getComplianceNavItems(complianceView);

  return (
    <>
      <aside className="hidden w-[280px] flex-col border-r border-[#e9edf5] bg-white xl:flex">
        <SidebarLogo />
        <SidebarNav navItems={navItems} />
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

