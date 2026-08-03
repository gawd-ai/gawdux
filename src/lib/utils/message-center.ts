export type MessageTone = 'success' | 'info' | 'warning' | 'error';
export type MessageKind = 'transient' | 'condition';
export type MessageRevision = string | number;

export const DEFAULT_MESSAGE_LIFETIMES_MS: Readonly<Record<MessageTone, number | null>> = {
	success: 4_000,
	info: 6_000,
	warning: null,
	error: null
};

export interface MessageActionInput {
	id: string;
	label: string;
	href?: string | null;
}

export interface MessageAction {
	readonly id: string;
	readonly label: string;
	readonly href: string | null;
}

export interface MessageInput {
	id: string;
	revision: MessageRevision;
	tone: MessageTone;
	title?: string | null;
	message: string;
	actions?: readonly MessageActionInput[];
}

export interface TransientMessageInput extends MessageInput {
	/** Override the tone default. Null keeps the message until it is dismissed. */
	lifetimeMs?: number | null;
}

export type PersistentConditionInput = MessageInput;

export interface MessageCenterItem {
	readonly id: string;
	readonly revision: MessageRevision;
	readonly kind: MessageKind;
	readonly tone: MessageTone;
	readonly title: string | null;
	readonly message: string;
	readonly actions: readonly MessageAction[];
	/** First publication time for this stable ID. */
	readonly createdAt: number;
	/** Publication time of the current revision. */
	readonly updatedAt: number;
	/** Null means the item persists until explicitly dismissed or resolved. */
	readonly lifetimeMs: number | null;
	/** Conditions remain in notices while hidden from the overlay. */
	readonly overlayHidden: boolean;
}

export interface MessageCenterSnapshot {
	/** All active items, ordered by severity and recency. */
	readonly items: readonly MessageCenterItem[];
	/** The bounded set a toast/overlay host should currently render. */
	readonly overlay: readonly MessageCenterItem[];
	/** Active persistent conditions, including ones hidden from the overlay. */
	readonly notices: readonly MessageCenterItem[];
	readonly pendingOverlayCount: number;
	readonly hiddenNoticeCount: number;
	readonly maxVisible: number;
	readonly timersPaused: boolean;
}

export type PublishOutcome = 'created' | 'deduplicated' | 'revised';

export interface PublishResult {
	readonly outcome: PublishOutcome;
	readonly item: MessageCenterItem;
}

export interface MessageCenterVisibilitySource {
	isHidden(): boolean;
	subscribe(listener: (hidden: boolean) => void): () => void;
}

export interface DocumentVisibilityLike {
	readonly hidden: boolean;
	addEventListener(type: 'visibilitychange', listener: () => void): void;
	removeEventListener(type: 'visibilitychange', listener: () => void): void;
}

export interface MessageCenterHiddenConditionPersistence {
	/** Caller-owned tenant/workspace/user identity for this dismissal scope. */
	readonly identity: string;
	read(): string | null;
	write(serialized: string | null): void;
}

export interface KeyValueStorageLike {
	getItem(key: string): string | null;
	setItem(key: string, value: string): void;
	removeItem(key: string): void;
}

export interface MessageCenterClock {
	now(): number;
	setTimer(callback: () => void, delayMs: number): unknown;
	clearTimer(handle: unknown): void;
}

export interface MessageCenterOptions {
	maxVisible?: number;
	clock?: MessageCenterClock;
	visibility?: MessageCenterVisibilitySource;
	hiddenConditionPersistence?: MessageCenterHiddenConditionPersistence;
}

interface StoredItem {
	item: MessageCenterItem;
	remainingMs: number | null;
	timerActive: boolean;
	timerHandle: unknown;
	timerStartedAt: number | null;
}

type SnapshotListener = (snapshot: MessageCenterSnapshot) => void;

const MANUAL_PAUSE_REASON = 'manual';
const VISIBILITY_PAUSE_REASON = 'document-hidden';
const HIDDEN_CONDITION_STATE_VERSION = 1;

const tonePriority: Readonly<Record<MessageTone, number>> = {
	error: 4,
	warning: 3,
	info: 2,
	success: 1
};

const systemClock: MessageCenterClock = {
	now: () => Date.now(),
	setTimer: (callback, delayMs) => setTimeout(callback, delayMs),
	clearTimer: (handle) => clearTimeout(handle as ReturnType<typeof setTimeout>)
};

function compareItems(a: MessageCenterItem, b: MessageCenterItem): number {
	const priorityDifference = tonePriority[b.tone] - tonePriority[a.tone];
	if (priorityDifference !== 0) return priorityDifference;
	if (a.updatedAt !== b.updatedAt) return b.updatedAt - a.updatedAt;
	return a.id.localeCompare(b.id);
}

