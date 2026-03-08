import { Table, Select, Button } from "antd";
import { EllipsisOutlined } from "@ant-design/icons";
import { ActiveOrderItem } from "../../dashboard/api";
import type { ColumnsType } from "antd/es/table";
import { DEFAULT_CURRENCY_SYMBOL } from "@/src/constants";
import { ORDER_STATUS, LOGISTICS_STATUS } from "../../dashboard/constants";

type Props = {
  items: ActiveOrderItem[];
  loading?: boolean;
  total?: number;
  page?: number;
  perPage?: number;
  onPageChange?: (page: number) => void;
};

export default function ActiveOrdersTable({ items, loading, total, page, perPage, onPageChange }: Props) {
  const columns: ColumnsType<ActiveOrderItem> = [
    {
      title: "Order ID",
      dataIndex: "order_code",
      key: "order_code",
      render: (text) => <span className="text-gray-500 font-medium">#{text}</span>,
    },
    {
      title: "Total Value",
      dataIndex: "total_value",
      key: "total_value",
      render: (text) => <span className="font-semibold">{DEFAULT_CURRENCY_SYMBOL}{Number(text).toLocaleString()}</span>,
    },
    {
      title: "Quantity (MT)",
      dataIndex: "quantity",
      key: "quantity",
      render: (text) => <span>{Number(text).toLocaleString()}</span>,
    },
    {
      title: "Payment Status",
      key: "status",
      render: (_, record) => {
        // Mock logic as API returns generic 'status'
        const isPaid = record.status === ORDER_STATUS.COMPLETED; 
        return (
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isPaid ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-gray-600">{isPaid ? 'Completed' : 'Not started'}</span>
          </div>
        );
      },
    },
    {
      title: "Logistics Status",
      dataIndex: "shipment_status",
      key: "shipment_status",
      render: (text) => {
        let color = 'bg-blue-500';
        let label = text;
        
        if (text === LOGISTICS_STATUS.LOCKED) {
            color = 'bg-blue-600';
            label = 'Awaiting pickup';
        }
        
        return (
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${color}`} />
            <span className="text-gray-600 capitalize">{label.replace(/_/g, ' ').toLowerCase()}</span>
          </div>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      render: () => (
        <Button type="text" icon={<EllipsisOutlined className="text-gray-400 text-lg" />} />
      ),
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 md:p-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Payment Status</span>
            <Select defaultValue="all" className="w-32" size="middle" bordered={false} style={{ backgroundColor: '#f3f4f6', borderRadius: '6px' }}>
                <Select.Option value="all">All status</Select.Option>
                <Select.Option value="paid">Paid</Select.Option>
                <Select.Option value="unpaid">Unpaid</Select.Option>
            </Select>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Logistics status</span>
             <Select defaultValue="all" className="w-32" size="middle" bordered={false} style={{ backgroundColor: '#f3f4f6', borderRadius: '6px' }}>
                <Select.Option value="all">All</Select.Option>
                <Select.Option value="transit">In Transit</Select.Option>
                <Select.Option value="delivered">Delivered</Select.Option>
            </Select>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <Table
          columns={columns}
          dataSource={items}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize: perPage,
            total: total,
            onChange: onPageChange,
            showSizeChanger: false,
            position: ["bottomRight"],
            itemRender: (page, type, originalElement) => {
              if (type === 'prev') return <Button className="border-none shadow-none text-gray-500">Previous</Button>;
              if (type === 'next') return <Button className="border-none shadow-none text-gray-500">Next</Button>;
              return originalElement;
            }
          }}
          scroll={{ x: 800 }}
        />
      </div>

      {/* Mobile/Tablet Card View */}
      <div className="lg:hidden space-y-4">
        {loading ? (
            <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-50 rounded-xl animate-pulse" />)}
            </div>
        ) : items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No active orders found</div>
        ) : (
            items.map((item) => (
                <div key={item.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50 space-y-3">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="text-xs text-gray-500 font-medium mb-1">Order ID</div>
                            <div className="font-semibold text-gray-900">#{item.order_code}</div>
                        </div>
                        <div className="text-right">
                             <div className="text-xs text-gray-500 font-medium mb-1">Value</div>
                             <div className="font-semibold text-gray-900">₦{Number(item.total_value).toLocaleString()}</div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-3">
                        <div>
                             <div className="text-xs text-gray-500 mb-1">Quantity</div>
                             <div className="font-medium">{Number(item.quantity).toLocaleString()} MT</div>
                        </div>
                        <div>
                             <div className="text-xs text-gray-500 mb-1">Logistics</div>
                             <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${item.shipment_status === 'LOCKED' ? 'bg-blue-600' : 'bg-blue-500'}`} />
                                <span className="text-sm capitalize">{item.shipment_status?.replace(/_/g, ' ').toLowerCase() || '-'}</span>
                             </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button type="default" size="small" icon={<EllipsisOutlined />} />
                    </div>
                </div>
            ))
        )}
      </div>
      
      {/* Custom footer text if needed matching Figma "You have 241 orders..." */}
      {!loading && total ? (
          <div className="mt-4 text-xs text-gray-400">
              You have {total} orders (Displaying {items.length} per page)
          </div>
      ) : null}
    </div>
  );
}
