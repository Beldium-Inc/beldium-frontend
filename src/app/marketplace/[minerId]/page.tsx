"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button, Skeleton, Tag } from "antd";
import { ArrowLeftOutlined, DownloadOutlined, EyeOutlined } from "@ant-design/icons";
import { getMinerComplianceDetail } from "@/src/features/marketplace/detail-api";
import { complianceScoreColor } from "@/src/features/marketplace/components/MarketplaceMinerCard";

const MINING_TITLE_LABELS: Record<string, string> = {
  valid_mining_license: "Valid Mining License",
  small_scale_mining_lease: "Small Scale Mining Lease",
  exploration_license: "Exploration License",
  inprocess_or_pending: "In Process / Pending",
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-gray-400">{label}</div>
      <div className="text-sm font-medium text-gray-900">{value ?? "Not available"}</div>
    </div>
  );
}

export default function MinerDetailPage() {
  const params = useParams<{ minerId: string }>();
  const router = useRouter();
  const minerId = params.minerId;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["marketplace", "miner-detail", minerId],
    queryFn: () => getMinerComplianceDetail(minerId),
    enabled: Boolean(minerId),
  });

  const detail = data?.data;
  const miner = detail?.miner;
  const complianceScore = detail?.compliance_review?.compliance_score ?? null;
  const primaryLicense = detail?.licenses?.[0];
  const eiaReview = detail?.esg_reviews?.find((r) => r.category?.toLowerCase() === "environmental");

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 md:px-6 pt-6">
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    );
  }

  if (isError || !miner) {
    return (
      <div className="max-w-5xl mx-auto px-4 md:px-6 pt-6">
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.push("/marketplace")}>
          Back to marketplace
        </Button>
        <div className="text-sm text-red-500 mt-4">
          Unable to load this miner&apos;s details right now. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24 px-4 md:px-6 pt-6">
      <Button icon={<ArrowLeftOutlined />} onClick={() => router.push("/marketplace")}>
        Back to marketplace
      </Button>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{miner.user_email}</h1>
          <div className="text-sm text-gray-500">#{miner.miner_code}</div>
        </div>
        <div className="flex items-center gap-3">
          <Tag color={complianceScoreColor(complianceScore)} className="text-sm px-3 py-1">
            {complianceScore != null ? `${complianceScore}% compliant` : "Score pending"}
          </Tag>
          <Button type="primary" onClick={() => router.push(`/marketplace/${minerId}/request-quote`)}>
            Request Quote
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-[#E9ECF2] bg-white p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Field
          label="License Type"
          value={primaryLicense ? primaryLicense.license_type : (miner.mining_title_status ? (MINING_TITLE_LABELS[miner.mining_title_status] ?? miner.mining_title_status) : null)}
        />
        <Field label="License Number" value={primaryLicense?.license_number ?? miner.license_number} />
        <Field label="License Issue Date" value={miner.license_issue_date} />
        <Field label="License Expiry Date" value={primaryLicense?.expiry_date} />
        <Field label="EIA Status" value={eiaReview?.status} />
        <Field
          label="Mining Location"
          value={[miner.local_government_area, miner.state_of_operation, miner.country].filter(Boolean).join(", ")}
        />
        <Field label="Surface Sample Grade" value={null} />
        <Field label="Production Capacity" value={miner.estimated_monthly_output} />
        <Field label="Worker Count" value={null} />
      </div>

      <div className="rounded-xl border border-[#E9ECF2] bg-white p-4 md:p-6">
        <div className="font-semibold text-gray-900 mb-4">Compliance Documents</div>
        {detail?.documents?.length ? (
          <div className="flex flex-col divide-y divide-gray-100">
            {detail.documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between py-3 gap-3">
                <div>
                  <div className="text-sm font-medium text-gray-900">{doc.document_type}</div>
                  <Tag className="mt-1">{doc.status}</Tag>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="small"
                    icon={<EyeOutlined />}
                    disabled={!doc.file}
                    onClick={() => doc.file && window.open(doc.file, "_blank")}
                  >
                    View
                  </Button>
                  <Button
                    size="small"
                    icon={<DownloadOutlined />}
                    disabled={!doc.file}
                    href={doc.file ?? undefined}
                    target="_blank"
                  >
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-400">No compliance documents available.</div>
        )}
      </div>
    </div>
  );
}
