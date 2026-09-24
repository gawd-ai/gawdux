// gawdux/admin: shared tenant-administration blocks.
// Presentation only: hosts own loading, authorization and every mutation.
// Consumed via the `gawdux/admin` subpath.

export { default as MemberAccessCard } from './MemberAccessCard.svelte';
export { default as SecurityActivityList } from './SecurityActivityList.svelte';
export { default as BotToolAccess } from './BotToolAccess.svelte';
export { default as BotConfigFields } from './BotConfigFields.svelte';
export { default as AuditHistoryTable } from './AuditHistoryTable.svelte';

export { DEFAULT_MEMBER_ACCESS_COPY } from './types';
export type {
	AuditHistoryChange,
	AuditHistoryRow,
	AuditTone,
	BotConfigDraft,
	BotOption,
	BotTool,
	BotToolGroup,
	MemberAccessCopy,
	MemberCapability,
	MemberCapabilityGroup,
	MemberRole,
	SecurityActivityEvent
} from './types';
