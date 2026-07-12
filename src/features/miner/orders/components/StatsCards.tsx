import { Card, Skeleton } from "antd";
import { ArrowRightOutlined, AuditOutlined, SyncOutlined, SafetyCertificateOutlined, CheckCircleOutlined } from "@ant-design/icons";

type Props = {
  incomingRfqs: number;
  activeOrders: number;
  compliancePending: number;
  completedOrders: number;
  loading?: boolean;
};

export default function OrdersStatsCards({
  incomingRfqs,
  activeOrders,
  compliancePending,
  completedOrders,
  loading,
}: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton.Button key={i} active className="!w-full !h-32 !rounded-xl" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "New Request(s)",
      count: incomingRfqs,
      subtitle: "Awaiting review",
      icon: <AuditOutlined className="text-base" />,
      badgeBg: "bg-blue-50",
      text: "text-blue-600",
    },
    {
      title: "Active orders",
      count: activeOrders,
      subtitle: "In progress",
      icon: <SyncOutlined className="text-base" />,
      badgeBg: "bg-cyan-50",
      text: "text-cyan-600",
    },
    {
      title: "Require Action",
      count: compliancePending,
      subtitle: "Compliance or logistics needed",
      icon: <SafetyCertificateOutlined className="text-base" />,
      badgeBg: "bg-orange-50",
      text: "text-orange-600",
    },
    {
      title: "Completed",
      count: completedOrders,
      subtitle: "Successfully fulfilled",
      icon: <CheckCircleOutlined className="text-base" />,
      badgeBg: "bg-green-50",
      text: "text-green-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col justify-between h-32 relative overflow-hidden transition-all hover:shadow-md cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full ${card.badgeBg} ${card.text} flex items-center justify-center flex-shrink-0`}>
              {card.icon}
            </div>
            <span className="font-medium text-gray-900">
              {card.count} {card.title}
            </span>
          </div>

          <div className="flex items-center justify-between mt-auto">
            <span className="text-xs text-gray-500 font-medium">{card.subtitle}</span>
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500">
              <ArrowRightOutlined className="text-xs" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
