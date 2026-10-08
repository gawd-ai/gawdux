import { cleanup, fireEvent, render, screen, within } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AiUsageBars from '../src/lib/admin/AiUsageBars.svelte';
import AiUsageReport from '../src/lib/admin/AiUsageReport.svelte';
import BotRail, { botInitials } from '../src/lib/admin/BotRail.svelte';
import BotIdentityHeader from '../src/lib/admin/BotIdentityHeader.svelte';
import BotConfigView from '../src/lib/admin/BotConfigView.svelte';
import BotContextCard from '../src/lib/admin/BotContextCard.svelte';
import RoleMembersCard from '../src/lib/admin/RoleMembersCard.svelte';

afterEach(() => cleanup());

const DAYS = [
	{ day: '2026-10-05', turns: 0, tokens: 0 },
	{ day: '2026-10-06', turns: 3, tokens: 1250 },
	{ day: '2026-10-07', turns: 6, tokens: 2500 }
];

describe('AiUsageBars', () => {
	it('reads every day as one meter, in the host unit, with no canvas or table', () => {
		const { container } = render(AiUsageBars, {
			props: { rows: DAYS.map((d) => ({ day: d.day, value: d.tokens })), unit: 'credits' }
		});
		const meters = screen.getAllByRole('meter');
		expect(meters).toHaveLength(3);
		expect(meters[1]!.getAttribute('aria-label')).toBe('Credits on 2026-10-06');
		expect(meters[1]!.getAttribute('aria-valuetext')).toBe('1,250 credits');
		expect(meters[2]!.getAttribute('aria-valuemax')).toBe('2500');
		expect(meters[1]!.dataset.tooltip).toBe('2026-10-06: 1,250 credits');
		expect(container.querySelector('canvas')).toBeNull();
		expect(container.querySelector('table')).toBeNull();
		expect(screen.getByRole('group').getAttribute('aria-label')).toBe('Credits per day for the last 3 days');
	});

	it('takes the host day wording for the axis and the tooltip', () => {
		render(AiUsageBars, {
			props: {
				rows: DAYS.map((d) => ({ day: d.day, value: d.turns })),
				unit: 'turns',
				dayLabel: (d: string) => d.slice(5),
				dayTitle: (d: string) => `day ${d}`
			}
		});
		expect(screen.getAllByRole('meter')[2]!.dataset.tooltip).toBe('day 2026-10-07: 6 turns');
		expect(screen.getByText('10-07')).toBeTruthy();
	});
});

describe('AiUsageReport', () => {
	const props = {
		totals: { turns: 9, tokens: 3750 },
		daily: DAYS,
		days: 30,
		breakdowns: [
			{
				id: 'bots',
				title: 'By assistant',
				rows: [
					{ key: 'ops', label: 'Netage Ops', turns: 9, tokens: 3750 },
					{ key: 'idle', label: 'Quiet bot', turns: 0, tokens: 0 }
				]
			},
			{ id: 'members', title: 'By person', rows: [] }
		],
		tiles: [{ label: 'Assistants on', value: '1', meta: 'In this tenant' }]
	};

	it('states the totals as tiles, the host tiles after them', () => {
		const { container } = render(AiUsageReport, { props });
		const labels = [...container.querySelectorAll('.stat-tile')].map((t) => t.querySelector('span[title]')?.textContent);
		expect(labels).toEqual(['Turns', 'Tokens', 'Assistants on']);
		expect(screen.getByText('9')).toBeTruthy();
		expect(screen.getByText('3.8k').getAttribute('title')).toBe('3,750 tokens');
	});

	it('draws the bars in the chosen metric and names the card after it', () => {
		render(AiUsageReport, { props: { ...props, metric: 'turns' } });
		expect(screen.getByText('Turns per day')).toBeTruthy();
		expect(screen.getAllByRole('meter')[2]!.getAttribute('aria-valuetext')).toBe('6 turns');
	});

	it('says the window is quiet instead of drawing zeroes', () => {
		const quiet = DAYS.map((d) => ({ ...d, turns: 0, tokens: 0 }));
		const { container } = render(AiUsageReport, {
			props: { ...props, daily: quiet, totals: { turns: 0, tokens: 0 }, emptyText: 'Nothing yet.' }
		});
		expect(container.querySelector('[data-ai-usage-bars]')).toBeNull();
		expect(screen.getByText('Nothing yet.')).toBeTruthy();
	});

	it('gives each breakdown row its share, and a zero row no bar', () => {
		const { container } = render(AiUsageReport, { props });
		const rows = container.querySelectorAll('[data-ai-usage-breakdown="bots"] li');
		const width = (li: Element) => (li.querySelector('.rounded-full.h-full') as HTMLElement).style.width;
		expect(width(rows[0]!)).toBe('100%');
		expect(width(rows[1]!)).toBe('0%');
		expect(screen.getByText('No activity in this window.')).toBeTruthy();
	});

	it('leaves an empty breakdown out when asked', () => {
		render(AiUsageReport, { props: { ...props, hideEmptyBreakdowns: true } });
		expect(screen.queryByText('By person')).toBeNull();
	});

	it('offers the windows only with a handler, and raises the chosen one', async () => {
		const onwindow = vi.fn();
		render(AiUsageReport, { props: { ...props, onwindow } });
		await fireEvent.click(screen.getByRole('button', { name: '7 days' }));
		expect(onwindow).toHaveBeenCalledWith(7);
		cleanup();
		render(AiUsageReport, { props });
		expect(screen.queryByRole('button', { name: '7 days' })).toBeNull();
	});
});

