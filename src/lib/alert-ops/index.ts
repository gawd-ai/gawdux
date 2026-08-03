// gawdux/alert-ops — reusable Alert Operations console surface.
// Presentation + UI contract only: hosts own transport, authentication,
// authorization, sanitization and the provider adapter. Consumed via the
// `gawdux/alert-ops` subpath.

export { default as AlertOpsConsole } from './AlertOpsConsole.svelte';
export { default as AlertDetailPanel } from './AlertDetailPanel.svelte';
export { default as AlertGroupTable } from './AlertGroupTable.svelte';
export { default as FilterRail } from './FilterRail.svelte';
export { default as ProviderHealthBar } from './ProviderHealthBar.svelte';
export { default as SilenceTable } from './SilenceTable.svelte';

export {
	DEFAULT_ALERT_OPS_COPY,
	formatAlertOpsTemplate,
	resolveAlertOpsCopy
} from './types';
export type {
	AlertOpsAlert,
	AlertOpsAlertStatus,
	AlertOpsCopy,
	AlertOpsData,
	AlertOpsFilters,
	AlertOpsGroup,
	AlertOpsLink,
	AlertOpsMutationPhase,
	AlertOpsMutationState,
	AlertOpsProviderState,
	AlertOpsProviderStatus,
	AlertOpsScope,
	AlertOpsScopeOption,
	AlertOpsSilence,
	AlertOpsSilenceMatcher
} from './types';

export {
	alertSeverityBadgeColor,
	alertSeverityLabel,
	alertStatusBadgeColor,
	alertStatusLabel,
	canExpireAlertOpsSilence,
	formatAlertOpsDuration,
	formatAlertOpsRelativeTime,
	formatAlertOpsTimestamp,
	hasActiveAlertOpsFilters,
	providerStateBadgeColor,
	providerStateLabel,
	resolveAlertOpsCollection,
	resolveAlertOpsView,
	shortAlertFingerprint,
	silenceStateBadgeColor,
	silenceStateLabel
} from './states';
export type { AlertOpsCollectionState, AlertOpsView, AlertOpsViewKind } from './states';

export { createAlertOpsPoller } from './polling.svelte';
export type {
	AlertOpsPoller,
	AlertOpsPollerStatus,
	AlertOpsVisibilitySource,
	CreateAlertOpsPollerOptions
} from './polling.svelte';
