import type { Snippet } from 'svelte';

export type AiKnowledgeId = string | number;
export type AiKnowledgeTone = 'muted' | 'ready' | 'error' | 'warning' | 'working';

export interface AiKnowledgeBase<Id extends AiKnowledgeId = number> {
	id: Id;
	name: string;
	description: string;
	rollup: {
		sourceCount: number;
		readyCount: number;
		ingestingCount: number;
		errorCount: number;
		staleCount: number;
		unavailableCount: number;
		charCount: number;
	};
}

/** Eligibility, versions and last-good semantics are already resolved by the host. */
export interface AiKnowledgeSource<Id extends AiKnowledgeId = number> {
	id: Id;
	kind: 'resource' | 'upload';
	title: string;
	status: { label: string; tone: AiKnowledgeTone };
	chunkCount: number;
	charCount: number;
	metadata: readonly { label: string; tone?: AiKnowledgeTone }[];
	errorDetail?: string;
	lastGoodNotice?: string;
	canRefresh: boolean;
	refreshTitle: string;
}

export interface AiKnowledgeResource<Id extends AiKnowledgeId = number> {
	id: Id;
	title: string;
	metadata: string;
}

export interface AiKnowledgeUsageIntent {
	id: string;
	label: string;
	detail?: string;
	href: string;
}

export interface AiKnowledgeLimits {
	maxKnowledgeBases: number;
	maxSourcesPerBase: number;
	maxCharsPerBase: number;
	nameMaxChars: number;
	descriptionMaxChars: number;
}

/** Source and authorization policy is supplied as truthful host presentation. */
export interface AiKnowledgeSourcePolicy {
	addLabel: string;
	searchLabel: string;
	emptySearch: string;
	disclosure: string;
	emptySources: string;
	uploadLabel: string;
	uploadAccept: string;
	availability: string;
	namePlaceholder: string;
	emptyDetail: string;
	searchErrorMessage: string;
	addErrorMessage: string;
}

export interface AiKnowledgeUsage {
	entries: readonly AiKnowledgeUsageIntent[];
	connect: AiKnowledgeUsageIntent | null;
	emptyMessage: string;
	blockedMessage: string;
	deleteBlockedReason: string;
	discardMessage: string;
	discardConfirmLabel: string;
}

export interface AiKnowledgePanelModel<
	KnowledgeId extends AiKnowledgeId = number,
	SourceId extends AiKnowledgeId = number,
	Knowledge extends AiKnowledgeBase<KnowledgeId> = AiKnowledgeBase<KnowledgeId>
> {
	knowledgeBases: readonly Knowledge[];
	selectedKnowledgeId: KnowledgeId | null;
	sources: readonly AiKnowledgeSource<SourceId>[];
	limits: AiKnowledgeLimits;
	sourcePolicy: AiKnowledgeSourcePolicy;
	/** Null means this capability is absent, not an empty available capability. */
	usage: AiKnowledgeUsage | null;
}

export interface AiKnowledgeDiscardRequest {
	message: string;
	confirmLabel: string;
	continue: () => void | Promise<void>;
	focusAfter: () => HTMLElement | null;
}

/** Complete effects; there is no inferred API, storage, permission or route. */
export interface AiKnowledgePanelActions<
	KnowledgeId extends AiKnowledgeId = number,
	SourceId extends AiKnowledgeId = number,
	ResourceId extends AiKnowledgeId = number,
	Knowledge extends AiKnowledgeBase<KnowledgeId> = AiKnowledgeBase<KnowledgeId>
> {
	navigate(knowledgeId?: KnowledgeId): Promise<void>;
	navigateUsage(intent: AiKnowledgeUsageIntent): Promise<void>;
	usageFocusTarget(): HTMLElement | null;
	requestDiscard(request: AiKnowledgeDiscardRequest): void;
	knowledgeBasesChanged(knowledgeBases: Knowledge[]): void;
	create(input: { name: string; description: string }): Promise<Knowledge>;
	update(
		knowledgeId: KnowledgeId,
		input: { name: string; description: string }
	): Promise<Knowledge>;
	delete(knowledgeId: KnowledgeId): Promise<void>;
	/** Called after applying the local authoritative response, never before it. */
	refreshKnowledgeBases(): Promise<void>;
	searchResources(input: {
		knowledgeId: KnowledgeId;
		search: string;
		signal: AbortSignal;
	}): Promise<AiKnowledgeResource<ResourceId>[]>;
	addResource(
		knowledgeId: KnowledgeId,
		resourceId: ResourceId
	): Promise<AiKnowledgeSource<SourceId>>;
	upload(knowledgeId: KnowledgeId, file: File): Promise<AiKnowledgeSource<SourceId>>;
	refreshSource(sourceId: SourceId): Promise<AiKnowledgeSource<SourceId>>;
	removeSource(sourceId: SourceId): Promise<void>;
	validateUpload(file: File): string | null;
	isAbortError(error: unknown): boolean;
	errorMessage(error: unknown, fallback: string): string;
}

export interface AiKnowledgePanelProps<
	KnowledgeId extends AiKnowledgeId = number,
	SourceId extends AiKnowledgeId = number,
	ResourceId extends AiKnowledgeId = number,
	Knowledge extends AiKnowledgeBase<KnowledgeId> = AiKnowledgeBase<KnowledgeId>
> {
	model: AiKnowledgePanelModel<KnowledgeId, SourceId, Knowledge> | null;
	actions: AiKnowledgePanelActions<KnowledgeId, SourceId, ResourceId, Knowledge>;
	editorDirty?: boolean;
	editorBusy?: boolean;
	history?: Snippet;
	guideId?: string;
}
