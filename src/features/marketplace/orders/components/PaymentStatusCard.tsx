import type { MockOrder } from "../mock-data";

const CURRENCY_SYMBOL: Record<string, string> = { NGN: "₦", USD: "$" };

export default function PaymentStatusCard({ order }: { order: MockOrder }) {
  const symbol = CURRENCY_SYMBOL[order.currency] ?? `${order.currency} `;
  const amount = Number(order.total_value).toLocaleString();

  return (
    <div className="bg-white border border-[#E9ECF2] rounded-xl p-5">
      <h2 className="font-semibold text-gray-900 mb-3">Payment status</h2>

      {order.escrow_secured ? (
        <>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-100 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-600" /> ESCROW SECURED
          </span>
          <p className="text-sm text-gray-500 mt-3 leading-relaxed">
            {symbol}
            {amount} is secured in Beldium Escrow. Funds will be released to the miner once you
            receive your order.
          </p>
        </>
      ) : (
        <>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-700 bg-orange-50 border border-orange-100 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> AWAITING PAYMENT
          </span>
          <p className="text-sm text-gray-500 mt-3 leading-relaxed">
            Fund escrow for {symbol}
            {amount} to move this order forward.
          </p>
        </>
      )}
    </div>
  );
}
