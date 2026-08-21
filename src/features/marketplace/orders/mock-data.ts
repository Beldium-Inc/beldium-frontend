/**
 * TEMPORARY mock data layer. The backend has no buyer-facing order-list or
 * order-detail endpoint yet (see the message sent to the backend team -
 * item 3 and 5). This lets the Orders list + Order detail + logistics map
 * pages get built and demoed now; `orders-api.ts` tries the real endpoint
 * first and only falls back to this file on failure, so once the backend
 * ships those endpoints this file stops being used with zero page changes.
 */

export type OrderTimelineStep =
  | "order_placed"
  | "payment_secured"
  | "quality_verification"
  | "preparing"
  | "in_transit"
  | "delivered"
  | "payment_released";

export const TIMELINE_STEPS: { key: OrderTimelineStep; label: string }[] = [
  { key: "order_placed", label: "Order placed" },
  { key: "payment_secured", label: "Payment secured" },
  { key: "quality_verification", label: "Quality verification" },
  { key: "preparing", label: "Preparing" },
  { key: "in_transit", label: "In transit" },
  { key: "delivered", label: "Delivered" },
  { key: "payment_released", label: "Payment released" },
];

export type MockDocument = { label: string };

export type MockOrder = {
  id: string;
  order_code: string;
  mineral_type: string;
  supplier_name: string;
  agreed_tonnage: string; // e.g. "500 DMT (Dry Metric Tonnes)"
  quantity_display: string; // e.g. "1,250 MT (Metric Tonnes)"
  total_value: string;
  currency: string;
  status: "in_transit" | "delivered" | "payment_secured";
  created_at: string;
  current_step: OrderTimelineStep;
  escrow_secured: boolean;
  documents: MockDocument[];
  origin: { label: string; sublabel: string; lat: number; lng: number };
  destination: { label: string; sublabel: string; lat: number; lng: number };
};

export const MOCK_ORDERS: MockOrder[] = [
  {
    id: "BLD-00231",
    order_code: "BLD-00231",
    mineral_type: "Lithium",
    supplier_name: "Minera Corp PLC",
    agreed_tonnage: "500 DMT (Dry Metric Tonnes)",
    quantity_display: "1,250 MT (Metric Tonnes)",
    total_value: "202608.11",
    currency: "NGN",
    status: "in_transit",
    created_at: "2026-08-11",
    current_step: "in_transit",
    escrow_secured: true,
    documents: [
      { label: "Sales contract" },
      { label: "Assay reports" },
      { label: "Certificate of analysis (COA)" },
      { label: "Export documentation" },
    ],
    origin: { label: "Oyo state, NIG", sublabel: "Oyo port complex", lat: 8.1574, lng: 4.2743 },
    destination: { label: "Lagos state, NIG", sublabel: "Apapa port complex", lat: 6.4531, lng: 3.3592 },
  },
  {
    id: "BLD-00230",
    order_code: "BLD-00231",
    mineral_type: "Gold",
    supplier_name: "AfriMine Exporters",
    agreed_tonnage: "250,000 DMT",
    quantity_display: "250,000 OZ",
    total_value: "202608.11",
    currency: "NGN",
    status: "delivered",
    created_at: "2026-08-11",
    current_step: "delivered",
    escrow_secured: true,
    documents: [
      { label: "Sales contract" },
      { label: "Assay reports" },
      { label: "Certificate of analysis (COA)" },
      { label: "Export documentation" },
    ],
    origin: { label: "Zamfara state, NIG", sublabel: "Gusau depot", lat: 12.1704, lng: 6.6641 },
    destination: { label: "Lagos state, NIG", sublabel: "Apapa port complex", lat: 6.4531, lng: 3.3592 },
  },
  {
    id: "BLD-00229",
    order_code: "BLD-00231",
    mineral_type: "Tantalum",
    supplier_name: "AfriMine Exporters",
    agreed_tonnage: "250,000 DMT",
    quantity_display: "250,000 MT",
    total_value: "202608.11",
    currency: "NGN",
    status: "payment_secured",
    created_at: "2026-08-11",
    current_step: "payment_secured",
    escrow_secured: true,
    documents: [{ label: "Sales contract" }],
    origin: { label: "Plateau state, NIG", sublabel: "Jos depot", lat: 9.8965, lng: 8.8583 },
    destination: { label: "Lagos state, NIG", sublabel: "Apapa port complex", lat: 6.4531, lng: 3.3592 },
  },
];

export function getMockOrders(search: string): MockOrder[] {
  if (!search) return MOCK_ORDERS;
  const q = search.toLowerCase();
  return MOCK_ORDERS.filter(
    (o) =>
      o.mineral_type.toLowerCase().includes(q) ||
      o.supplier_name.toLowerCase().includes(q) ||
      o.order_code.toLowerCase().includes(q),
  );
}

export function getMockOrderById(id: string): MockOrder | undefined {
  return MOCK_ORDERS.find((o) => o.id === id);
}

// Used when a signed-in buyer clicks Buy now / Request quote on a real
// listing - creates a fresh mock order so the rest of the (currently
// backend-less) purchase flow can still be demoed end-to-end.
export function createMockOrderFromListing(input: {
  mineralType: string;
  supplierName: string;
  quantityAvailable: number;
  askingPricePerMt: string;
  currency: string;
  mineState: string;
}): MockOrder {
  const nextNumber = 232 + MOCK_ORDERS.length;
  const id = `BLD-${String(nextNumber).padStart(5, "0")}`;
  const order: MockOrder = {
    id,
    order_code: id,
    mineral_type: input.mineralType,
    supplier_name: input.supplierName,
    agreed_tonnage: `${input.quantityAvailable.toLocaleString()} DMT (Dry Metric Tonnes)`,
    quantity_display: `${input.quantityAvailable.toLocaleString()} MT (Metric Tonnes)`,
    total_value: (Number(input.askingPricePerMt) * input.quantityAvailable).toFixed(2),
    currency: input.currency,
    status: "payment_secured",
    created_at: new Date().toISOString().slice(0, 10),
    current_step: "order_placed",
    escrow_secured: false,
    documents: [{ label: "Sales contract" }],
    origin: { label: `${input.mineState} state, NIG`, sublabel: `${input.mineState} depot`, lat: 9.082, lng: 8.6753 },
    destination: { label: "Lagos state, NIG", sublabel: "Apapa port complex", lat: 6.4531, lng: 3.3592 },
  };
  MOCK_ORDERS.unshift(order);
  return order;
}
