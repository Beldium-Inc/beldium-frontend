"use client";

import { Button } from "antd";
import {
  AppstoreOutlined,
  DoubleLeftOutlined,
  DoubleRightOutlined,
  MenuOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useUIStore } from "@/store/ui/ui.store";
import Breadcrumbs from "./Breadcrumbs";

export default function Header() {
  const {
    openMobileLeaderBoard,
    openMobileSidebar,
    sidebarCollapsed,
    toggleSidebar,
  } = useUIStore();

  return (
    <header className="h-16 bg-gray-100 flex items-center justify-between px-3 lg:px-6">
      <div className="flex items-center justify-between w-full gap-4">
        {/* Mobile */}
        <div className="flex gap-4 items-center">
          <span className="lg:hidden">
            <Button
              type="text"
              icon={<MenuOutlined />}
              className="lg:hidden"
              onClick={openMobileSidebar}
            />
          </span>

          {/* Desktop */}
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

          <Breadcrumbs />
        </div>

        {/* Leader Board Mobile */}
        <div className="flex items-center gap-4 lg:hidden">
          <span className="lg:hidden">
            <Button
              type="text"
              icon={<AppstoreOutlined />}
              className="lg:hidden"
              onClick={openMobileLeaderBoard}
            />
          </span>
          <span className="flex justify-center items-center w-8 h-8 border rounded-full text-sm">
            <UserOutlined />
          </span>
        </div>
      </div>
    </header>
  );
}
