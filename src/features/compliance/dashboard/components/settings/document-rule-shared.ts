

export type DocumentRuleDraft = {
  documentName: string;
  description: string;
  applicableMinerals: string;
  applicableJurisdiction: string;
  allowedFileFormats: string;
  maximumFileSize: string;
  mandatoryMetadata: {
    issueDate: boolean;
    issuingAuthority: boolean;
    expiryDate: boolean;
    documentNumber: boolean;
  };
  expiryType: string;
  validityPeriodYears: string;
  expiryActions: {
    sendRenewalReminder: boolean;
    flagMiner: boolean;
    blockNewSubmissions: boolean;
  };
};

export type DocumentRuleValidationField = "documentName";

export const DOCUMENT_RULE_JURISDICTION_OPTIONS = [
  "Federal",
  "State",
  "All Jurisdiction",
] as const;

export const DOCUMENT_RULE_EXPIRY_TYPE_OPTIONS = [
  "Fixed validity period",
  "Per shipment",
  "No expiry",
  "Custom review cycle",
] as const;

export const INITIAL_DOCUMENT_RULE_DRAFT: DocumentRuleDraft = {
  documentName: "Mining License",
  description: "Official license authorizing mineral extraction activities",
  applicableMinerals: "Lithium",
  applicableJurisdiction: "Federal",
  allowedFileFormats: "PDF, JPG, PNG",
  maximumFileSize: "20 MB",
  mandatoryMetadata: {
    issueDate: true,
    issuingAuthority: true,
    expiryDate: true,
    documentNumber: false,
  },
  expiryType: "Fixed validity period",
  validityPeriodYears: "1",
  expiryActions: {
    sendRenewalReminder: true,
    flagMiner: true,
    blockNewSubmissions: false,
  },
};

