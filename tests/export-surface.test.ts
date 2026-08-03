import { describe, expect, it } from 'vitest';
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
