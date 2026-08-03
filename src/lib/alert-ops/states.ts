// gawdux/alert-ops — surface-state derivation and pure rendering helpers.
//
// The console distinguishes seven explicit states, all driven purely by the
// props the host passes down:
//   loading      — provider state 'loading': deferred spinner, no data shell.
//   denied       — provider state 'denied': permission message, no skeletons.
//   unavailable  — provider state 'unavailable': error panel + retry.
//   stale        — provider state 'stale': banner over the last-good data.
//   partial      — provider state 'partial': per-section banners over data.
//   empty        — content shown, zero alerts, no result filters active.
//   no-results   — content shown, zero alerts, result filters active.

import type { StatusBadgeColor } from '../primitives/StatusBadge.svelte';
import {
	formatAlertOpsTemplate,
	type AlertOpsAlertStatus,
	type AlertOpsCopy,
	type AlertOpsFilters,
	type AlertOpsProviderState
} from './types';

export type AlertOpsViewKind = 'loading' | 'denied' | 'unavailable' | 'content';

export interface AlertOpsView {
	kind: AlertOpsViewKind;
	/** Content is last-good data; render the stale banner above it. */
	stale: boolean;
	/** Content is incomplete; render the per-section partial banners. */
	partial: boolean;
}

export function resolveAlertOpsView(state: AlertOpsProviderState): AlertOpsView {
	switch (state) {
		case 'loading':
			return { kind: 'loading', stale: false, partial: false };
		case 'denied':
			return { kind: 'denied', stale: false, partial: false };
		case 'unavailable':
			return { kind: 'unavailable', stale: false, partial: false };
		case 'stale':
			return { kind: 'content', stale: true, partial: false };
		case 'partial':
			return { kind: 'content', stale: false, partial: true };
		default:
			return { kind: 'content', stale: false, partial: false };
	}
}

export type AlertOpsCollectionState = 'empty' | 'no-results' | 'rows';

/**
 * Environment/plane are scope pickers, not result filters: an empty scope
 * without state/severity/service/text narrowing is genuinely "empty", not
 * "no results".
 */
export function hasActiveAlertOpsFilters(filters: AlertOpsFilters | null | undefined): boolean {
	if (!filters) return false;
	return Boolean(
		(filters.states && filters.states.length > 0) ||
			(filters.severities && filters.severities.length > 0) ||
			(filters.service && filters.service.trim() !== '') ||
			(filters.text && filters.text.trim() !== '')
	);
}

export function resolveAlertOpsCollection(
	alertCount: number,
	filtersActive: boolean
): AlertOpsCollectionState {
	if (alertCount > 0) return 'rows';
	return filtersActive ? 'no-results' : 'empty';
}

/**
 * Expiry applies only to a silence that is still running or scheduled — an
 * already-expired silence has nothing left to expire, so no control is
 * rendered for it even when the host gated mutation on. Allow-list by
 * design: an unrecognized state is never assumed expirable.
 */
export function canExpireAlertOpsSilence(state: string): boolean {
	const normalized = state.trim().toLowerCase();
	return normalized === 'active' || normalized === 'pending';
}

// ---------- StatusBadge color mappings ----------

export function alertSeverityBadgeColor(severity: string): StatusBadgeColor {
	switch (severity.trim().toLowerCase()) {
		case 'critical':
			return 'red';
		case 'warning':
			return 'yellow';
		case 'info':
			return 'blue';
		default:
			return 'dark';
	}
}

export function alertStatusBadgeColor(status: AlertOpsAlertStatus): StatusBadgeColor {
	switch (status) {
		case 'firing':
			return 'red';
		case 'resolved':
			return 'green';
		default:
			return 'dark';
	}
}

export function providerStateBadgeColor(state: AlertOpsProviderState): StatusBadgeColor {
	switch (state) {
		case 'ok':
			return 'green';
		case 'loading':
			return 'blue';
		case 'stale':
		case 'partial':
			return 'yellow';
		case 'unavailable':
			return 'red';
		default:
			return 'dark';
	}
}

export function silenceStateBadgeColor(state: string): StatusBadgeColor {
	switch (state.trim().toLowerCase()) {
		case 'active':
			return 'green';
		case 'pending':
			return 'yellow';
		default:
			return 'dark';
	}
}

