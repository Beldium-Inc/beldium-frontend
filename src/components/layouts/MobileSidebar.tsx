"use client";

import { Drawer } from "antd";
import { useUIStore } from "@/src/store/ui/ui.store";
import Sidebar from "./Sidebar";

export default function MobileSidebar() {
  const open = useUIStore((state) => state.mobileSidebarOpen);
  const close = useUIStore((state) => state.closeMobileSidebar);

  return (
    <Drawer
      placement="left"
      open={open}
      onClose={close}
      className="mobile-sidebar"
      styles={{ body: { padding: 0 } }}
      size={260}
    >
      <Sidebar isMobile />
    </Drawer>
  );
}
