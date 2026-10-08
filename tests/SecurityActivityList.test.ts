import { cleanup, render } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';
import BareIcon from './fixtures/BareIcon.svelte';
import SecurityActivityList from '../src/lib/admin/SecurityActivityList.svelte';
import type { SecurityActivityEvent } from '../src/lib/admin/types';

afterEach(() => cleanup());

const EVENTS: SecurityActivityEvent[] = [
	{ id: 'e1', at: '2026-10-08T10:00:00Z', label: 'Signed in', result: 'Success', tone: 'success', detail: 'Password' },
	{ id: 'e2', at: '2026-10-08T09:00:00Z', label: 'Signed in', result: 'Refused', tone: 'failure' }
];

describe('SecurityActivityList column icons (headIcons)', () => {
	it('draws no header icon without headIcons', () => {
		const { container } = render(SecurityActivityList, { props: { events: EVENTS } });
		expect(container.querySelector('thead svg')).toBeNull();
		expect([...container.querySelectorAll('thead th')].map((th) => th.textContent?.trim())).toEqual([
			'When',
			'Event',
			'Result',
			'Detail'
		]);
	});

	it("puts a key's icon before that header's word and no other", () => {
		const { container } = render(SecurityActivityList, {
			props: { events: EVENTS, headIcons: { when: BareIcon, result: BareIcon } }
		});
		const ths = [...container.querySelectorAll('thead th')] as HTMLElement[];
		expect(ths.map((th) => Boolean(th.querySelector('svg')))).toEqual([true, false, true, false]);
		for (const th of [ths[0]!, ths[2]!]) {
			const label = th.querySelector('.table-head-label')!;
			expect(label.firstElementChild?.classList.contains('table-head-icon')).toBe(true);
			expect(label.firstElementChild?.getAttribute('aria-hidden')).toBe('true');
		}
		expect(ths[0]!.textContent?.trim()).toBe('When');
		expect(ths[2]!.textContent?.trim()).toBe('Result');
	});
});
