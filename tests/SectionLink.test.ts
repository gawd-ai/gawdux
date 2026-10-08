import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SectionLink from '../src/lib/primitives/SectionLink.svelte';
import IconButton from '../src/lib/primitives/IconButton.svelte';
import CardContainerLinkHarness from './fixtures/CardContainerLinkHarness.svelte';
import { TrashBinOutline } from 'flowbite-svelte-icons';

afterEach(() => cleanup());

describe('SectionLink', () => {
	it('is an icon link named by its destination', () => {
		render(SectionLink, { props: { label: 'Open Network', href: '/devices/1/network' } });
		const link = screen.getByRole('link', { name: 'Open Network' });
		expect(link.getAttribute('href')).toBe('/devices/1/network');
		expect(link.getAttribute('title')).toBe('Open Network');
		expect(link.textContent?.trim()).toBe('');
		expect(link.querySelector('svg')).toBeTruthy();
	});

	it('is a button with a handler', async () => {
		const onclick = vi.fn();
		render(SectionLink, { props: { label: 'Open Health', onclick } });
		await fireEvent.click(screen.getByRole('button', { name: 'Open Health' }));
		expect(onclick).toHaveBeenCalledTimes(1);
	});

	it('renders nothing without a target or handler', () => {
		const { container } = render(SectionLink, { props: { label: 'Nowhere' } });
		expect(container.querySelector('[data-section-link]')).toBeNull();
	});
});

describe('IconButton', () => {
	it('is named by its action and stays grey until intent when dangerous', async () => {
		const onclick = vi.fn();
		render(IconButton, {
			props: { icon: TrashBinOutline, label: 'Remove Camera 3', tone: 'danger', onclick }
		});
		const button = screen.getByRole('button', { name: 'Remove Camera 3' });
		expect(button.getAttribute('title')).toBe('Remove Camera 3');
		expect(button.dataset.tone).toBe('danger');
		expect(button.className).toContain('text-gray-500');
		expect(button.className).toContain('hover:text-red-600');
		expect(button.className).not.toMatch(/(^|\s)text-red-/);
		await fireEvent.click(button);
		expect(onclick).toHaveBeenCalledTimes(1);
	});

	it('does not act when disabled', async () => {
		const onclick = vi.fn();
		render(IconButton, { props: { icon: TrashBinOutline, label: 'Remove', disabled: true, onclick } });
		const button = screen.getByRole('button', { name: 'Remove' });
		expect((button as HTMLButtonElement).disabled).toBe(true);
	});
});

describe('CardContainer link', () => {
	it('puts the go-to icon at the right end of the header, after the header slot', () => {
		const { container } = render(CardContainerLinkHarness, {
			props: { link: { label: 'Open Network', href: '/n' } }
		});
		const header = container.querySelector('.card-container-header') as HTMLElement;
		const link = screen.getByRole('link', { name: 'Open Network' });
		expect(header.contains(link)).toBe(true);
		const meta = screen.getByText('2 ports');
		expect(meta.compareDocumentPosition(link) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
	});

	it('has no go-to icon without a link', () => {
		const { container } = render(CardContainerLinkHarness, { props: { link: null } });
		expect(container.querySelector('[data-section-link]')).toBeNull();
		expect(screen.getByText('2 ports')).toBeTruthy();
	});
});
