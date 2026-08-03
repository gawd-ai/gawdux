import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ProviderHealthBar from '../src/lib/alert-ops/ProviderHealthBar.svelte';

afterEach(() => cleanup());

const NOW = new Date('2026-08-02T12:00:00Z');

describe('ProviderHealthBar', () => {
	it('shows scope labels, the status pill, and relative last refresh from the injected clock', () => {
		render(ProviderHealthBar, {
			props: {
				status: { state: 'ok', lastSuccessfulRefresh: '2026-08-02T11:55:00Z' },
				environmentLabel: 'Production',
				planeLabel: 'Host-local',
				now: NOW
			}
		});
		expect(screen.getByTestId('alert-ops-environment').textContent?.trim()).toBe('Production');
		expect(screen.getByTestId('alert-ops-plane').textContent?.trim()).toBe('Host-local');
		expect(screen.getByTestId('alert-ops-provider-state').textContent).toContain('Connected');
		expect(screen.getByTestId('alert-ops-last-refresh').textContent).toContain('5 min ago');
	});

	it('falls back to all-scope labels and "never" without scope or refresh data', () => {
		render(ProviderHealthBar, { props: { status: { state: 'denied' }, now: NOW } });
		expect(screen.getByTestId('alert-ops-environment').textContent?.trim()).toBe(
			'All environments'
		);
		expect(screen.getByTestId('alert-ops-plane').textContent?.trim()).toBe('All planes');
		expect(screen.getByTestId('alert-ops-provider-state').textContent).toContain('Denied');
		expect(screen.getByTestId('alert-ops-last-refresh').textContent).toContain('never');
	});

	it('enables Refresh normally and invokes onrefresh on click', async () => {
		const onrefresh = vi.fn();
		render(ProviderHealthBar, {
			props: { status: { state: 'ok' }, now: NOW, onrefresh }
		});
		const button = screen.getByTestId('alert-ops-refresh') as HTMLButtonElement;
		expect(button.disabled).toBe(false);
		await fireEvent.click(button);
		expect(onrefresh).toHaveBeenCalledOnce();
	});

	it('disables Refresh while the provider is loading', () => {
		render(ProviderHealthBar, {
			props: { status: { state: 'loading' }, now: NOW, onrefresh: vi.fn() }
		});
		// jsdom still dispatches synthetic clicks on disabled buttons, so the
		// disabled attribute itself is the browser-facing contract.
		expect((screen.getByTestId('alert-ops-refresh') as HTMLButtonElement).disabled).toBe(true);
	});

	it('disables Refresh while a host-driven refresh is in flight', () => {
		render(ProviderHealthBar, {
			props: { status: { state: 'ok' }, now: NOW, refreshing: true }
		});
		expect((screen.getByTestId('alert-ops-refresh') as HTMLButtonElement).disabled).toBe(true);
	});

	it('surfaces the sanitized provider error when present', () => {
		render(ProviderHealthBar, {
			props: { status: { state: 'stale', error: 'upstream timed out' }, now: NOW }
		});
		expect(screen.getByTestId('alert-ops-provider-error').textContent).toContain(
			'upstream timed out'
		);
	});
});
