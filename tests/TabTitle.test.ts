import { cleanup, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';
import TabTitle from '../src/lib/primitives/TabTitle.svelte';
import { EyeOutline } from 'flowbite-svelte-icons';

afterEach(() => cleanup());

/** The house icon's box (20×20) an icon sits in; absent means the label starts flush. */
const iconBox = (container: HTMLElement) => container.querySelector('span.gawdux-control-icon.gawdux-icon');

describe('TabTitle', () => {
	it('renders the icon box when an icon is given', () => {
		const { container } = render(TabTitle, { props: { icon: EyeOutline, label: 'Overview' } });

		expect(screen.getByText('Overview')).toBeTruthy();
		expect(iconBox(container)).toBeTruthy();
		expect(iconBox(container)?.querySelector('svg')).toBeTruthy();
	});

	it('omits the icon box entirely when no icon is given', () => {
		// Not merely "renders without crashing": the box must be ABSENT. An
		// always-present wrapper indents every label in an icon-less tab set by
		// the icon's box plus the flex gap, which is a layout defect that type-checks
		// clean and reads as intentional padding.
		const { container } = render(TabTitle, { props: { label: 'Channels' } });

		expect(screen.getByText('Channels')).toBeTruthy();
		expect(iconBox(container)).toBeNull();
	});

	it('keeps a fixed-width box so labels align across a mixed tab set', () => {
		// The reason omission is safe: icons never size to their content, so a
		// set where only some tabs have icons still lines those labels up.
		const { container } = render(TabTitle, { props: { icon: EyeOutline, label: 'History' } });
		expect(iconBox(container)?.className).toContain('inline-flex');
	});

	it('marks the icon and the label the strip hides while its labels do not fit', () => {
		// A strip whose labels do not fit shows each tab's icon alone
		// (fitLabels): the label is kept as the tab's accessible name, so it
		// must stay in the tab, marked to hide, never removed.
		const { container } = render(TabTitle, { props: { icon: EyeOutline, label: 'History' } });
		const root = container.querySelector('.gawdux-tab-title');
		expect(root).toBeTruthy();
		expect(root?.querySelector('.gawdux-control-icon svg')).toBeTruthy();
		expect(root?.querySelector('.gawdux-control-icon')?.getAttribute('aria-hidden')).toBe('true');
		expect(root?.querySelector('.gawdux-control-label')?.textContent).toBe('History');
	});

	it('never hides the label of a tab with no icon, which would leave the tab empty', () => {
		const { container } = render(TabTitle, { props: { label: 'Channels' } });
		expect(container.querySelector('.gawdux-tab-title')).toBeTruthy();
		expect(container.querySelector('.gawdux-control-label')).toBeNull();
		expect(screen.getByText('Channels')).toBeTruthy();
	});

	it('appends a caller class without dropping the layout classes', () => {
		const { container } = render(TabTitle, { props: { label: 'Rules', className: 'text-xs' } });
		const root = container.querySelector('.gawdux-tab-title');
		expect(root?.tagName).toBe('SPAN');
		expect(root?.className).toContain('text-xs');
		expect(root?.className).toContain('items-center');
	});
});
