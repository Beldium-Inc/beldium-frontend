"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Input, Button, Popover, Avatar } from "antd";
import {
  SearchOutlined,
  UserOutlined,
  DownOutlined,
  SettingOutlined,
  BellOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Menu, X } from "lucide-react";
import { useMarketplaceAuth, logoutMarketplaceUser } from "@/src/features/marketplace/auth/use-marketplace-auth";

const AUTH_NAV = [
  { label: "Marketplace", href: "/marketplace" },
  { label: "Order's", href: "/marketplace/orders" },
  { label: "RFQ's", href: "/marketplace/rfqs" },
  { label: "Saved", href: "/marketplace/saved" },
];

// Structurally ported from the marketing site's <Header> (react-router,
// bg-background/80 backdrop-blur-xl fixed bar, circle logo, border-b
// border-border/50) - the nav-links block in that source is replaced here
// with the marketplace's own search bar + account menu when signed out, or
// the buyer nav (Marketplace/Order's/RFQ's/Saved) + avatar menu when signed in.
export default function MarketplaceHeader({
  search,
  onSearch,
}: {
  search: string;
  onSearch: (value: string) => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user } = useMarketplaceAuth();
  const [value, setValue] = useState(search);
  const [mobileOpen, setMobileOpen] = useState(false);

  const guestMenu = (
    <div className="flex flex-col gap-2 w-40 py-1">
      <Link href="/marketplace/register">
        <Button block className="!bg-[#101E3D] !text-white !border-none">
          Sign up
        </Button>
      </Link>
      <Link href="/marketplace/login">
        <Button block className="!bg-[#0E4B5C] !text-white !border-none">
          Login
        </Button>
      </Link>
    </div>
  );

  const handleLogout = () => {
    logoutMarketplaceUser();
    router.push("/marketplace");
    router.refresh();
  };

  const userMenu = (
    <div className="flex flex-col w-44 py-1">
      <Link
        href="/dashboard/settings"
        className="px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50"
      >
        Settings
      </Link>
      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-red-600 hover:bg-red-50 text-left"
      >
        <LogoutOutlined /> Logout
      </button>
    </div>
  );

  const userName = user?.company_name || user?.email?.split("@")[0] || "Account";

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <nav className="max-w-7xl mx-auto flex items-center justify-between gap-4 md:gap-8 px-4 md:px-6 py-4">
        <Link href="/marketplace" className="flex items-center gap-2.5 shrink-0">
          <div className="h-10 w-10 rounded-full bg-[#fafafa] p-1.5">
            <Image
              src="/assets/images/logo.png"
              alt="Beldium"
              width={32}
              height={32}
              className="h-full w-full object-contain rounded-full"
            />
          </div>
          <span className="text-2xl font-bold text-foreground tracking-tight hidden sm:inline">
            Beldium
          </span>
        </Link>

        {isAuthenticated ? (
          <div className="hidden md:flex items-center gap-1 flex-1">
            {AUTH_NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                    active
                      ? "text-foreground border-[#101E3D]"
                      : "text-muted-foreground border-transparent hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex-1 max-w-sm hidden md:block">
            <Input
              size="large"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onPressEnter={() => onSearch(value)}
              prefix={<SearchOutlined className="text-gray-400 mr-1" />}
              placeholder="Search product, supplier and categories..."
              suffix={
                <Button
                  type="primary"
                  shape="round"
                  className="!bg-[#101E3D] !border-none !h-9 !px-5 !font-medium flex items-center gap-1.5 -mr-1"
                  onClick={() => onSearch(value)}
                >
                  Search <SearchOutlined />
                </Button>
              }
              className="!rounded-full !pl-5 !pr-1.5 !py-1 shadow-sm"
            />
          </div>
        )}

        <div className="hidden md:flex items-center gap-3 shrink-0">
          {isAuthenticated ? (
            <>
              <button
                type="button"
                aria-label="Settings"
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <SettingOutlined />
              </button>
              <button
                type="button"
                aria-label="Notifications"
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <BellOutlined />
              </button>
              <div className="h-6 w-px bg-gray-200" />
              <Popover
                trigger={["hover", "click"]}
                mouseEnterDelay={0.1}
                mouseLeaveDelay={0.15}
                placement="bottomRight"
                content={userMenu}
              >
                <button type="button" className="flex items-center gap-2">
                  <Avatar
                    size={32}
                    src={user?.profile_picture}
                    icon={!user?.profile_picture && <UserOutlined />}
                  />
                  <span className="text-sm font-medium text-foreground">{userName}</span>
                  <DownOutlined className="text-[10px] opacity-70" />
                </button>
              </Popover>
            </>
          ) : (
            <Popover
              trigger={["hover", "click"]}
              mouseEnterDelay={0.1}
              mouseLeaveDelay={0.15}
              placement="bottomRight"
              content={guestMenu}
            >
              <button
                type="button"
                className="flex items-center gap-1.5 text-foreground font-medium text-base px-2 py-1.5 rounded-full hover:bg-black/5 transition-colors"
              >
                <UserOutlined className="text-lg" />
                <span>Account</span>
                <DownOutlined className="text-[10px] opacity-70" />
              </button>
            </Popover>
          )}
        </div>

        <button
          className="md:hidden p-2 text-muted-foreground hover:text-foreground"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="md:hidden bg-background border-t border-border max-h-[calc(100vh-4.5rem)] overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-3">
            {isAuthenticated ? (
              <>
                <div className="flex flex-col gap-1">
                  {AUTH_NAV.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        pathname === item.href
                          ? "bg-gray-100 text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
                <div className="flex items-center gap-3 pt-2 border-t border-border">
                  <Avatar size={32} src={user?.profile_picture} icon={!user?.profile_picture && <UserOutlined />} />
                  <span className="text-sm font-medium text-foreground">{userName}</span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-sm text-red-600"
                >
                  <LogoutOutlined /> Logout
                </button>
              </>
            ) : (
              <>
                <Input
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onPressEnter={() => onSearch(value)}
                  prefix={<SearchOutlined className="text-gray-400" />}
                  placeholder="Search product, supplier and categories..."
                  className="rounded-full"
                />
                <div className="flex flex-col gap-2 pt-2 border-t border-border">
                  <Link href="/marketplace/register" onClick={() => setMobileOpen(false)}>
                    <Button block className="!bg-[#101E3D] !text-white !border-none">
                      Sign up
                    </Button>
                  </Link>
                  <Link href="/marketplace/login" onClick={() => setMobileOpen(false)}>
                    <Button block className="!bg-[#0E4B5C] !text-white !border-none">
                      Login
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
