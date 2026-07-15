import { cleanup, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';
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
		expect(screen.queryByText('Independent footer')).toBeNull();
	});
});
