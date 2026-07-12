"use client";

import { useParams, useRouter } from "next/navigation";
import { Button, Result } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";

// STUB: the quote/RFQ creation flow does not exist yet. This page is a
// placeholder destination for the "Request Quote" button on the miner
// detail page so the button is never a dead link. Replace with the real
// RFQ form once that flow is built.
export default function RequestQuoteStubPage() {
  const params = useParams<{ minerId: string }>();
  const router = useRouter();

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 pt-6">
      <Button icon={<ArrowLeftOutlined />} onClick={() => router.push(`/marketplace/${params.minerId}`)}>
        Back to miner profile
      </Button>
      <Result
        status="info"
        title="Quote requests are coming soon"
        subTitle="We're still building the request-for-quote flow for this miner. Check back shortly."
        extra={
          <Button type="primary" onClick={() => router.push("/marketplace")}>
            Back to marketplace
          </Button>
        }
      />
    </div>
  );
}
