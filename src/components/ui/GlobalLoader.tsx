import { Skeleton } from "antd";

export default function GlobalLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
      <div className="font-bungee text-3xl mb-6 text-orange-500">MONEXAY</div>

      <div className="w-64">
        <Skeleton.Input active block />
      </div>

      <p className="mt-4 text-sm text-gray-500">Loading your experience…</p>
    </div>
  );
}
