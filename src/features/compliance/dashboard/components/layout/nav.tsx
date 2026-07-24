import {
  AppstoreOutlined,
  FolderOpenOutlined,
  SafetyCertificateOutlined,
  FileSearchOutlined,
} from "@ant-design/icons";
import type { ComplianceView, NavItem } from "@/src/features/compliance/dashboard/types";

export function getAdminNavItems(view: ComplianceView): NavItem[] {
  return [
    {
      label: "Dashboard",
      icon: <AppstoreOutlined />,
      href: "/compliancedashboard?persona=admin",
      active: view === "dashboard",
    },
    {
      label: "Open Task Pool",
      icon: <FolderOpenOutlined />,
      href: "/compliancedashboard?persona=compliance",
    },
    {
      label: "Reviews",
      icon: <FileSearchOutlined />,
      href: "/compliancedashboard?persona=compliance&view=reviews",
      active: view === "reviews",
    },
    {
      label: "Regulatory Alerts",
      icon: <SafetyCertificateOutlined />,
      href: "/compliancedashboard?persona=admin&view=regulatory-alerts",
      active: view === "regulatory-alerts",
    },
  ];
}

export function getComplianceNavItems(view: ComplianceView): NavItem[] {
  return [
    {
      label: "Dashboard",
      icon: <AppstoreOutlined />,
      href: "/compliancedashboard?persona=admin",
    },
    {
      label: "Open Task Pool",
      icon: <FolderOpenOutlined />,
      href: "/compliancedashboard?persona=compliance",
      active: view === "dashboard",
    },
    {
      label: "Reviews",
      icon: <FileSearchOutlined />,
      href: "/compliancedashboard?persona=compliance&view=reviews",
      active: view === "reviews",
    },
    {
      label: "Regulatory Alerts",
      icon: <SafetyCertificateOutlined />,
      href: "/compliancedashboard?persona=compliance&view=regulatory-alerts",
      active: view === "regulatory-alerts",
    },
  ];
}

