import type { Snippet } from 'svelte';

/** A loaded skill definition. Content, dependency rules and rendering belong to the host. */
export interface AiSkillDefinition {
	id: string;
	name: string;
	tagline: string;
	category: string;
	version: string;
	instructionPack: string;
	requires?: readonly string[];
	tools?: readonly { tool: string; purpose: string }[];
	parameters?: readonly {
		key: string;
		label: string;
		description: string;
		kind: 'text' | 'multiline';
		required: boolean;
		maxChars: number;
		placeholder?: string;
	}[];
	knowledgeSlots?: readonly {
		id: string;
		label: string;
		description: string;
		required: boolean;
	}[];
}

export interface AiSkillBot {
	id: string;
	name: string;
	role: string;
	initials: string;
	color: string;
}

export interface AiSkillGrant {
	botId: string;
	skillId: string;
}

export interface AiSkillSettings {
	params: Record<string, string>;
	revision: number;
}

export interface AiSkillPreviewTuning {
	params: Record<string, string>;
	/** Current, resolvable names only; removed references are not advertised. */
	knowledge: Record<string, string>;
}

export interface AiSkillsPanelModel<KnowledgeId extends string | number = number> {
	skillCatalog: readonly AiSkillDefinition[];
	botCatalog: readonly AiSkillBot[];
	grants: readonly AiSkillGrant[];
	selectedSkillId: string | null;
	settings: Readonly<Record<string, AiSkillSettings>>;
	bindings: Readonly<Record<string, Readonly<Record<string, KnowledgeId>>>>;
	kbOptions: readonly { id: KnowledgeId; name: string }[];
	/** Only explicitly live tools are presented as available. */
	bridgeTools: readonly { id: string; status: string; statusLabel?: string }[];
}

export interface AiSkillDiscardRequest {
	message: string;
	confirmLabel: string;
	continue: () => Promise<void>;
	focusAfter: () => HTMLElement | null;
}

/** Complete host effects. The panel never fetches, authorizes or derives a dependency closure. */
export interface AiSkillsPanelActions<KnowledgeId extends string | number = number> {
	/** The host owns route formatting, navigation approval and its discard guard. */
	navigate(skillId: string): Promise<void>;
	requestDiscard(request: AiSkillDiscardRequest): void;
	setGrant(input: {
		botId: string;
		skillId: string;
		allowed: boolean;
		cascade: boolean;
	}): Promise<{ grants: AiSkillGrant[] }>;
	/** Receives the full authoritative set, including prerequisite grants and cascades. */
	grantsChanged(grants: AiSkillGrant[]): void;
	saveSettings(input: {
		skillId: string;
		params: Record<string, string>;
		expectedRevision: number;
	}): Promise<AiSkillSettings>;
	loadSettings(skillId: string): Promise<AiSkillSettings>;
	setKnowledgeBinding(input: {
		skillId: string;
		slotId: string;
		knowledgeId: KnowledgeId | null;
	}): Promise<void>;
	/** Use the same renderer and policy as the runtime; no library renderer is inferred. */
	renderPreview(
		skill: AiSkillDefinition,
		tuning: AiSkillPreviewTuning,
		liveToolIds: ReadonlySet<string>
	): string;
	classifyError(error: unknown): 'stale' | 'dependents' | 'other';
	errorMessage(error: unknown, fallback: string): string;
}

export interface AiSkillsPanelProps<KnowledgeId extends string | number = number> {
	/** Null means the capability is absent; no empty substitute is rendered. */
	model: AiSkillsPanelModel<KnowledgeId> | null;
	actions: AiSkillsPanelActions<KnowledgeId>;
	settingsDirty?: boolean;
	editorBusy?: boolean;
	/** The host supplies already-authorized history presentation, if available. */
	history?: Snippet;
	guideId?: string;
}
