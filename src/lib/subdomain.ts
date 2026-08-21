// Hosts that should only ever show the compliance app. Kept as a plain
// array (no node-only APIs) so it can be imported from both middleware.ts
// (edge runtime) and client components.
export const COMPLIANCE_HOSTS = [
  "compliance.beldium.com",
  "stg-compliance.beldium.com",
  "compliance.localhost",
];

// Hosts whose root ("/") should land on the public marketplace instead of
// the default app root. Marketplace has no role gate (it's public), so
// unlike compliance this only affects the root rewrite, not login.
export const MARKETPLACE_HOSTS = [
  "marketplace.beldium.com",
  "stg-marketplace.beldium.com",
  "marketplace.localhost",
];

export function isComplianceHost(host: string): boolean {
  return COMPLIANCE_HOSTS.includes(host.split(":")[0]);
}

export function isMarketplaceHost(host: string): boolean {
  return MARKETPLACE_HOSTS.includes(host.split(":")[0]);
}

export const COMPLIANCE_APP_URL = "https://compliance.beldium.com";
export const MAIN_APP_URL = "https://app.beldium.com";
export const MARKETPLACE_APP_URL = "https://marketplace.beldium.com";
