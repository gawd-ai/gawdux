import type { StatusBadgeColor } from '../primitives/StatusBadge.svelte';
import { type AlertOpsAlertStatus, type AlertOpsCopy, type AlertOpsFilters, type AlertOpsProviderState } from './types';
export type AlertOpsViewKind = 'loading' | 'denied' | 'unavailable' | 'content';
export interface AlertOpsView {
    kind: AlertOpsViewKind;
    /** Content is last-good data; render the stale banner above it. */
    stale: boolean;
    /** Content is incomplete; render the per-section partial banners. */
    partial: boolean;
}
export declare function resolveAlertOpsView(state: AlertOpsProviderState): AlertOpsView;
export type AlertOpsCollectionState = 'empty' | 'no-results' | 'rows';
/**
 * Environment/plane are scope pickers, not result filters: an empty scope
 * without state/severity/service/text narrowing is genuinely "empty", not
 * "no results".
 */
export declare function hasActiveAlertOpsFilters(filters: AlertOpsFilters | null | undefined): boolean;
export declare function resolveAlertOpsCollection(alertCount: number, filtersActive: boolean): AlertOpsCollectionState;
export declare function alertSeverityBadgeColor(severity: string): StatusBadgeColor;
export declare function alertStatusBadgeColor(status: AlertOpsAlertStatus): StatusBadgeColor;
export declare function providerStateBadgeColor(state: AlertOpsProviderState): StatusBadgeColor;
export declare function silenceStateBadgeColor(state: string): StatusBadgeColor;
export declare function providerStateLabel(state: AlertOpsProviderState, copy: AlertOpsCopy): string;
export declare function alertStatusLabel(status: AlertOpsAlertStatus, copy: AlertOpsCopy): string;
/** Known severities localize through copy; unknown values pass through. */
export declare function alertSeverityLabel(severity: string, copy: AlertOpsCopy): string;
/** Known silence states localize through copy; unknown values pass through. */
export declare function silenceStateLabel(state: string, copy: AlertOpsCopy): string;
/**
 * Timezone-safe timestamp, DateCell-consistent (UTC ISO derivation):
 * `2026-08-02 14:03:11Z`. Unparseable input renders as authored.
 */
export declare function formatAlertOpsTimestamp(iso: string): string;
/** Humanized duration with the two largest units: `3d 4h`, `2h 5m`, `45s`. */
export declare function formatAlertOpsDuration(totalSeconds: number, copy: AlertOpsCopy): string;
/** "just now" / "{n} min ago" / … against an injected `now` for testability. */
export declare function formatAlertOpsRelativeTime(iso: string | undefined, now: number | Date, copy: AlertOpsCopy): string;
/** Short correlation code for dense rows; render the full value in `title`. */
export declare function shortAlertFingerprint(fingerprint: string): string;
