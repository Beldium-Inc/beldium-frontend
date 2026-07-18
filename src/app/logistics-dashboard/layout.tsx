import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Logistics Dashboard | Beldium",
  description: "Transport opportunities, assigned jobs, and fleet operations for logistics partners.",
};

export default function LogisticsDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
