export type MessageTone = 'success' | 'info' | 'warning' | 'error';
export type MessageKind = 'transient' | 'condition';
export type MessageRevision = string | number;
export declare const DEFAULT_MESSAGE_LIFETIMES_MS: Readonly<Record<MessageTone, number | null>>;
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
type SnapshotListener = (snapshot: MessageCenterSnapshot) => void;
/**
 * Framework-neutral application feedback state. Its standard subscribe method
 * can be consumed as a Svelte store, while injected time and visibility keep
 * lifecycle behavior deterministic outside a browser.
 */
export declare class MessageCenter {
    #private;
    constructor(options?: MessageCenterOptions);
    getSnapshot(): MessageCenterSnapshot;
    /** Svelte store contract: the subscriber receives the current state immediately. */
    subscribe(listener: SnapshotListener): () => void;
    publishTransient(input: TransientMessageInput): PublishResult;
    publishCondition(input: PersistentConditionInput): PublishResult;
    dismissTransient(id: string, revision?: MessageRevision): boolean;
    hideCondition(id: string, revision?: MessageRevision): boolean;
    revealCondition(id: string, revision?: MessageRevision): boolean;
    resolveCondition(id: string, revision?: MessageRevision): boolean;
    pauseTimers(reason?: string): void;
    resumeTimers(reason?: string): void;
    /**
     * Connects timer suspension to an injected visibility source. The returned
     * cleanup only detaches this particular binding, so stale component cleanup
     * cannot disconnect a newer binding.
     */
    bindVisibility(source: MessageCenterVisibilitySource): () => void;
    destroy(): void;
}
/** Adapter kept separate from global `document` so SSR and unit tests stay DOM-free. */
export declare function createDocumentVisibilitySource(documentLike: DocumentVisibilityLike): MessageCenterVisibilitySource;
/**
 * Creates a reload-safe hidden-condition adapter. Pass sessionStorage for one
 * browser session or localStorage when dismissal should survive new sessions.
 */
export declare function createStorageHiddenConditionPersistence(storage: KeyValueStorageLike, identity: string, namespace?: string): MessageCenterHiddenConditionPersistence;
export declare function createMessageCenter(options?: MessageCenterOptions): MessageCenter;
export {};
