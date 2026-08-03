// gawdux/alert-ops — UI contract for the Alert Operations surface.
//
// Structural types only: hosts adapt whatever monitoring provider they run
// into these shapes on the server side and pass plain data down. gawdux
// stays free of any product's or monitoring backend's vocabulary, performs
// no data fetching, and treats every value below as display-ready (already
// authorized, sanitized and redacted by the host).

export type AlertOpsProviderState =
	| 'ok'
	| 'stale'
	| 'unavailable'
	| 'partial'
	| 'loading'
	| 'denied';

export interface AlertOpsProviderStatus {
	state: AlertOpsProviderState;
	/** ISO-8601 timestamp of the last refresh that succeeded, when any has. */
	lastSuccessfulRefresh?: string;
	/** Host-sanitized, displayable error description. */
	error?: string;
}

export type AlertOpsAlertStatus = 'firing' | 'resolved' | 'suppressed';

export interface AlertOpsLink {
	href: string;
	label: string;
	/** Set by the host after validating the target. Unsafe links render inert. */
	safe: boolean;
}

export interface AlertOpsAlert {
	fingerprint: string;
	status: AlertOpsAlertStatus;
	/** Open set; 'critical' | 'warning' | 'info' get dedicated badge colors. */
	severity: string;
	service: string;
	summary: string;
	/** ISO-8601. */
	startsAt: string;
	durationSeconds: number;
	receiver?: string;
	labels: Record<string, string>;
	annotations: Record<string, string>;
	links: AlertOpsLink[];
}

export interface AlertOpsGroup {
	key: string;
	labels: Record<string, string>;
	alerts: AlertOpsAlert[];
}

export interface AlertOpsSilenceMatcher {
	name: string;
	value: string;
	isRegex: boolean;
}

export interface AlertOpsSilence {
	id: string;
	/** Open set; 'active' | 'pending' | 'expired' get dedicated badge colors. */
	state: string;
	matchers: AlertOpsSilenceMatcher[];
	/** ISO-8601. */
	startsAt: string;
	/** ISO-8601. */
	endsAt: string;
	createdBy: string;
	comment: string;
}

export interface AlertOpsFilters {
	environmentId?: string;
	planeId?: string;
	states?: string[];
	severities?: string[];
	service?: string;
	text?: string;
}

export interface AlertOpsScopeOption {
	id: string;
	label: string;
}

export interface AlertOpsScope {
	environments: AlertOpsScopeOption[];
	planes: AlertOpsScopeOption[];
}

/** The host-provided payload the console renders. Data down, events up. */
export interface AlertOpsData {
	status: AlertOpsProviderStatus;
	groups: AlertOpsGroup[];
	silences: AlertOpsSilence[];
}

/**
 * Every user-facing string in the alert-ops components. Hosts localize by
 * passing a partial override through the `copy` prop; English defaults ship
 * below. Templated entries use `{placeholder}` interpolation via
 * `formatAlertOpsTemplate`.
 */
export interface AlertOpsCopy {
	// Tabs
	alertsTab: string;
	silencesTab: string;
	// Provider health bar
	providerHealthLabel: string;
	environmentLabel: string;
	planeLabel: string;
	allEnvironmentsLabel: string;
	allPlanesLabel: string;
	refreshLabel: string;
	lastRefreshLabel: string;
	lastRefreshNever: string;
	refreshedJustNow: string;
	refreshedMinutesAgo: string;
	refreshedHoursAgo: string;
	refreshedDaysAgo: string;
	providerStateOk: string;
	providerStateStale: string;
	providerStateUnavailable: string;
	providerStatePartial: string;
	providerStateLoading: string;
	providerStateDenied: string;
	// Filters
	filtersLabel: string;
	filterEnvironmentLabel: string;
	filterPlaneLabel: string;
	filterStateLabel: string;
	filterSeverityLabel: string;
	filterServiceLabel: string;
	filterServicePlaceholder: string;
	filterTextLabel: string;
	filterTextPlaceholder: string;
	filterAnyOptionLabel: string;
	// Alert vocabulary
	statusFiring: string;
	statusResolved: string;
	statusSuppressed: string;
	severityCritical: string;
	severityWarning: string;
	severityInfo: string;
	// Alert table
	alertsTableCaption: string;
	columnSeverity: string;
	columnStatus: string;
	columnService: string;
	columnSummary: string;
	columnStarted: string;
	columnDuration: string;
	columnReceiver: string;
	columnFingerprint: string;
	ungroupedLabel: string;
	// Duration units (short suffixes)
	durationUnitDays: string;
	durationUnitHours: string;
	durationUnitMinutes: string;
	durationUnitSeconds: string;
	// Surface states
	loadingLabel: string;
	emptyTitle: string;
	emptyMessage: string;
	noResultsTitle: string;
	noResultsMessage: string;
	unavailableTitle: string;
	unavailableMessage: string;
	retryLabel: string;
	staleBannerTitle: string;
	staleBannerMessage: string;
	partialAlertsBanner: string;
	partialSilencesBanner: string;
	deniedTitle: string;
	deniedMessage: string;
	// Detail panel
	detailHeading: string;
	detailNoSelection: string;
	detailLabelsHeading: string;
	detailAnnotationsHeading: string;
	detailLinksHeading: string;
	detailStartedLabel: string;
	detailDurationLabel: string;
	detailReceiverLabel: string;
	detailFingerprintLabel: string;
	detailGroupKeyLabel: string;
	detailNameHeader: string;
	detailValueHeader: string;
	detailNoLabels: string;
	detailNoAnnotations: string;
	detailNoLinks: string;
	blockedLinkTitle: string;
	// Silences
	silencesTableCaption: string;
	silenceColumnState: string;
	silenceColumnMatchers: string;
	silenceColumnWindow: string;
	silenceColumnCreatedBy: string;
	silenceColumnComment: string;
	silenceStateActive: string;
	silenceStatePending: string;
	silenceStateExpired: string;
	regexMarkerLabel: string;
	silencesEmptyTitle: string;
	silencesEmptyMessage: string;
}

