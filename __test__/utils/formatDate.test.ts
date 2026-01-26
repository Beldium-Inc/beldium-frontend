
import { formatDate } from "@/utils";
import dayjs from "dayjs";

describe("formatDate", () => {
  it("formats a Date object correctly", () => {
    const date = new Date(2026, 0, 5); // Jan 5, 2026
    const result = formatDate(date);
    expect(result).toBe("05 Jan, 2026");
  });

  it("formats a date string correctly", () => {
    const date = "2026-12-25"; // Dec 25, 2026
    const result = formatDate(date);
    expect(result).toBe("25 Dec, 2026");
  });

  it("formats today correctly", () => {
    const today = new Date();
    const expected = dayjs(today).format("DD MMM, YYYY");
    expect(formatDate(today)).toBe(expected);
  });

  it("handles null or undefined gracefully", () => {
    expect(formatDate(null as any)).toBe("Invalid Date");
    expect(formatDate(undefined as any)).toBe("Invalid Date");
  });
});
