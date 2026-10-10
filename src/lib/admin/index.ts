// gawdux/admin: shared tenant-administration blocks.
// Presentation only: hosts own loading, authorization and every mutation.
// Consumed via the `gawdux/admin` subpath.

export { default as MemberAccessCard } from './MemberAccessCard.svelte';
export { default as SecurityActivityList } from './SecurityActivityList.svelte';
export { default as BotToolAccess } from './BotToolAccess.svelte';
export { default as BotConfigFields } from './BotConfigFields.svelte';
export { default as BotConfigContentFields } from './BotConfigContentFields.svelte';
export { default as BotConfigAssignments } from './BotConfigAssignments.svelte';
export { default as AuditHistoryTable } from './AuditHistoryTable.svelte';
export { default as AiUsageBars } from './AiUsageBars.svelte';
export { default as AiSkillsPanel } from './AiSkillsPanel.svelte';
export type {
	AiSkillDefinition,
	AiSkillBot,
	AiSkillGrant,
	AiSkillSettings,
	AiSkillPreviewTuning,
	AiSkillsPanelModel,
	AiSkillDiscardRequest,
	AiSkillsPanelActions,
	AiSkillsPanelProps
} from './skills-types';
export { default as AiUsageReport } from './AiUsageReport.svelte';
export { default as BotRail, botInitials } from './BotRail.svelte';
export { default as BotIdentityHeader } from './BotIdentityHeader.svelte';
export { default as BotConfigView } from './BotConfigView.svelte';
export { default as BotContextCard } from './BotContextCard.svelte';
export { default as RoleMembersCard } from './RoleMembersCard.svelte';

export { DEFAULT_MEMBER_ACCESS_COPY } from './types';
export type {
	AiUsageBreakdown,
	AiUsageBreakdownRow,
	AiUsageDay,
	AiUsageTile,
	AiUsageTotals,
	AuditHistoryChange,
	AuditHistoryHeadIcons,
	AuditHistoryHeadKey,
	AuditHistoryRow,
	AuditTone,
	BotConfigDraft,
	BotConfigSummary,
	BotContextPart,
	BotOption,
	BotRailItem,
	BotTool,
	BotToolGroup,
	MemberAccessCopy,
	MemberCapability,
	MemberCapabilityGroup,
	MemberRole,
	RoleMemberItem,
	SecurityActivityEvent,
	SecurityActivityHeadIcons,
	SecurityActivityHeadKey
} from './types';
