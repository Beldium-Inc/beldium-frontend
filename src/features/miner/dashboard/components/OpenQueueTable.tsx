import { Table, Tag, Skeleton } from "antd";
import Link from "next/link";
import dayjs from "dayjs";
import { OpenQueueItem } from "../api";

type Props = {
  items: OpenQueueItem[];
  loading?: boolean;
};

function statusColor(status: string) {
  const s = (status || "").toLowerCase();
  if (s === "pending") return "orange";
  if (s === "completed") return "green";
  if (s === "shipped") return "blue";
  if (s === "in transit") return "gold";
  return "default";
}

export default function OpenQueueTable({ items, loading }: Props) {
  if (loading) {
    return <Skeleton active paragraph={{ rows: 5 }} />;
  }

  const data = items.map((i) => ({
    key: i.id,
    orderId: i.order_id || i.id.slice(0, 8),
    mineral: i.mineral_type,
    quantity: i.quantity,
    status: i.status,
    date: i.created_at ? dayjs(i.created_at).format("D MMM, YYYY") : "--",
  }));

  const viewHref = "/dashboard?view=orders&tab=new_requests";

  return (
    <>
      {/* Mobile/Tablet List View */}
      <div className="block xl:hidden space-y-4">
        {data.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">No orders found</div>
        ) : (
          data.map((item) => (
            <div key={item.key} className="p-4 bg-gray-50 rounded-xl border border-gray-100 relative">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Order ID</div>
                  <div className="font-semibold text-gray-900">#{item.orderId}</div>
                </div>
                <Tag color={statusColor(item.status)} className="m-0 rounded-full">{item.status}</Tag>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-400 font-medium mb-0.5">Mineral</div>
                  <div className="text-sm font-medium text-gray-700">{item.mineral}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 font-medium mb-0.5">Quantity (kg)</div>
                  <div className="text-sm font-medium text-gray-700">{item.quantity}</div>
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
                <div className="text-xs text-gray-400">{item.date}</div>
                <Link href={viewHref} className="text-gray-500 hover:text-gray-800 text-xs font-medium">
                  View
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden xl:block">
        <Table
          dataSource={data}
          pagination={false}
          scroll={{ x: 800 }}
          columns={[
            { title: "Order ID", dataIndex: "orderId", render: (v) => `#${v}` },
            { title: "Mineral", dataIndex: "mineral" },
            { title: "Quantity (kg)", dataIndex: "quantity" },
            {
              title: "Status",
              dataIndex: "status",
              render: (v: string) => <Tag color={statusColor(v)} className="rounded-full">{v}</Tag>,
            },
            { title: "Date", dataIndex: "date" },
            {
              title: "Action",
              render: () => (
                <Link href={viewHref} className="text-gray-500 hover:text-gray-800 text-xs font-medium">
                  View
                </Link>
              ),
            },
          ]}
        />
      </div>
    </>
  );
}
