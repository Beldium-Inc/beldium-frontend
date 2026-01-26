"use client";

import { Button } from "antd";
import {
  AppstoreOutlined,
  BellOutlined,
  DoubleLeftOutlined,
  DoubleRightOutlined,
  MenuOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useUIStore } from "@/src/store/ui/ui.store";
import Link from "next/link";
import Breadcrumbs from "./Breadcrumbs";

export default function Header() {
  const { openMobileSidebar, sidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <header className="h-16 bg-gray-10 border-b border-gray-200 flex items-center justify-between px-3 lg:px-6">
      <div className="flex items-center justify-between w-full gap-4">
        {/* Mobile */}
        <div className="flex gap-4 items-center justify-between w-full">
          {/* Desktop */}

          <div className="flex gap-4 items-center">
            <span className="hidden lg:inline-block">
              <Button
                type="text"
                icon={
                  sidebarCollapsed ? (
                    <DoubleRightOutlined />
                  ) : (
                    <DoubleLeftOutlined />
                  )
                }
                className="hidden lg:inline-flex"
                onClick={toggleSidebar}
              />
            </span>
            <span className="lg:hidden">
              <Button
                type="text"
                icon={<MenuOutlined />}
                className="lg:hidden"
                onClick={openMobileSidebar}
              />
            </span>

            <Breadcrumbs />
          </div>
          <div className="hidden lg:flex h-16 px-6 items-start pt-4 justify-between font-semibold text-2xl">
            <Link href="/dashboard/notifications" className="">
              <BellOutlined />
            </Link>
            <p className="flex gap-3 items-center">
              <span className="text-sm">Akachukwu</span>
              <span className="flex justify-center items-center w-8 h-8 border rounded-full text-sm">
                <UserOutlined />
              </span>
            </p>
          </div>
        </div>

        {/* Leader Board Mobile */}
        <div className="flex items-center gap-4 lg:hidden">
          <span className="flex justify-center items-center w-8 h-8 border rounded-full text-sm">
            <UserOutlined />
          </span>
        </div>
      </div>
    </header>
  );
}
