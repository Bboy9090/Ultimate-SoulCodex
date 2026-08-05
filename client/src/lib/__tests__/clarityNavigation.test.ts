import { describe, expect, it } from "vitest";
import {
  getPrimaryCodexDestination,
  getProfileKind,
  getProfilePath,
  getReadingPath,
} from "../clarityNavigation";

describe("clarity navigation", () => {
  it("routes server and local profiles through the same public contracts", () => {
    expect(getProfileKind("42")).toBe("server");
    expect(getProfileKind("local-abc")).toBe("local");
    expect(getReadingPath("42")).toBe("/reading/42");
    expect(getReadingPath("local-abc")).toBe("/reading/local-abc");
    expect(getProfilePath("local-abc")).toBe("/profile/local-abc");
  });

  it("encodes hostile or malformed path content instead of concatenating it raw", () => {
    expect(getReadingPath("person/name?tab=1")).toBe(
      "/reading/person%2Fname%3Ftab%3D1",
    );
  });

  it("falls back safely when no profile exists", () => {
    expect(getProfileKind(undefined)).toBeNull();
    expect(getReadingPath(undefined)).toBe("/create");
    expect(getProfilePath(undefined)).toBe("/");
    expect(getPrimaryCodexDestination(undefined)).toEqual({
      href: "/create",
      label: "Create your Soul Codex",
      kind: null,
    });
  });
});
