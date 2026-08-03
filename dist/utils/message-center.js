export const DEFAULT_MESSAGE_LIFETIMES_MS = {
    success: 4_000,
    info: 6_000,
    warning: null,
    error: null
};
const MANUAL_PAUSE_REASON = 'manual';
const VISIBILITY_PAUSE_REASON = 'document-hidden';
const HIDDEN_CONDITION_STATE_VERSION = 1;
const tonePriority = {
    error: 4,
    warning: 3,
    info: 2,
    success: 1
};
const systemClock = {
    now: () => Date.now(),
    setTimer: (callback, delayMs) => setTimeout(callback, delayMs),
    clearTimer: (handle) => clearTimeout(handle)
};
function compareItems(a, b) {
    const priorityDifference = tonePriority[b.tone] - tonePriority[a.tone];
    if (priorityDifference !== 0)
        return priorityDifference;
    if (a.updatedAt !== b.updatedAt)
        return b.updatedAt - a.updatedAt;
    return a.id.localeCompare(b.id);
}
function normalizedText(value, field) {
    const normalized = value.trim();
    if (!normalized)
        throw new Error(`${field} must not be empty`);
    return normalized;
}
function normalizedRevision(revision) {
    if (typeof revision === 'number') {
        if (!Number.isFinite(revision))
            throw new Error('Message revision must be finite');
        return revision;
    }
    return normalizedText(revision, 'Message revision');
}
function normalizedActions(actions) {
    return (actions ?? []).map((action) => ({
        id: normalizedText(action.id, 'Message action ID'),
        label: normalizedText(action.label, 'Message action label'),
        href: action.href?.trim() || null
    }));
}
function normalizedLifetime(lifetimeMs, tone) {
    const resolved = lifetimeMs === undefined ? DEFAULT_MESSAGE_LIFETIMES_MS[tone] : lifetimeMs;
    if (resolved === null)
        return null;
    if (!Number.isFinite(resolved) || resolved <= 0) {
        throw new Error('Message lifetime must be a positive finite number or null');
    }
    return resolved;
}
function sameRevision(a, b) {
    return typeof a === typeof b && a === b;
}
function parseHiddenConditionState(serialized, identity) {
    const hidden = new Map();
    if (!serialized)
        return hidden;
    try {
        const parsed = JSON.parse(serialized);
        if (parsed.version !== HIDDEN_CONDITION_STATE_VERSION || parsed.identity !== identity) {
            return hidden;
        }
        if (!Array.isArray(parsed.hidden))
            return hidden;
        for (const candidate of parsed.hidden) {
            if (!candidate || typeof candidate !== 'object')
                continue;
            const id = typeof candidate.id === 'string' ? candidate.id.trim() : '';
            const revision = candidate.revision;
            if (!id)
                continue;
            if (typeof revision === 'string' && revision.trim())
                hidden.set(id, revision.trim());
            else if (typeof revision === 'number' && Number.isFinite(revision))
                hidden.set(id, revision);
        }
    }
    catch {
        // Corrupt browser storage must never prevent the application from loading.
    }
    return hidden;
}
/**
 * Framework-neutral application feedback state. Its standard subscribe method
 * can be consumed as a Svelte store, while injected time and visibility keep
 * lifecycle behavior deterministic outside a browser.
 */
