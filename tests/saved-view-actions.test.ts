import { describe, expect, it, vi } from "vitest";
import {
  createSavedViewActions,
  type SavedViewActionRecord,
} from "../src/lib/utils/saved-view-actions";

const row = (id = "v1", name = "Alpha"): SavedViewActionRecord => ({
  id,
  name,
  pageKey: "records.mine",
  query: { state: "open" },
});
function deferred() {
  let resolve!: (result: unknown) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<unknown>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
function fixture() {
  let identity: string | null = "tenant:1/member:7";
  let page = "records.mine";
  let rows = [row()];
  const requests: ReturnType<typeof deferred>[] = [];
  const error = vi.fn();
  const changed = vi.fn((next: SavedViewActionRecord[]) => {
    rows = next;
  });
  const request = vi.fn(() => {
    const pending = deferred();
    requests.push(pending);
    return pending.promise;
  });
  const actions = createSavedViewActions({
    currentKey: () => identity,
    pageKey: () => page,
    currentQuery: () => ({ state: "open" }),
    views: () => rows,
    changed,
    error,
    request,
    isView: (value): value is SavedViewActionRecord =>
      !!value &&
      typeof value === "object" &&
      "id" in value &&
      "pageKey" in value,
    errorMessage: (_error, op) =>
      op === "save" ? "Save refused." : "Remove refused.",
  });
  return {
    actions,
    requests,
    request,
    error,
    changed,
    rows: () => rows,
    identity: (next: string | null) => {
      identity = next;
    },
    page: (next: string) => {
      page = next;
    },
  };
}
describe("captured saved-view response custody", () => {
  it("settles independent authoritative rows, sorted by name, without sending ownership fields", async () => {
    const fx = fixture();
    const first = fx.actions.save("Zulu");
    const second = fx.actions.save("Beta");
    fx.requests[1]!.resolve({ view: row("v3", "Beta") });
    await second;
    fx.requests[0]!.resolve({ view: row("v2", "Zulu") });
    await first;
    expect(fx.rows().map((view) => view.name)).toEqual([
      "Alpha",
      "Beta",
      "Zulu",
    ]);
    expect(fx.request.mock.calls[0]).toEqual([
      "POST",
      { name: "Zulu", query: { state: "open" } },
    ]);
  });
  it("refuses stale identity, page or unmounted responses without publishing an error", async () => {
    for (const change of ["identity", "page", "unmount"] as const) {
      const fx = fixture();
      const saving = fx.actions.save("Alpha");
      if (change === "page") fx.page("records.all");
      else fx.identity(change === "unmount" ? null : "tenant:2/member:7");
      fx.requests[0]!.resolve({ view: row() });
      expect(await saving).toBe(false);
      expect(fx.changed).not.toHaveBeenCalled();
      expect(fx.error).toHaveBeenCalledTimes(1);
    }
  });
  it("does not resurrect a row after a newer delete settles", async () => {
    const fx = fixture();
    const saving = fx.actions.save("Renamed");
    const removing = fx.actions.remove(row());
    fx.requests[1]!.resolve({ removed: true });
    expect(await removing).toBe(true);
    fx.requests[0]!.resolve({ view: row("v1", "Renamed") });
    expect(await saving).toBe(false);
    expect(fx.rows()).toEqual([]);
  });
  it("does not apply an older delete over a newer save", async () => {
    const fx = fixture();
    const removing = fx.actions.remove(row());
    const saving = fx.actions.save("Renamed");
    fx.requests[1]!.resolve({ view: row("v1", "Renamed") });
    await saving;
    fx.requests[0]!.resolve({ removed: true });
    expect(await removing).toBe(false);
    expect(fx.rows()[0]?.name).toBe("Renamed");
  });
  it("refuses foreign pages and malformed acknowledgements, retaining current rows", async () => {
    const fx = fixture();
    const saving = fx.actions.save("Alpha");
    fx.requests[0]!.resolve({ view: { ...row(), pageKey: "records.foreign" } });
    expect(await saving).toBe(false);
    expect(fx.error).toHaveBeenLastCalledWith("Save refused.");
    const removing = fx.actions.remove(row());
    fx.requests[1]!.resolve({ removed: false });
    expect(await removing).toBe(false);
    expect(fx.rows()).toHaveLength(1);
  });
  it("does not let an older failure replace feedback from a successor action", async () => {
    const fx = fixture();
    const old = fx.actions.save("Old");
    const recent = fx.actions.save("Recent");
    fx.requests[1]!.resolve({ view: row("v1", "Recent") });
    await recent;
    fx.requests[0]!.reject(new Error("Refused"));
    expect(await old).toBe(false);
    expect(fx.error).toHaveBeenLastCalledWith(null);
    expect(fx.error).toHaveBeenCalledTimes(2);
  });
  it("fences an observed identity switch away and back, and sends nothing while unmounted", async () => {
    const fx = fixture();
    const original = fx.actions.save("Old");
    fx.identity("tenant:2/member:7");
    const other = fx.actions.save("Other");
    fx.identity("tenant:1/member:7");
    const newest = fx.actions.save("New");
    fx.requests[0]!.resolve({ view: row() });
    expect(await original).toBe(false);
    fx.requests[1]!.resolve({ view: row() });
    expect(await other).toBe(false);
    fx.requests[2]!.resolve({ view: row("v1", "New") });
    expect(await newest).toBe(true);
    fx.identity(null);
    expect(await fx.actions.save("No")).toBe(false);
    expect(fx.request).toHaveBeenCalledTimes(3);
  });
});
