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
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block flex-shrink-0">
        <Sidebar isMobile={false} />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar />
      <MobileLeaderBoard />

      {/* Main */}
      <div className="flex flex-col flex-1 lg:px-6">
        <Header />
        <main className="flex-1 overflow-y-scroll p-6">{children}</main>
      </div>
      <div className="hidden lg:block flex-shrink-0">
        <LeaderBoard />
      </div>
    </div>
  );
}