export const DEFAULT_ALERT_OPS_COPY: Readonly<AlertOpsCopy> = Object.freeze({
	alertsTab: 'Alerts',
	silencesTab: 'Silences',
	providerHealthLabel: 'Provider health',
	environmentLabel: 'Environment',
	planeLabel: 'Plane',
	allEnvironmentsLabel: 'All environments',
	allPlanesLabel: 'All planes',
	refreshLabel: 'Refresh',
	lastRefreshLabel: 'Last refresh',
	lastRefreshNever: 'never',
	refreshedJustNow: 'just now',
	refreshedMinutesAgo: '{minutes} min ago',
	refreshedHoursAgo: '{hours} h ago',
	refreshedDaysAgo: '{days} d ago',
	providerStateOk: 'Connected',
	providerStateStale: 'Stale',
	providerStateUnavailable: 'Unavailable',
	providerStatePartial: 'Partial',
	providerStateLoading: 'Loading',
	providerStateDenied: 'Denied',
	filtersLabel: 'Filters',
	filterEnvironmentLabel: 'Environment',
	filterPlaneLabel: 'Plane',
	filterStateLabel: 'State',
	filterSeverityLabel: 'Severity',
	filterServiceLabel: 'Service',
	filterServicePlaceholder: 'Any service',
	filterTextLabel: 'Search',
	filterTextPlaceholder: 'Search alerts',
	filterAnyOptionLabel: 'All',
	statusFiring: 'Firing',
	statusResolved: 'Resolved',
	statusSuppressed: 'Suppressed',
	severityCritical: 'Critical',
	severityWarning: 'Warning',
	severityInfo: 'Info',
	alertsTableCaption: 'Alert groups',
	columnSeverity: 'Severity',
	columnStatus: 'Status',
	columnService: 'Service',
	columnSummary: 'Summary',
	columnStarted: 'Started',
	columnDuration: 'Duration',
	columnReceiver: 'Receiver',
	columnFingerprint: 'Fingerprint',
	ungroupedLabel: 'Ungrouped',
	durationUnitDays: 'd',
	durationUnitHours: 'h',
	durationUnitMinutes: 'm',
	durationUnitSeconds: 's',
	loadingLabel: 'Loading alert data',
	emptyTitle: 'No alerts',
	emptyMessage: 'The monitoring provider reports no alerts in this scope.',
	noResultsTitle: 'Nothing matches these filters',
	noResultsMessage: 'Adjust or reset the filters to see more alerts.',
	unavailableTitle: 'Alert data is unavailable',
	unavailableMessage: 'The monitoring provider could not be reached.',
	retryLabel: 'Retry',
	staleBannerTitle: 'Showing stale data.',
	staleBannerMessage: 'The provider could not be refreshed; this is the last successfully loaded data.',
	partialAlertsBanner: 'Some alert data could not be loaded.',
	partialSilencesBanner: 'Some silence data could not be loaded.',
	deniedTitle: 'Access denied',
	deniedMessage: 'You do not have permission to view alert operations.',
	detailHeading: 'Alert detail',
	detailNoSelection: 'Select an alert to see its details.',
	detailLabelsHeading: 'Labels',
	detailAnnotationsHeading: 'Annotations',
	detailLinksHeading: 'Links',
	detailStartedLabel: 'Started',
	detailDurationLabel: 'Duration',
	detailReceiverLabel: 'Receiver',
	detailFingerprintLabel: 'Fingerprint',
	detailGroupKeyLabel: 'Group key',
	detailNameHeader: 'Name',
	detailValueHeader: 'Value',
	detailNoLabels: 'No labels',
	detailNoAnnotations: 'No annotations',
	detailNoLinks: 'No links',
	blockedLinkTitle: 'Blocked link',
	silencesTableCaption: 'Silences',
	silenceColumnState: 'State',
	silenceColumnMatchers: 'Matchers',
	silenceColumnWindow: 'Window',
	silenceColumnCreatedBy: 'Created by',
	silenceColumnComment: 'Comment',
	silenceStateActive: 'Active',
	silenceStatePending: 'Pending',
	silenceStateExpired: 'Expired',
	regexMarkerLabel: 'regex',
	silencesEmptyTitle: 'No silences',
	silencesEmptyMessage: 'There are no silences in this scope.'
});

/** Merges host copy overrides over the English defaults. */
export function resolveAlertOpsCopy(overrides?: Partial<AlertOpsCopy>): AlertOpsCopy {
	if (!overrides) return DEFAULT_ALERT_OPS_COPY;
	const merged: AlertOpsCopy = { ...DEFAULT_ALERT_OPS_COPY };
	for (const [key, value] of Object.entries(overrides)) {
		if (typeof value === 'string') (merged as unknown as Record<string, string>)[key] = value;
	}
	return merged;
}

/** `{placeholder}` interpolation for templated copy entries. */
export function formatAlertOpsTemplate(
	template: string,
	params: Record<string, string | number>
): string {
	return template.replace(/\{(\w+)\}/g, (match, key: string) =>
		key in params ? String(params[key]) : match
	);
}
