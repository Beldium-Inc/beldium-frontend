// Status styling + a couple of still-mocked pieces of the RFQ purchase
// flow (order codes, delivery/transport details on an offer) that have no
// real backend field yet - see BACKEND_REQUEST_RFQ_ORDER_FLOW.md. The
// offers themselves, their count, and the RFQ's derived status are real
// now (RFQSerializer.get_offers_count / get_total_value / get_derived_status
// on the backend, and /rfq-assignments/quotes/ for the detail page) -
// nothing here fabricates data anymore.

export type MockRfqStatus = "open" | "under_review" | "accepted" | "closed" | "expired" | "no_match";

export const MOCK_STATUS_STYLES: Record<
  MockRfqStatus,
  { label: string; className: string }
> = {
  open: { label: "Open", className: "bg-blue-50 text-blue-600" },
  under_review: { label: "Under review", className: "bg-amber-50 text-amber-600" },
  accepted: { label: "Accepted", className: "bg-green-50 text-green-600" },
  closed: { label: "Closed", className: "bg-gray-100 text-gray-500" },
  expired: { label: "Expired", className: "bg-red-50 text-red-600" },
  // Real backend status (RFQStatus.NO_MATCH) - no verified miner supplies
  // this mineral, so no assignment/notification was ever created and no
  // one will ever quote it. Distinct from "open" so the buyer isn't left
  // thinking a request is still awaiting response when it never went anywhere.
  no_match: { label: "No miners available", className: "bg-red-50 text-red-600" },
};

// The buyer-facing shape an accepted (or pending) offer is rendered in on
// the RFQ detail page. Populated from real RfqQuote data via quoteToOffer()
// in app/marketplace/rfqs/[id]/page.tsx - deliveryDays/transportMode are
// filled with placeholders there since a miner's quote doesn't carry them
// yet.
export type MockOffer = {
  id: string;
  miner: string;
  location: string;
  quantity: number;
  pricePerUnit: number;
  totalValue: number;
  deliveryDays: number;
  origin: string;
  destination: string;
  transportMode: string;
  verified: boolean;
};

export function formatNaira(value: number) {
  return `₦${value.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
