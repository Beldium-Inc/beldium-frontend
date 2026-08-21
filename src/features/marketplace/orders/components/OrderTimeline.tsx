import { CheckOutlined, SyncOutlined, CarOutlined } from "@ant-design/icons";
import { TIMELINE_STEPS, OrderTimelineStep } from "../mock-data";

export default function OrderTimeline({ currentStep }: { currentStep: OrderTimelineStep }) {
  const currentIndex = TIMELINE_STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="bg-white border border-[#E9ECF2] rounded-xl p-5">
      <h2 className="font-semibold text-gray-900 mb-5">Timeline</h2>
      <div className="flex items-start overflow-x-auto">
        {TIMELINE_STEPS.map((step, i) => {
          const isDone = i < currentIndex;
          const isCurrent = i === currentIndex;
          return (
            <div key={step.key} className="flex items-center shrink-0">
              <div className="flex flex-col items-center gap-2 w-24 text-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm ${
                    isDone || isCurrent
                      ? "bg-[#101E3D] text-white"
                      : "border border-gray-300 text-gray-300"
                  }`}
                >
                  {isDone && <CheckOutlined />}
                  {isCurrent && (step.key === "in_transit" ? <CarOutlined /> : <SyncOutlined spin />)}
                </div>
                <span className={`text-xs ${isDone || isCurrent ? "text-gray-900" : "text-gray-400"}`}>
                  {step.label}
                </span>
              </div>
              {i < TIMELINE_STEPS.length - 1 && (
                <div className={`h-px w-8 mb-6 ${isDone ? "bg-[#101E3D]" : "bg-gray-200"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
