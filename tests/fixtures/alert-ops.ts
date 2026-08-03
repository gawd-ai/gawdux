// Shared sanitized fixtures for the alert-ops component suites.
// No production data; product-neutral vocabulary only.

import type {
	AlertOpsAlert,
	AlertOpsData,
	AlertOpsGroup,
	AlertOpsProviderState,
	AlertOpsScope,
	AlertOpsSilence
} from '../../src/lib/alert-ops/types';

export const sampleScope: AlertOpsScope = {
	environments: [
		{ id: 'prod', label: 'Production' },
		{ id: 'staging', label: 'Staging' }
	],
	planes: [
		{ id: 'host-local', label: 'Host-local' },
		{ id: 'external', label: 'External' }
	]
};

export function makeAlert(overrides: Partial<AlertOpsAlert> = {}): AlertOpsAlert {
	return {
		fingerprint: 'abcdef0123456789',
		status: 'firing',
		severity: 'critical',
		service: 'api',
		summary: 'Database connection pool exhausted',
		startsAt: '2026-08-01T10:00:00Z',
		durationSeconds: 3_600,
		labels: { alertname: 'DbPoolExhausted', service: 'api' },
		annotations: { description: 'Pool saturated for five minutes' },
		links: [],
		...overrides
	};
}

export function makeGroup(overrides: Partial<AlertOpsGroup> = {}): AlertOpsGroup {
	return {
		key: '{service="api"}',
		labels: { service: 'api' },
		alerts: [makeAlert()],
		...overrides
	};
}

export function makeSilence(overrides: Partial<AlertOpsSilence> = {}): AlertOpsSilence {
	return {
		id: 'silence-1',
		state: 'active',
		matchers: [{ name: 'service', value: 'api', isRegex: false }],
		startsAt: '2026-08-01T08:00:00Z',
		endsAt: '2026-08-03T08:00:00Z',
		createdBy: 'ops@example.test',
		comment: 'Planned maintenance window',
		...overrides
	};
}

export function makeData(
	state: AlertOpsProviderState,
	groups: AlertOpsGroup[] = [],
	silences: AlertOpsSilence[] = []
): AlertOpsData {
	return {
		status: { state, lastSuccessfulRefresh: '2026-08-02T11:55:00Z' },
		groups,
		silences
	};
}
