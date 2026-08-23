import DashboardLayout from "@/src/components/layouts/DashboardLayout";
import RequireAuth from "@/src/components/auth/RequireAuth";
import React from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <RequireAuth allowedRoles={["Miner"]}>
      <DashboardLayout>{children}</DashboardLayout>
    </RequireAuth>
  );
};

export default layout;
