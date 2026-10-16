import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/svelte";
import { tick } from "svelte";
import { afterEach, describe, expect, it, vi } from "vitest";
import DiscardNavigationCommandSurface from "../src/lib/primitives/DiscardNavigationCommandSurface.svelte";
import CustomDiscardPresentation from "./fixtures/CustomDiscardPresentation.svelte";

afterEach(cleanup);

describe("custom discard presentation", () => {
  it("shares single-flight continuation, completion and destination focus", async () => {
    let resolve!: () => void;
    const gate = new Promise<void>((done) => {
      resolve = done;
    });
    const destination = document.createElement("button");
    document.body.append(destination);
    const continuation = vi.fn(() => gate);
    const request = {
      message: "Leave this draft?",
      confirmLabel: "Discard and continue",
      continue: continuation,
      focusAfter: () => destination,
    };
    const oncomplete = vi.fn();
    render(DiscardNavigationCommandSurface, {
      props: {
        request,
        presentation: CustomDiscardPresentation,
        oncancel: vi.fn(),
        oncomplete,
      },
    });
    const confirm = screen.getByRole("button", {
      name: "Discard and continue",
    });
    await fireEvent.click(confirm);
    await fireEvent.click(confirm);
    expect(continuation).toHaveBeenCalledTimes(1);
    expect(confirm.hasAttribute("disabled")).toBe(true);
    expect(oncomplete).not.toHaveBeenCalled();
    resolve();
    await waitFor(() => expect(oncomplete).toHaveBeenCalledWith(request));
    expect(document.activeElement).toBe(destination);
    destination.remove();
  });

  it("cancels once via presenter Escape and restores the original focus", async () => {
    const trigger = document.createElement("button");
    document.body.append(trigger);
    trigger.focus();
    const request = {
      message: "Leave this draft?",
      confirmLabel: "Discard and continue",
      continue: vi.fn(),
    };
    const oncancel = vi.fn();
    render(DiscardNavigationCommandSurface, {
      props: {
        request,
        presentation: CustomDiscardPresentation,
        oncancel,
        oncomplete: vi.fn(),
      },
    });
    await tick();
    await tick();
    await fireEvent.keyDown(window, { key: "Escape" });
    await tick();
    expect(oncancel).toHaveBeenCalledExactlyOnceWith(request);
    expect(document.activeElement).toBe(trigger);
    trigger.remove();
  });

  it("retains a failed automatic continuation and allows one explicit retry", async () => {
    const continuation = vi.fn(() =>
      Promise.reject(new Error("private failure")),
    );
    const request = {
      id: 42,
      message: "Continue after saving?",
      confirmLabel: "Continue",
      continue: continuation,
      autoContinue: true,
    };
    render(DiscardNavigationCommandSurface, {
      props: {
        request,
        presentation: CustomDiscardPresentation,
        oncancel: vi.fn(),
        oncomplete: vi.fn(),
      },
    });
    await waitFor(() => expect(continuation).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toContain(
        "Could not continue",
      ),
    );
    expect(document.body.textContent).not.toContain("private failure");
    await tick();
    await tick();
    expect(continuation).toHaveBeenCalledTimes(1);
    await fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    await waitFor(() => expect(continuation).toHaveBeenCalledTimes(2));
  });
});
