import { afterEach, describe, expect, it, vi } from "vitest";
import { createDisclosureController } from "../src/lib/utils/disclosure";

afterEach(() => {
  document.body.innerHTML = "";
});

function fixture() {
  document.body.innerHTML =
    '<div id="menu"><button id="trigger">Open</button><a href="/record">Record</a></div><button id="outside">Outside</button>';
  const root = document.getElementById("menu")!;
  const trigger = document.getElementById("trigger")!;
  let open = false;
  const setOpen = vi.fn((next: boolean) => {
    open = next;
  });
  const controller = createDisclosureController({
    isOpen: () => open,
    setOpen,
    root: () => root,
    trigger: () => trigger,
  });
  const cleanup = controller.bind(window);
  return { root, trigger, controller, cleanup, setOpen, isOpen: () => open };
}

describe("explicit disclosure lifecycle", () => {
  it("uses caller-owned state and ignores inside interactions", () => {
    const f = fixture();
    f.controller.toggle();
    expect(f.isOpen()).toBe(true);
    const link = f.root.querySelector("a")!;
    link.addEventListener("click", (event) => event.preventDefault());
    link.dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true }),
    );
    expect(f.isOpen()).toBe(true);
    f.controller.toggle();
    expect(f.isOpen()).toBe(false);
    f.cleanup();
  });

  it("closes outside without stealing focus and restores trigger focus on Escape", () => {
    const f = fixture();
    f.controller.toggle();
    const outside = document.getElementById("outside")!;
    outside.focus();
    outside.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(f.isOpen()).toBe(false);
    expect(document.activeElement).toBe(outside);
    f.controller.toggle();
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(f.isOpen()).toBe(false);
    expect(document.activeElement).toBe(f.trigger);
    f.cleanup();
  });

  it("does not consume composing or previously handled Escape and removes listeners once", () => {
    const f = fixture();
    f.controller.toggle();
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", isComposing: true }),
    );
    const handled = new KeyboardEvent("keydown", {
      key: "Escape",
      cancelable: true,
    });
    handled.preventDefault();
    window.dispatchEvent(handled);
    expect(f.isOpen()).toBe(true);
    f.cleanup();
    f.cleanup();
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(f.isOpen()).toBe(true);
    expect(f.setOpen).toHaveBeenCalledTimes(1);
  });
});
