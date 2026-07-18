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
  MessageOutlined
} from "@ant-design/icons";
import { useUIStore } from "@/src/store/ui/ui.store";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getUser } from "@/src/features/onboarding/api";

export default function Header() {
  const { openMobileSidebar, sidebarCollapsed, toggleSidebar } = useUIStore();

  const { data, isLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: getUser,
  });

  const user = data?.data;
  const isVerified = user?.account_verified;
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
        
        <div className="flex items-center ml-4 gap-3">
          <span className="text-gray-600 font-medium hidden sm:inline-block">Miner Portal</span>
          {isLoading ? (
            <Skeleton.Button active size="small" style={{ width: 100 }} />
          ) : (
            isVerified && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-200 rounded-full text-green-700 text-xs font-medium">
                <CheckCircleFilled className="text-green-600" />
                Verified Miner
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
        <div className="flex items-center gap-2">
          <Button type="text" shape="circle" icon={<BellOutlined className="text-gray-600 text-lg" />} className="bg-gray-50" />
          <Button type="text" shape="circle" icon={<MessageOutlined className="text-gray-600 text-lg" />} className="bg-gray-50" />
        </div>

        <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

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
              <DownOutlined className="text-gray-400 text-xs hidden sm:inline-block" />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
