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
      icon: <AuditOutlined className="text-xl" />,
      bg: "bg-blue-50",
      text: "text-blue-600",
      border: "border-blue-100",
    },
    {
      title: "Active orders",
      count: activeOrders,
      subtitle: "In progress",
      icon: <SyncOutlined className="text-xl" />,
      bg: "bg-white",
      text: "text-gray-600",
      border: "border-gray-200",
    },
    {
      title: "Require Action",
      count: compliancePending,
      subtitle: "Compliance or logistics needed",
      icon: <SafetyCertificateOutlined className="text-xl" />,
      bg: "bg-orange-50",
      text: "text-orange-600",
      border: "border-orange-100",
    },
    {
      title: "Completed",
      count: completedOrders,
      subtitle: "Successfully fulfilled",
      icon: <CheckCircleOutlined className="text-xl" />,
      bg: "bg-green-50",
      text: "text-green-600",
      border: "border-green-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`${card.bg} border ${card.border} rounded-xl p-5 flex flex-col justify-between h-32 relative overflow-hidden transition-all hover:shadow-md cursor-pointer group`}
        >
          <div className="flex items-start justify-between z-10">
            <div className="flex items-center gap-2">
              <div className={`${card.text}`}>{card.icon}</div>
              <span className={`font-medium ${card.text.replace('600', '700')}`}>
                {card.count} {card.title}
              </span>
            </div>
          </div>
          
          <div className="z-10 flex items-center justify-between mt-auto">
            <span className="text-xs text-gray-500 font-medium">{card.subtitle}</span>
            <div className={`w-8 h-8 rounded-full bg-white/50 flex items-center justify-center ${card.text} opacity-0 group-hover:opacity-100 transition-opacity`}>
               <ArrowRightOutlined />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
