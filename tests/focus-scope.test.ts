import { afterEach, describe, expect, it, vi } from "vitest";
import { activateFocusScope } from "../src/lib/utils/focus-scope";

const cleanups: Array<() => void> = [];
afterEach(() => {
  for (const cleanup of cleanups.splice(0).reverse()) cleanup();
  document.body.innerHTML = "";
  document.body.removeAttribute("style");
});

function fixture() {
  document.body.innerHTML =
    '<button id="prior">Prior</button><main id="background">Work</main><main id="already-inert">Blocked</main><section id="panel"><button id="first">Close</button><button id="disabled" disabled>Disabled</button><button id="last">Last</button><a href="/record" id="record">Record</a></section>';
  const root = document.getElementById("panel")!;
  const first = document.getElementById("first")!;
  const prior = document.getElementById("prior")!;
  const background = document.getElementById("background")!;
  const alreadyInert = document.getElementById("already-inert")!;
  alreadyInert.inert = true;
  prior.focus();
  const onEscape = vi.fn();
  const onLink = vi.fn();
  const ports = {
    document,
    eventTarget: window,
    root: () => root,
    background: () => [background, alreadyInert],
    initialFocus: () => first,
    onEscape,
    onLink,
    isVisible: () => true,
  };
  return {
    root,
    first,
    prior,
    background,
    alreadyInert,
    onEscape,
    onLink,
    ports,
  };
}

describe("explicit focus scope", () => {
  it("contains Tab, handles scoped links/Escape and restores previous resources and focus", () => {
    const f = fixture();
    document.body.style.setProperty("overflow", "scroll", "important");
    const close = activateFocusScope(f.ports);
    cleanups.push(close);
    expect(document.activeElement).toBe(f.first);
    expect(f.background.inert).toBe(true);
    expect(document.body.style.overflow).toBe("hidden");
    const link = document.getElementById("record")!;
    link.focus();
    const forward = new KeyboardEvent("keydown", {
      key: "Tab",
      cancelable: true,
    });
    window.dispatchEvent(forward);
    expect(forward.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(f.first);
    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Tab",
        shiftKey: true,
        cancelable: true,
      }),
    );
    expect(document.activeElement).toBe(link);
    link.addEventListener("click", (event) => event.preventDefault());
    link.dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true }),
    );
    expect(f.onLink).toHaveBeenCalledExactlyOnceWith(link);
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(f.onEscape).toHaveBeenCalledTimes(1);
    close();
    close();
    expect(f.background.inert).toBe(false);
    expect(f.alreadyInert.inert).toBe(true);
    expect(document.body.style.getPropertyValue("overflow")).toBe("scroll");
    expect(document.body.style.getPropertyPriority("overflow")).toBe(
      "important",
    );
    expect(document.activeElement).toBe(f.prior);
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(f.onEscape).toHaveBeenCalledTimes(1);
  });

  it("keeps nested resources locked during out-of-order teardown and only handles the top scope", () => {
    const f = fixture();
    const closeOuter = activateFocusScope(f.ports);
    cleanups.push(closeOuter);
    const inner = document.createElement("section");
    const button = document.createElement("button");
    button.textContent = "Inner";
    inner.append(button);
    document.body.append(inner);
    const onEscape = vi.fn();
    const closeInner = activateFocusScope({
      ...f.ports,
      root: () => inner,
      background: () => [f.background],
      initialFocus: () => button,
      onEscape,
    });
    cleanups.push(closeInner);
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(onEscape).toHaveBeenCalledTimes(1);
    expect(f.onEscape).not.toHaveBeenCalled();
    closeOuter();
    expect(f.background.inert).toBe(true);
    expect(document.body.style.overflow).toBe("hidden");
    expect(document.activeElement).toBe(button);
    closeInner();
    expect(f.background.inert).toBe(false);
    expect(document.body.style.overflow).toBe("");
  });

  it("keeps focus in an empty scope without leaving an invented tabindex behind", () => {
    const f = fixture();
    f.root.replaceChildren();
    const close = activateFocusScope({ ...f.ports, initialFocus: () => null });
    cleanups.push(close);
    expect(document.activeElement).toBe(f.root);
    const key = new KeyboardEvent("keydown", { key: "Tab", cancelable: true });
    window.dispatchEvent(key);
    expect(key.defaultPrevented).toBe(true);
    close();
    expect(f.root.hasAttribute("tabindex")).toBe(false);
    expect(document.activeElement).toBe(f.prior);
  });

  it("does not mutate anything when no scope root is mounted", () => {
    const f = fixture();
    const close = activateFocusScope({ ...f.ports, root: () => null });
    expect(Boolean(f.background.inert)).toBe(false);
    expect(document.body.style.overflow).toBe("");
    expect(document.activeElement).toBe(f.prior);
    close();
  });
});
