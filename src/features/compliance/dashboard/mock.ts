export type TrendDirection = "up" | "down" | "neutral";

export type StatusTone =
  | "green"
  | "amber"
  | "red"
  | "slate"
  | "mint"
  | "cyan"
  | "rose";

export type StatusBadge = {
  label: string;
  tone: StatusTone;
};

export type DashboardMetric = {
  title: string;
  value: string;
  trendText?: string;
  trendDirection?: TrendDirection;
  note?: string;
  featured?: boolean;
  progress?: number;
};

export type AdminPipelineRow = {
  minerId: string;
  company: string;
  location: string;
  licenseStatus: StatusBadge;
  environmentalStatus: StatusBadge;
  complianceScore: number;
  reviewer: string;
  lastActionDate: string;
};

export type ComplianceAlert = {
  title: string;
  detail: string;
  meta: string;
  actionLabel: string;
  reviewId?: string;
  minerId?: string | null;
  minerName?: string | null;
  createdAt?: string;
};

export type ComplianceQueueRow = {
  minerId: string;
  company: string;
  location: string;
  waitTime: string;
  waitTone?: "default" | "warning";
  highlighted?: boolean;
};

export type ComplianceCaseCard = {
  minerId: string;
  company: string;
  location: string;
  priority: StatusBadge;
  progress: number;
  cta: string;
};

export const ADMIN_METRICS: DashboardMetric[] = [
  {
    title: "Total Miners Onboarded",
    value: "1,191",
    trendText: "+15% last month",
    trendDirection: "up",
    featured: true,
  },
  {
    title: "Under review",
    value: "1,022",
    trendText: "+15% last month",
    trendDirection: "up",
  },
  {
    title: "Compliance-ready",
    value: "542",
    trendText: "+15% last month",
    trendDirection: "up",
  },
  {
    title: "Action required",
    value: "619",
    trendText: "+15% last month",
    trendDirection: "down",
  },
];

export const ADMIN_PIPELINE_ROWS: AdminPipelineRow[] = [
  {
    minerId: "BLD-01120",
    company: "Oke Ayo Minerals Ltd",
    location: "Kwara / Ilorin",
    licenseStatus: { label: "Valid", tone: "green" },
    environmentalStatus: { label: "Submitted", tone: "green" },
    complianceScore: 96,
    reviewer: "A. Bello",
    lastActionDate: "14 Jan 2026",
  },
  {
    minerId: "BLD-00126",
    company: "Zamfara Gold Works",
    location: "Zamfara / Anka",
    licenseStatus: { label: "Valid", tone: "green" },
    environmentalStatus: { label: "In progress", tone: "amber" },
    complianceScore: 68,
    reviewer: "K. Mohammed",
    lastActionDate: "14 Jan 2026",
  },
  {
    minerId: "BLD-00127",
    company: "GreenRock Resources",
    location: "Nasarawa / Lafia",
    licenseStatus: { label: "Not provided", tone: "slate" },
    environmentalStatus: { label: "Not initiated", tone: "red" },
    complianceScore: 32,
    reviewer: "-",
    lastActionDate: "14 Jan 2026",
  },
  {
    minerId: "BLD-00128",
    company: "Kogi Ore Cooperative",
    location: "Kogi / Okene",
    licenseStatus: { label: "Expiring", tone: "amber" },
    environmentalStatus: { label: "Submitted", tone: "green" },
    complianceScore: 67,
    reviewer: "S. Okafor",
    lastActionDate: "14 Jan 2026",
  },
  {
    minerId: "BLD-00124",
    company: "Northern Ridge Minerals",
    location: "Kaduna / Birnin Gwari",
    licenseStatus: { label: "Valid", tone: "green" },
    environmentalStatus: { label: "Initiated", tone: "cyan" },
    complianceScore: 94,
    reviewer: "K. Mohammed",
    lastActionDate: "14 Jan 2026",
  },
  {
    minerId: "BLD-00136",
    company: "Oke Ayo Minerals Ltd",
    location: "Kwara / Ilorin",
    licenseStatus: { label: "Not provided", tone: "slate" },
    environmentalStatus: { label: "Submitted", tone: "green" },
    complianceScore: 66,
    reviewer: "K. Mohammed",
    lastActionDate: "14 Jan 2026",
  },
  {
    minerId: "BLD-00138",
    company: "Northern Ridge Minerals",
    location: "Zamfara / Anka",
    licenseStatus: { label: "Expired", tone: "red" },
    environmentalStatus: { label: "Not initiated", tone: "red" },
    complianceScore: 30,
    reviewer: "-",
    lastActionDate: "14 Jan 2026",
  },
  {
    minerId: "BLD-00140",
    company: "Oke Ayo Minerals Ltd",
    location: "Kwara / Ilorin",
    licenseStatus: { label: "Expired", tone: "red" },
    environmentalStatus: { label: "Submitted", tone: "green" },
    complianceScore: 31,
    reviewer: "-",
    lastActionDate: "14 Jan 2026",
  },
];

