import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MasterDetailShell from '../src/lib/primitives/MasterDetailShell.svelte';
import RailRowButton from '../src/lib/primitives/RailRowButton.svelte';

const rail = createRawSnippet(() => ({
	render: () => `
		<div>
			<button type="button" data-master-detail-row aria-current="true">Alpha</button>
			<button type="button" data-master-detail-row>Beta</button>
		</div>
	`
}));

const detail = createRawSnippet(() => ({
	render: () => '<h2>Current item</h2>'
}));

const rowLabel = createRawSnippet(() => ({
	render: () => '<span>Alpha</span>'
}));

describe('MasterDetailShell compact navigation', () => {
	afterEach(() => cleanup());

	beforeEach(() => {
		Object.defineProperty(window, 'matchMedia', {
			configurable: true,
			value: vi.fn().mockImplementation((query: string) => ({
				matches: query === '(max-width: 48rem)',
				media: query,
				onchange: null,
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
				addListener: vi.fn(),
				removeListener: vi.fn(),
				dispatchEvent: vi.fn()
			}))
		});
	});

	it('moves between one rail and detail pane while restoring focus', async () => {
		render(MasterDetailShell, {
			props: { rail, detail, detailKey: 'alpha', detailLabel: 'Item details' }
		});

		const detailRegion = screen.getByRole('region', { name: 'Item details' });
		const railRegion = screen.getByRole('complementary');
		await waitFor(() => expect(detailRegion.getAttribute('data-mobile-active')).toBe('true'));

		await fireEvent.click(screen.getByRole('button', { name: 'Back to list' }));
		expect(railRegion.getAttribute('data-mobile-active')).toBe('true');
		expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Alpha' }));

		await fireEvent.click(screen.getByRole('button', { name: 'Beta' }));
		expect(detailRegion.getAttribute('data-mobile-active')).toBe('true');
		expect(document.activeElement).toBe(detailRegion);
	});

	it('opens detail when an external action changes the detail identity', async () => {
		const view = render(MasterDetailShell, {
			props: { rail, detail, detailKey: 'alpha', detailLabel: 'Item details' }
		});

		await fireEvent.click(screen.getByRole('button', { name: 'Back to list' }));
		await view.rerender({ detailKey: 'new' });

		const detailRegion = screen.getByRole('region', { name: 'Item details' });
		await waitFor(() => expect(detailRegion.getAttribute('data-mobile-active')).toBe('true'));
		expect(document.activeElement).toBe(detailRegion);
	});

	it('marks shared rail rows for shell navigation delegation', () => {
		render(RailRowButton, { props: { selected: true, children: rowLabel } });
		expect(
			screen.getByRole('button', { name: 'Alpha' }).hasAttribute('data-master-detail-row')
		).toBe(true);
	});
});
