import { EditOutlined, CheckOutlined, UserOutlined, InboxOutlined, WalletOutlined } from "@ant-design/icons";
import { recentActivity } from "./data";

const icons = [EditOutlined, CheckOutlined, UserOutlined, InboxOutlined, WalletOutlined];
const iconColors = [
  "bg-[#e9f0ff] text-[#4a80ff]",
  "bg-[#ecfaf0] text-[#1ea43b]",
  "bg-[#f4e9ff] text-[#8b5cf6]",
  "bg-[#fff0e5] text-[#ff8739]",
  "bg-[#ecfaf0] text-[#1ea43b]",
];

export default function RecentActivity() {
  return (
    <div className="rounded-[16px] border border-[#e8ecf4] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)]">
      <h2 className="font-semibold text-[#172554] mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {recentActivity.map((a, i) => {
          const Icon = icons[i % icons.length];
          return (
            <div key={a.title + i} className="flex gap-3">
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${iconColors[i % iconColors.length]}`}
              >
                <Icon className="text-[14px]" />
              </span>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium text-[#172554]">{a.title}</span>
                  <span className="text-xs text-[#8b93a1]">{a.time}</span>
                </div>
                <p className="text-xs text-[#6f7786] mt-0.5">{a.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
