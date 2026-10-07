import { cleanup, render } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';
import { ChartOutline } from 'flowbite-svelte-icons';
import AppSidebar from '../src/lib/components/AppSidebar.svelte';
import sidebarSource from '../src/lib/components/AppSidebar.svelte?raw';
import type { SidebarConfig } from '../src/lib/types/sidebar.types';

afterEach(() => cleanup());

const config: SidebarConfig = {
	groups: [
		{
			id: 'updates',
			label: 'Agent updates and rollouts',
			icon: ChartOutline,
			items: [{ id: 'releases', label: 'Releases', href: '/app/updates' }]
		}
	]
};

describe('AppSidebar group label and chevron', () => {
	it('truncates a long group label with an ellipsis instead of running under the chevron', () => {
		const { container } = render(AppSidebar, {
			props: { config, activeUrl: '/elsewhere', initialOpen: true }
		});
		const wrapper = container.querySelector('.dropdown-wrapper') as HTMLElement;
		const button = wrapper.querySelector('button') as HTMLButtonElement;
		const label = button.querySelector(':scope > span') as HTMLSpanElement;
		expect(label.textContent).toBe('Agent updates and rollouts');
		for (const cls of ['flex-1', 'min-w-0', 'whitespace-nowrap', 'overflow-hidden', 'text-ellipsis']) {
			expect(label.classList.contains(cls), cls).toBe(true);
		}
		// The visible chevron lives beside the button, not inside the label's flow.
		const chevron = wrapper.querySelector(':scope > .dropdown-chevron');
		expect(chevron).toBeTruthy();
		expect(button.contains(chevron)).toBe(false);
	});

	it('reserves the chevron column on the expanded rail only', () => {
		// right: 12px + 20px chevron + 4px gap = 2.25rem of the button kept clear.
		expect(sidebarSource).toMatch(/\.dropdown-wrapper \.dropdown-chevron\) \{\s*position: absolute;\s*right: 12px;/);
		expect(sidebarSource).toMatch(
			/:global\(\.app-sidebar:not\(\.collapsed\) \.dropdown-wrapper button\) \{\s*padding-right: 2\.25rem;/
		);
	});
});
