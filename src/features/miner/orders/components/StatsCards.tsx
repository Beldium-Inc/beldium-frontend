import { Card, Skeleton } from "antd";
import {
  CodeSandboxOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  FileTextOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";

type Props = {
  newRequests: number;
  activeOrders: number;
  actionRequired: number;
  completed: number;
  loading?: boolean;
};

export default function StatsCards({
  newRequests,
  activeOrders,
  actionRequired,
  completed,
  loading,
}: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="rounded-xl border-none shadow-sm">
            <Skeleton active paragraph={{ rows: 1 }} />
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "New Request(s)",
      count: newRequests,
      desc: "Awaiting review",
      icon: <FileTextOutlined />,
      bg: "bg-blue-100",
      text: "text-blue-600",
      border: "border-blue-100",
      iconBg: "bg-white",
    },
    {
      title: "Active orders",
      count: activeOrders,
      desc: "In progress",
      icon: <CodeSandboxOutlined />,
      bg: "bg-white",
      text: "text-gray-800",
      border: "border-gray-200",
      iconBg: "bg-white border border-gray-200",
    },
    {
      title: "Require Action",
      count: actionRequired,
      desc: "Compliance or logistics needed",
      icon: <WarningOutlined />,
      bg: "bg-orange-100",
      text: "text-orange-600",
      border: "border-orange-100",
      iconBg: "bg-white",
    },
    {
      title: "Completed",
      count: completed,
      desc: "Successfully fulfilled",
      icon: <CheckCircleOutlined />,
      bg: "bg-green-100",
      text: "text-green-600",
      border: "border-green-100",
      iconBg: "bg-white",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`p-5 rounded-xl border ${card.border} ${card.bg} shadow-sm relative overflow-hidden transition-all hover:shadow-md flex flex-col justify-between h-[140px]`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-8 h-8 rounded-full ${card.iconBg} flex items-center justify-center ${card.text}`}>
                {card.icon}
              </span>
              <span className="font-medium text-gray-700 text-sm md:text-base">
                {card.title}
              </span>
            </div>
          </div>
          
          <div>
            <div className="mb-1">
              <span className="text-3xl md:text-4xl font-semibold text-gray-900">
                {card.count}
              </span>
            </div>
            
            <p className="text-xs text-gray-500">
              {card.desc}
            </p>
          </div>

          <button className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-white/50 hover:bg-white flex items-center justify-center text-gray-500 transition-colors shadow-sm">
            <ArrowRightOutlined className="-rotate-45 text-xs" />
          </button>
        </div>
      ))}
    </div>
  );
}
