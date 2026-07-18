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

export type MinerDocumentStatus = "verified" | "issues" | "rejected" | "unreviewed";

export type MinerDocumentDetail = {
  id: string;
  name: string;
  fileName?: string;
  issuedDate: string;
  status: MinerDocumentStatus;
  verifiedBy?: string;
  verifiedAt?: string;
};

export type MinerEsgStatus = "approved" | "in_progress" | "not_initiated";

export type MinerEsgItemDetail = {
  key: string;
  title: string;
  status: MinerEsgStatus;
  notes: string;
  updatedBy: string;
  updatedAt: string;
};

export type MinerActivityLogEntry = {
  id: string;
  message: string;
  by: string;
  at: string;
};

export type MinerDetailInfo = {
  logoInitials: string;
  logoColor: string;
  monthlyOutputRange: string;
  operationType: string;
  minerStatus: "Under review" | "Verified";
  licenseType: string;
  licenseNumber: string;
  issuingAuthority: string;
  licenseExpiry: string;
  documents: MinerDocumentDetail[];
  esgItems: MinerEsgItemDetail[];
  activityLog: MinerActivityLogEntry[];
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
  detail: MinerDetailInfo;
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
  expiresAt?: string;
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

export type ComplianceRuleCategory = {
  id: string;
  title: string;
  description: string;
  activeRules: number;
  icon: "environmental" | "framework" | "community" | "trade";
};

export type ComplianceRuleRow = {
  id: string;
  name: string;
  version: string;
  category: string;
  description: string;
  triggerCondition: string;
  conditions: Array<{
    field: string;
    operator: string;
    value: string;
    unit: string;
  }>;
  action: string;
  severityLabel: "Low" | "Medium" | "High";
  scope: string;
  status: StatusBadge;
};

export type ComplianceThresholdCard = {
  id: string;
  title: string;
  value: string;
  unit: string;
  automatedAction: string;
  automatedActionTone: StatusTone;
  summary: string;
  updatedBy: string;
  icon: "frequency" | "volume";
};

export type ComplianceRiskRuleCard = {
  id: string;
  title: string;
  severityLabel: string;
  severityTone: StatusTone;
  trigger: string;
  action: string;
  active: boolean;
};

export type ComplianceDocumentRequirementRow = {
  id: string;
  documentType: string;
  required: string;
  expiryRule: string;
  status: StatusBadge;
};

export type ComplianceDataControlCard = {
  id: string;
  title: string;
  value: string;
};

export type NotificationSeverity = "high_risk" | "action_required" | "informational";

export type ComplianceNotificationRow = {
  id: string;
  minerName: string;
  minerCode: string;
  alertType: string;
  description: string;
  assignedTo?: string;
  triggeredAt: string;
  severity: NotificationSeverity;
  minerId?: string;
};

export const COMPLIANCE_NOTIFICATIONS: ComplianceNotificationRow[] = [
  {
    id: "note-1",
    minerName: "Apex Extraction Corp",
    minerCode: "#LST-10210",
    alertType: "License Expiry",
    description: "License expires in 30 days",
    assignedTo: "K. Mohammed",
    triggeredAt: "24 May, 2020",
    severity: "high_risk",
  },
  {
    id: "note-2",
    minerName: "Blue Horizon Mining",
    minerCode: "#LST-10210",
    alertType: "EIA Overdue",
    description: "No EIA initiated",
    assignedTo: "O. Bello",
    triggeredAt: "17 Oct, 2020",
    severity: "action_required",
  },
  {
    id: "note-3",
    minerName: "DeepCore Extraction",
    minerCode: "#LST-10210",
    alertType: "Compliance Score",
    description: "Compliance Score changed - Red",
    assignedTo: "O. David",
    triggeredAt: "1 Feb, 2020",
    severity: "high_risk",
  },
  {
    id: "note-4",
    minerName: "GreenStone Mines",
    minerCode: "#LST-10210",
    alertType: "Document Upload",
    description: "New license document uploaded",
    assignedTo: undefined,
    triggeredAt: "8 Sep, 2020",
    severity: "informational",
  },
  {
    id: "note-5",
    minerName: "Apex Extraction Corp",
    minerCode: "#LST-10210",
    alertType: "License Expiry",
    description: "License document expires in 60 days",
    assignedTo: "O. David",
    triggeredAt: "21 Sep, 2020",
    severity: "action_required",
  },
];

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

function buildDocuments(
  status: MinerDocumentStatus,
  verifiedBy: string,
): MinerDocumentDetail[] {
  return [
    {
      id: "doc-1",
      name: "Mining Licensing Certificate",
      issuedDate: "12 Mar 2024",
      status: "unreviewed",
    },
    {
      id: "doc-2",
      name: "Mining Licensing Certificate",
      fileName: "mining_licensing_certificate.pdf",
      issuedDate: "12 Mar 2024",
      status: status === "verified" ? "issues" : status,
    },
    {
      id: "doc-3",
      name: "Mining Licensing Certificate",
      fileName: "mining_licensing_certificate.pdf",
      issuedDate: "12 Mar 2024",
      status,
      verifiedBy: status === "verified" ? verifiedBy : undefined,
      verifiedAt: status === "verified" ? "14 Jan, 2026 12:30 pm" : undefined,
    },
  ];
}

function buildEsgItems(status: MinerEsgStatus, updatedBy: string): MinerEsgItemDetail[] {
  return [
    { key: "eia-status", title: "EIA Status", status, notes: "", updatedBy, updatedAt: "15 Jan 2026" },
    {
      key: "environmental-consultant",
      title: "Environmental Consultant (if any)",
      status,
      notes: "",
      updatedBy,
      updatedAt: "15 Jan 2026",
    },
    { key: "safety-measures", title: "Safety Measures", status, notes: "", updatedBy, updatedAt: "15 Jan 2026" },
    {
      key: "community-engagement",
      title: "Community Engagement",
      status,
      notes: "",
      updatedBy,
      updatedAt: "15 Jan 2026",
    },
  ];
}

function buildActivityLog(reviewer: string): MinerActivityLogEntry[] {
  return [
    { id: "log-1", message: "EIA status updated: In Progress", by: "I. Brown", at: "Jan 24, 2025 1:39 pm" },
    { id: "log-2", message: "License document verified", by: reviewer === "-" ? "Unassigned" : reviewer, at: "Jan 24, 2025 1:39 pm" },
    { id: "log-3", message: "EIA status updated: In Progress", by: "I. Brown", at: "Jan 24, 2025 1:39 pm" },
    { id: "log-4", message: "License document verified", by: reviewer === "-" ? "Unassigned" : reviewer, at: "Jan 24, 2025 1:39 pm" },
  ];
}

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
    detail: {
      logoInitials: "in",
      logoColor: "#ee2a5c",
      monthlyOutputRange: "100 - 200 tons",
      operationType: "Open Pit",
      minerStatus: "Under review",
      licenseType: "Small Scale Mining Leases",
      licenseNumber: "ML/NGR/2345/2026",
      issuingAuthority: "Nigeria Mining Cadastre Office (NMCO)",
      licenseExpiry: "Valid till 08/2028",
      documents: buildDocuments("verified", "A. Bello"),
      esgItems: buildEsgItems("approved", "I. Brown"),
      activityLog: buildActivityLog("A. Bello"),
    },
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
    detail: {
      logoInitials: "ZG",
      logoColor: "#f3a000",
      monthlyOutputRange: "50 - 100 tons",
      operationType: "Underground",
      minerStatus: "Under review",
      licenseType: "Small Scale Mining Leases",
      licenseNumber: "ML/NGR/4471/2025",
      issuingAuthority: "Nigeria Mining Cadastre Office (NMCO)",
      licenseExpiry: "Valid till 03/2027",
      documents: buildDocuments("issues", "K. Mohammed"),
      esgItems: buildEsgItems("in_progress", "I. Brown"),
      activityLog: buildActivityLog("K. Mohammed"),
    },
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
    detail: {
      logoInitials: "GR",
      logoColor: "#7b8392",
      monthlyOutputRange: "Not provided",
      operationType: "Not provided",
      minerStatus: "Under review",
      licenseType: "Not provided",
      licenseNumber: "Not provided",
      issuingAuthority: "Not provided",
      licenseExpiry: "Not provided",
      documents: buildDocuments("rejected", "Unassigned"),
      esgItems: buildEsgItems("not_initiated", "Unassigned"),
      activityLog: buildActivityLog("-"),
    },
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
    detail: {
      logoInitials: "KO",
      logoColor: "#1d5de2",
      monthlyOutputRange: "80 - 150 tons",
      operationType: "Open Pit",
      minerStatus: "Under review",
      licenseType: "Small Scale Mining Leases",
      licenseNumber: "ML/NGR/8820/2024",
      issuingAuthority: "Nigeria Mining Cadastre Office (NMCO)",
      licenseExpiry: "Valid till 02/2026",
      documents: buildDocuments("issues", "S. Okafor"),
      esgItems: buildEsgItems("in_progress", "I. Brown"),
      activityLog: buildActivityLog("S. Okafor"),
    },
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
    detail: {
      logoInitials: "NR",
      logoColor: "#1ea43b",
      monthlyOutputRange: "150 - 250 tons",
      operationType: "Open Pit",
      minerStatus: "Verified",
      licenseType: "Small Scale Mining Leases",
      licenseNumber: "ML/NGR/1190/2023",
      issuingAuthority: "Nigeria Mining Cadastre Office (NMCO)",
      licenseExpiry: "Valid till 11/2028",
      documents: buildDocuments("verified", "K. Mohammed"),
      esgItems: buildEsgItems("approved", "I. Brown"),
      activityLog: buildActivityLog("K. Mohammed"),
    },
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
    detail: {
      logoInitials: "in",
      logoColor: "#ee2a5c",
      monthlyOutputRange: "Not provided",
      operationType: "Open Pit",
      minerStatus: "Under review",
      licenseType: "Not provided",
      licenseNumber: "Not provided",
      issuingAuthority: "Not provided",
      licenseExpiry: "Not provided",
      documents: buildDocuments("issues", "K. Mohammed"),
      esgItems: buildEsgItems("in_progress", "I. Brown"),
      activityLog: buildActivityLog("K. Mohammed"),
    },
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
    detail: {
      logoInitials: "NR",
      logoColor: "#1ea43b",
      monthlyOutputRange: "60 - 90 tons",
      operationType: "Underground",
      minerStatus: "Under review",
      licenseType: "Small Scale Mining Leases",
      licenseNumber: "ML/NGR/2207/2021",
      issuingAuthority: "Nigeria Mining Cadastre Office (NMCO)",
      licenseExpiry: "Expired 09/2025",
      documents: buildDocuments("rejected", "Unassigned"),
      esgItems: buildEsgItems("not_initiated", "Unassigned"),
      activityLog: buildActivityLog("-"),
    },
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
    detail: {
      logoInitials: "in",
      logoColor: "#ee2a5c",
      monthlyOutputRange: "40 - 70 tons",
      operationType: "Open Pit",
      minerStatus: "Under review",
      licenseType: "Small Scale Mining Leases",
      licenseNumber: "ML/NGR/3391/2020",
      issuingAuthority: "Nigeria Mining Cadastre Office (NMCO)",
      licenseExpiry: "Expired 06/2025",
      documents: buildDocuments("rejected", "Unassigned"),
      esgItems: buildEsgItems("in_progress", "Unassigned"),
      activityLog: buildActivityLog("-"),
    },
  },
];

