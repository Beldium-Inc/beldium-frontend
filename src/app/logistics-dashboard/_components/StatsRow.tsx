import { stats } from "./data";
import { IconBoard, IconBox, IconTruck, IconWallet } from "./icons";

const icons = [IconBoard, IconBox, IconTruck, IconWallet];

export default function StatsRow() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s, i) => {
        const Icon = icons[i];
        return (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
              <span className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center text-primary">
                <Icon className="w-4 h-4" />
              </span>
              {s.label}
            </div>
            <div className="text-2xl font-semibold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-400 mt-1">{s.sub}</div>
          </div>
        );
      })}
    </div>
  );
}
