// Mock data layer for the RFQ offers / purchase-order / escrow / contract
// flow. None of this is backed by a real endpoint yet - see the note in
// rfqs-api.ts. Every value here is derived deterministically from the real
// RFQ's id so the same RFQ always renders the same mock state across
// reloads, without needing a fake backend or persisted mock store.
import type { RfqRow } from "./rfqs-api";

export type MockRfqStatus = "open" | "under_review" | "accepted" | "closed" | "expired";

export const MOCK_STATUS_STYLES: Record<
  MockRfqStatus,
  { label: string; className: string }
> = {
  open: { label: "Open", className: "bg-blue-50 text-blue-600" },
  under_review: { label: "Under review", className: "bg-amber-50 text-amber-600" },
  accepted: { label: "Accepted", className: "bg-green-50 text-green-600" },
  closed: { label: "Closed", className: "bg-gray-100 text-gray-500" },
  expired: { label: "Expired", className: "bg-red-50 text-red-600" },
};

const MOCK_SUPPLIERS = [
  "Miners Craft",
  "Gold SaaS PLC",
  "Tony Stack Mines",
  "Oodgwu PLC",
  "Akon Snoop-Dog",
];

const MOCK_LOCATIONS = ["Oyo state, NIG", "Kano state, NIG", "Zamfara state, NIG", "Plateau state, NIG"];

function hashString(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const STATUS_CYCLE: MockRfqStatus[] = ["open", "under_review", "accepted", "closed", "expired"];

export function mockStatusFor(rfqId: string): MockRfqStatus {
  return STATUS_CYCLE[hashString(rfqId) % STATUS_CYCLE.length];
}

export function mockAmountFor(rfq: Pick<RfqRow, "id" | "total_weight">) {
  const seed = hashString(rfq.id);
  const unitPrice = 200000 + (seed % 50) * 1000;
  const total = unitPrice * Number(rfq.total_weight || 0) / 10;
  return { unitPrice, total: Math.round(total) };
}

export type MockOffer = {
  id: string;
  supplier: string;
  location: string;
  quantity: number;
  pricePerUnit: number;
  totalValue: number;
  deliveryDays: number;
  origin: string;
  verified: boolean;
};

export function mockOffersFor(rfq: Pick<RfqRow, "id" | "total_weight">): MockOffer[] {
  const status = mockStatusFor(rfq.id);
  if (status === "open") return [];

  const seed = hashString(rfq.id);
  const count = status === "under_review" ? 4 : status === "accepted" ? 11 : 12;
  const { unitPrice } = mockAmountFor(rfq);

  return Array.from({ length: count }).map((_, index) => {
    const supplier = MOCK_SUPPLIERS[(seed + index) % MOCK_SUPPLIERS.length];
    const location = MOCK_LOCATIONS[(seed + index) % MOCK_LOCATIONS.length];
    const quantity = [500, 250, 1000][(seed + index) % 3];
    return {
      id: `${rfq.id}-offer-${index}`,
      supplier,
      location,
      quantity,
      pricePerUnit: unitPrice,
      totalValue: unitPrice * quantity / 10,
      deliveryDays: 14 + ((seed + index) % 3) * 7,
      origin: location,
      verified: true,
    };
  });
}

export function formatNaira(value: number) {
  return `₦${value.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