function normalizedText(value: string, field: string): string {
	const normalized = value.trim();
	if (!normalized) throw new Error(`${field} must not be empty`);
	return normalized;
}

function normalizedRevision(revision: MessageRevision): MessageRevision {
	if (typeof revision === 'number') {
		if (!Number.isFinite(revision)) throw new Error('Message revision must be finite');
		return revision;
	}
	return normalizedText(revision, 'Message revision');
}

function normalizedActions(actions: readonly MessageActionInput[] | undefined): MessageAction[] {
	return (actions ?? []).map((action) => ({
		id: normalizedText(action.id, 'Message action ID'),
		label: normalizedText(action.label, 'Message action label'),
		href: action.href?.trim() || null
	}));
}

function normalizedLifetime(
	lifetimeMs: number | null | undefined,
	tone: MessageTone
): number | null {
	const resolved = lifetimeMs === undefined ? DEFAULT_MESSAGE_LIFETIMES_MS[tone] : lifetimeMs;
	if (resolved === null) return null;
	if (!Number.isFinite(resolved) || resolved <= 0) {
		throw new Error('Message lifetime must be a positive finite number or null');
	}
	return resolved;
}

function sameRevision(a: MessageRevision, b: MessageRevision): boolean {
	return typeof a === typeof b && a === b;
}

interface HiddenConditionState {
	version: typeof HIDDEN_CONDITION_STATE_VERSION;
	identity: string;
	hidden: Array<{ id: string; revision: MessageRevision }>;
}

