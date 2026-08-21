"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Button, Result } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import RequireMarketplaceAuth from "@/src/features/marketplace/auth/RequireMarketplaceAuth";

// STUB: buyer-initiated RFQ/order creation has no backend endpoint yet -
// see the message to the backend team. This page exists purely so
// PricingCard's "Buy now" / "Request quote" (features/marketplace/
// components/detail/PricingCard.tsx) never 404 once a signed-in buyer gets
// past the auth gate. Replace with the real quote/checkout form once that
// endpoint exists.
function RequestQuoteContent({ slug }: { slug: string }) {
  const router = useRouter();

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 pt-6">
      <Button icon={<ArrowLeftOutlined />} onClick={() => router.push(`/marketplace/listings/${slug}`)}>
        Back to listing
      </Button>
      <Result
        status="info"
        title="Quote requests are coming soon"
        subTitle="We're still building the buy / request-for-quote flow for this listing. Check back shortly."
        extra={
          <Button type="primary" onClick={() => router.push("/marketplace")}>
            Back to marketplace
          </Button>
        }
      />
    </div>
  );
}

export default function RequestQuotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  return (
    <RequireMarketplaceAuth>
      <RequestQuoteContent slug={slug} />
    </RequireMarketplaceAuth>
  );
}
