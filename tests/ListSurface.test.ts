import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ListPaginationNav from '../src/lib/primitives/ListPaginationNav.svelte';
import ListSurfaceHarness from './fixtures/ListSurfaceHarness.svelte';

afterEach(() => cleanup());

describe('ListSurface pagination', () => {
	it('suppresses empty pagination without suppressing independent command-bar content', () => {
		render(ListSurfaceHarness, { props: { total: 0 } });

		expect(screen.getByRole('button', { name: 'Independent action' })).toBeTruthy();
		expect(screen.getByText('Independent footer')).toBeTruthy();
		expect(screen.queryByRole('button', { name: 'Previous page' })).toBeNull();
	});

	it('keeps non-empty declarative pagination ahead of the legacy footer slot', () => {
		render(ListSurfaceHarness, { props: { total: 3 } });

		expect(screen.getByRole('button', { name: 'Independent action' })).toBeTruthy();
		expect(screen.getByRole('button', { name: 'Previous page' })).toBeTruthy();
		expect(screen.getByText('3 / 3')).toBeTruthy();
		expect(screen.queryByText('Independent footer')).toBeNull();
	});

	it('renders unknown-total cursor pagination without changing the exact-total contract', () => {
		render(ListSurfaceHarness, { props: { total: 3, cursor: true } });

		expect(screen.getByText('3 shown')).toBeTruthy();
		expect(screen.getByRole('button', { name: 'Previous page' })).toHaveProperty('disabled', true);
		expect(screen.getByRole('button', { name: 'Next page' })).toHaveProperty('disabled', false);
		expect(screen.queryByText('Independent footer')).toBeNull();
	});

	it('reports the truthful visible count and invokes only available directions', async () => {
		const onPrevious = vi.fn();
		const onNext = vi.fn();
		render(ListPaginationNav, {
			props: {
				mode: 'cursor',
				visibleCount: 25,
				hasPrevious: true,
				hasNext: false,
				onPrevious,
				onNext,
				scrollTargetSelector: null
			}
		});

		expect(screen.getByText('25 shown')).toBeTruthy();
		await fireEvent.click(screen.getByRole('button', { name: 'Previous page' }));
		await fireEvent.click(screen.getByRole('button', { name: 'Next page' }));

		expect(onPrevious).toHaveBeenCalledOnce();
		expect(onNext).not.toHaveBeenCalled();
	});
});
