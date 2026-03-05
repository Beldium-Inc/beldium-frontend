import { Table, Tag, Button, DatePicker, Select, Skeleton } from "antd";
import { OrderHistoryItem } from "../../dashboard/api";

type Props = {
  items?: OrderHistoryItem[];
  loading?: boolean;
};

export default function OrderHistoryView({ items = [], loading }: Props) {
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
      title: "Buyer",
      dataIndex: "buyer_name",
      key: "buyer_name",
      render: (text: string) => <span className="font-semibold text-gray-900">{text}</span>,
    },
    {
      title: "Quantity (MT)",
      dataIndex: "agreed_tonnage",
      key: "agreed_tonnage",
    },
    {
      title: "Delivered Date",
      dataIndex: "delivered_date",
      key: "delivered_date",
      render: (text: string | null) => text || "-",
    },
    {
      title: "Payment Date",
      dataIndex: "payment_date",
      key: "payment_date",
      render: (text: string) => new Date(text).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    },
    {
      title: "Total Amount",
      dataIndex: "total_value",
      key: "total_value",
      render: (text: string) => <span className="font-semibold">₦{text}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const color = status === "completed" ? "green" : "red";
        return (
          <Tag color={color} className="rounded-full px-3 border-none capitalize font-medium">
            {status}
          </Tag>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-500 mb-1 font-medium">Total Orders</div>
          <div className="text-2xl font-bold text-gray-900">{items.length}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-500 mb-1 font-medium">Total Volume Sold</div>
          <div className="text-2xl font-bold text-gray-900">18.400MT</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-500 mb-1 font-medium">Total Revenue</div>
          <div className="text-2xl font-bold text-gray-900 truncate" title="₦124,000,000">₦124,000,000</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-500 mb-1 font-medium">Last Transaction</div>
          <div className="text-2xl font-bold text-gray-900">Oct 24, 2025</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Filters Header */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col lg:flex-row gap-4 lg:items-center">
           <div className="grid grid-cols-2 sm:flex gap-4 w-full lg:w-auto">
             <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-2 py-1 flex-1 sm:flex-none">
               <span className="text-xs text-gray-500 pl-2">Status</span>
               <Select 
                 defaultValue="all" 
                 bordered={false} 
                 className="w-full sm:w-24 text-sm" 
                 options={[{ value: 'all', label: 'All status' }]} 
                 size="small"
               />
             </div>
             <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-2 py-1 flex-1 sm:flex-none">
               <span className="text-xs text-gray-500 pl-2">Payment</span>
               <Select 
                 defaultValue="all" 
                 bordered={false} 
                 className="w-full sm:w-20 text-sm" 
                 options={[{ value: 'all', label: 'All' }]} 
                 size="small"
               />
             </div>
           </div>
           
           <div className="grid grid-cols-2 sm:flex gap-4 w-full lg:w-auto lg:ml-auto">
             <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-2 py-1 flex-1 sm:flex-none">
               <span className="text-xs text-gray-500 pl-2 whitespace-nowrap">From</span>
               <DatePicker bordered={false} placeholder="Select start date" size="small" className="w-full sm:w-32 bg-transparent" />
             </div>
             <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-2 py-1 flex-1 sm:flex-none">
               <span className="text-xs text-gray-500 pl-2 whitespace-nowrap">To</span>
               <DatePicker bordered={false} placeholder="Select end date" size="small" className="w-full sm:w-32 bg-transparent" />
             </div>
           </div>
        </div>

        {/* Mobile List View */}
        <div className="block lg:hidden p-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No order history</div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Order ID</div>
                    <div className="font-semibold text-gray-900 text-lg">#{item.order_code}</div>
                  </div>
                  <Tag color={item.status === "completed" ? "green" : "red"} className="rounded-full px-2 border-none m-0 capitalize font-medium">
                    {item.status}
                  </Tag>
                </div>
                
                <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                  <div>
                     <div className="text-xs text-gray-400 mb-1">Buyer</div>
                     <div className="font-semibold text-gray-900 text-sm truncate">{item.buyer_name}</div>
                  </div>
                  <div>
                     <div className="text-xs text-gray-400 mb-1">Total Amount</div>
                     <div className="font-semibold text-gray-900 text-sm truncate">₦{item.total_value}</div>
                  </div>
                  
                  <div>
                     <div className="text-xs text-gray-400 mb-1">Quantity</div>
                     <div className="text-sm font-medium text-gray-700 truncate">{item.agreed_tonnage} MT</div>
                  </div>
                  <div>
                     <div className="text-xs text-gray-400 mb-1">Payment Date</div>
                     <div className="text-sm font-medium text-gray-700 truncate">{new Date(item.payment_date).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block">
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
    </div>
  );
}
