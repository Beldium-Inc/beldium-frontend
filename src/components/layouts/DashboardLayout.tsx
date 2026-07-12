"use client";

import Header from "./Header";
import MobileSidebar from "./MobileSidebar";
import Sidebar from "./Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex overflow-hidden bg-white">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block flex-shrink-0">
        <Sidebar isMobile={false} />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar />

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0 lg:px-0">
        <Header />
        <main className="flex-1 min-w-0 overflow-y-scroll py-6 px-0 md:p-6 bg-[#F9FAFB]">{children}</main>
      </div>
    </div>
  );
}
