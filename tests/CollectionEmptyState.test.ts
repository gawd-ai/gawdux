import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import CollectionEmptyState from '../src/lib/primitives/CollectionEmptyState.svelte';

afterEach(() => cleanup());

describe('CollectionEmptyState', () => {
	it('renders an accessible empty collection with title, message and href action', () => {
		render(CollectionEmptyState, {
			props: {
				title: 'No records yet',
				message: 'Create the first record to get started.',
				actionLabel: 'New record',
				actionHref: '/app/records/new'
			}
		});

		const region = screen.getByRole('status');
		expect(region.getAttribute('data-collection-state')).toBe('empty');
		expect(region.getAttribute('aria-live')).toBe('polite');
		expect(screen.getByText('No records yet')).toBeTruthy();
		expect(screen.getByText('Create the first record to get started.')).toBeTruthy();
		const action = screen.getByRole('link', { name: 'New record' });
		expect(action.getAttribute('href')).toBe('/app/records/new');
	});

	it('renders the tighter no-results variant with a callback action', async () => {
		const onaction = vi.fn();
		render(CollectionEmptyState, {
			props: {
				title: 'Nothing matches these filters',
				variant: 'no-results',
				actionLabel: 'Clear filters',
				onaction
			}
		});

		const region = screen.getByRole('status');
		expect(region.getAttribute('data-collection-state')).toBe('no-results');
		await fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
		expect(onaction).toHaveBeenCalledOnce();
	});

	it('exposes a custom state marker for machine-readable assertions', () => {
		render(CollectionEmptyState, {
			props: { title: 'Loading failed', state: 'error' }
		});
		expect(screen.getByRole('status').getAttribute('data-collection-state')).toBe('error');
	});
});