describe('BotRail', () => {
	const BOTS = [
		{ id: 'ops', name: 'Netage Ops', role: 'Fleet operations', status: { on: true, label: 'On' } },
		{ id: 'sales', name: 'Sales Desk', role: 'Quotes', color: 'bg-pink-600', status: { on: false, label: 'Off' } }
	];

	it('names each bot with its role, avatar and one state', () => {
		const { container } = render(BotRail, { props: { bots: BOTS, selected: 'ops', onselect: () => {} } });
		const rows = container.querySelectorAll('[data-master-detail-row]');
		expect(rows).toHaveLength(2);
		expect(rows[0]!.getAttribute('aria-current')).toBe('true');
		expect(rows[0]!.textContent).toContain('NO');
		expect(rows[1]!.querySelector('.bg-pink-600')).toBeTruthy();
		expect(rows[1]!.querySelector('[data-bot-status="off"]')?.getAttribute('title')).toBe('Off');
	});

	it('raises the chosen bot and filters by name or role', async () => {
		const onselect = vi.fn();
		render(BotRail, { props: { bots: BOTS, onselect, search: true } });
		await fireEvent.click(screen.getByText('Sales Desk'));
		expect(onselect).toHaveBeenCalledWith('sales');
		await fireEvent.input(screen.getByLabelText('Search bots'), { target: { value: 'fleet' } });
		expect(screen.queryByText('Sales Desk')).toBeNull();
		expect(screen.getByText('Netage Ops')).toBeTruthy();
	});

	it('draws lanes with a rule between them', () => {
		const { container } = render(BotRail, { props: { groups: [[BOTS[0]!], [BOTS[1]!]], onselect: () => {} } });
		expect(container.querySelectorAll('.border-t')).toHaveLength(1);
	});

	it('derives two initials from the name when the host gives none', () => {
		expect(botInitials({ name: 'Netage Ops' })).toBe('NO');
		expect(botInitials({ name: 'Atlas' })).toBe('AT');
		expect(botInitials({ name: 'X', initials: 'qa' })).toBe('QA');
	});
});

describe('BotIdentityHeader', () => {
	it('shows the name, role, state and what it does', () => {
		render(BotIdentityHeader, {
			props: { bot: { id: 'ops', name: 'Netage Ops', role: 'Fleet operations', status: { on: true, label: 'On' } }, tagline: 'Ask in plain language.' }
		});
		expect(screen.getByRole('heading', { name: 'Netage Ops' })).toBeTruthy();
		expect(screen.getByText('Fleet operations')).toBeTruthy();
		expect(screen.getByText('On').dataset.botStatus).toBe('on');
		expect(screen.getByText('Ask in plain language.')).toBeTruthy();
	});
});

