import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ProfileClarityLauncher from "../ProfileClarityLauncher";

describe("ProfileClarityLauncher", () => {
  it("links a server profile to its clarity reading", () => {
    render(
      <ProfileClarityLauncher profileId="42">
        <div>Profile content</div>
      </ProfileClarityLauncher>,
    );

    expect(screen.getByText("Profile content")).toBeTruthy();
    expect(screen.getByTestId("profile-clarity-reading-link").getAttribute("href")).toBe(
      "/reading/42",
    );
  });

  it("preserves local profile ids for offline reading dispatch", () => {
    render(
      <ProfileClarityLauncher profileId="local-abc">
        <div>Local profile</div>
      </ProfileClarityLauncher>,
    );

    expect(screen.getByTestId("profile-clarity-reading-link").getAttribute("href")).toBe(
      "/reading/local-abc",
    );
  });

  it("does not render a broken action without a profile id", () => {
    render(
      <ProfileClarityLauncher>
        <div>Profile content</div>
      </ProfileClarityLauncher>,
    );

    expect(screen.queryByTestId("profile-clarity-reading-link")).toBeNull();
  });
});
