"use client";

import { useMemo, useState } from "react";
import {
  UserOutlined,
  InboxOutlined,
  FileTextOutlined,
  CreditCardOutlined,
  CarOutlined,
  MoreOutlined,
  StarOutlined,
  DeleteOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { classNames } from "@/src/features/compliance/dashboard/lib/style";
import { notificationItems, NotificationItem } from "./data";

const iconMap: Record<NotificationItem["icon"], React.ReactNode> = {
  person: <UserOutlined />,
  job: <InboxOutlined />,
  doc: <FileTextOutlined />,
  payment: <CreditCardOutlined />,
  truck: <CarOutlined />,
};

export default function NotificationsView() {
  const [items, setItems] = useState(notificationItems);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = items;
    if (status === "unread") list = list.filter((n) => n.unread);
    if (status === "read") list = list.filter((n) => !n.unread);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((n) => n.title.toLowerCase().includes(q) || n.description.toLowerCase().includes(q));
    }
    return list;
  }, [items, status, query]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[#172554]">Notification</h1>
          <p className="text-sm text-[#8b93a1] mt-1">Stay up to date with activity across your logistics operations</p>
        </div>
        <button
          type="button"
          onClick={() => setItems((prev) => prev.map((n) => ({ ...n, unread: false })))}
          className="inline-flex items-center gap-2 rounded-[10px] border border-[#dbe0ea] px-4 py-2.5 text-sm font-medium text-[#293041] hover:bg-[#f9fafc]"
        >
          Mark all as read <MailOutlined />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm">
        <span className="font-medium text-[#293041]">Filter:</span>
        <div className="flex items-center gap-2">
          <span className="text-[#8b93a1]">Status</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-white border border-[#e4e9f2] rounded-lg px-3 py-1.5 text-sm text-[#293041] outline-none"
          >
            <option value="">All status</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#8b93a1]">State</span>
          <select className="bg-white border border-[#e4e9f2] rounded-lg px-3 py-1.5 text-sm text-[#293041] outline-none">
            <option>All states</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#8b93a1]">Sort by</span>
          <select className="bg-white border border-[#e4e9f2] rounded-lg px-3 py-1.5 text-sm text-[#293041] outline-none">
            <option>Most recent</option>
            <option>Oldest</option>
          </select>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search notifications..."
          className="ml-auto min-w-[220px] bg-white border border-[#e4e9f2] rounded-lg px-3 py-1.5 text-sm text-[#293041] placeholder:text-[#8b93a1] outline-none"
        />
      </div>

      <div className="rounded-[16px] border border-[#e8ecf4] bg-white overflow-hidden">
        {filtered.map((n, i) => (
          <div
            key={n.id}
            className={classNames(
              "relative flex items-start gap-3 px-5 py-4",
              i !== filtered.length - 1 && "border-b border-[#edf1f7]",
              n.unread ? "bg-[#fafbfe]" : "bg-white",
            )}
          >
            <span
              className={classNames(
                "mt-1.5 h-2 w-2 rounded-full shrink-0",
                n.unread ? "bg-[#1ea43b]" : "bg-transparent",
              )}
            />
            <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#f4f6f9] text-[#5e6777] text-[15px] shrink-0">
              {iconMap[n.icon]}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-[#172554]">{n.title}</div>
              <div className="text-sm text-[#6f7786] mt-0.5">{n.description}</div>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <span className="text-xs text-[#8b93a1]">{n.time}</span>
              <button
                type="button"
                onClick={() => setOpenMenuId(openMenuId === n.id ? null : n.id)}
                className="text-[#8b93a1] hover:text-[#293041]"
              >
                <MoreOutlined />
              </button>
            </div>

            {openMenuId === n.id && (
              <div className="absolute right-5 top-12 z-10 w-40 rounded-xl border border-[#e8ecf4] bg-white shadow-lg py-1.5">
                <button
                  type="button"
                  onClick={() => setOpenMenuId(null)}
                  className="flex w-full items-center justify-between px-4 py-2 text-sm text-[#293041] hover:bg-[#f9fafc]"
                >
                  Star <StarOutlined />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setItems((prev) => prev.filter((item) => item.id !== n.id));
                    setOpenMenuId(null);
                  }}
                  className="flex w-full items-center justify-between px-4 py-2 text-sm text-[#ef2f32] hover:bg-[#fff5f5]"
                >
                  Delete <DeleteOutlined />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="text-center text-sm text-[#8b93a1]">No more notification</p>
    </div>
  );
}
