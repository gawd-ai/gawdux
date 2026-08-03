export type AlertOpsProviderState = 'ok' | 'stale' | 'unavailable' | 'partial' | 'loading' | 'denied';
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
    alertsTab: string;
    silencesTab: string;
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
    statusFiring: string;
    statusResolved: string;
    statusSuppressed: string;
    severityCritical: string;
    severityWarning: string;
    severityInfo: string;
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
    durationUnitDays: string;
    durationUnitHours: string;
    durationUnitMinutes: string;
    durationUnitSeconds: string;
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
export declare const DEFAULT_ALERT_OPS_COPY: Readonly<AlertOpsCopy>;
/** Merges host copy overrides over the English defaults. */
export declare function resolveAlertOpsCopy(overrides?: Partial<AlertOpsCopy>): AlertOpsCopy;
/** `{placeholder}` interpolation for templated copy entries. */
export declare function formatAlertOpsTemplate(template: string, params: Record<string, string | number>): string;
