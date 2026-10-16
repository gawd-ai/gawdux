export interface FocusScopePorts {
  document: Document;
  eventTarget: EventTarget;
  root(): HTMLElement | null | undefined;
  background(): Iterable<HTMLElement>;
  initialFocus?(): HTMLElement | null | undefined;
  onEscape?(): void;
  onLink?(link: HTMLAnchorElement): void;
  /** Test or non-layout host port; ordinary browsers use rendered client rects. */
  isVisible?(element: HTMLElement): boolean;
}

interface ElementLock<T> {
  owners: Set<symbol>;
  previous: T;
}

interface ActiveScope {
  owner: symbol;
  root: HTMLElement;
  previousFocus: HTMLElement | null;
  initialFocus: () => HTMLElement | null | undefined;
}

const inertLocks = new WeakMap<HTMLElement, ElementLock<boolean>>();
const overflowLocks = new WeakMap<
  HTMLElement,
  ElementLock<{ value: string; priority: string }>
>();
const activeScopes = new WeakMap<
  Document,
  { scopes: ActiveScope[]; initialFocus: HTMLElement | null }
>();

function elementOf(value: EventTarget | null): HTMLElement | null {
  return value && "nodeType" in value && value.nodeType === 1
    ? (value as HTMLElement)
    : null;
}

function canFocus(
  element: HTMLElement | null | undefined,
): element is HTMLElement {
  if (!element?.isConnected || element.matches(":disabled")) return false;
  for (
    let parent: HTMLElement | null = element;
    parent;
    parent = parent.parentElement
  ) {
    if (parent.inert || parent.hidden) return false;
  }
  return true;
}

/**
 * Explicit-lifetime focus containment. No browser globals are read at import or
 * construction. Resource locks preserve pre-existing values and nested owners,
 * including teardown in a different order from activation.
 */
export function activateFocusScope(ports: FocusScopePorts): () => void {
  const mountedRoot = ports.root();
  if (!mountedRoot) return () => {};
  const root: HTMLElement = mountedRoot;
  const document = ports.document;
  const body = document.body;
  const owner = Symbol("focus-scope");
  const previousFocus = elementOf(document.activeElement);
  const background = [...new Set(ports.background())].filter(
    (element) => element !== root && !element.contains(root),
  );
  const previousTabIndex = root.getAttribute("tabindex");
  let temporaryTabIndex = false;
  let disposed = false;
  const state = activeScopes.get(document) ?? {
    scopes: [],
    initialFocus: previousFocus,
  };
  const scope: ActiveScope = {
    owner,
    root,
    previousFocus,
    initialFocus: ports.initialFocus ?? (() => null),
  };
  state.scopes.push(scope);
  activeScopes.set(document, state);

  const overflow = overflowLocks.get(body) ?? {
    owners: new Set<symbol>(),
    previous: {
      value: body.style.getPropertyValue("overflow"),
      priority: body.style.getPropertyPriority("overflow"),
    },
  };
  overflow.owners.add(owner);
  overflowLocks.set(body, overflow);
  body.style.setProperty("overflow", "hidden");
  for (const element of background) {
    const lock = inertLocks.get(element) ?? {
      owners: new Set<symbol>(),
      previous: Boolean(element.inert),
    };
    lock.owners.add(owner);
    inertLocks.set(element, lock);
    element.inert = true;
  }

  const visible =
    ports.isVisible ??
    ((element: HTMLElement) => element.getClientRects().length > 0);
  const focusable = () =>
    Array.from(
      root.querySelectorAll<HTMLElement>(
        'a[href],button,input,select,textarea,[tabindex],[contenteditable="true"]',
      ),
    ).filter(
      (element) =>
        element.tabIndex >= 0 && canFocus(element) && visible(element),
    );
  function focusRoot() {
    if (root.tabIndex < 0 && !root.hasAttribute("tabindex")) {
      root.setAttribute("tabindex", "-1");
      temporaryTabIndex = true;
    }
    root.focus();
  }
  const initial = ports.initialFocus?.();
  if (initial && root.contains(initial) && canFocus(initial)) initial.focus();
  else {
    const first = focusable()[0];
    if (first) first.focus();
    else focusRoot();
  }

  function isTop() {
    return state.scopes.at(-1)?.owner === owner;
  }
  const keydown: EventListener = (event) => {
    const key = event as KeyboardEvent;
    if (!isTop() || key.defaultPrevented || key.isComposing) return;
    if (key.key === "Escape") {
      ports.onEscape?.();
      return;
    }
    if (key.key !== "Tab") return;
    const items = focusable();
    const first = items[0];
    const last = items.at(-1);
    if (!first || !last) {
      key.preventDefault();
      focusRoot();
      return;
    }
    const active = document.activeElement;
    if (key.shiftKey && (active === first || !root.contains(active))) {
      key.preventDefault();
      last.focus();
    } else if (!key.shiftKey && (active === last || !root.contains(active))) {
      key.preventDefault();
      first.focus();
    }
  };
  const click: EventListener = (event) => {
    if (!isTop()) return;
    const element = elementOf(event.target);
    const link = element?.closest<HTMLAnchorElement>("a[href]");
    if (link && root.contains(link)) ports.onLink?.(link);
  };
  ports.eventTarget.addEventListener("keydown", keydown);
  ports.eventTarget.addEventListener("click", click);

  return () => {
    if (disposed) return;
    disposed = true;
    ports.eventTarget.removeEventListener("keydown", keydown);
    ports.eventTarget.removeEventListener("click", click);
    const wasTop = isTop();
    state.scopes.splice(state.scopes.indexOf(scope), 1);
    for (const element of background) {
      const lock = inertLocks.get(element);
      if (!lock) continue;
      lock.owners.delete(owner);
      if (!lock.owners.size) {
        element.inert = lock.previous;
        inertLocks.delete(element);
      }
    }
    overflow.owners.delete(owner);
    if (!overflow.owners.size) {
      if (overflow.previous.value)
        body.style.setProperty(
          "overflow",
          overflow.previous.value,
          overflow.previous.priority,
        );
      else body.style.removeProperty("overflow");
      overflowLocks.delete(body);
    }
    if (temporaryTabIndex && root.getAttribute("tabindex") === "-1") {
      if (previousTabIndex === null) root.removeAttribute("tabindex");
      else root.setAttribute("tabindex", previousTabIndex);
    }
    if (wasTop) {
      const remaining = state.scopes.at(-1);
      const target = canFocus(previousFocus)
        ? previousFocus
        : (remaining?.initialFocus() ?? state.initialFocus);
      if (canFocus(target)) target.focus();
    }
    if (!state.scopes.length) activeScopes.delete(document);
  };
}
