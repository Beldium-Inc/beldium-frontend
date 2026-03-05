import { Card, Tag, Skeleton } from "antd";
import { 
  SafetyCertificateOutlined, 
  CodeSandboxOutlined, 
  BellOutlined, 
  ArrowRightOutlined,
  CheckCircleFilled,
  RiseOutlined
} from "@ant-design/icons";

type Props = {
  kyc: string;
  compliance: string;
  access: string;
  activeCount: number;
  activeChange: number;
  pendingCount: number;
  loading?: boolean;
};

function statusTag(value: string) {
  const v = (value || "").toLowerCase();
  
  const icon = <CheckCircleFilled className="mr-1" />;

  if (v === "completed") return <Tag color="green" icon={icon} className="rounded-full px-2 border-none bg-green-50 text-green-600 font-medium">VERIFIED</Tag>;
  if (v === "approved") return <Tag color="green" icon={icon} className="rounded-full px-2 border-none bg-green-50 text-green-600 font-medium">PASSED</Tag>;
  if (v === "active") return <Tag color="green" icon={icon} className="rounded-full px-2 border-none bg-green-50 text-green-600 font-medium">ACTIVE</Tag>;
  if (v === "pending") return <Tag color="orange" className="rounded-full px-2 border-none">Pending</Tag>;
  
  return <Tag className="rounded-full px-2">{value}</Tag>;
}

export default function OverviewCards({
  kyc,
  compliance,
  access,
  activeCount,
  activeChange,
  pendingCount,
  loading
}: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <Skeleton active paragraph={{ rows: 2 }} />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* Account Health */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600">
            <SafetyCertificateOutlined />
          </span>
          <span className="font-medium text-gray-700">Account Health</span>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm">KYC Status</span>
            {statusTag(kyc)}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm">Compliance Audit</span>
            {statusTag(compliance)}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm">Marketplace Access</span>
            {statusTag(access)}
          </div>
        </div>
      </div>

      {/* Active Orders */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <CodeSandboxOutlined />
          </span>
          <span className="font-medium text-gray-700">Active Orders</span>
        </div>

        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-4xl font-semibold text-gray-900">{activeCount}</span>
          <span className="text-xs font-medium text-green-600 flex items-center bg-green-50 px-1.5 py-0.5 rounded">
            <RiseOutlined className="mr-1" />
            {activeChange > 0 ? "+" : ""}{activeChange}% last month
          </span>
        </div>
        <p className="text-xs text-gray-400">Currently in fulfillment or transit.</p>

        <button className="absolute bottom-5 right-5 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors">
          <ArrowRightOutlined className="-rotate-45" />
        </button>
      </div>

      {/* Pending Actions */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
            <BellOutlined />
          </span>
          <span className="font-medium text-gray-700">Pending Actions</span>
        </div>

        <div className="mb-1">
          <span className="text-4xl font-semibold text-gray-900">{pendingCount}</span>
        </div>
        <p className="text-xs text-gray-400">All systems clear</p>

        <button className="absolute bottom-5 right-5 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors">
          <ArrowRightOutlined className="-rotate-45" />
        </button>
      </div>
    </div>
  );
}
