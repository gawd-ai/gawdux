/** Strict neutral consumer of the compiled package's public entrypoints only. */
import type { Component, ComponentProps, Snippet } from 'svelte';
import {
	UserMenu,
	type UserMenuPresentation,
	type UserMenuProps
} from 'gawdux';
import type { UserMenuPresentation as MenuPresentationFromTypes } from 'gawdux/types';
import {
	ConfirmationCommandSurface,
	DiscardNavigationCommandSurface,
	type ConfirmationCommandPresentationProps,
	type DiscardNavigationCommandPresentationProps,
	type DiscardNavigationCommandSurfaceProps
} from 'gawdux/primitives';
import {
	buildUtcDaySeries,
	sampleSeriesTicks,
	createSavedViewActions,
	createDisclosureController,
	activateFocusScope,
	slideFadeIn,
	slideFadeOut,
	calendarDateOf,
	formatCalendarDate,
	isValidTimeZone,
	todayInZone,
	formatDate,
	formatRelativeDate,
	formatAbsoluteDateTime,
	formatAuditDateTime,
	formatAuditDateTimeText,
	type UtcDaySeriesOptions,
	type UtcDaySeriesRow,
	type SavedViewActionPorts,
	type SavedViewActionRecord,
	type DisclosurePorts,
	type DisclosureController,
	type FocusScopePorts,
	type AuditDateTimeParts
} from 'gawdux/utils';

interface View extends SavedViewActionRecord {
	revision: number;
}
function isView(value: unknown): value is View {
	if (!value || typeof value !== 'object') return false;
	return (
		'id' in value &&
		typeof value.id === 'string' &&
		'name' in value &&
		typeof value.name === 'string' &&
		'pageKey' in value &&
		typeof value.pageKey === 'string' &&
		'query' in value &&
		typeof value.query === 'object' &&
		value.query !== null &&
		!Array.isArray(value.query) &&
		Object.values(value.query).every((entry) => typeof entry === 'string') &&
		'revision' in value &&
		typeof value.revision === 'number'
	);
}

export function publicUtilitiesFixture(
	root: HTMLElement,
	trigger: HTMLElement,
	document: Document,
	eventTarget: EventTarget
) {
	const dayOptions: UtcDaySeriesOptions<{ day: string; count: number }> = {
		rows: [{ day: '2026-10-16', count: 7 }],
		dayOf: (row) => row.day,
		days: 2,
		now: new Date('2026-10-16T12:00:00Z'),
		locale: 'en-US'
	};
	const days: UtcDaySeriesRow<{ day: string; count: number }>[] =
		buildUtcDaySeries(dayOptions);
	const ticks = sampleSeriesTicks(days, 2);
	let open = false;
	const disclosurePorts: DisclosurePorts = {
		isOpen: () => open,
		setOpen: (next) => {
			open = next;
		},
		root: () => root,
		trigger: () => trigger
	};
	const disclosure: DisclosureController =
		createDisclosureController(disclosurePorts);
	const focusPorts: FocusScopePorts = {
		document,
		eventTarget,
		root: () => root,
		background: () => [],
		initialFocus: () => trigger,
		onEscape: () => disclosure.close({ restoreFocus: true }),
		onLink: () => disclosure.close()
	};
	let views: View[] = [];
	const savedPorts: SavedViewActionPorts<View> = {
		currentKey: () => 'principal:1',
		pageKey: () => 'records',
		currentQuery: () => ({ q: 'active' }),
		views: () => views,
		changed: (next) => {
			views = next;
		},
		error: () => {},
		request: async (_method, body) => ({
			view: {
				id: 'view-1',
				name: body.name,
				pageKey: 'records',
				query: { q: 'active' },
				revision: 1
			}
		}),
		isView,
		errorMessage: (_error, operation) => `Could not ${operation}.`
	};
	const saved = createSavedViewActions(savedPorts);
	const audit: AuditDateTimeParts = formatAuditDateTime(
		'2026-10-16T12:00:00Z',
		{ timeZone: 'UTC' }
	);
	return {
		days,
		ticks,
		disclosure,
		saved,
		views: () => views,
		bind: () => disclosure.bind(eventTarget),
		scope: () => activateFocusScope(focusPorts),
		transitionIn: () => slideFadeIn(root, { duration: 0 }),
		transitionOut: () => slideFadeOut(root, { duration: 0 }),
		calendar: calendarDateOf('2026-10-16'),
		calendarLabel: formatCalendarDate('2026-10-16'),
		validZone: isValidTimeZone('UTC'),
		today: todayInZone('UTC', dayOptions.now),
		date: formatDate('2026-10-16'),
		relative: formatRelativeDate('2026-10-16'),
		absolute: formatAbsoluteDateTime('2026-10-16'),
		audit,
		auditText: formatAuditDateTimeText('2026-10-16T12:00:00Z', {
			timeZone: 'UTC'
		})
	};
}

export function publicPresentationFixture(
	discardPresenter: Component<DiscardNavigationCommandPresentationProps>,
	confirmationPresenter: Component<ConfirmationCommandPresentationProps>,
	accountPresenter: Snippet<[UserMenuPresentation]>
) {
	const discard: DiscardNavigationCommandSurfaceProps = {
		request: {
			message: 'Leave this draft?',
			confirmLabel: 'Continue',
			continue: async () => {}
		},
		presentation: discardPresenter,
		oncancel: () => {},
		oncomplete: () => {}
	};
	const discardProps: ComponentProps<typeof DiscardNavigationCommandSurface> =
		discard;
	const confirmationProps: ComponentProps<typeof ConfirmationCommandSurface> = {
		request: null,
		presentation: confirmationPresenter,
		onconfirm: () => {},
		oncancel: () => {}
	};
	const account: UserMenuProps = {
		name: 'Ada Lovelace',
		presentation: accountPresenter
	};
	const accountProps: ComponentProps<typeof UserMenu> = account;
	const equivalent: Snippet<[MenuPresentationFromTypes]> = accountPresenter;
	return { discardProps, confirmationProps, accountProps, equivalent };
}
