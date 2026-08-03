import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import FilterRail from '../src/lib/alert-ops/FilterRail.svelte';
import { sampleScope } from './fixtures/alert-ops';

afterEach(() => cleanup());

describe('FilterRail', () => {
	it('emits the next filters object from every control', async () => {
		const onchange = vi.fn();
		render(FilterRail, { props: { scope: sampleScope, filters: {}, onchange } });

		await fireEvent.change(screen.getByLabelText('Environment'), { target: { value: 'prod' } });
		expect(onchange).toHaveBeenLastCalledWith({ environmentId: 'prod' });

		await fireEvent.change(screen.getByLabelText('Plane'), { target: { value: 'external' } });
		expect(onchange).toHaveBeenLastCalledWith({ environmentId: 'prod', planeId: 'external' });

		await fireEvent.click(screen.getByRole('button', { name: 'Firing' }));
		expect(onchange).toHaveBeenLastCalledWith({
			environmentId: 'prod',
			planeId: 'external',
			states: ['firing']
		});

		await fireEvent.click(screen.getByRole('button', { name: 'Critical' }));
		expect(onchange).toHaveBeenLastCalledWith({
			environmentId: 'prod',
			planeId: 'external',
			states: ['firing'],
			severities: ['critical']
		});

		await fireEvent.input(screen.getByLabelText('Service'), { target: { value: 'api' } });
		expect(onchange).toHaveBeenLastCalledWith({
			environmentId: 'prod',
			planeId: 'external',
			states: ['firing'],
			severities: ['critical'],
			service: 'api'
		});

		await fireEvent.input(screen.getByLabelText('Search'), { target: { value: 'pool' } });
		expect(onchange).toHaveBeenLastCalledWith({
			environmentId: 'prod',
			planeId: 'external',
			states: ['firing'],
			severities: ['critical'],
			service: 'api',
			text: 'pool'
		});
	});

	it('toggles multi-select buttons with aria-pressed and removes emptied keys', async () => {
		const onchange = vi.fn();
		render(FilterRail, { props: { scope: sampleScope, filters: {}, onchange } });

		const firing = screen.getByRole('button', { name: 'Firing' });
		expect(firing.getAttribute('aria-pressed')).toBe('false');

		await fireEvent.click(firing);
		expect(firing.getAttribute('aria-pressed')).toBe('true');
		expect(onchange).toHaveBeenLastCalledWith({ states: ['firing'] });

		await fireEvent.click(firing);
		expect(firing.getAttribute('aria-pressed')).toBe('false');
		// The states key disappears entirely instead of lingering as [].
		expect(onchange).toHaveBeenLastCalledWith({});
	});

	it('clears scalar keys when a control empties out', async () => {
		const onchange = vi.fn();
		render(FilterRail, {
			props: { scope: sampleScope, filters: { environmentId: 'prod', service: 'api' }, onchange }
		});

		await fireEvent.change(screen.getByLabelText('Environment'), { target: { value: '' } });
		expect(onchange).toHaveBeenLastCalledWith({ service: 'api' });

		await fireEvent.input(screen.getByLabelText('Service'), { target: { value: '' } });
		expect(onchange).toHaveBeenLastCalledWith({});
	});

	it('labels every control for keyboard and assistive access', () => {
		render(FilterRail, { props: { scope: sampleScope, filters: {} } });
		expect(screen.getByLabelText('Environment').tagName).toBe('SELECT');
		expect(screen.getByLabelText('Plane').tagName).toBe('SELECT');
		expect(screen.getByLabelText('Service').tagName).toBe('INPUT');
		expect(screen.getByLabelText('Search').tagName).toBe('INPUT');
		// The toggle groups expose accessible group names.
		expect(screen.getByRole('group', { name: 'State' })).toBeTruthy();
		expect(screen.getByRole('group', { name: 'Severity' })).toBeTruthy();
	});
});
