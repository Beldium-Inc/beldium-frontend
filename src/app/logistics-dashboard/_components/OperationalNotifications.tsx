import { notifications } from "./data";
import { IconBoard, IconBox, IconWallet, IconTruck } from "./icons";

const icons = [IconBoard, IconBox, IconWallet, IconTruck];
const iconColors = [
  "bg-blue-50 text-blue-500",
  "bg-blue-50 text-blue-500",
  "bg-orange-50 text-orange-500",
  "bg-red-50 text-red-500",
];

export default function OperationalNotifications() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900">Operational Notifications</h2>
        <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-medium flex items-center justify-center">
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
                <Icon className="w-4 h-4" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-blue-600" />
              </span>
              <div>
                <div className="text-sm font-medium text-gray-900">{n.title}</div>
                <p className="text-xs text-gray-500 mt-0.5">{n.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <button className="text-xs text-primary font-medium hover:underline">{n.linkLabel}</button>
                  <span className="text-xs text-gray-400">{n.time}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button className="text-sm text-primary font-medium mt-4 hover:underline">
        View All Notifications →
      </button>
    </div>
  );
}
