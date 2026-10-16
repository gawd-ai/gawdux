import type { SavedViewSummary } from "../primitives/saved-views";

export interface SavedViewActionRecord extends SavedViewSummary {
  pageKey: string;
}
export interface SavedViewActionPorts<View extends SavedViewActionRecord> {
  currentKey: () => string | null;
  pageKey: () => string;
  currentQuery: () => Record<string, string>;
  views: () => readonly View[];
  changed: (views: View[]) => void;
  error: (message: string | null) => void;
  request: (
    method: "POST" | "DELETE",
    body: Record<string, unknown>,
  ) => Promise<unknown>;
  isView: (value: unknown) => value is View;
  errorMessage: (error: unknown, operation: "save" | "remove") => string;
}

/**
 * Settle authoritative preference responses without letting an old identity,
 * page or same-row write overwrite its successor. Transport and policy stay
 * in the host; distinct rows may settle independently.
 */
export function createSavedViewActions<View extends SavedViewActionRecord>(
  ports: SavedViewActionPorts<View>,
) {
  let sequence = 0;
  const settledRows = new Map<string, number>();
  let settlementIdentity: string | null = null;
  let identityRevision = 0;

  function begin() {
    const key = ports.currentKey();
    if (!key) return null;
    const pageKey = ports.pageKey();
    const identity = JSON.stringify([key, pageKey]);
    if (identity !== settlementIdentity) {
      settledRows.clear();
      settlementIdentity = identity;
      identityRevision += 1;
    }
    const revision = identityRevision;
    const operation = ++sequence;
    ports.error(null);
    return {
      operation,
      current: () =>
        revision === identityRevision &&
        ports.currentKey() === key &&
        ports.pageKey() === pageKey,
      pageKey,
      settle: (id: string) => {
        if ((settledRows.get(id) ?? 0) > operation) return false;
        settledRows.set(id, operation);
        return true;
      },
    };
  }

  return {
    async save(name: string): Promise<boolean> {
      const pending = begin();
      if (!pending) return false;
      try {
        const result = await ports.request("POST", {
          name,
          query: { ...ports.currentQuery() },
        });
        if (!pending.current()) return false;
        const view =
          result && typeof result === "object" && "view" in result
            ? result.view
            : null;
        if (!ports.isView(view) || view.pageKey !== pending.pageKey)
          throw new TypeError("Invalid saved view response");
        if (!pending.settle(view.id)) return false;
        ports.changed(
          [...ports.views().filter((row) => row.id !== view.id), view].sort(
            (a, b) => {
              const left = a.name.toLocaleLowerCase("en");
              const right = b.name.toLocaleLowerCase("en");
              return left < right
                ? -1
                : left > right
                  ? 1
                  : a.id.localeCompare(b.id);
            },
          ),
        );
        return true;
      } catch (error) {
        if (pending.current() && pending.operation === sequence)
          ports.error(ports.errorMessage(error, "save"));
        return false;
      }
    },
    async remove(view: Pick<View, "id">): Promise<boolean> {
      const pending = begin();
      if (!pending) return false;
      const id = view.id;
      try {
        const result = await ports.request("DELETE", { id });
        if (!pending.current()) return false;
        if (
          !result ||
          typeof result !== "object" ||
          !("removed" in result) ||
          result.removed !== true
        )
          throw new TypeError("Invalid saved view response");
        if (!pending.settle(id)) return false;
        ports.changed(ports.views().filter((row) => row.id !== id));
        return true;
      } catch (error) {
        if (pending.current() && pending.operation === sequence)
          ports.error(ports.errorMessage(error, "remove"));
        return false;
      }
    },
  };
}
