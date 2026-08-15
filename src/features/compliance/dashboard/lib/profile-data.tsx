import { SafetyOutlined, LoginOutlined, LockOutlined } from "@ant-design/icons";

export function buildComplianceSecuritySettings(twoFactorEnabled: boolean) {
  return [
    {
      title: "Two-Factor Authentication",
      description: "Add an extra layer of security to your account",
      icon: <SafetyOutlined />,
      tone: "blue" as const,
      statusLabel: twoFactorEnabled ? "Enabled" : "Disabled",
    },
    {
      title: "Last Login",
      description: "Not tracked yet",
      icon: <LoginOutlined />,
      tone: "neutral" as const,
    },
    {
      title: "Password",
      description: "Keep your password up to date",
      icon: <LockOutlined />,
      tone: "neutral" as const,
      actionLabel: "Change",
    },
  ];
}

export const compliancePermissions = [
  { label: "View miner submissions", granted: true },
  { label: "Review compliance documents", granted: true },
  { label: "Flag non-compliant miners", granted: true },
  { label: "Manage team members", granted: false },
  { label: "Modify verification rules", granted: false },
];

export const complianceInstitutionProfile = {
  title: "Compliance Profile",
  subtitle: "Institutional regulatory identity and compliance authority overview",
  roleLabel: "Compliance Officer",
  actingLabel: "You are acting under this institution",
  institutionName: "Nigerian Mineral Compliance Authority",
  jurisdiction: "Federal Nigeria",
  mineralsCovered: ["Lithium"],
  complianceDomains: ["Environmental", "Safety", "ESG", "Mining"],
  renewalNotice: {
    title: "License Renewal Due",
    description:
      "Your institutional license expires in 45 days. Initiate renewal process.",
    actionLabel: "Take action",
  },
  overviewCards: [
    {
      title: "Total miners",
      value: "247",
      footnote: "Registered",
      footnoteClassName: "text-[#7a8291]",
    },
    {
      title: "Under review",
      value: "42",
      footnote: "In Progress",
      footnoteClassName: "text-[#ea9b2e]",
    },
    {
      title: "Compliance ready",
      value: "198",
      footnote: "Verified",
      footnoteClassName: "text-[#1ea43b]",
    },
    {
      title: "Action required",
      value: "7",
      footnote: "Urgent",
      footnoteClassName: "text-[#ef2f32]",
    },
  ],
  teamMembers: [
    { name: "Ayo Bakare", role: "Super Admin", status: "Active" },
    { name: "Nkechi Okoro", role: "Compliance Officer", status: "Active" },
    { name: "Chidi Anyaegbu", role: "Reviewer", status: "Active" },
    { name: "Ibrahim Musa", role: "Admin", status: "Active" },
  ],
  verificationItems: [
    { label: "Verification Status", value: "Active", tone: "green" as const },
    { label: "Last Verified", value: "March 15, 2026" },
    { label: "Next Review", value: "April 30, 2026" },
    { label: "Audit Status", value: "Up to date", tone: "green" as const },
  ],
};

