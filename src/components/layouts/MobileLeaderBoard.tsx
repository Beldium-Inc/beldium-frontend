"use client";

import { Drawer } from "antd";
import { useUIStore } from "@/src/store/ui/ui.store";
import Sidebar from "./Sidebar";
import LeaderBoard from "./LeaderBoard";

const MobileLeaderBoard = () => {
  const open = useUIStore((state) => state.mobileLeaderBoardOpen);
  const close = useUIStore((state) => state.closeMobileLeaderBoard);

  return (
    <Drawer
      placement="right"
      open={open}
      onClose={close}
      className="mobile-sidebar"
      styles={{ body: { padding: 0 } }}
      size={260}
    >
      <LeaderBoard />
    </Drawer>
  );
};

export default MobileLeaderBoard;
