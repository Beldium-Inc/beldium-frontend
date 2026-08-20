"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Input, Button, Dropdown } from "antd";
import { MenuOutlined, SearchOutlined, UserOutlined, DownOutlined } from "@ant-design/icons";

export default function MarketplaceHeader({
  search,
  onSearch,
}: {
  search: string;
  onSearch: (value: string) => void;
}) {
  const [value, setValue] = useState(search);

  return (
    <header className="bg-white border-b border-[#E9ECF2]">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center gap-4 md:gap-8">
        <button
          type="button"
          aria-label="Open menu"
          className="lg:hidden p-2 -ml-2 text-gray-600"
        >
          <MenuOutlined />
        </button>

        <Link href="/marketplace" className="flex items-center gap-2 shrink-0">
          <Image src="/assets/images/logo.svg" alt="Beldium" width={28} height={28} />
          <span className="font-semibold text-lg text-[#101E3D] hidden sm:inline">Beldium</span>
        </Link>

        <div className="flex-1 max-w-xl hidden md:block">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onPressEnter={() => onSearch(value)}
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder="Search product, miner and categories..."
            suffix={
              <Button
                type="primary"
                size="small"
                className="!bg-[#101E3D] !border-none rounded-md"
                onClick={() => onSearch(value)}
              >
                Search <SearchOutlined />
              </Button>
            }
            className="rounded-full pl-4"
          />
        </div>

        <div className="ml-auto shrink-0">
          <Dropdown
            menu={{
              items: [
                { key: "login", label: <Link href="/login">Log in</Link> },
                { key: "register", label: <Link href="/register">Create account</Link> },
              ],
            }}
            trigger={["click"]}
          >
            <button type="button" className="flex items-center gap-2 text-gray-700">
              <UserOutlined />
              <span className="hidden sm:inline">Account</span>
              <DownOutlined className="text-xs" />
            </button>
          </Dropdown>
        </div>
      </div>

      <div className="md:hidden px-4 pb-3">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onPressEnter={() => onSearch(value)}
          prefix={<SearchOutlined className="text-gray-400" />}
          placeholder="Search product, miner and categories..."
          className="rounded-full"
        />
      </div>
    </header>
  );
}