export const COMPLIANCE_ALERT: ComplianceAlert = {
  title: "New Miner Onboarded",
  detail: "Ready for review",
  meta: "Review ID: 52fec003 • Mar 15, 2026, 5:20 PM",
  actionLabel: "Claim Task",
  reviewId: "52fec003-6b02-4543-ba36-08ff8e702db6",
  minerId: "16691080-f8c7-4f1a-8f90-87e5fa09b78c",
  minerName: "Beldium Inc (Miner1)",
  createdAt: "2026-03-15T17:20:11.111321Z",
};

export const COMPLIANCE_METRICS: DashboardMetric[] = [
  {
    title: "Active tasks",
    value: "1",
    trendText: "+100% last month",
    trendDirection: "up",
  },
  {
    title: "Avg. review time",
    value: "0m",
    trendText: "No change last month",
    trendDirection: "neutral",
  },
  {
    title: "Quality score",
    value: "0%",
    progress: 0,
  },
  {
    title: "Queue load",
    value: "3",
    note: "Pending global claims",
  },
];

export const COMPLIANCE_QUEUE_ROWS: ComplianceQueueRow[] = [
  {
    minerId: "BLD-01120",
    company: "Oke Ayo Minerals Ltd",
    location: "Kwara / Ilorin",
    waitTime: "30m",
  },
  {
    minerId: "BLD-00126",
    company: "Zamfara Gold Works",
    location: "Zamfara / Anka",
    waitTime: "25m",
  },
  {
    minerId: "BLD-00127",
    company: "GreenRock Resources",
    location: "Nasarawa / Lafia",
    waitTime: "1h 13m",
    waitTone: "warning",
    highlighted: true,
  },
  {
    minerId: "BLD-00128",
    company: "Northern Ridge Minerals",
    location: "Kaduna / Birnin Gwari",
    waitTime: "18m",
  },
  {
    minerId: "BLD-00140",
    company: "Oke Ayo Minerals Ltd",
    location: "Kwara / Ilorin",
    waitTime: "40m",
    waitTone: "warning",
    highlighted: true,
  },
];

export const COMPLIANCE_CASE_CARDS: ComplianceCaseCard[] = [
  {
    minerId: "#BLD-10024",
    company: "Oke Mineral Miners",
    location: "Kano / Kano",
    priority: { label: "Critical", tone: "amber" },
    progress: 97,
    cta: "Resume verification",
  },
  {
    minerId: "#BLD-10042",
    company: "Zamfara Gold Works",
    location: "Zamfara / Anka",
    priority: { label: "Standard", tone: "slate" },
    progress: 30,
    cta: "Continue review",
  },
  {
    minerId: "#BLD-10057",
    company: "Northern Ridge Minerals",
    location: "Kaduna / Birnin Gwari",
    priority: { label: "Critical", tone: "amber" },
    progress: 60,
    cta: "Resume verification",
  },
];
