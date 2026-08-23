"use client";

import { Button, Input, Tag, Avatar, Skeleton } from "antd";
import {
  BellOutlined,
  DoubleLeftOutlined,
  DoubleRightOutlined,
  DownOutlined,
  MenuOutlined,
  SearchOutlined,
  UserOutlined,
  CheckCircleFilled,
  ClockCircleFilled,
  SyncOutlined,
  ExclamationCircleFilled,
  CloseCircleFilled,
  MessageOutlined
} from "@ant-design/icons";
import { useUIStore } from "@/src/store/ui/ui.store";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getUser } from "@/src/features/onboarding/api";

// Mirrors compliance.choices.Status on the backend - the miner's real
// compliance review status, not the coarse account_verified boolean. A miner
// with no review yet (new signup) is served "pending" by the API.
const COMPLIANCE_STATUS_STYLES: Record<
  string,
  { label: string; className: string; icon: React.ReactNode }
> = {
  approved: {
    label: "Verified Miner",
    className: "bg-green-50 border-green-200 text-green-700",
    icon: <CheckCircleFilled className="text-green-600" />,
  },
  pending: {
    label: "Pending Verification",
    className: "bg-gray-50 border-gray-200 text-gray-600",
    icon: <ClockCircleFilled className="text-gray-500" />,
  },
  claimed: {
    label: "Under Review",
    className: "bg-blue-50 border-blue-200 text-blue-700",
    icon: <SyncOutlined className="text-blue-600" />,
  },
  under_review: {
    label: "Under Review",
    className: "bg-blue-50 border-blue-200 text-blue-700",
    icon: <SyncOutlined className="text-blue-600" />,
  },
  requires_info: {
    label: "Action Required",
    className: "bg-orange-50 border-orange-200 text-orange-700",
    icon: <ExclamationCircleFilled className="text-orange-600" />,
  },
  red_flagged: {
    label: "Flagged",
    className: "bg-red-50 border-red-200 text-red-700",
    icon: <CloseCircleFilled className="text-red-600" />,
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-50 border-red-200 text-red-700",
    icon: <CloseCircleFilled className="text-red-600" />,
  },
};

export default function Header() {
  const { openMobileSidebar, sidebarCollapsed, toggleSidebar } = useUIStore();

  const { data, isLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: getUser,
  });

  const user = data?.data;
  const complianceStatus = COMPLIANCE_STATUS_STYLES[user?.profile?.compliance_status] || null;
  const minerId = user?.profile?.miner_code ? `Miner ID: ${user.profile.miner_code}` : "";
  const userName = user?.company_name || user?.email?.split('@')[0] || "Miner";

  return (
    <header className="h-20 bg-white border-none flex items-center justify-between px-4 lg:px-8">
      {/* Left Section: Toggle + Portal Title + Badge */}
      <div className="flex items-center gap-4">
        {/* Mobile Toggle - explicitly only on mobile */}
        <div className="lg:hidden flex items-center">
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={openMobileSidebar}
          />
        </div>

        {/* Desktop Toggle - collapse/expand the sidebar */}
        <div className="hidden lg:flex items-center">
          <Button
            type="text"
            shape="circle"
            icon={sidebarCollapsed ? <DoubleRightOutlined /> : <DoubleLeftOutlined />}
            onClick={toggleSidebar}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="bg-gray-50"
          />
        </div>

        <div className="flex items-center ml-4 gap-3">
          <span className="text-gray-600 font-medium hidden sm:inline-block">Miner Portal</span>
          {isLoading ? (
            <Skeleton.Button active size="small" style={{ width: 100 }} />
          ) : (
            complianceStatus && (
              <div
                className={`flex items-center gap-1.5 px-3 py-1 border rounded-full text-xs font-medium ${complianceStatus.className}`}
              >
                {complianceStatus.icon}
                {complianceStatus.label}
              </div>
            )
          )}
        </div>
      </div>

      {/* Center Section: Search */}
      {/* <div className="flex-1 max-w-xl mx-4 hidden md:block">
        <Input
          prefix={<SearchOutlined className="text-gray-400" />}
          placeholder="Search miner"
          className="rounded-full bg-gray-50 border-gray-200 hover:bg-white focus:bg-white"
          size="large"
        />
      </div> */}

      {/* Right Section: Notifications + Profile */}
      <div className="flex items-center gap-3 lg:gap-6">
        {/* <div className="flex items-center gap-2">
          <Button type="text" shape="circle" icon={<BellOutlined className="text-gray-600 text-lg" />} className="bg-gray-50" />
          <Button type="text" shape="circle" icon={<MessageOutlined className="text-gray-600 text-lg" />} className="bg-gray-50" />
        </div> */}

        <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

        <Link href="/dashboard/settings" className="flex items-center gap-2">
          <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <Skeleton.Input active size="small" style={{ width: 80, height: 16 }} />
                <Skeleton.Input active size="small" style={{ width: 60, height: 12, marginTop: 4 }} />
              </div>
              <Skeleton.Avatar active />
            </div>
          ) : (
            <>
              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold text-gray-900 leading-tight">{userName}</div>
                {minerId && <div className="text-xs text-gray-500 mt-0.5">{minerId}</div>}
              </div>
              <Avatar
                size={40}
                src={user?.profile_picture}
                icon={!user?.profile_picture && <UserOutlined />}
                className="border border-gray-200"
              />
              {/* <DownOutlined className="text-gray-400 text-xs hidden sm:inline-block" /> */}
            </>
          )}
        </div>
        </Link>
      </div>
    </header>
  );
}
