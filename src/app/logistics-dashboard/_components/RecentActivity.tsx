import { recentActivity } from "./data";
import { IconPencil, IconCheck, IconPerson, IconBox, IconWallet } from "./icons";

const icons = [IconPencil, IconCheck, IconPerson, IconBox, IconWallet];
const iconColors = [
  "bg-blue-50 text-blue-500",
  "bg-green-50 text-green-500",
  "bg-purple-50 text-purple-500",
  "bg-orange-50 text-orange-500",
  "bg-green-50 text-green-500",
];

export default function RecentActivity() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <h2 className="font-semibold text-gray-900 mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {recentActivity.map((a, i) => {
          const Icon = icons[i % icons.length];
          return (
            <div key={a.title + i} className="flex gap-3">
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${iconColors[i % iconColors.length]}`}
              >
                <Icon className="w-4 h-4" />
              </span>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium text-gray-900">{a.title}</span>
                  <span className="text-xs text-gray-400">{a.time}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{a.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
