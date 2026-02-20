import { FIAT_CURRENCIES } from "@/src/constants";
import { DateValuePiece } from "@/src/types";
import dayjs from "dayjs";

export function formatCurrency(
  amount: number,
  currency: string = "USD",
  locale: string = "en-US",
  decimals: number = 2
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

export const formatDate = (date: DateValuePiece): string => {
  if (!date) return "Invalid Date"; // handle null/undefined
  return dayjs(date).isValid() ? dayjs(date).format("DD MMM, YYYY") : "Invalid Date";
};

export function getTimeGreeting(date: Date = new Date()): string {
  const hour = date.getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 18) {
    return "Good afternoon";
  }

  return "Good evening";
}

export const normalizePath = (path: string) =>
  path.replace(/\/+$/, "");

export function formatCurrencyAmount(value: string | number) {
  if (!value) return "";
  const number = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(number)) return "";

  return number.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// utils/passwordRules.ts
export const passwordRules = {
  minLength: 8,
  regex: {
    upper: /[A-Z]/,
    lower: /[a-z]/,
    number: /[0-9]/,
    special: /[^A-Za-z0-9]/,
  },
};


export function getInitials(fullName: string): string {
  if (!fullName) return "";

  return fullName
    .trim()
    .split(/\s+/)
    .map(name => name[0])
    .join("")
    .toUpperCase();
}

