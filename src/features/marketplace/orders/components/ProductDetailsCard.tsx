import type { MockOrder } from "../mock-data";

const CURRENCY_SYMBOL: Record<string, string> = { NGN: "₦", USD: "$" };

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#E9ECF2] last:border-0 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-900 font-medium text-right">{value}</span>
    </div>
  );
}

export default function ProductDetailsCard({ order }: { order: MockOrder }) {
  const symbol = CURRENCY_SYMBOL[order.currency] ?? `${order.currency} `;
  return (
    <div className="bg-white border border-[#E9ECF2] rounded-xl p-5">
      <h2 className="font-semibold text-gray-900 mb-1">Product details</h2>
      <Row label="Commodity" value={order.mineral_type} />
      <Row label="Unit price" value={order.agreed_tonnage} />
      <Row label="Quantity" value={order.quantity_display} />
      <Row
        label="Total value"
        value={`${symbol}${Number(order.total_value).toLocaleString()}`}
      />
    </div>
  );
}
