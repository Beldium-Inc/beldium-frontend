"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// The standalone orders list is retired - "RFQ's" is now the single entry
// point for a buyer's activity (request → offers → accepted order). An
// individual order is still reachable at /marketplace/orders/[id] once an
// RFQ's accepted offer creates one (see the "Proceed to order" / "View
// order" actions on the RFQ detail page).
export default function OrdersPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/marketplace/rfqs");
  }, [router]);
  return null;
}
