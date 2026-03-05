import { Table, Button, Skeleton, Select } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import { ActiveOrderItem } from "../../dashboard/api";

type Props = {
  items: ActiveOrderItem[];
  loading?: boolean;
};

function statusColor(status: string) {
  const s = (status || "").toLowerCase();
  if (s === "completed") return "green";
  if (s === "in_progress") return "green";
  if (s === "not started") return "default";
  return "default";
}

function logisticsColor(status: string) {
  const s = (status || "").toLowerCase();
  if (s === "delivered") return "green";
  if (s === "awaiting pickup") return "blue";
  if (s === "assigned") return "default";
  if (s === "in transit") return "purple";
  return "default";
}

export default function ActiveOrdersTable({ items, loading }: Props) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <Skeleton active paragraph={{ rows: 5 }} />
      </div>
    );
  }

  const columns = [
    {
      title: "Order ID",
      dataIndex: "order_code",
      key: "order_code",
      render: (text: string) => <span className="text-gray-600 font-medium">#{text}</span>,
    },
    {
      title: "Total Value",
      dataIndex: "total_value",
      key: "total_value",
      render: (text: string) => <span className="font-semibold">₦{text}</span>,
    },
    {
      title: "Quantity (MT)",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Payment Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${status === 'completed' ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span className="capitalize text-gray-700">{status.replace('_', ' ')}</span>
        </div>
      ),
    },
    {
      title: "Logistics Status",
      dataIndex: "shipment_status",
      key: "shipment_status",
      render: (status: string) => {
        const color = logisticsColor(status);
        let dotColor = "bg-gray-300";
        if (color === "green") dotColor = "bg-green-500";
        if (color === "blue") dotColor = "bg-blue-500";
        if (color === "purple") dotColor = "bg-purple-500";

        return (
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${dotColor}`} />
            <span className="capitalize text-gray-700">{status.toLowerCase().replace('_', ' ')}</span>
          </div>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      align: "center" as const,
      render: () => (
        <Button type="text" icon={<MoreOutlined />} className="text-gray-400 hover:text-gray-600" />
      ),
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Filters Header */}
      <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-2 py-1">
           <span className="text-xs text-gray-500 pl-2">Payment Status</span>
           <Select 
             defaultValue="all" 
             bordered={false} 
             className="w-28 text-sm" 
             options={[{ value: 'all', label: 'All status' }]} 
             size="small"
           />
        </div>
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-2 py-1">
           <span className="text-xs text-gray-500 pl-2">Logistics status</span>
           <Select 
             defaultValue="all" 
             bordered={false} 
             className="w-24 text-sm" 
             options={[{ value: 'all', label: 'All' }]} 
             size="small"
           />
        </div>
      </div>

      {/* Mobile/Tablet List View */}
      <div className="block xl:hidden p-4 space-y-4">
        {items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No active orders</div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Order ID</div>
                  <div className="font-semibold text-gray-900 text-lg">#{item.order_code}</div>
                </div>
                <Button type="text" icon={<MoreOutlined />} className="text-gray-400 -mr-2 -mt-2" />
              </div>

              <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                <div>
                  <div className="text-xs text-gray-400 mb-1">Total Value</div>
                  <div className="font-semibold text-gray-900 truncate">₦{item.total_value}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Quantity</div>
                  <div className="font-medium text-gray-900 truncate">{item.quantity} MT</div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-400 mb-1">Payment Status</div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${item.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="capitalize text-sm text-gray-700">{item.status.replace('_', ' ')}</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Logistics Status</div>
                  {(() => {
                    const status = item.shipment_status;
                    const color = logisticsColor(status);
                    let dotColor = "bg-gray-300";
                    if (color === "green") dotColor = "bg-green-500";
                    if (color === "blue") dotColor = "bg-blue-500";
                    if (color === "purple") dotColor = "bg-purple-500";
                    return (
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                        <span className="capitalize text-sm text-gray-700">{status.toLowerCase().replace('_', ' ')}</span>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden xl:block">
        <Table
          dataSource={items}
          columns={columns}
          rowKey="id"
          pagination={false}
          scroll={{ x: 1000 }}
          className="ant-table-striped"
        />
        <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-gray-50/30">
          <div className="text-sm text-gray-500">
            You have <span className="font-medium text-gray-900">{items.length} orders</span>
          </div>
          <div className="flex gap-2">
             <Button size="small" disabled>Previous</Button>
             <div className="flex gap-1">
                <Button size="small" type="text" className="bg-gray-100 font-medium">1</Button>
                <Button size="small" type="text">2</Button>
                <Button size="small" type="text">3</Button>
                <span className="px-1 text-gray-400">...</span>
                <Button size="small" type="text">8</Button>
                <Button size="small" type="text">9</Button>
                <Button size="small" type="text">10</Button>
             </div>
             <Button size="small">Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