export const COMPLIANCE_ALERT: ComplianceAlert = {
  title: "New Miner Onboarded",
  detail: "[Miner ID: 16691080] - Ready for Review.",
  meta: "Expires Mar 17, 2026, 5:20 PM",
  actionLabel: "Claim Task",
  reviewId: "52fec003-6b02-4543-ba36-08ff8e702db6",
  minerId: "16691080-f8c7-4f1a-8f90-87e5fa09b78c",
  minerName: "Beldium Inc (Miner1)",
  createdAt: "2026-03-15T17:20:11.111321Z",
  expiresAt: "2026-03-17T17:20:11.111321Z",
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

export const COMPLIANCE_RULE_CATEGORIES: ComplianceRuleCategory[] = [
  {
    id: "eia",
    title: "Environmental Impact Assessments (EIAs)",
    description: "Rules enforcing Environmental Impact Assessments (EIAs)",
    activeRules: 7,
    icon: "environmental",
  },
  {
    id: "esg",
    title: "ESG Framework Design & Reporting",
    description:
      "Requirements for environmental, social, and governance reporting",
    activeRules: 7,
    icon: "framework",
  },
  {
    id: "community",
    title: "Community & Social Impact Advisory",
    description: "Rules governing community and social impact",
    activeRules: 7,
    icon: "community",
  },
  {
    id: "trade",
    title: "Export & Trade Documentation",
    description:
      "Rules regulating mineral export documentation and authorization",
    activeRules: 7,
    icon: "trade",
  },
];

export const COMPLIANCE_ACTIVE_RULE_ROWS: ComplianceRuleRow[] = [
  {
    id: "rule-1",
    name: "EIA Required",
    version: "v3",
    category: "Environmental",
    description:
      "Ensures Environmental Impact Assessment is submitted for qualifying operations",
    triggerCondition: "Missing EIA document",
    conditions: [
      {
        field: "EIA Submission Status",
        operator: "is missing",
        value: "1",
        unit: "Submission",
      },
    ],
    action: "Auto flag miner",
    severityLabel: "High",
    scope: "All Jurisdiction",
    status: { label: "Active", tone: "green" },
  },
  {
    id: "rule-2",
    name: "High Production without EIA",
    version: "v3",
    category: "Environmental",
    description:
      "Flags miners producing above approved levels without a valid EIA on file",
    triggerCondition: "Production > 100 tons annually",
    conditions: [
      {
        field: "Production Volume",
        operator: ">",
        value: "100",
        unit: "Tons",
      },
    ],
    action: "High Risk Flag",
    severityLabel: "High",
    scope: "Federal Only",
    status: { label: "Active", tone: "green" },
  },
  {
    id: "rule-3",
    name: "Safety Documentation Expiry",
    version: "v3",
    category: "Safety",
    description:
      "Creates an early warning when safety documentation approaches expiry",
    triggerCondition: "November 16, 2014",
    conditions: [
      {
        field: "Permit Expiry Date",
        operator: "expires within",
        value: "30",
        unit: "Days",
      },
    ],
    action: "Issue Warning",
    severityLabel: "Medium",
    scope: "State Level",
    status: { label: "Active", tone: "green" },
  },
  {
    id: "rule-4",
    name: "Export License Validation",
    version: "v3",
    category: "Export",
    description:
      "Checks export documentation timelines before any outbound mineral transfer",
    triggerCondition: "Safety document expires in 14 days",
    conditions: [
      {
        field: "Permit Expiry Date",
        operator: "expires within",
        value: "14",
        unit: "Days",
      },
    ],
    action: "Missing or expired export document",
    severityLabel: "Medium",
    scope: "All Jurisdiction",
    status: { label: "Active", tone: "green" },
  },
  {
    id: "rule-5",
    name: "Worker Safety Training",
    version: "v3",
    category: "Safety",
    description:
      "Alerts the reviewer when required safety training records are out of date",
    triggerCondition: "Training records > 12 months old",
    conditions: [
      {
        field: "Worker Safety Training Age",
        operator: ">",
        value: "12",
        unit: "Months",
      },
    ],
    action: "Warning Notification",
    severityLabel: "Low",
    scope: "Pilot Phase",
    status: { label: "Active", tone: "green" },
  },
  {
    id: "rule-6",
    name: "Environmental Permit Verification",
    version: "v3",
    category: "Export",
    description:
      "Escalates expiring environmental permit issues to the compliance officer",
    triggerCondition: "Permit expiry detected",
    conditions: [
      {
        field: "Permit Expiry Date",
        operator: "expires within",
        value: "7",
        unit: "Days",
      },
    ],
    action: "Escalate to Compliance Officer",
    severityLabel: "High",
    scope: "All Jurisdiction",
    status: { label: "Active", tone: "green" },
  },
];

export const COMPLIANCE_THRESHOLD_CARDS: ComplianceThresholdCard[] = [
  {
    id: "reporting-frequency",
    title: "Production Reporting Frequency",
    value: "30",
    unit: "days",
    automatedAction: "Active",
    automatedActionTone: "green",
    summary: "Issue compliance warning",
    updatedBy: "Last updated by Admin O. Bello, Oct 12",
    icon: "frequency",
  },
  {
    id: "high-production-threshold",
    title: "High Production Threshold",
    value: "99",
    unit: "tons",
    automatedAction: "High",
    automatedActionTone: "red",
    summary: "Require Environmental Impact Assessment",
    updatedBy: "Last updated by Admin O. Bello, Oct 12",
    icon: "volume",
  },
];

export const COMPLIANCE_RISK_RULE_CARDS: ComplianceRiskRuleCard[] = [
  {
    id: "missing-license",
    title: "Missing Regulatory License",
    severityLabel: "High Risk",
    severityTone: "red",
    trigger: "Miner submission without valid mining license.",
    action: "Block submission and flag miner.",
    active: true,
  },
  {
    id: "expired-permit",
    title: "Expired Environmental Permit",
    severityLabel: "High Risk",
    severityTone: "red",
    trigger: "Miner submission without valid mining license.",
    action: "Block submission and flag miner.",
    active: true,
  },
  {
    id: "overdue-esg-high",
    title: "Overdue ESG Report",
    severityLabel: "High Risk",
    severityTone: "amber",
    trigger: "Miner submission without valid mining license.",
    action: "Block submission and flag miner.",
    active: true,
  },
  {
    id: "overdue-esg-medium",
    title: "Overdue ESG Report",
    severityLabel: "Medium Risk",
    severityTone: "amber",
    trigger: "ESG report not submitted within deadline.",
    action: "Compliance warning and follow-up required.",
    active: true,
  },
];

export const COMPLIANCE_DOCUMENT_REQUIREMENT_ROWS: ComplianceDocumentRequirementRow[] = [
  {
    id: "mining-license",
    documentType: "Mining License",
    required: "Yes",
    expiryRule: "Annual Renewal",
    status: { label: "Active", tone: "green" },
  },
  {
    id: "environmental-impact-assessment",
    documentType: "Environmental Impact Assessment",
    required: "Yes",
    expiryRule: "Every 3 years",
    status: { label: "Active", tone: "green" },
  },
  {
    id: "safety-compliance-certificate",
    documentType: "Safety Compliance Certificate",
    required: "Optional",
    expiryRule: "2 years",
    status: { label: "Active", tone: "green" },
  },
  {
    id: "export-permit",
    documentType: "Export Permit",
    required: "Yes",
    expiryRule: "Per shipment",
    status: { label: "Active", tone: "green" },
  },
];

export const COMPLIANCE_DATA_CONTROL_CARDS: ComplianceDataControlCard[] = [
  {
    id: "allowed-file-formats",
    title: "Allowed File Formats",
    value: "PDF, JPG, PNG",
  },
  {
    id: "maximum-file-size",
    title: "Maximum File Size",
    value: "20 MB",
  },
];

export type PartnerCategory =
  | "Environmental"
  | "Legal"
  | "ESG Auditors"
  | "Govt Liaison";

export type PartnerAvailability = "Available" | "Near capacity" | "Busy";

export type PartnerDirectoryRow = {
  id: string;
  partnerEntity: string;
  category: PartnerCategory;
  accreditationStatus: string;
  regionsCovered: string;
  availability: PartnerAvailability;
  activeAssignments: number;
};

export const PARTNER_DIRECTORY_ROWS: PartnerDirectoryRow[] = [
  {
    id: "partner-1",
    partnerEntity: "EcoVerify Ltd",
    category: "Environmental",
    accreditationStatus: "NESREA-Certified",
    regionsCovered: "Oyo, Nasarawa",
    availability: "Available",
    activeAssignments: 12,
  },
  {
    id: "partner-2",
    partnerEntity: "LegalLink Partners",
    category: "Legal",
    accreditationStatus: "MCO Licensed",
    regionsCovered: "Federal (All)",
    availability: "Near capacity",
    activeAssignments: 50,
  },
  {
    id: "partner-3",
    partnerEntity: "GeoSurvey Niger",
    category: "ESG Auditors",
    accreditationStatus: "ISO 14001",
    regionsCovered: "Kaduna, Kano",
    availability: "Busy",
    activeAssignments: 121,
  },
  {
    id: "partner-4",
    partnerEntity: "GeoSurvey Niger",
    category: "Environmental",
    accreditationStatus: "Kogi / Okene",
    regionsCovered: "Kaduna, Kano",
    availability: "Available",
    activeAssignments: 17,
  },
  {
    id: "partner-5",
    partnerEntity: "LegalLink Partners",
    category: "ESG Auditors",
    accreditationStatus: "Mining Cadastre",
    regionsCovered: "Oyo, Kwara",
    availability: "Available",
    activeAssignments: 12,
  },
  {
    id: "partner-6",
    partnerEntity: "EcoVerify Ltd",
    category: "Govt Liaison",
    accreditationStatus: "NESREA-Certified",
    regionsCovered: "Kano, Oyo",
    availability: "Near capacity",
    activeAssignments: 61,
  },
  {
    id: "partner-7",
    partnerEntity: "LegalLink Partners",
    category: "Environmental",
    accreditationStatus: "MCO Licensed",
    regionsCovered: "Kaduna, Kano",
    availability: "Busy",
    activeAssignments: 101,
  },
  {
    id: "partner-8",
    partnerEntity: "GeoSurvey Niger",
    category: "ESG Auditors",
    accreditationStatus: "MCO Licensed",
    regionsCovered: "Federal (All)",
    availability: "Near capacity",
    activeAssignments: 47,
  },
  {
    id: "partner-9",
    partnerEntity: "EcoVerify Ltd",
    category: "Govt Liaison",
    accreditationStatus: "NESREA-Certified",
    regionsCovered: "Oyo, Kwara",
    availability: "Available",
    activeAssignments: 18,
  },
];

export type RegulatoryReadinessMetric = {
  id: string;
  title: string;
  percentage: number;
  tone: "blue" | "green" | "amber";
  legendReady: string;
  legendNotReady: string;
};

export const REGULATORY_READINESS_METRICS: RegulatoryReadinessMetric[] = [
  {
    id: "legal",
    title: "Legal Readiness",
    percentage: 75,
    tone: "blue",
    legendReady: "Miners with valid license",
    legendNotReady: "Miners without valid license",
  },
  {
    id: "environmental",
    title: "EIA/Environmental Readiness",
    percentage: 82,
    tone: "green",
    legendReady: "Miners with EIA initiated",
    legendNotReady: "Miners without EIA initiated",
  },
  {
    id: "esg",
    title: "ESG/Social Readiness",
    percentage: 63,
    tone: "amber",
    legendReady: "ESG ready",
    legendNotReady: "Non-ESG ready",
  },
];

export type RegulatoryRiskState = {
  state: string;
  risk: "Low" | "Medium" | "High";
  compliancePartners: number;
  totalMiners: number;
};

export const REGULATORY_RISK_STATES: RegulatoryRiskState[] = [
  { state: "Lagos", risk: "Low", compliancePartners: 62, totalMiners: 54 },
  { state: "Kwara", risk: "Low", compliancePartners: 48, totalMiners: 40 },
  { state: "Kaduna", risk: "Medium", compliancePartners: 39, totalMiners: 61 },
  { state: "Kano", risk: "Medium", compliancePartners: 33, totalMiners: 58 },
  { state: "Borno", risk: "Low", compliancePartners: 55, totalMiners: 48 },
  { state: "Zamfara", risk: "High", compliancePartners: 21, totalMiners: 72 },
  { state: "Nasarawa", risk: "High", compliancePartners: 18, totalMiners: 66 },
  { state: "Kogi", risk: "Medium", compliancePartners: 30, totalMiners: 52 },
];

export const REGULATORY_STATUS_DISTRIBUTION = [
  { id: "ready", label: "Compliance-Ready", percentage: 42, count: 52, tone: "green" as const },
  { id: "conditional", label: "Conditional/Under Review", percentage: 32, count: 43, tone: "amber" as const },
  { id: "blocked", label: "Blocked/Missing Docs", percentage: 23, count: 52, tone: "red" as const },
];
