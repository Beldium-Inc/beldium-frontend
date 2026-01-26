"use client";

import clsx from "clsx";
import { BellOutlined, UserOutlined } from "@ant-design/icons";
import { formatCurrency, formatDate } from "@/utils";
import Image from "next/image";
import Link from "next/link";

const LeaderBoard = () => {
  return (
    <aside
      className={clsx(
        "w-64 h-screen bg-white text-shadow-gray-700 flex flex-col transition-all duration-300 ease-in-out"
      )}
    >
      {/* Header */}
      <div className="hidden lg:flex h-16 px-6 items-start pt-4 justify-between font-semibold text-2xl">
        <Link href="/dashboard/notifications" className="">
          <BellOutlined />
        </Link>
        <p className="flex gap-3 items-center">
          <span className="text-sm">Akachukwu</span>
          <span className="flex justify-center items-center w-8 h-8 border rounded-full text-sm">
            <UserOutlined />
          </span>
        </p>
      </div>

      {/* Nav */}
      <nav className={clsx("flex-1 px-4 py-4 space-y-5")}>
        <div className="bg-secondary p-4 rounded-lg">
          <div className="flex flex-col gap-2">
            <p className="text-sm">Today's Rate</p>
            <p className="font-semibold text-md">
              {formatCurrency(1453, "USD")} = 1 USD
            </p>
          </div>
          <span className="text-sm block mt-5 text-gray-500">
            {formatDate(new Date())}
          </span>
        </div>
        <div className="bg-light-secondary p-4 rounded-lg">
          <div className="flex flex-col gap-2">
            <p className="text-sm">Today's Rate</p>
            <p className="font-semibold text-md">
              {formatCurrency(1453, "USD")} = 1 USD
            </p>
          </div>
          <span className="text-sm block mt-5 text-gray-500">
            {formatDate(new Date())}
          </span>
        </div>
        <div className="bg-success p-4 rounded-lg">
          <div className="flex flex-col gap-2">
            <p className="text-sm">Today's Rate</p>
            <p className="font-semibold text-md">
              {formatCurrency(1453, "USD")} = 1 USD
            </p>
          </div>
          <span className="text-sm block mt-5 text-gray-500">
            {formatDate(new Date())}
          </span>
        </div>
        <div className="rounded-lg flex justify-center items-center">
          <Image
            src={`/assets/images/money-exchange.svg`}
            width={160}
            height={160}
            loading="eager"
            alt="money-exchange"
          />
        </div>
      </nav>
    </aside>
  );
};

export default LeaderBoard;
