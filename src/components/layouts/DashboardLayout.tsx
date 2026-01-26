"use client";

import Header from "./Header";
import LeaderBoard from "./LeaderBoard";
import MobileLeaderBoard from "./MobileLeaderBoard";
import MobileSidebar from "./MobileSidebar";
import Sidebar from "./Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex overflow-hidden bg-gray-10">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block flex-shrink-0 border-r border-gray-300">
        <Sidebar isMobile={false} />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar />

      {/* Main */}
      <div className="flex flex-col flex-1 lg:px-0">
        <Header />
        <main className="flex-1 overflow-y-scroll p-6">{children}</main>
      </div>
    </div>
  );
}
