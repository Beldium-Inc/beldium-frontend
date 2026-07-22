import {
  AppstoreOutlined,
  FolderOpenOutlined,
  UsergroupAddOutlined,
  ApartmentOutlined,
  SafetyCertificateOutlined,
  FileSearchOutlined,
  BellOutlined,
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
      href: "/compliancedashboard?persona=compliance&view=reviews",
    },
    {
      label: "Miner Pipeline",
      icon: <UsergroupAddOutlined />,
      href: "/compliancedashboard?persona=admin&view=miner-pipeline",
      active: view === "miner-pipeline",
    },
    {
      label: "Partner directory",
      icon: <ApartmentOutlined />,
      href: "/compliancedashboard?persona=admin&view=partner-directory",
      active: view === "partner-directory",
    },
    {
      label: "Regulatory Alerts",
      icon: <SafetyCertificateOutlined />,
      href: "/compliancedashboard?persona=admin&view=regulatory-alerts",
      active: view === "regulatory-alerts",
    },
        {
      label: "Reviews",
      icon: <FileSearchOutlined />,
      href: "/compliancedashboard?persona=compliance&view=reviews",
      active: view === "reviews",
    },
  ];
}

export function getComplianceNavItems(view: ComplianceView): NavItem[] {
  return [
    {
      label: "Open Task Pool",
      icon: <FolderOpenOutlined />,
      href: "/compliancedashboard?persona=compliance",
      active: view === "dashboard",
    },
    // {
    //   label: "Partner directory",
    //   icon: <ApartmentOutlined />,
    // },
    {
      label: "Reviews",
      icon: <FileSearchOutlined />,
      href: "/compliancedashboard?persona=compliance&view=reviews",
      active: view === "reviews",
    },
    {
      label: "Regulatory Alerts",
      icon: <BellOutlined />,
      href: "/compliancedashboard?persona=compliance&view=regulatory-alerts",
      active: view === "regulatory-alerts",
      showDot: view !== "regulatory-alerts",
    },
  ];
}

