import { AccountBookOutlined, DashboardOutlined, HomeOutlined, SettingOutlined, SwapOutlined, UserOutlined } from "@ant-design/icons";

export const AppRoutes = [
  {
    key: 'home',
    label: 'Home',
    href: '/dashboard',
    icon: HomeOutlined,
  },
  
  {
    key: 'rate',
    label: 'Rates',
    href: '/dashboard/rate',
    icon: AccountBookOutlined,
  },

    {
    key: 'transactions',
    label: 'Transactions',
    href: '/dashboard/transactions',
    icon: SwapOutlined,
  },
  {
    key: 'profile',
    label: 'Profile',
    href: '/dashboard/profile',
    icon: UserOutlined,
  },
];