// ---------- Localized labels ----------

export function providerStateLabel(state: AlertOpsProviderState, copy: AlertOpsCopy): string {
	switch (state) {
		case 'ok':
			return copy.providerStateOk;
		case 'stale':
			return copy.providerStateStale;
		case 'unavailable':
			return copy.providerStateUnavailable;
		case 'partial':
			return copy.providerStatePartial;
		case 'loading':
			return copy.providerStateLoading;
		default:
			return copy.providerStateDenied;
	}
}

export function alertStatusLabel(status: AlertOpsAlertStatus, copy: AlertOpsCopy): string {
	switch (status) {
		case 'firing':
			return copy.statusFiring;
		case 'resolved':
			return copy.statusResolved;
		default:
			return copy.statusSuppressed;
	}
}

/** Known severities localize through copy; unknown values pass through. */
export function alertSeverityLabel(severity: string, copy: AlertOpsCopy): string {
	switch (severity.trim().toLowerCase()) {
		case 'critical':
			return copy.severityCritical;
		case 'warning':
			return copy.severityWarning;
		case 'info':
			return copy.severityInfo;
		default:
			return severity;
	}
}

/** Known silence states localize through copy; unknown values pass through. */
export function silenceStateLabel(state: string, copy: AlertOpsCopy): string {
	switch (state.trim().toLowerCase()) {
		case 'active':
			return copy.silenceStateActive;
		case 'pending':
			return copy.silenceStatePending;
		case 'expired':
			return copy.silenceStateExpired;
		default:
			return state;
	}
}

// ---------- Formatting ----------

/**
 * Timezone-safe timestamp, DateCell-consistent (UTC ISO derivation):
 * `2026-08-02 14:03:11Z`. Unparseable input renders as authored.
 */
export function formatAlertOpsTimestamp(iso: string): string {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return iso;
	return `${date.toISOString().slice(0, 19).replace('T', ' ')}Z`;
}

/** Humanized duration with the two largest units: `3d 4h`, `2h 5m`, `45s`. */
export function formatAlertOpsDuration(totalSeconds: number, copy: AlertOpsCopy): string {
	if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return '';
	const seconds = Math.floor(totalSeconds);
	const days = Math.floor(seconds / 86_400);
	const hours = Math.floor((seconds % 86_400) / 3_600);
	const minutes = Math.floor((seconds % 3_600) / 60);
	const rest = seconds % 60;
	const d = copy.durationUnitDays;
	const h = copy.durationUnitHours;
	const m = copy.durationUnitMinutes;
	const s = copy.durationUnitSeconds;
	if (days > 0) return hours > 0 ? `${days}${d} ${hours}${h}` : `${days}${d}`;
	if (hours > 0) return minutes > 0 ? `${hours}${h} ${minutes}${m}` : `${hours}${h}`;
	if (minutes > 0) return rest > 0 ? `${minutes}${m} ${rest}${s}` : `${minutes}${m}`;
	return `${seconds}${s}`;
}

/** "just now" / "{n} min ago" / … against an injected `now` for testability. */
export function formatAlertOpsRelativeTime(
	iso: string | undefined,
	now: number | Date,
	copy: AlertOpsCopy
): string {
	if (!iso) return copy.lastRefreshNever;
	const then = new Date(iso).getTime();
	if (Number.isNaN(then)) return copy.lastRefreshNever;
	const nowMs = now instanceof Date ? now.getTime() : now;
	const elapsedMs = Math.max(0, nowMs - then);
	if (elapsedMs < 60_000) return copy.refreshedJustNow;
	const minutes = Math.floor(elapsedMs / 60_000);
	if (minutes < 60) return formatAlertOpsTemplate(copy.refreshedMinutesAgo, { minutes });
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return formatAlertOpsTemplate(copy.refreshedHoursAgo, { hours });
	return formatAlertOpsTemplate(copy.refreshedDaysAgo, { days: Math.floor(hours / 24) });
}

/** Short correlation code for dense rows; render the full value in `title`. */
export function shortAlertFingerprint(fingerprint: string): string {
	return fingerprint.length <= 8 ? fingerprint : fingerprint.slice(0, 8);
}
