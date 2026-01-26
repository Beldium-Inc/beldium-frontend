import { formatCurrency } from "@/utils";

describe("formatCurrency", () => {
  it("formats a number as USD by default", () => {
    const result = formatCurrency(1234.5);
    expect(result).toBe("$1,234.50");
  });

  it("formats a number with a different currency", () => {
    const result = formatCurrency(1234.5, "EUR");
    expect(result).toBe("€1,234.50");
  });

  it("formats a number with a different locale", () => {
    const result = formatCurrency(1234.5, "EUR", "de-DE");
    expect(result).toBe("1.234,50 €"); // German format uses comma for decimals
  });

  it("formats a number with custom decimal places", () => {
    const result = formatCurrency(1234.5678, "USD", "en-US", 3);
    expect(result).toBe("$1,234.568"); // 3 decimal places
  });

  it("formats negative numbers correctly", () => {
    const result = formatCurrency(-1000);
    expect(result).toBe("-$1,000.00");
  });

  it("formats zero correctly", () => {
    const result = formatCurrency(0);
    expect(result).toBe("$0.00");
  });
});


describe("formatCurrencyAmount", () => {
  it("formats a number correctly", () => {
    expect(formatCurrencyAmount(1234.5)).toBe("1,234.50");
  });

  it("formats a string number correctly", () => {
    expect(formatCurrencyAmount("5678.9")).toBe("5,678.90");
  });

  it("returns empty string for null or undefined", () => {
    expect(formatCurrencyAmount(null as any)).toBe("");
    expect(formatCurrencyAmount(undefined as any)).toBe("");
  });

  it("returns empty string for empty string input", () => {
    expect(formatCurrencyAmount("")).toBe("");
  });

  it("returns empty string for non-numeric string", () => {
    expect(formatCurrencyAmount("abc")).toBe("");
  });

  it("formats numbers with more than 2 decimals correctly", () => {
    expect(formatCurrencyAmount(1234.5678)).toBe("1,234.57"); // rounds
  });

  it("formats integer numbers correctly", () => {
    expect(formatCurrencyAmount(1000)).toBe("1,000.00");
  });

  it("formats negative numbers correctly", () => {
    expect(formatCurrencyAmount(-1234.5)).toBe("-1,234.50");
  });
});
