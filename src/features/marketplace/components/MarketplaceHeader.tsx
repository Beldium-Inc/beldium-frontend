"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Input, Button, Popover, Avatar } from "antd";
import {
  SearchOutlined,
  UserOutlined,
  DownOutlined,
  SettingOutlined,
  SafetyOutlined,
  BellOutlined,
  LogoutOutlined,
  ShopOutlined,
  FileTextOutlined,
  ShoppingOutlined,
  BookOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { Menu, X } from "lucide-react";
import { useMarketplaceAuth, logoutMarketplaceUser } from "@/src/features/marketplace/auth/use-marketplace-auth";
import { showToast } from "@/src/store/toast.store";

const AUTH_NAV = [
  { label: "Marketplace", href: "/marketplace" },
  { label: "RFQ's", href: "/marketplace/rfqs" },
  { label: "Saved", href: "/marketplace/saved" },
];

const NAV_ICONS: Record<string, React.ReactNode> = {
  Marketplace: <ShopOutlined />,
  "Order's": <ShoppingOutlined />,
  "RFQ's": <FileTextOutlined />,
  Saved: <BookOutlined />,
};

// The homepage nav additionally shows "Order's" and a live search bar
// alongside the links - everywhere else keeps the plain AUTH_NAV above, per
// explicit direction not to roll the homepage layout out site-wide.
const HOMEPAGE_AUTH_NAV = [
  { label: "Marketplace", href: "/marketplace" },
  // { label: "Order's", href: "/marketplace/orders" },
  { label: "RFQ's", href: "/marketplace/rfqs" },
  { label: "Saved", href: "/marketplace/saved" },
];

// Structurally ported from the marketing site's <Header> (react-router,
// bg-background/80 backdrop-blur-xl fixed bar, circle logo, border-b
// border-border/50) - the nav-links block in that source is replaced here
// with the marketplace's own search bar + account menu when signed out, or
// the buyer nav (Marketplace/RFQ's/Saved) + avatar menu when signed in.
export default function MarketplaceHeader({
  search,
  onSearch,
}: {
  search: string;
  onSearch: (value: string) => void;
}) {
  const pathname = usePathname();
  const isHomepage = pathname === "/marketplace";
  const router = useRouter();
  const { isAuthenticated, user } = useMarketplaceAuth();
  const [value, setValue] = useState(search);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Live filtering: debounced so the listings query (keyed on `search` in
  // the parent) doesn't refire on every keystroke, but no longer requires
  // pressing Enter or the Search button either.
  useEffect(() => {
    const timer = setTimeout(() => onSearch(value), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Without this the page behind the fixed overlay stays scrollable, so a
  // touch-scroll on the menu can drag the underlying page instead.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

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
      <button
        type="button"
        onClick={() => showToast("Marketplace account settings aren't built yet.", "error")}
        className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50 text-left"
      >
        <UserOutlined /> My account
      </button>
      <Link
        href="/marketplace/escrow"
        className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50 text-left"
      >
        <SafetyOutlined /> Escrow
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
    <>
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
          <div className="hidden md:flex items-center gap-4 flex-1 min-w-0">
            <div className="flex items-center gap-1">
              {(isHomepage ? HOMEPAGE_AUTH_NAV : AUTH_NAV).map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 active:!text-white py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
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
              {isHomepage && (
                <Link href="/marketplace/rfqs/new">
                  <Button type="primary" className="!bg-white !text-[#101E3D] !border-[#101E3D] !font-medium">
                    Request RFQ
                  </Button>
                </Link>
              )}
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
    </header>

      {mobileOpen && (
        // Fixed full-height overlay - deliberately NOT nested inside
        // <header>: that element has `backdrop-blur-xl`, and
        // backdrop-filter (like `filter`/`transform`) makes its box the
        // containing block for any `position: fixed` descendant instead of
        // the viewport. Nested here, `top`+`bottom` resolved against the
        // header's own ~72px height, collapsing this to 1px tall - the
        // menu was rendering, just squashed to nothing, so the real page
        // showed straight through untouched. Being a sibling of <header>
        // instead means the viewport is the containing block, as expected.
        <div className="md:hidden fixed inset-x-0 top-[4.5rem] bottom-0 z-40 bg-white overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col gap-5">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-3">
                  <Avatar size={40} src={user?.profile_picture} icon={!user?.profile_picture && <UserOutlined />} />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-foreground truncate">{userName}</div>
                    <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
                  </div>
                </div>

                <nav className="flex flex-col rounded-xl border border-gray-100 overflow-hidden">
                  {(isHomepage ? HOMEPAGE_AUTH_NAV : AUTH_NAV).map((item, i) => {
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium ${
                          i > 0 ? "border-t border-gray-100" : ""
                        } ${active ? "bg-[#101E3D] text-white" : "text-gray-700 active:bg-gray-50"}`}
                      >
                        <span className={active ? "text-white active:!text-white" : "text-gray-400 active:!text-white"}>{NAV_ICONS[item.label]}</span>
                        <span className={active ? "flex-1 !text-white" : "!text-black flex-1"}>{item.label}</span>
                        <RightOutlined className={active ? "text-white/70 !text-white" : " text-gray-300 "} />
                      </Link>
                    );
                  })}
                </nav>

                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1 mb-2">Account</div>
                  <div className="flex flex-col rounded-xl border border-gray-100 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => showToast("Marketplace account settings aren't built yet.", "error")}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 text-left active:bg-gray-50"
                    >
                      <UserOutlined className="text-gray-400" /> My account
                    </button>
                    <Link
                      href="/marketplace/escrow"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 border-t border-gray-100 active:bg-gray-50"
                    >
                      <SafetyOutlined className="text-gray-400" /> Escrow
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 text-left border-t border-gray-100 active:bg-red-50"
                    >
                      <LogoutOutlined /> Logout
                    </button>
                  </div>
                </div>

                {isHomepage && (
                  <Link href="/marketplace/rfqs/new" onClick={() => setMobileOpen(false)}>
                    <Button block size="large" type="primary" className="!bg-[#101E3D] !border-none !rounded-full">
                      Request RFQ
                    </Button>
                  </Link>
                )}
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
                  size="large"
                />
                <div className="flex flex-col gap-2">
                  <Link href="/marketplace/register" onClick={() => setMobileOpen(false)}>
                    <Button block size="large" className="!bg-[#101E3D] !text-white !border-none !rounded-full">
                      Sign up
                    </Button>
                  </Link>
                  <Link href="/marketplace/login" onClick={() => setMobileOpen(false)}>
                    <Button block size="large" className="!bg-[#0E4B5C] !text-white !border-none !rounded-full">
                      Login
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
