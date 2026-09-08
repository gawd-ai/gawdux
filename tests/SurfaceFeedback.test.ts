import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SurfaceFeedback from '../src/lib/primitives/SurfaceFeedback.svelte';
import SurfaceFeedbackHarness from './fixtures/SurfaceFeedbackHarness.svelte';

afterEach(() => cleanup());

describe('surface feedback ownership', () => {
	it('keeps load failure, dismissable action, and standing notice distinct', async () => {
		const ondismiss = vi.fn();
		render(SurfaceFeedback, {
			props: {
				loadError: 'This record could not be loaded.',
				loadErrorAction: { label: 'Back to list', href: '/items' },
				actionError: 'The change was not saved.',
				notice: 'This record is archived.',
				ondismiss
			}
		});
		expect(screen.getAllByRole('alert')).toHaveLength(2);
		expect(screen.getByRole('status').textContent).toContain(
			'This record is archived.'
		);
		expect(
			screen.getByRole('link', { name: 'Back to list' }).getAttribute('href')
		).toBe('/items');
		const dismissals = screen.getAllByRole('button', {
			name: 'Dismiss message'
		});
		expect(dismissals).toHaveLength(1);
		await fireEvent.click(dismissals[0]);
		expect(ondismiss).toHaveBeenCalledOnce();
	});

	it('renders one strip inside the tabs and releases ownership when the tabs unmount', async () => {
		const ondismiss = vi.fn();
		const view = render(SurfaceFeedbackHarness, {
			props: {
				actionError: 'The change was not saved.',
				ondismiss
			}
		});
		expect(view.container.querySelectorAll('.surface-feedback')).toHaveLength(
			1
		);
		expect(
			screen.getByRole('alert').closest('.page-tabs-shell')
		).not.toBeNull();
		await fireEvent.click(
			screen.getByRole('button', { name: 'Dismiss message' })
		);
		expect(ondismiss).toHaveBeenCalledOnce();
		await view.rerender({ tabs: false });
		expect(view.container.querySelectorAll('.surface-feedback')).toHaveLength(
			1
		);
		expect(screen.getByRole('alert').closest('.page-tabs-shell')).toBeNull();
	});

	it('shows a standing notice inside tabs even when there is no error or divider', () => {
		const view = render(SurfaceFeedbackHarness, {
			props: { notice: 'This record is archived.' }
		});
		expect(view.container.querySelectorAll('.surface-feedback')).toHaveLength(
			1
		);
		expect(
			screen.getByRole('status').closest('.page-tabs-shell')
		).not.toBeNull();
		expect(screen.queryByRole('alert')).toBeNull();
	});
});
