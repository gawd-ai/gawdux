// gawdux/alert-ops — UI contract for the Alert Operations surface.
//
// Structural types only: hosts adapt whatever monitoring provider they run
// into these shapes on the server side and pass plain data down. gawdux
// stays free of any product's or monitoring backend's vocabulary, performs
// no data fetching, and treats every value below as display-ready (already
// authorized, sanitized and redacted by the host).
export const DEFAULT_ALERT_OPS_COPY = Object.freeze({
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
    silencesEmptyMessage: 'There are no silences in this scope.',
    silenceColumnActions: 'Actions',
    expireSilence: 'Expire silence',
    expireSilenceAccessibleLabel: 'Expire silence for {matchers}',
    expireDisabledExpired: 'Already expired',
    silenceAlert: 'Silence this alert',
    mutationPending: 'Working…',
    mutationFailed: 'The action could not be completed.'
});
/** Merges host copy overrides over the English defaults. */
export function resolveAlertOpsCopy(overrides) {
    if (!overrides)
        return DEFAULT_ALERT_OPS_COPY;
    const merged = { ...DEFAULT_ALERT_OPS_COPY };
    for (const [key, value] of Object.entries(overrides)) {
        if (typeof value === 'string')
            merged[key] = value;
    }
    return merged;
}
/** `{placeholder}` interpolation for templated copy entries. */
export function formatAlertOpsTemplate(template, params) {
    return template.replace(/\{(\w+)\}/g, (match, key) => key in params ? String(params[key]) : match);
}
