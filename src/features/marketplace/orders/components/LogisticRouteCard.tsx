"use client";

import { useState } from "react";
import { EnvironmentOutlined, CarOutlined } from "@ant-design/icons";
import type { MockOrder } from "../mock-data";
import LogisticsMapModal from "./LogisticsMapModal";

export default function LogisticRouteCard({ order }: { order: MockOrder }) {
  const [mapOpen, setMapOpen] = useState(false);

  return (
    <div className="bg-white border border-[#E9ECF2] rounded-xl p-5">
      <h2 className="font-semibold text-gray-900 mb-4">Logistic route</h2>
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-xs text-gray-400 mb-1">ORIGIN</div>
          <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
            <EnvironmentOutlined className="text-gray-400" /> {order.origin.label}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">{order.origin.sublabel}</div>
        </div>

        <div className="flex-1 flex flex-col items-center gap-1 px-2">
          <CarOutlined className="text-gray-400" />
          <div className="w-full border-t border-dashed border-gray-300" />
          <button
            type="button"
            onClick={() => setMapOpen(true)}
            className="text-xs text-[#101E3D] underline font-medium mt-1"
          >
            View map
          </button>
        </div>

        <div className="text-right">
          <div className="text-xs text-gray-400 mb-1">DESTINATION</div>
          <div className="flex items-center justify-end gap-1.5 text-sm font-medium text-gray-900">
            {order.destination.label} <EnvironmentOutlined className="text-gray-400" />
          </div>
          <div className="text-xs text-gray-500 mt-0.5">{order.destination.sublabel}</div>
        </div>
      </div>

      <LogisticsMapModal open={mapOpen} onClose={() => setMapOpen(false)} order={order} />
    </div>
  );
}
