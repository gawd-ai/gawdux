import { describe, expect, it } from 'vitest';
import pkg from '../package.json';
import * as alertOps from '../src/lib/alert-ops/index';
import * as primitives from '../src/lib/primitives/index';
import * as utils from '../src/lib/utils/index';

describe('gawdux 0.3.0 export surface', () => {
	it('exports the lifted primitives without dropping any pre-0.3.0 export', () => {
		// New in 0.3.0
		for (const name of [
			'CollectionEmptyState',
			'CommandPalette',
			'ConfirmationCommandSurface',
			'CurrencyCell',
			'DeferredLoadingIndicator',
			'DEFERRED_LOADING_DELAY_MS',
			'DiscardNavigationCommandSurface',
			'MessageHost',
			'PasswordWithRequirements',
			'createPageCommandBarRegistry'
		] as const) {
			expect(primitives[name], `primitives must export ${name}`).toBeDefined();
		}
		// Pre-existing surface stays intact (spot checks across the family).
		for (const name of [
			'BreadcrumbTrail',
			'ConfirmModal',
			'EmptyStateRow',
			'ListPageScaffold',
			'MasterDetailShell',
			'PageCommandBar',
			'PageFeedback',
			'PageTabs',
			'StatusBadge',
			'TabTitle',
			'PAGE_COMMAND_BAR_CONTEXT',
			'EMPTY_PAGE_COMMAND_BAR_SLOTS'
		] as const) {
			expect(primitives[name], `primitives must keep exporting ${name}`).toBeDefined();
		}
	});

	it('exports the lifted utils without dropping any pre-0.3.0 export', () => {
		for (const name of [
			'MessageCenter',
			'createMessageCenter',
			'createDocumentVisibilitySource',
			'createStorageHiddenConditionPersistence',
			'DEFAULT_MESSAGE_LIFETIMES_MS',
			'APP_MESSAGE_CENTER_CONTEXT',
			'getAppMessageCenter',
			'DiscardNavigationController',
			'DISCARD_NAVIGATION_CONTEXT',
			'navigationTargets',
			'useGuardedGoto'
		] as const) {
			expect(utils[name], `utils must export ${name}`).toBeDefined();
		}
		for (const name of [
			'createSidebarConfig',
			'createEditMode',
			'initListState',
			'createBreadcrumbBuilder',
			'createCancellableScheduler',
			'isBrowser'
		] as const) {
			expect(utils[name], `utils must keep exporting ${name}`).toBeDefined();
		}
	});

	it('keeps the message-center default lifetimes at the platform contract', () => {
		expect(utils.DEFAULT_MESSAGE_LIFETIMES_MS).toEqual({
			success: 4_000,
			info: 6_000,
			warning: null,
			error: null
		});
	});
});

describe('gawdux 0.4.0 export surface (alert-ops)', () => {
	it('exports the alert-ops components and helpers', () => {
		for (const name of [
			'AlertOpsConsole',
			'AlertDetailPanel',
			'AlertGroupTable',
			'FilterRail',
			'ProviderHealthBar',
			'SilenceTable',
			'DEFAULT_ALERT_OPS_COPY',
			'resolveAlertOpsCopy',
			'formatAlertOpsTemplate',
			'resolveAlertOpsView',
			'resolveAlertOpsCollection',
			'hasActiveAlertOpsFilters',
			'alertSeverityBadgeColor',
			'providerStateBadgeColor',
			'formatAlertOpsDuration',
			'formatAlertOpsRelativeTime',
			'formatAlertOpsTimestamp',
			'shortAlertFingerprint',
			'createAlertOpsPoller'
		] as const) {
			expect(alertOps[name], `alert-ops must export ${name}`).toBeDefined();
		}
	});

	it('adds the ./alert-ops subpath additively, leaving every existing export entry unchanged', () => {
		expect(pkg.exports['./alert-ops']).toEqual({
			types: './dist/alert-ops/index.d.ts',
			svelte: './dist/alert-ops/index.js',
			default: './dist/alert-ops/index.js'
		});

		// The pre-0.4.0 subpaths remain byte-identical.
		expect(pkg.exports['.']).toEqual({
			types: './dist/index.d.ts',
			svelte: './dist/index.js',
			default: './dist/index.js'
		});
		expect(pkg.exports['./components']).toEqual({
			types: './dist/components/index.d.ts',
			svelte: './dist/components/index.js',
			default: './dist/components/index.js'
		});
		expect(pkg.exports['./primitives']).toEqual({
			types: './dist/primitives/index.d.ts',
			svelte: './dist/primitives/index.js',
			default: './dist/primitives/index.js'
		});
		expect(pkg.exports['./types']).toEqual({
			types: './dist/types/index.d.ts',
			default: './dist/types/index.js'
		});
		expect(pkg.exports['./utils']).toEqual({
			types: './dist/utils/index.d.ts',
			default: './dist/utils/index.js'
		});
		expect(pkg.exports['./styles/tokens.css']).toBe('./dist/styles/tokens.css');
		expect(Object.keys(pkg.exports).sort()).toEqual(
			[
				'.',
				'./alert-ops',
				'./components',
				'./primitives',
				'./styles/tokens.css',
				'./types',
				'./utils'
			].sort()
		);
	});
});
