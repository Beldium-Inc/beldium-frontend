import { normalizePath } from "@/src/utils";


describe("normalizePath", () => {
  it("removes a single trailing slash", () => {
    expect(normalizePath("/users/")).toBe("/users");
  });

  it("removes multiple trailing slashes", () => {
    expect(normalizePath("/users///")).toBe("/users");
  });

  it("does not remove slashes in the middle", () => {
    expect(normalizePath("/users/admin/")).toBe("/users/admin");
  });

  it("returns empty string if path is only a slash", () => {
    expect(normalizePath("/")).toBe("");
  });

  it("returns the same path if no trailing slash", () => {
    expect(normalizePath("/users")).toBe("/users");
  });

  it("works with empty string", () => {
    expect(normalizePath("")).toBe("");
  });
});
