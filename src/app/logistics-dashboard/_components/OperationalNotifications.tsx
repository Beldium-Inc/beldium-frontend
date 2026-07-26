import { FolderOpenOutlined, FileSearchOutlined, WalletOutlined, CarOutlined } from "@ant-design/icons";
import { notifications } from "./data";

const icons = [FolderOpenOutlined, FileSearchOutlined, WalletOutlined, CarOutlined];
const iconColors = [
  "bg-[#e9f0ff] text-[#4a80ff]",
  "bg-[#e9f0ff] text-[#4a80ff]",
  "bg-[#fff0e5] text-[#ff8739]",
  "bg-[#ffeff0] text-[#ef2f32]",
];

export default function OperationalNotifications() {
  return (
    <div className="rounded-[16px] border border-[#e8ecf4] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-[#172554]">Operational Notifications</h2>
        <span className="w-6 h-6 rounded-full bg-[#101e3d] text-white text-xs font-medium flex items-center justify-center">
          {notifications.length}
        </span>
      </div>

      <div className="space-y-4">
        {notifications.map((n, i) => {
          const Icon = icons[i % icons.length];
          return (
            <div key={n.title} className="flex gap-3">
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 relative ${iconColors[i % iconColors.length]}`}
              >
                <Icon className="text-[14px]" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#2563eb]" />
              </span>
              <div>
                <div className="text-sm font-medium text-[#172554]">{n.title}</div>
                <p className="text-xs text-[#6f7786] mt-0.5">{n.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <button className="text-xs text-[#101e3d] font-medium hover:underline">{n.linkLabel}</button>
                  <span className="text-xs text-[#8b93a1]">{n.time}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