describe('BotConfigView', () => {
	it('reads a config: state, the bots by name, the instructions as written', () => {
		render(BotConfigView, {
			props: {
				config: { name: 'Arenas', body: 'Say tenant.\nNever infer a site.', enabled: false, botIds: ['ops', 'gone'] },
				bots: [{ id: 'ops', name: 'Netage Ops' }],
				maxBodyChars: 4000
			}
		});
		expect(screen.getByText('Off')).toBeTruthy();
		expect(screen.getByText('Netage Ops, gone')).toBeTruthy();
		expect(screen.getByText(/Never infer a site/).tagName).toBe('PRE');
		expect(screen.getByText('31 of 4,000 characters')).toBeTruthy();
	});
});

describe('BotContextCard', () => {
	it('shows the block in full without parts, with its size and the go-to link', () => {
		render(BotContextCard, {
			props: { block: 'Be brief.', maxChars: 8000, link: { label: 'Open Configs', href: '/configs' } }
		});
		expect(screen.getByText('Be brief.').tagName).toBe('PRE');
		expect(screen.getByText('9 of 8,000 characters')).toBeTruthy();
		expect(screen.getByRole('link', { name: 'Open Configs' }).getAttribute('href')).toBe('/configs');
	});

	it('summarises by parts and keeps the composed text behind a disclosure', () => {
		const { container } = render(BotContextCard, {
			props: { block: 'A\nB', parts: [{ kind: 'config', label: 'Arenas', chars: 1 }, { kind: 'skill', label: 'Diagnose', chars: 1 }], version: 'ab12' }
		});
		expect(container.querySelectorAll('li')).toHaveLength(2);
		expect(container.querySelector('details pre')?.textContent).toBe('A\nB');
		expect(screen.getByText('vab12')).toBeTruthy();
	});

	it('says so when nothing is told', () => {
		render(BotContextCard, { props: { block: '', emptyText: 'Nothing yet.' } });
		expect(screen.getByText('Nothing yet.')).toBeTruthy();
	});
});

describe('RoleMembersCard', () => {
	const MEMBERS = [
		{ ref: 'u:1', label: 'Alex Chen', detail: 'admin@netage.ai' },
		{ ref: 'u:2', label: 'Sam Lee' }
	];

	it('raises a removal as an intent, from a quiet trash icon named for the person', async () => {
		const onremove = vi.fn();
		render(RoleMembersCard, { props: { roleName: 'Operators', members: MEMBERS, onremove } });
		const trash = screen.getByRole('button', { name: 'Remove Sam Lee from Operators' });
		expect(trash.dataset.tone).toBe('danger');
		expect(trash.textContent?.trim()).toBe('');
		await fireEvent.click(trash);
		expect(onremove).toHaveBeenCalledWith(MEMBERS[1]);
		expect(screen.getByText('admin@netage.ai')).toBeTruthy();
	});

	it('is read-only for a platform-managed Role', () => {
		render(RoleMembersCard, {
			props: { roleName: 'Platform', members: MEMBERS, editable: false, onremove: () => {}, onadd: () => {}, candidates: [{ ref: 'u:3', label: 'Kim' }] }
		});
		expect(screen.queryByRole('button')).toBeNull();
	});

	it('hands the picked person to the host', async () => {
		const onadd = vi.fn();
		const { container } = render(RoleMembersCard, {
			props: { roleName: 'Operators', members: [], candidates: [{ ref: 'u:3', label: 'Kim' }], onadd }
		});
		expect(screen.getByText('Nobody holds this Role yet.')).toBeTruthy();
		const add = screen.getByRole('button', { name: 'Add' }) as HTMLButtonElement;
		expect(add.disabled).toBe(true);
		const select = container.querySelector('select') as HTMLSelectElement;
		await fireEvent.change(select, { target: { value: 'u:3' } });
		await fireEvent.click(within(container as HTMLElement).getByRole('button', { name: 'Add' }));
		expect(onadd).toHaveBeenCalledWith('u:3');
	});
});
