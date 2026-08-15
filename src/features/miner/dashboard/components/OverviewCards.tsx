import Link from "next/link";
import { Card, Tag, Skeleton } from "antd";
import { 
  SafetyCertificateOutlined, 
  CodeSandboxOutlined, 
  BellOutlined, 
  ArrowRightOutlined,
  CheckCircleFilled,
  RiseOutlined
} from "@ant-design/icons";

type Props = {
  kyc: string;
  compliance: string;
  access: string;
  activeCount: number;
  activeChange: number;
  pendingCount: number;
  showComplianceBanner?: boolean;
  complianceBannerHref?: string;
  loading?: boolean;
};

function statusTag(value: string) {
  const v = (value || "").toLowerCase();

  const icon = <CheckCircleFilled className="mr-1" />;

  if (v === "completed") return <Tag color="green" icon={icon} className="rounded-full px-2 border-none bg-green-50 text-green-600 font-medium">VERIFIED</Tag>;
  if (v === "approved") return <Tag color="green" icon={icon} className="rounded-full px-2 border-none bg-green-50 text-green-600 font-medium">PASSED</Tag>;
  if (v === "active") return <Tag color="green" icon={icon} className="rounded-full px-2 border-none bg-green-50 text-green-600 font-medium">ACTIVE</Tag>;
  if (v === "pending") return <Tag color="orange" className="rounded-full px-2 border-none">Pending</Tag>;

  return <Tag className="rounded-full px-2">{value}</Tag>;
}

// Human-readable labels for the raw onboarding-step slugs the backend sends
// as "kyc_status" (it's actually which onboarding step the miner is on).
const ONBOARDING_STEP_LABELS: Record<string, string> = {
  miner_identity: "Miner Identity",
  mining_operation_profile: "Mining Operation Profile",
  licensing_regulatory_status: "Licensing & Regulatory Status",
  environmental_esg: "Environmental & ESG",
  production_supply_signals: "Production & Supply Signals",
  compliance_support_opt_in: "Compliance Support Opt-In",
  declaration_authority: "Declaration & Authority",
  completed: "Completed",
};

function AccountHealthRow({
  label,
  helpText,
  children,
}: {
  label: string;
  helpText?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <span className="text-gray-500 text-sm">{label}</span>
        {helpText ? <p className="mt-0.5 text-xs text-gray-400">{helpText}</p> : null}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function kycStatusDisplay(step: string) {
  const isComplete = step.toLowerCase() === "completed";
  const stepLabel = ONBOARDING_STEP_LABELS[step] ?? null;

  if (!step) {
    return { tag: <Tag className="rounded-full px-2 border-none bg-gray-100 text-gray-500">Not started</Tag>, helpText: "Onboarding hasn't started yet." };
  }
  if (isComplete) {
    return { tag: statusTag("completed"), helpText: "Onboarding is complete." };
  }
  return {
    tag: <Tag color="orange" className="rounded-full px-2 border-none">In Progress</Tag>,
    helpText: stepLabel ? `Next step: ${stepLabel}` : undefined,
  };
}

function complianceAuditDisplay(status: string) {
  const v = (status || "").toLowerCase();
  if (v === "approved") {
    return { tag: statusTag("approved"), helpText: "Your compliance audit has been verified." };
  }
  if (v === "rejected") {
    return {
      tag: <Tag color="red" className="rounded-full px-2 border-none bg-red-50 text-red-600 font-medium">Rejected</Tag>,
      helpText: "Your compliance audit was rejected — check your documentation.",
    };
  }
  return {
    tag: <Tag color="orange" className="rounded-full px-2 border-none">Unverified</Tag>,
    helpText: "Your compliance audit hasn't been reviewed yet.",
  };
}

function marketplaceAccessDisplay(access: string) {
  const v = (access || "").toLowerCase();
  if (v === "active") {
    return { tag: statusTag("active"), helpText: "You can list and trade on the marketplace." };
  }
  return {
    tag: <Tag color="red" className="rounded-full px-2 border-none bg-red-50 text-red-600 font-medium">Restricted</Tag>,
    helpText: "Complete your compliance audit to unlock marketplace access.",
  };
}

export default function OverviewCards({
  kyc,
  compliance,
  access,
  activeCount,
  activeChange,
  pendingCount,
  showComplianceBanner = false,
  complianceBannerHref = "/onboarding",
  loading
}: Props) {
  if (loading) {
    return (
      <div className="space-y-4">
        {showComplianceBanner && (
          <Skeleton active paragraph={{ rows: 2 }} className="p-6 rounded-2xl border border-gray-100 bg-white" />
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <Skeleton active paragraph={{ rows: 2 }} />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showComplianceBanner && (
        <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-orange-50 p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <span className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                <SafetyCertificateOutlined />
              </span>
              <div>
                <h3 className="text-base font-semibold text-slate-900">Finish Compliance Documentation</h3>
                <p className="mt-1 text-sm text-slate-600">
                  We could not confirm your compliance documentation status. Complete the required details to keep your account on track.
                </p>
              </div>
            </div>

            <Link
              href={complianceBannerHref}
              className="inline-flex w-full items-center justify-center gap-2 self-start rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white! no-underline shadow-sm transition-colors hover:bg-slate-800 hover:text-white! md:w-auto md:min-w-[220px] md:self-auto"
            >
              Finish Documentation
              <ArrowRightOutlined />
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Account Health */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600">
              <SafetyCertificateOutlined />
            </span>
            <span className="font-medium text-gray-700">Account Health</span>
          </div>
          
          <div className="space-y-4">
            <AccountHealthRow label="Onboarding" helpText={kycStatusDisplay(kyc).helpText}>
              {kycStatusDisplay(kyc).tag}
            </AccountHealthRow>
            <AccountHealthRow label="Compliance Audit" helpText={complianceAuditDisplay(compliance).helpText}>
              {complianceAuditDisplay(compliance).tag}
            </AccountHealthRow>
            <AccountHealthRow label="Marketplace Access" helpText={marketplaceAccessDisplay(access).helpText}>
              {marketplaceAccessDisplay(access).tag}
            </AccountHealthRow>
          </div>
        </div>

        {/* Active Orders */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <CodeSandboxOutlined />
            </span>
            <span className="font-medium text-gray-700">Active Orders</span>
          </div>

          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-4xl font-semibold text-gray-900">{activeCount}</span>
            <span className="text-xs font-medium text-green-600 flex items-center bg-green-50 px-1.5 py-0.5 rounded">
              <RiseOutlined className="mr-1" />
              {activeChange > 0 ? "+" : ""}{activeChange}% last month
            </span>
          </div>
          <p className="text-xs text-gray-400">Currently in fulfillment or transit.</p>

          <Link
            href="/dashboard?view=orders&tab=active_orders"
            aria-label="View active orders"
            className="absolute bottom-5 right-5 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors"
          >
            <ArrowRightOutlined className="-rotate-45" />
          </Link>
        </div>

        {/* Pending Actions */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
              <BellOutlined />
            </span>
            <span className="font-medium text-gray-700">Pending Actions</span>
          </div>

          <div className="mb-1">
            <span className="text-4xl font-semibold text-gray-900">{pendingCount}</span>
          </div>
          <p className="text-xs text-gray-400">
            {pendingCount > 0 ? "Orders awaiting your next step." : "All systems clear"}
          </p>

          <Link
            href="/dashboard?view=orders&tab=active_orders"
            aria-label="View pending actions"
            className="absolute bottom-5 right-5 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors"
          >
            <ArrowRightOutlined className="-rotate-45" />
          </Link>
        </div>
      </div>
    </div>
  );
}
