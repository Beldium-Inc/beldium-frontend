import { AccountBookOutlined, DashboardOutlined, HomeOutlined, SettingOutlined, SwapOutlined, UserOutlined } from "@ant-design/icons";

export const AppRoutes = [
  {
    key: 'home',
    label: 'Dashboard',
    href: '/dashboard',
    icon: HomeOutlined,
  },
  
  {
    key: 'profile',
    label: 'Profile',
    href: '/dashboard/profile',
    icon: UserOutlined,
  },
];

