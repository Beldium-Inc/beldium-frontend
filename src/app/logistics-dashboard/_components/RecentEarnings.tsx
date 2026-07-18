import { recentEarnings } from "./data";

export default function RecentEarnings() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <h2 className="font-semibold text-gray-900 mb-4">Recent Earnings</h2>

      <div className="space-y-3">
        {recentEarnings.map((e) => (
          <div key={e.jobId} className="flex items-center justify-between text-sm">
            <span className="font-medium text-primary">{e.jobId}</span>
            <span className="text-gray-800">{e.amount}</span>
            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                e.status === "Completed" ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-500"
              }`}
            >
              {e.status}
            </span>
            <span className="text-xs text-gray-400 w-16 text-right">{e.date}</span>
          </div>
        ))}
      </div>

      <button className="text-sm text-primary font-medium mt-4 hover:underline">View Wallet</button>
    </div>
  );
}
