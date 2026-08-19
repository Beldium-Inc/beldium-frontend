import {
  AppstoreOutlined,
  CodeSandboxOutlined,
  EnvironmentOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  UnorderedListOutlined,
  WalletOutlined,
} from "@ant-design/icons";

export const AppRoutes = [
  {
    key: "overview",
    label: "Overview",
    href: "/dashboard",
    icon: AppstoreOutlined,
  },
  {
    key: "listings",
    label: "Listings",
    href: "/dashboard?view=listings",
    icon: UnorderedListOutlined,
  },
  {
    key: "orders",
    label: "Orders",
    href: "/dashboard?view=orders",
    icon: CodeSandboxOutlined,
  },
  {
    key: "sites",
    label: "Sites",
    href: "/dashboard/sites",
    icon: EnvironmentOutlined,
  },
  {
    key: "wallet",
    label: "Wallet",
    href: "/dashboard/wallet",
    icon: WalletOutlined,
  },
  {
    key: "compliance",
    label: "Compliance",
    href: "/dashboard/compliance",
    icon: SafetyCertificateOutlined,
  },
  {
    key: "settings",
    label: "Settings",
    href: "/dashboard/settings",
    icon: SettingOutlined,
  },
];
