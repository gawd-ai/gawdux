import { cleanup, fireEvent, render, screen } from "@testing-library/svelte";
import { tick } from "svelte";
import { afterEach, describe, expect, it } from "vitest";
import CustomUserMenuHarness from "./fixtures/CustomUserMenuHarness.svelte";

afterEach(cleanup);

describe("custom account menu presentation", () => {
  it("preserves host markup while using shared arrows, Home, End and Escape focus behavior", async () => {
    const { container } = render(CustomUserMenuHarness);
    const trigger = screen.getByRole("button", {
      name: "Account menu for Ada Lovelace",
    });
    const profile = screen.getByRole("menuitem", {
      name: "Profile",
      hidden: true,
    });
    const signout = screen.getByRole("menuitem", {
      name: "Sign out",
      hidden: true,
    });
    expect(container.querySelector(".gawdux-user-menu")).toBeNull();
    await fireEvent.keyDown(trigger, { key: "ArrowDown" });
    await tick();
    expect(document.activeElement).toBe(profile);
    await fireEvent.keyDown(profile, { key: "End" });
    expect(document.activeElement).toBe(signout);
    await fireEvent.keyDown(signout, { key: "ArrowDown" });
    expect(document.activeElement).toBe(profile);
    await fireEvent.keyDown(profile, { key: "Escape" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(trigger);
  });

  it("shares pointer toggle, outside close and history close without changing signout semantics", async () => {
    const { container } = render(CustomUserMenuHarness);
    const trigger = screen.getByRole("button", {
      name: "Account menu for Ada Lovelace",
    });
    await fireEvent.click(trigger, { detail: 1 });
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    await fireEvent.pointerDown(screen.getByTestId("outside"));
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    await fireEvent.click(trigger, { detail: 1 });
    await fireEvent.popState(window);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(container.querySelector("form")?.getAttribute("method")).toBe(
      "POST",
    );
    expect(container.querySelector("form")?.getAttribute("action")).toBe(
      "/signout",
    );
  });
});
