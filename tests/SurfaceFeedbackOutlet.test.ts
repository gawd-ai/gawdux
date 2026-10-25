import { flushSync, mount, unmount } from 'svelte';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import SurfaceFeedbackOutlet from '../src/lib/primitives/SurfaceFeedbackOutlet.svelte';
import SurfaceFeedbackOutletHarness from './fixtures/SurfaceFeedbackOutletHarness.svelte';

/**
 * The outlet is the strip's place in a panel that is not PageTabs. These cases
 * pin where the one strip renders: inside the panel while the outlet holds the
 * claim, back above it (the scaffold's own) while the outlet is inactive, and
 * never twice.
 */
let host: HTMLDivElement;
let app: Record<string, unknown> | null = null;

function mountHarness(props: Record<string, unknown>) {
	app = mount(SurfaceFeedbackOutletHarness, { target: host, props }) as Record<string, unknown>;
	flushSync();
	return app as { setActive: (value: boolean) => void };
}

/** Where each strip on the page sits: the panel holding it, or "scaffold". */
function stripPlaces(): string[] {
	return [...host.querySelectorAll('.surface-feedback')].map(
		(strip) => strip.closest('[data-panel]')?.getAttribute('data-panel') ?? 'scaffold'
	);
}

beforeEach(() => {
	host = document.createElement('div');
	document.body.appendChild(host);
});

afterEach(() => {
	if (app) unmount(app);
	app = null;
	host.remove();
});

describe('SurfaceFeedbackOutlet', () => {
	it('claims the strip and renders it where it is mounted', () => {
		mountHarness({ actionError: 'The record could not be saved.' });
		expect(stripPlaces()).toEqual(['first']);
		expect(host.querySelector('[data-panel="first"] .surface-feedback')?.textContent).toContain(
			'The record could not be saved.'
		);
	});

	it('renders nothing while there is nothing to say', () => {
		mountHarness({ actionError: null });
		expect(stripPlaces()).toEqual([]);
	});

	it('releases the claim while inactive and takes it back when active again', () => {
		const api = mountHarness({ actionError: 'The record could not be saved.' });
		api.setActive(false);
		flushSync();
		expect(stripPlaces()).toEqual(['scaffold']);

		api.setActive(true);
		flushSync();
		expect(stripPlaces()).toEqual(['first']);
	});

	it('gives a second outlet nothing: one strip per page', () => {
		mountHarness({ actionError: 'The record could not be saved.', second: true });
		expect(stripPlaces()).toEqual(['first']);
		expect(host.querySelector('[data-panel="second"]')?.childElementCount).toBe(0);
	});

	it('renders nothing outside a scaffold', () => {
		app = mount(SurfaceFeedbackOutlet, { target: host, props: {} }) as Record<string, unknown>;
		flushSync();
		expect(host.querySelector('.surface-feedback')).toBeNull();
	});
});