function parseHiddenConditionState(
	serialized: string | null,
	identity: string
): Map<string, MessageRevision> {
	const hidden = new Map<string, MessageRevision>();
	if (!serialized) return hidden;
	try {
		const parsed = JSON.parse(serialized) as Partial<HiddenConditionState>;
		if (parsed.version !== HIDDEN_CONDITION_STATE_VERSION || parsed.identity !== identity) {
			return hidden;
		}
		if (!Array.isArray(parsed.hidden)) return hidden;
		for (const candidate of parsed.hidden) {
			if (!candidate || typeof candidate !== 'object') continue;
			const id = typeof candidate.id === 'string' ? candidate.id.trim() : '';
			const revision = candidate.revision;
			if (!id) continue;
			if (typeof revision === 'string' && revision.trim()) hidden.set(id, revision.trim());
			else if (typeof revision === 'number' && Number.isFinite(revision)) hidden.set(id, revision);
		}
	} catch {
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
	readonly #clock: MessageCenterClock;
	readonly #items = new Map<string, StoredItem>();
	readonly #listeners = new Set<SnapshotListener>();
	readonly #pauseReasons = new Set<string>();
	readonly #hiddenConditionRevisions: Map<string, MessageRevision>;
	readonly #maxVisible: number;
	readonly #hiddenConditionPersistence: MessageCenterHiddenConditionPersistence | null;
	#snapshot: MessageCenterSnapshot;
	#visibilityUnsubscribe: (() => void) | null = null;
	#visibilityBinding: symbol | null = null;
	#destroyed = false;

	constructor(options: MessageCenterOptions = {}) {
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
		let persistedState: string | null = null;
		if (this.#hiddenConditionPersistence) {
			try {
				persistedState = this.#hiddenConditionPersistence.read();
			} catch {
				// Storage can be unavailable in privacy modes; in-memory behavior remains valid.
			}
		}
		this.#hiddenConditionRevisions = parseHiddenConditionState(persistedState, persistenceIdentity);
		this.#snapshot = this.#buildSnapshot();
		if (options.visibility) this.bindVisibility(options.visibility);
	}

	getSnapshot(): MessageCenterSnapshot {
		return this.#snapshot;
	}

	/** Svelte store contract: the subscriber receives the current state immediately. */
	subscribe(listener: SnapshotListener): () => void {
		this.#assertActive();
		this.#listeners.add(listener);
		listener(this.#snapshot);
		return () => this.#listeners.delete(listener);
	}

	publishTransient(input: TransientMessageInput): PublishResult {
		return this.#publish('transient', input, normalizedLifetime(input.lifetimeMs, input.tone));
	}

	publishCondition(input: PersistentConditionInput): PublishResult {
		return this.#publish('condition', input, null);
	}

	dismissTransient(id: string, revision?: MessageRevision): boolean {
		return this.#remove(id, 'transient', revision);
	}

	hideCondition(id: string, revision?: MessageRevision): boolean {
		return this.#setConditionHidden(id, true, revision);
	}

	revealCondition(id: string, revision?: MessageRevision): boolean {
		return this.#setConditionHidden(id, false, revision);
	}

	resolveCondition(id: string, revision?: MessageRevision): boolean {
		const normalizedId = id.trim();
		const removed = this.#remove(normalizedId, 'condition', revision, false);
		if (removed) {
			this.#hiddenConditionRevisions.delete(normalizedId);
			this.#persistHiddenConditions();
			this.#emit();
			return true;
		}
		const hiddenRevision = this.#hiddenConditionRevisions.get(normalizedId);
		if (hiddenRevision === undefined) return false;
		if (revision !== undefined && !sameRevision(hiddenRevision, normalizedRevision(revision))) {
			return false;
		}
		this.#hiddenConditionRevisions.delete(normalizedId);
		this.#persistHiddenConditions();
		return true;
	}

	pauseTimers(reason = MANUAL_PAUSE_REASON): void {
		this.#assertActive();
		const normalizedReason = normalizedText(reason, 'Pause reason');
		if (this.#pauseReasons.has(normalizedReason)) return;
		const wasPaused = this.#pauseReasons.size > 0;
		this.#pauseReasons.add(normalizedReason);
		if (wasPaused) return;

		const now = this.#clock.now();
		for (const stored of [...this.#items.values()]) this.#pauseTimer(stored, now);
		this.#emit();
	}

	resumeTimers(reason = MANUAL_PAUSE_REASON): void {
		this.#assertActive();
		const normalizedReason = normalizedText(reason, 'Pause reason');
		if (!this.#pauseReasons.delete(normalizedReason) || this.#pauseReasons.size > 0) return;

		for (const stored of [...this.#items.values()]) this.#scheduleTimer(stored);
		this.#emit();
	}

	/**
	 * Connects timer suspension to an injected visibility source. The returned
	 * cleanup only detaches this particular binding, so stale component cleanup
	 * cannot disconnect a newer binding.
	 */
	bindVisibility(source: MessageCenterVisibilitySource): () => void {
		this.#assertActive();
		this.#visibilityUnsubscribe?.();
		this.#visibilityUnsubscribe = null;

		const binding = Symbol('message-center-visibility');
		this.#visibilityBinding = binding;
		this.#applyVisibility(source.isHidden());
		const unsubscribe = source.subscribe((hidden) => {
			if (this.#visibilityBinding === binding) this.#applyVisibility(hidden);
		});
		this.#visibilityUnsubscribe = unsubscribe;

		return () => {
			if (this.#visibilityBinding !== binding) return;
			this.#visibilityBinding = null;
			this.#visibilityUnsubscribe = null;
			unsubscribe();
			this.resumeTimers(VISIBILITY_PAUSE_REASON);
		};
	}

	destroy(): void {
		if (this.#destroyed) return;
		this.#visibilityBinding = null;
		this.#visibilityUnsubscribe?.();
		this.#visibilityUnsubscribe = null;
		for (const stored of this.#items.values()) this.#cancelTimer(stored);
		this.#items.clear();
		this.#hiddenConditionRevisions.clear();
		this.#pauseReasons.clear();
		this.#snapshot = this.#buildSnapshot();
		for (const listener of this.#listeners) listener(this.#snapshot);
		this.#listeners.clear();
		this.#destroyed = true;
	}

	#publish(kind: MessageKind, input: MessageInput, lifetimeMs: number | null): PublishResult {
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
		const persistedHiddenRevision =
			kind === 'condition' ? this.#hiddenConditionRevisions.get(id) : undefined;
		const overlayHidden =
			persistedHiddenRevision !== undefined && sameRevision(persistedHiddenRevision, revision);
		if (persistedHiddenRevision !== undefined && !overlayHidden) {
			this.#hiddenConditionRevisions.delete(id);
			this.#persistHiddenConditions();
		}
		const item: MessageCenterItem = {
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
		if (existing) this.#cancelTimer(existing);
		const stored: StoredItem = {
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

	#remove(id: string, kind: MessageKind, revision?: MessageRevision, emit = true): boolean {
		this.#assertActive();
		const stored = this.#items.get(id.trim());
		if (!stored || stored.item.kind !== kind) return false;
		if (
			revision !== undefined &&
			!sameRevision(stored.item.revision, normalizedRevision(revision))
		) {
			return false;
		}
		this.#cancelTimer(stored);
		this.#items.delete(stored.item.id);
		if (emit) this.#emit();
		return true;
	}

	#setConditionHidden(id: string, hidden: boolean, revision?: MessageRevision): boolean {
		this.#assertActive();
		const stored = this.#items.get(id.trim());
		if (!stored || stored.item.kind !== 'condition') return false;
		if (
			revision !== undefined &&
			!sameRevision(stored.item.revision, normalizedRevision(revision))
		) {
			return false;
		}
		if (stored.item.overlayHidden === hidden) return true;
		stored.item = { ...stored.item, overlayHidden: hidden };
		if (hidden) this.#hiddenConditionRevisions.set(stored.item.id, stored.item.revision);
		else this.#hiddenConditionRevisions.delete(stored.item.id);
		this.#persistHiddenConditions();
		this.#emit();
		return true;
	}

	#applyVisibility(hidden: boolean): void {
		if (hidden) this.pauseTimers(VISIBILITY_PAUSE_REASON);
		else this.resumeTimers(VISIBILITY_PAUSE_REASON);
	}

	#scheduleTimer(stored: StoredItem): void {
		if (this.#pauseReasons.size > 0 || stored.remainingMs === null || stored.timerActive) return;
		if (stored.remainingMs <= 0) {
			this.#items.delete(stored.item.id);
			return;
		}

		stored.timerStartedAt = this.#clock.now();
		stored.timerActive = true;
		stored.timerHandle = this.#clock.setTimer(() => {
			const current = this.#items.get(stored.item.id);
			if (current !== stored) return;
			stored.timerActive = false;
			stored.timerHandle = null;
			stored.timerStartedAt = null;
			stored.remainingMs = 0;
			this.#items.delete(stored.item.id);
			this.#emit();
		}, stored.remainingMs);
	}

	#pauseTimer(stored: StoredItem, now: number): void {
		if (!stored.timerActive || stored.remainingMs === null) return;
		const startedAt = stored.timerStartedAt ?? now;
		const elapsed = Math.max(0, now - startedAt);
		this.#clock.clearTimer(stored.timerHandle);
		stored.timerActive = false;
		stored.timerHandle = null;
		stored.timerStartedAt = null;
		stored.remainingMs = Math.max(0, stored.remainingMs - elapsed);
		if (stored.remainingMs === 0) this.#items.delete(stored.item.id);
	}

	#cancelTimer(stored: StoredItem): void {
		if (stored.timerActive) this.#clock.clearTimer(stored.timerHandle);
		stored.timerActive = false;
		stored.timerHandle = null;
		stored.timerStartedAt = null;
	}

	#buildSnapshot(): MessageCenterSnapshot {
		const items = [...this.#items.values()].map((stored) => stored.item).sort(compareItems);
		const notices = items.filter((item) => item.kind === 'condition');
		const overlayCandidates = items.filter(
			(item) => item.kind === 'transient' || !item.overlayHidden
		);
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

	#emit(): void {
		this.#snapshot = this.#buildSnapshot();
		for (const listener of this.#listeners) listener(this.#snapshot);
	}

	#persistHiddenConditions(): void {
		const persistence = this.#hiddenConditionPersistence;
		if (!persistence) return;
		try {
			if (this.#hiddenConditionRevisions.size === 0) {
				persistence.write(null);
				return;
			}
			const state: HiddenConditionState = {
				version: HIDDEN_CONDITION_STATE_VERSION,
				identity: persistence.identity.trim(),
				hidden: [...this.#hiddenConditionRevisions.entries()]
					.sort(([a], [b]) => a.localeCompare(b))
					.map(([id, revision]) => ({ id, revision }))
			};
			persistence.write(JSON.stringify(state));
		} catch {
			// Storage persistence is best effort; the in-memory notice remains authoritative.
		}
	}

	#assertActive(): void {
		if (this.#destroyed) throw new Error('MessageCenter has been destroyed');
	}
}

/** Adapter kept separate from global `document` so SSR and unit tests stay DOM-free. */
export function createDocumentVisibilitySource(
	documentLike: DocumentVisibilityLike
): MessageCenterVisibilitySource {
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
export function createStorageHiddenConditionPersistence(
	storage: KeyValueStorageLike,
	identity: string,
	namespace = 'gawdux.message-center.hidden-conditions'
): MessageCenterHiddenConditionPersistence {
	const normalizedIdentity = normalizedText(identity, 'Hidden-condition persistence identity');
	const normalizedNamespace = normalizedText(namespace, 'Hidden-condition persistence namespace');
	const key = `${normalizedNamespace}:${encodeURIComponent(normalizedIdentity)}`;
	return {
		identity: normalizedIdentity,
		read: () => storage.getItem(key),
		write(serialized) {
			if (serialized === null) storage.removeItem(key);
			else storage.setItem(key, serialized);
		}
	};
}

export function createMessageCenter(options: MessageCenterOptions = {}): MessageCenter {
	return new MessageCenter(options);
}
