import { Table, Select, DatePicker, Button, Tag, Modal, message } from "antd";
import { OrderHistoryItem } from "../../dashboard/api";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { DEFAULT_CURRENCY_SYMBOL } from "@/src/constants";
import { ORDER_STATUS } from "../../dashboard/constants";
import { useRouter } from "next/navigation";
import { RightOutlined, DeleteOutlined } from "@ant-design/icons";
import { useState } from "react";

type Props = {
  items: OrderHistoryItem[];
  loading?: boolean;
  total?: number;
  page?: number;
  perPage?: number;
  onPageChange?: (page: number) => void;
  totalVolume?: string;
  totalRevenue?: string;
  lastTransactionDate?: string;
};

export default function OrderHistoryView({ 
  items, 
  loading, 
  total, 
  page, 
  perPage, 
  onPageChange,
  totalVolume,
  totalRevenue,
  lastTransactionDate
}: Props) {
  const router = useRouter();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const handleBulkArchive = () => {
    Modal.confirm({
      title: 'Archive Orders',
      content: `Are you sure you want to archive ${selectedRowKeys.length} selected order(s)?`,
      okText: 'Archive',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        // Simulate API call
        setTimeout(() => {
            message.success(`${selectedRowKeys.length} orders archived successfully`);
            setSelectedRowKeys([]);
        }, 500);
      },
    });
  };

  const columns: ColumnsType<OrderHistoryItem> = [
    {
      title: "Order ID",
      dataIndex: "order_code",
      key: "order_code",
      render: (text) => <span className="text-gray-500 font-medium">#{text}</span>,
    },
    {
      title: "Buyer",
      dataIndex: "buyer_name",
      key: "buyer_name",
      render: (text) => <span className="font-semibold">{text}</span>,
    },
    {
      title: "Quantity (MT)",
      dataIndex: "agreed_tonnage",
      key: "agreed_tonnage",
      render: (text) => <span>{Number(text).toLocaleString()}</span>,
    },
    {
      title: "Delivered Date",
      dataIndex: "delivered_date",
      key: "delivered_date",
      render: (text) => text ? dayjs(text).format("D MMM, YYYY") : "-",
    },
    {
      title: "Payment Date",
      dataIndex: "payment_date",
      key: "payment_date",
      render: (text) => text ? dayjs(text).format("D MMM, YYYY") : "-",
    },
    {
      title: "Total Amount",
      dataIndex: "total_value",
      key: "total_value",
      render: (text) => <span className="font-semibold">{DEFAULT_CURRENCY_SYMBOL}{Number(text).toLocaleString()}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text) => {
        let bg = 'bg-green-100';
        let textCol = 'text-green-700';
        
        if (text === ORDER_STATUS.CANCELLED) {
            bg = 'bg-red-100';
            textCol = 'text-red-700';
        }
        
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${bg} ${textCol} capitalize`}>
            {text}
          </span>
        );
      },
    },
    {
      title: "",
      key: "action",
      width: 120,
      render: (_, record) => (
        <button 
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 group min-w-[44px] min-h-[44px]"
          aria-label={`View details for order ${record.order_code}`}
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/dashboard/orders/${record.id}`);
          }}
        >
          <span className="text-xs font-medium">Click</span>
          <RightOutlined className="text-xs transition-transform group-hover:translate-x-1" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-gray-100">
                <div className="text-xs text-gray-400 mb-1">Total Orders</div>
                <div className="text-xl font-bold">{total || 0}</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-100">
                <div className="text-xs text-gray-400 mb-1">Total Volume Sold</div>
                <div className="text-xl font-bold">{totalVolume ? `${totalVolume}MT` : '—'}</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-100">
                <div className="text-xs text-gray-400 mb-1">Total Revenue</div>
                <div className="text-xl font-bold">{totalRevenue ? `${DEFAULT_CURRENCY_SYMBOL}${totalRevenue}` : '—'}</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-100">
                <div className="text-xs text-gray-400 mb-1">Last Transaction</div>
                <div className="text-xl font-bold">{lastTransactionDate || '—'}</div>
            </div>
        </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 md:p-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500">Status</span>
                <Select defaultValue="all" className="w-32" size="middle" bordered={false} style={{ backgroundColor: '#f3f4f6', borderRadius: '6px' }}>
                    <Select.Option value="all">All status</Select.Option>
                    <Select.Option value="completed">Completed</Select.Option>
                    <Select.Option value="cancelled">Cancelled</Select.Option>
                </Select>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500">Payment</span>
                <Select defaultValue="all" className="w-32" size="middle" bordered={false} style={{ backgroundColor: '#f3f4f6', borderRadius: '6px' }}>
                    <Select.Option value="all">All</Select.Option>
                    <Select.Option value="paid">Paid</Select.Option>
                    <Select.Option value="unpaid">Unpaid</Select.Option>
                </Select>
            </div>
            <div className="flex items-center gap-2">
                 <span className="text-xs font-medium text-gray-500">From</span>
                 <DatePicker className="w-40 bg-gray-100 border-none" placeholder="Select start date" />
            </div>
            <div className="flex items-center gap-2">
                 <span className="text-xs font-medium text-gray-500">To</span>
                 <DatePicker className="w-40 bg-gray-100 border-none" placeholder="Select end date" />
            </div>
          </div>
          
          {selectedRowKeys.length > 0 && (
             <Button 
                type="primary" 
                danger 
                icon={<DeleteOutlined />} 
                onClick={handleBulkArchive}
                className="rounded-lg animate-fade-in"
             >
                Archive ({selectedRowKeys.length})
             </Button>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={items}
            rowKey="id"
            loading={loading}
            onRow={(record) => ({
              onClick: () => router.push(`/dashboard/orders/${record.id}`),
              className: "cursor-pointer transition-all duration-200 ease-out hover:bg-[#F8FAFF] hover:[&>td]:bg-[#F8FAFF] group"
            })}
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
             <div className="text-center py-8 text-gray-500">No order history found</div>
          ) : (
             items.map((item) => (
                <button
                  key={item.id}
                  className="w-full text-left border border-gray-100 rounded-xl p-4 bg-gray-50 space-y-3 active:bg-gray-100 transition-colors duration-200"
                  aria-label={`Open order ${item.order_code}`}
                  onClick={() => router.push(`/dashboard/orders/${item.id}`)}
                >
                   <div className="flex justify-between items-start gap-3">
                      <div>
                          <div className="text-xs text-gray-500 font-medium mb-1">Order ID</div>
                          <div className="font-semibold text-gray-900">#{item.order_code}</div>
                      </div>
                      <div className="text-right">
                          <div className="text-xs text-gray-500 font-medium mb-1">Buyer</div>
                          <div className="font-semibold text-gray-900">{item.buyer_name}</div>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-3">
                      <div>
                          <div className="text-xs text-gray-500 mb-1">Quantity</div>
                          <div className="font-medium">{Number(item.agreed_tonnage).toLocaleString()} MT</div>
                      </div>
                      <div>
                          <div className="text-xs text-gray-500 mb-1">Status</div>
                          <Tag color={item.status === ORDER_STATUS.CANCELLED ? 'red' : 'green'} className="rounded-full capitalize m-0">
                              {item.status}
                          </Tag>
                      </div>
                   </div>

                   <div className="flex justify-between items-center pt-2">
                      <div>
                          <div className="text-xs text-gray-500 mb-1">Total Amount</div>
                          <div className="font-bold text-gray-900">{DEFAULT_CURRENCY_SYMBOL}{Number(item.total_value).toLocaleString()}</div>
                      </div>
                      <div className="text-right">
                          <div className="text-xs text-gray-500 mb-1">Delivered</div>
                          <div className="text-xs font-medium">{item.delivered_date ? dayjs(item.delivered_date).format("D MMM, YYYY") : "-"}</div>
                      </div>
                   </div>
                   <div className="flex justify-end">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-gray-200 text-gray-500 bg-white active:bg-blue-50 active:text-blue-600 transition-colors duration-200">
                        <RightOutlined className="text-xs" />
                      </span>
                   </div>
                </button>
             ))
          )}
        </div>
        
        {!loading && total ? (
            <div className="mt-4 text-xs text-gray-400">
                You have {total} orders (Displaying {items.length} per page)
            </div>
        ) : null}
      </div>
    </div>
  );
}
