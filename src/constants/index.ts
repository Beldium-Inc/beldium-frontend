export * from "./routes";

export const FIAT_CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "CNY",
  "CAD",
  "AUD",
  "NZD",
  "CHF",
  "SEK",
  "NOK",
  "DKK",
  "ZAR",
  "NGN",
  "KES",
  "GHS",
  "INR",
  "BRL",
  "MXN",
  "AED",
  "SAR",
  "EGP",
];

export const COUNTRIES = [
  { code: "NG", iso3: "NGN", name: "Nigeria", dialCode: "+234", currency: "₦" },
  { code: "CA", iso3: "CAN", name: "Canada", dialCode: "+1", currency: "$" },
  { code: "GB", iso3: "GBR", name: "United Kingdom", dialCode: "+44", currency: "£" },
];



export const FLAG_CDN = "https://flagcdn.com/w20/ng.png"
