import RequireAuth from "@/src/components/auth/RequireAuth";
import React from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
  return <RequireAuth>{children}</RequireAuth>;
};

export default layout;
