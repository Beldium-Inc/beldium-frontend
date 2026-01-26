import { getInitials } from "@/utils";


describe("getInitials", () => {
  it("returns initials for a two-word name", () => {
    expect(getInitials("John Doe")).toBe("JD");
  });

  it("returns initials for a multi-word name", () => {
    expect(getInitials("Mary Ann Smith")).toBe("MAS");
  });

  it("handles extra spaces in the name", () => {
    expect(getInitials("  Alice   Bob  ")).toBe("AB");
  });

  it("returns uppercase initials", () => {
    expect(getInitials("mary ann")).toBe("MA");
  });

  it("handles single word names", () => {
    expect(getInitials("Cher")).toBe("C");
  });

  it("returns empty string for empty input", () => {
    expect(getInitials("")).toBe("");
  });

  it("returns empty string for null or undefined input", () => {
    expect(getInitials(null as any)).toBe("");
    expect(getInitials(undefined as any)).toBe("");
  });
});
