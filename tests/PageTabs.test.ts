import { cleanup, render, screen } from "@testing-library/svelte";
import { afterEach, describe, expect, it } from "vitest";
import PageTabsBelowHarness from "./fixtures/PageTabsBelowHarness.svelte";
import PageTabsStatusSwapHarness from "./fixtures/PageTabsStatusSwapHarness.svelte";

afterEach(() => cleanup());

describe("PageTabs `below` slot (additive merge)", () => {
  it("renders existing usage unchanged when no below slot is given", () => {
    const { container } = render(PageTabsBelowHarness, {
      props: { withBelow: false },
    });

    const shell = container.querySelector(".context-surface.page-tabs-shell");
    expect(shell).not.toBeNull();
    expect(screen.getByTestId("tab-body").textContent).toBe("first tab body");
    expect(screen.queryByTestId("below-content")).toBeNull();
    // The shell contains exactly the Tabs output (tab strip + content pane)
    // — an empty below slot adds no stray elements.
    expect(shell?.childElementCount).toBe(2);
  });

  it("renders persistent below content inside the same panel chrome, after the tabs", () => {
    const { container } = render(PageTabsBelowHarness, {
      props: { withBelow: true },
    });

    const shell = container.querySelector(".context-surface.page-tabs-shell")!;
    const below = screen.getByTestId("below-content");
    expect(shell.contains(below)).toBe(true);
    expect(below.textContent).toBe("persistent console");
    // Below content sits after the tab strip/content, as the panel's last region.
    expect(
      shell.lastElementChild?.contains(below) ||
        shell.lastElementChild === below,
    ).toBe(true);
    // The tab machinery is unaffected.
    expect(screen.getByTestId("tab-body").textContent).toBe("first tab body");
  });
});

import PageTabsStatusHarness from "./fixtures/PageTabsStatusHarness.svelte";
import postcss from "postcss";
import tokens from "../src/lib/styles/tokens.css?raw";

describe("PageTabs draws the page's status at the end of its tab strip", () => {
  it("draws the status its host states once, after the first strip, never inside it", () => {
    const { container } = render(PageTabsStatusHarness, {
      props: { nested: true },
    });
    const statuses = container.querySelectorAll("[data-page-status]");
    expect(statuses).toHaveLength(1);
    const status = statuses[0] as HTMLElement;
    expect(status.textContent?.trim()).toBe("Active");
    // After the page's own tab strip, as its sibling: the strip scrolls
    // beside it and no tab passes under it.
    const shell = status.parentElement!;
    expect(shell.classList.contains("gawdux-page-tabs")).toBe(true);
    expect(shell.classList.contains("page-tabs-has-status")).toBe(true);
    const strip = shell.querySelector(":scope > .page-tabs-list")!;
    expect(strip.contains(status)).toBe(false);
    expect(
      strip.compareDocumentPosition(status) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(strip.querySelectorAll('[role="tab"]').length).toBeGreaterThan(0);
    // The strip fades where more of its tabs lie.
    expect(strip.classList.contains("gawdux-scroll-fade")).toBe(true);
  });

  it("draws the next page's status once the previous page's tabs are gone, though they mounted first", async () => {
    const { container, rerender } = render(PageTabsStatusSwapHarness);
    expect(container.querySelector("[data-page-status]")).toBeNull();
    // The next page's tabs mount while the previous page's still hold the
    // status; the previous page states none, so nothing is drawn yet.
    await rerender({ previous: true, next: true, status: "Draft" });
    expect(container.querySelectorAll("[data-page-status]")).toHaveLength(1);
    expect(
      container
        .querySelector('[data-page="previous"] [data-page-status]')
        ?.textContent?.trim(),
    ).toBe("Draft");
    // The previous page goes: the next page's strip draws the status.
    await rerender({ previous: false, next: true, status: "Draft" });
    const statuses = container.querySelectorAll("[data-page-status]");
    expect(statuses).toHaveLength(1);
    expect(
      container
        .querySelector('[data-page="next"] [data-page-status]')
        ?.textContent?.trim(),
    ).toBe("Draft");
  });

  it("draws nothing for a page without a status, or without a host", () => {
    const { container } = render(PageTabsStatusHarness, {
      props: { status: null },
    });
    expect(container.querySelector("[data-page-status]")).toBeNull();
    cleanup();
    const plain = render(PageTabsBelowHarness, { props: { withBelow: false } });
    expect(plain.container.querySelector("[data-page-status]")).toBeNull();
  });

  it("ends the strip where the status begins, the status as tall as the strip", () => {
    const root = postcss.parse(tokens);
    const decls = (selector: string) => {
      const found: Record<string, string> = {};
      root.walkRules((rule) => {
        if (rule.parent?.type !== "root") return;
        if (!rule.selectors.map((s) => s.trim()).includes(selector)) return;
        rule.walkDecls((decl) => {
          found[decl.prop] = decl.value;
        });
      });
      return found;
    };
    expect(decls(".gawdux-page-tabs")).toMatchObject({ position: "relative" });
    expect(
      decls(".gawdux-page-tabs.page-tabs-has-status > .page-tabs-list"),
    ).toMatchObject({
      width: "calc(100% - var(--gawdux-page-tabs-status-width, 0px))",
    });
    expect(decls(".gawdux-page-tabs > .page-tabs-status")).toMatchObject({
      position: "absolute",
      right: "0",
      height: "var(--gawdux-page-tabs-strip-height, auto)",
    });
  });
});

describe("a tab strip is one row", () => {
  const root = postcss.parse(tokens);
  const decls = (selector: string) => {
    const found: Record<string, string> = {};
    root.walkRules((rule) => {
      if (rule.parent?.type !== "root") return;
      if (!rule.selectors.map((s) => s.trim()).includes(selector)) return;
      rule.walkDecls((decl) => {
        found[decl.prop] = decl.value;
      });
    });
    return found;
  };

  it("carries the one strip rule on PageTabs' strip", () => {
    const { container } = render(PageTabsBelowHarness, {
      props: { withBelow: false },
    });
    const strip = container.querySelector(".page-tabs-list") as HTMLElement;
    expect(strip.classList.contains("gawdux-tab-strip")).toBe(true);
  });

  it("scrolls sideways within itself at every width, never wrapping a tab onto a second row", () => {
    expect(decls(".gawdux-tab-strip")).toMatchObject({
      "flex-wrap": "nowrap",
      "overflow-x": "auto",
      "overflow-y": "hidden",
      "max-width": "100%",
      "min-width": "0",
    });
    expect(decls(".gawdux-tab-strip > *")).toMatchObject({ flex: "0 0 auto" });
    expect(
      decls(".gawdux-tab-strip :is([role='tab'], button, a)"),
    ).toMatchObject({ "white-space": "nowrap" });
  });

  it("rests PageTabs' strip with its first tab whole, its padding where a tab snaps", () => {
    expect(decls(".gawdux-tab-strip.tabs-stick")).toMatchObject({
      "scroll-padding-inline": "0.5rem",
    });
  });
});
