import { cleanup, fireEvent, render, screen, within } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Host from './fixtures/AiUsageReportHost.svelte';

afterEach(() => cleanup());

function model() {
	return {
		totals: { turns: 9, tokens: 3750 },
		daily: [
			{ day: '2026-10-05', turns: 0, tokens: 0 },
			{ day: '2026-10-06', turns: 3, tokens: 1250 },
			{ day: '2026-10-07', turns: 6, tokens: 2500 }
		],
		days: 30,
		breakdowns: [
			{
				id: 'agents',
				title: 'By agent',
				rows: [
					{
						key: 'active',
						label: 'Active agent',
						turns: 9,
						tokens: 3750,
						note: 'Host-authorized detail'
					},
					{ key: 'quiet', label: 'Quiet agent', turns: 0, tokens: 0 }
				]
			},
			{ id: 'teams', title: 'By team', rows: [] }
		]
	};
}

describe('public usage-report presentation in an independent host', () => {
	it('replaces only opted-in presentation while retaining shared breakdowns and shares', () => {
		const { container } = render(Host, { props: { model: model() } });
		expect(screen.getByLabelText('Host overview').textContent).toContain(
			'9 activities'
		);
		expect(screen.getByLabelText('Host activity').textContent).toContain(
			'30 days'
		);
		expect(container.querySelector('.stat-tile')).toBeNull();
		expect(container.querySelector('[data-ai-usage-bars]')).toBeNull();
		expect(screen.queryByText('Tokens per day')).toBeNull();
		expect(screen.getByText('By agent')).toBeTruthy();
		expect(screen.getByText('By team')).toBeTruthy();
		expect(container.querySelector('[data-ai-usage-report]')?.className).toBe(
			'ai-usage-report space-y-4'
		);
		const rows = container.querySelector('[data-ai-usage-breakdown="agents"]')!;
		expect(rows.className).toBe('space-y-3');
		expect(rows.closest('.grid')?.className).toBe(
			'grid grid-cols-1 gap-4 lg:grid-cols-2'
		);
		const bars = rows.querySelectorAll<HTMLElement>('.rounded-full.h-full');
		expect([...bars].map((bar) => bar.style.width)).toEqual(['100%', '0%']);
	});

	it('hands the exact row to a direct sibling snippet without implicit disclosure', async () => {
		const { container, rerender } = render(Host, { props: { model: model() } });
		const value = container.querySelector<HTMLElement>(
			'[data-host-row="active"]'
		)!;
		expect(value.textContent).toContain('3,750 units');
		expect(value.title).toBe('Host value for active');
		expect(value.parentElement?.firstElementChild?.textContent).toBe(
			'Active agent'
		);
		expect(value.parentElement?.className).toBe(
			'flex items-baseline justify-between gap-3 text-sm'
		);
		expect(container.textContent).not.toContain('Host-authorized detail');
		expect(value.className).toBe('host-row-value');
		await rerender({ model: model(), disclose: true });
		expect(
			container.querySelector('[data-host-row="active"]')?.textContent
		).toContain('Host-authorized detail');
	});

	it('keeps no-hook public labels, counts, notes, default spacing and window intents', async () => {
		const onwindow = vi.fn();
		const { container } = render(Host, {
			props: { model: model(), customPresentation: false, onwindow }
		});
		expect(container.querySelector('[data-host-summary]')).toBeNull();
		expect(container.querySelector('[data-host-row]')).toBeNull();
		const summary = within(screen.getByRole('group', { name: 'AI activity' }));
		expect(summary.getByText('Turns')).toBeTruthy();
		expect(summary.getByText('Tokens')).toBeTruthy();
		expect(screen.getByText('3.8k').getAttribute('title')).toBe('3,750 tokens');
		expect(screen.getByText('Tokens per day')).toBeTruthy();
		expect(screen.getAllByRole('meter')).toHaveLength(3);
		expect(container.textContent).toContain('9 turns · 3.8k tokens');
		expect(container.textContent).toContain('Host-authorized detail');
		expect(container.querySelector('[data-ai-usage-report]')?.className).toBe(
			'ai-usage-report space-y-3'
		);
		const rows = container.querySelector('[data-ai-usage-breakdown="agents"]')!;
		expect(rows.className).toBe('space-y-2.5');
		expect(rows.closest('.grid')?.className).toBe(
			'grid grid-cols-1 gap-3 xl:grid-cols-2'
		);
		await fireEvent.click(screen.getByRole('button', { name: '7 days' }));
		expect(onwindow).toHaveBeenCalledExactlyOnceWith(7);
	});

	it('does not invent usage when the host has no report capability', () => {
		const { container } = render(Host, { props: { model: null } });
		expect(container.querySelector('[data-ai-usage-report]')).toBeNull();
		expect(container.textContent?.trim()).toBe('');
	});

	it('keeps each hook independently optional without disabling other presentation', () => {
		const summary = render(Host, {
			props: { model: model(), omitSummary: true }
		});
		expect(summary.container.querySelector('.stat-tile')).not.toBeNull();
		expect(
			summary.container.querySelector('[data-host-activity]')
		).not.toBeNull();
		expect(summary.container.querySelector('[data-host-row]')).not.toBeNull();
		cleanup();
		const activity = render(Host, {
			props: { model: model(), omitActivity: true }
		});
		expect(
			activity.container.querySelector('[data-ai-usage-bars]')
		).not.toBeNull();
		expect(
			activity.container.querySelector('[data-host-summary]')
		).not.toBeNull();
		expect(activity.container.querySelector('[data-host-row]')).not.toBeNull();
		cleanup();
		const rows = render(Host, {
			props: { model: model(), omitRowValue: true }
		});
		expect(rows.container.querySelector('[data-host-row]')).toBeNull();
		expect(rows.container.textContent).toContain('9 turns · 3.8k tokens');
		expect(rows.container.querySelector('[data-host-summary]')).not.toBeNull();
		expect(rows.container.querySelector('[data-host-activity]')).not.toBeNull();
	});

	it('updates host snippets and shared shares from the latest supplied model', async () => {
		const { container, rerender } = render(Host, { props: { model: model() } });
		const updated = model();
		updated.days = 7;
		updated.totals = { turns: 12, tokens: 7500 };
		updated.breakdowns[0]!.rows[0]!.tokens = 1875;
		await rerender({ model: updated });
		expect(screen.getByLabelText('Host overview').textContent).toContain(
			'12 activities'
		);
		expect(screen.getByLabelText('Host activity').textContent).toContain(
			'7 days'
		);
		expect(
			container.querySelector('[data-host-row="active"]')?.textContent
		).toContain('1,875 units');
		expect(
			container.querySelector<HTMLElement>(
				'[data-ai-usage-breakdown="agents"] .rounded-full.h-full'
			)?.style.width
		).toBe('25%');
	});
});
