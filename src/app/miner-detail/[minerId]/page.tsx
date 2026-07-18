"use client";

import { useParams } from "next/navigation";
import MinerDetailView from "@/src/features/marketplace/components/MinerDetailView";

export default function MinerDetailPage() {
  const params = useParams<{ minerId: string }>();

  return <MinerDetailView minerId={params.minerId} backHref="/marketplace" backLabel="Back to marketplace" />;
}