export class MessageCenter {
    #clock;
    #items = new Map();
    #listeners = new Set();
    #pauseReasons = new Set();
    #hiddenConditionRevisions;
    #maxVisible;
    #hiddenConditionPersistence;
    #snapshot;
    #visibilityUnsubscribe = null;
    #visibilityBinding = null;
    #destroyed = false;
    constructor(options = {}) {
        const maxVisible = options.maxVisible ?? 3;
        if (!Number.isInteger(maxVisible) || maxVisible <= 0) {
            throw new Error('maxVisible must be a positive integer');
        }
        this.#maxVisible = maxVisible;
        this.#clock = options.clock ?? systemClock;
        this.#hiddenConditionPersistence = options.hiddenConditionPersistence ?? null;
        const persistenceIdentity = this.#hiddenConditionPersistence?.identity.trim() ?? '';
        if (this.#hiddenConditionPersistence && !persistenceIdentity) {
            throw new Error('Hidden-condition persistence identity must not be empty');
        }
        let persistedState = null;
        if (this.#hiddenConditionPersistence) {
            try {
                persistedState = this.#hiddenConditionPersistence.read();
            }
            catch {
                // Storage can be unavailable in privacy modes; in-memory behavior remains valid.
            }
        }
        this.#hiddenConditionRevisions = parseHiddenConditionState(persistedState, persistenceIdentity);
        this.#snapshot = this.#buildSnapshot();
        if (options.visibility)
            this.bindVisibility(options.visibility);
    }
    getSnapshot() {
        return this.#snapshot;
    }
    /** Svelte store contract: the subscriber receives the current state immediately. */
    subscribe(listener) {
        this.#assertActive();
        this.#listeners.add(listener);
        listener(this.#snapshot);
        return () => this.#listeners.delete(listener);
    }
    publishTransient(input) {
        return this.#publish('transient', input, normalizedLifetime(input.lifetimeMs, input.tone));
    }
    publishCondition(input) {
        return this.#publish('condition', input, null);
    }
    dismissTransient(id, revision) {
        return this.#remove(id, 'transient', revision);
    }
    hideCondition(id, revision) {
        return this.#setConditionHidden(id, true, revision);
    }
    revealCondition(id, revision) {
        return this.#setConditionHidden(id, false, revision);
    }
    resolveCondition(id, revision) {
        const normalizedId = id.trim();
        const removed = this.#remove(normalizedId, 'condition', revision, false);
        if (removed) {
            this.#hiddenConditionRevisions.delete(normalizedId);
            this.#persistHiddenConditions();
            this.#emit();
            return true;
        }
        const hiddenRevision = this.#hiddenConditionRevisions.get(normalizedId);
        if (hiddenRevision === undefined)
            return false;
        if (revision !== undefined && !sameRevision(hiddenRevision, normalizedRevision(revision))) {
            return false;
        }
        this.#hiddenConditionRevisions.delete(normalizedId);
        this.#persistHiddenConditions();
        return true;
    }
    pauseTimers(reason = MANUAL_PAUSE_REASON) {
        this.#assertActive();
        const normalizedReason = normalizedText(reason, 'Pause reason');
        if (this.#pauseReasons.has(normalizedReason))
            return;
        const wasPaused = this.#pauseReasons.size > 0;
        this.#pauseReasons.add(normalizedReason);
        if (wasPaused)
            return;
        const now = this.#clock.now();
        for (const stored of [...this.#items.values()])
            this.#pauseTimer(stored, now);
        this.#emit();
    }
    resumeTimers(reason = MANUAL_PAUSE_REASON) {
        this.#assertActive();
        const normalizedReason = normalizedText(reason, 'Pause reason');
        if (!this.#pauseReasons.delete(normalizedReason) || this.#pauseReasons.size > 0)
            return;
        for (const stored of [...this.#items.values()])
            this.#scheduleTimer(stored);
        this.#emit();
    }
    /**
     * Connects timer suspension to an injected visibility source. The returned
     * cleanup only detaches this particular binding, so stale component cleanup
     * cannot disconnect a newer binding.
     */
    bindVisibility(source) {
        this.#assertActive();
        this.#visibilityUnsubscribe?.();
        this.#visibilityUnsubscribe = null;
        const binding = Symbol('message-center-visibility');
        this.#visibilityBinding = binding;
        this.#applyVisibility(source.isHidden());
        const unsubscribe = source.subscribe((hidden) => {
            if (this.#visibilityBinding === binding)
                this.#applyVisibility(hidden);
        });
        this.#visibilityUnsubscribe = unsubscribe;
        return () => {
            if (this.#visibilityBinding !== binding)
                return;
            this.#visibilityBinding = null;
            this.#visibilityUnsubscribe = null;
            unsubscribe();
            this.resumeTimers(VISIBILITY_PAUSE_REASON);
        };
    }
    destroy() {
        if (this.#destroyed)
            return;
        this.#visibilityBinding = null;
        this.#visibilityUnsubscribe?.();
        this.#visibilityUnsubscribe = null;
        for (const stored of this.#items.values())
            this.#cancelTimer(stored);
        this.#items.clear();
        this.#hiddenConditionRevisions.clear();
        this.#pauseReasons.clear();
        this.#snapshot = this.#buildSnapshot();
        for (const listener of this.#listeners)
            listener(this.#snapshot);
        this.#listeners.clear();
        this.#destroyed = true;
    }
    #publish(kind, input, lifetimeMs) {
        this.#assertActive();
        const id = normalizedText(input.id, 'Message ID');
        const revision = normalizedRevision(input.revision);
        const existing = this.#items.get(id);
        if (existing?.item.kind !== undefined && existing.item.kind !== kind) {
            throw new Error(`Message "${id}" is already registered as ${existing.item.kind}`);
        }
        if (existing && sameRevision(existing.item.revision, revision)) {
            return { outcome: 'deduplicated', item: existing.item };
        }
        const now = this.#clock.now();
        const persistedHiddenRevision = kind === 'condition' ? this.#hiddenConditionRevisions.get(id) : undefined;
        const overlayHidden = persistedHiddenRevision !== undefined && sameRevision(persistedHiddenRevision, revision);
        if (persistedHiddenRevision !== undefined && !overlayHidden) {
            this.#hiddenConditionRevisions.delete(id);
            this.#persistHiddenConditions();
        }
        const item = {
            id,
            revision,
            kind,
            tone: input.tone,
            title: input.title?.trim() || null,
            message: normalizedText(input.message, 'Message'),
            actions: normalizedActions(input.actions),
            createdAt: existing?.item.createdAt ?? now,
            updatedAt: now,
            lifetimeMs,
            overlayHidden
        };
        if (existing)
            this.#cancelTimer(existing);
        const stored = {
            item,
            remainingMs: lifetimeMs,
            timerActive: false,
            timerHandle: null,
            timerStartedAt: null
        };
        this.#items.set(id, stored);
        this.#scheduleTimer(stored);
        this.#emit();
        return { outcome: existing ? 'revised' : 'created', item };
    }
    #remove(id, kind, revision, emit = true) {
        this.#assertActive();
        const stored = this.#items.get(id.trim());
        if (!stored || stored.item.kind !== kind)
            return false;
        if (revision !== undefined &&
            !sameRevision(stored.item.revision, normalizedRevision(revision))) {
            return false;
        }
        this.#cancelTimer(stored);
        this.#items.delete(stored.item.id);
        if (emit)
            this.#emit();
        return true;
    }
    #setConditionHidden(id, hidden, revision) {
        this.#assertActive();
        const stored = this.#items.get(id.trim());
        if (!stored || stored.item.kind !== 'condition')
            return false;
        if (revision !== undefined &&
            !sameRevision(stored.item.revision, normalizedRevision(revision))) {
            return false;
        }
        if (stored.item.overlayHidden === hidden)
            return true;
        stored.item = { ...stored.item, overlayHidden: hidden };
        if (hidden)
            this.#hiddenConditionRevisions.set(stored.item.id, stored.item.revision);
        else
            this.#hiddenConditionRevisions.delete(stored.item.id);
        this.#persistHiddenConditions();
        this.#emit();
        return true;
    }
    #applyVisibility(hidden) {
        if (hidden)
            this.pauseTimers(VISIBILITY_PAUSE_REASON);
        else
            this.resumeTimers(VISIBILITY_PAUSE_REASON);
    }
    #scheduleTimer(stored) {
        if (this.#pauseReasons.size > 0 || stored.remainingMs === null || stored.timerActive)
            return;
        if (stored.remainingMs <= 0) {
            this.#items.delete(stored.item.id);
            return;
        }
        stored.timerStartedAt = this.#clock.now();
        stored.timerActive = true;
        stored.timerHandle = this.#clock.setTimer(() => {
            const current = this.#items.get(stored.item.id);
            if (current !== stored)
                return;
            stored.timerActive = false;
            stored.timerHandle = null;
            stored.timerStartedAt = null;
            stored.remainingMs = 0;
            this.#items.delete(stored.item.id);
            this.#emit();
        }, stored.remainingMs);
    }
    #pauseTimer(stored, now) {
        if (!stored.timerActive || stored.remainingMs === null)
            return;
        const startedAt = stored.timerStartedAt ?? now;
        const elapsed = Math.max(0, now - startedAt);
        this.#clock.clearTimer(stored.timerHandle);
        stored.timerActive = false;
        stored.timerHandle = null;
        stored.timerStartedAt = null;
        stored.remainingMs = Math.max(0, stored.remainingMs - elapsed);
        if (stored.remainingMs === 0)
            this.#items.delete(stored.item.id);
    }
    #cancelTimer(stored) {
        if (stored.timerActive)
            this.#clock.clearTimer(stored.timerHandle);
        stored.timerActive = false;
        stored.timerHandle = null;
        stored.timerStartedAt = null;
    }
    #buildSnapshot() {
        const items = [...this.#items.values()].map((stored) => stored.item).sort(compareItems);
        const notices = items.filter((item) => item.kind === 'condition');
        const overlayCandidates = items.filter((item) => item.kind === 'transient' || !item.overlayHidden);
        const overlay = overlayCandidates.slice(0, this.#maxVisible);
        return {
            items,
            overlay,
            notices,
            pendingOverlayCount: Math.max(0, overlayCandidates.length - overlay.length),
            hiddenNoticeCount: notices.filter((item) => item.overlayHidden).length,
            maxVisible: this.#maxVisible,
            timersPaused: this.#pauseReasons.size > 0
        };
    }
    #emit() {
        this.#snapshot = this.#buildSnapshot();
        for (const listener of this.#listeners)
            listener(this.#snapshot);
    }
    #persistHiddenConditions() {
        const persistence = this.#hiddenConditionPersistence;
        if (!persistence)
            return;
        try {
            if (this.#hiddenConditionRevisions.size === 0) {
                persistence.write(null);
                return;
            }
            const state = {
                version: HIDDEN_CONDITION_STATE_VERSION,
                identity: persistence.identity.trim(),
                hidden: [...this.#hiddenConditionRevisions.entries()]
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([id, revision]) => ({ id, revision }))
            };
            persistence.write(JSON.stringify(state));
        }
        catch {
            // Storage persistence is best effort; the in-memory notice remains authoritative.
        }
    }
    #assertActive() {
        if (this.#destroyed)
            throw new Error('MessageCenter has been destroyed');
    }
}
/** Adapter kept separate from global `document` so SSR and unit tests stay DOM-free. */
export function createDocumentVisibilitySource(documentLike) {
    return {
        isHidden: () => documentLike.hidden,
        subscribe(listener) {
            const handleChange = () => listener(documentLike.hidden);
            documentLike.addEventListener('visibilitychange', handleChange);
            return () => documentLike.removeEventListener('visibilitychange', handleChange);
        }
    };
}
/**
 * Creates a reload-safe hidden-condition adapter. Pass sessionStorage for one
 * browser session or localStorage when dismissal should survive new sessions.
 */
export function createStorageHiddenConditionPersistence(storage, identity, namespace = 'gawdux.message-center.hidden-conditions') {
    const normalizedIdentity = normalizedText(identity, 'Hidden-condition persistence identity');
    const normalizedNamespace = normalizedText(namespace, 'Hidden-condition persistence namespace');
    const key = `${normalizedNamespace}:${encodeURIComponent(normalizedIdentity)}`;
    return {
        identity: normalizedIdentity,
        read: () => storage.getItem(key),
        write(serialized) {
            if (serialized === null)
                storage.removeItem(key);
            else
                storage.setItem(key, serialized);
        }
    };
}
export function createMessageCenter(options = {}) {
    return new MessageCenter(options);
}
