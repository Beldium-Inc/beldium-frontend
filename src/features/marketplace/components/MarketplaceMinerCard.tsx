"use client";

import { Card, Skeleton, Tag } from "antd";
import { useRouter } from "next/navigation";
import type { MinerProfileListItem } from "../api";

const MINING_TITLE_LABELS: Record<string, string> = {
  valid_mining_license: "Valid Mining License",
  small_scale_mining_lease: "Small Scale Mining Lease",
  exploration_license: "Exploration License",
  inprocess_or_pending: "In Process / Pending",
};

export function complianceScoreColor(score: number | null | undefined) {
  if (score == null) return "default";
  if (score >= 75) return "success";
  if (score >= 50) return "warning";
  return "error";
}

export default function MarketplaceMinerCard({
  miner,
  complianceScore,
  complianceLoading,
}: {
  miner: MinerProfileListItem;
  complianceScore: number | null;
  complianceLoading: boolean;
}) {
  const router = useRouter();

  return (
    <Card
      hoverable
      className="rounded-xl border border-[#E9ECF2] shadow-sm h-full"
      onClick={() => router.push(`/marketplace/${miner.id}`)}
      role="button"
      aria-label={`View details for ${miner.user_email}`}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="font-semibold text-gray-900">{miner.user_email}</div>
            <div className="text-xs text-gray-400">#{miner.miner_code}</div>
          </div>
          {complianceLoading ? (
            <Skeleton.Button active size="small" shape="round" />
          ) : (
            <Tag color={complianceScoreColor(complianceScore)}>
              {complianceScore != null ? `${complianceScore}% compliant` : "Score pending"}
            </Tag>
          )}
        </div>

        <div className="text-sm text-gray-600">
          {[miner.local_government_area, miner.state_of_operation, miner.country]
            .filter(Boolean)
            .join(", ")}
        </div>

        <div className="flex flex-wrap gap-2 mt-1">
          {miner.mining_title_status && (
            <Tag className="bg-gray-50 text-gray-600 border-0">
              {MINING_TITLE_LABELS[miner.mining_title_status] ?? miner.mining_title_status}
            </Tag>
          )}
          {miner.mineral_type && (
            <Tag className="bg-blue-50 text-blue-600 border-0">{miner.mineral_type}</Tag>
          )}
        </div>

        {miner.estimated_monthly_output && (
          <div className="text-xs text-gray-500 mt-1">
            Estimated monthly output: {miner.estimated_monthly_output}
          </div>
        )}
      </div>
    </Card>
  );
}
