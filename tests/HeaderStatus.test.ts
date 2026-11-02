import { cleanup, render } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';
import HeaderStatus from '../src/lib/primitives/HeaderStatus.svelte';

afterEach(() => cleanup());

const root = (container: HTMLElement) =>
	container.querySelector('[data-header-status]') as HTMLElement;
/** The chip is the status badge, first in the root. */
const chip = (container: HTMLElement) => root(container).firstElementChild as HTMLElement;
const lock = (container: HTMLElement) =>
	container.querySelector('[data-header-status-lock]') as HTMLElement | null;

describe('HeaderStatus', () => {
	it('shows the state as a chip in the header density, and no lock while editable', () => {
		const { container } = render(HeaderStatus, { props: { color: 'blue', label: 'Draft' } });
		expect(root(container).className).toContain('inline-flex');
		expect(chip(container).textContent?.trim()).toBe('Draft');
		const cls = chip(container).className;
		expect(cls).toContain('bg-blue-100');
		expect(cls).toContain('dark:bg-blue-900');
		// The header density: tighter than a list's chip.
		expect(cls).toContain('px-1.5');
		expect(cls).toContain('py-0');
		expect(cls).toContain('text-[10px]');
		expect(cls).not.toContain('px-2.5');
		expect(cls).not.toContain('text-xs');
		expect(lock(container)).toBeNull();
		expect(container.querySelector('svg')).toBeNull();
	});

	it('adds a lock beside the chip while the viewer cannot edit, its reason in the tooltip', () => {
		const reason = 'In approval: reject to draft before editing';
		const { container } = render(HeaderStatus, {
			props: { color: 'yellow', label: 'In approval', lockReason: reason }
		});
		// The chip keeps its word; the lock carries none of its own.
		expect(chip(container).textContent?.trim()).toBe('In approval');
		const icon = lock(container);
		expect(icon).not.toBeNull();
		expect(icon?.textContent?.trim()).toBe('');
		expect(icon?.getAttribute('title')).toBe(reason);
		expect(icon?.getAttribute('role')).toBe('img');
		expect(icon?.getAttribute('aria-label')).toBe(reason);
		expect(icon?.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
		// After the chip, never inside it.
		expect(chip(container).contains(icon)).toBe(false);
		expect(root(container).lastElementChild).toBe(icon);
	});

	it('draws no lock for an empty reason', () => {
		for (const lockReason of [null, undefined, '', '   ']) {
			const { container, unmount } = render(HeaderStatus, {
				props: { color: 'green', label: 'In force', lockReason }
			});
			expect(lock(container)).toBeNull();
			unmount();
		}
	});

	it('merges extra chip classes over the header density', () => {
		const { container } = render(HeaderStatus, {
			props: { color: 'green', label: 'In force', className: 'px-2' }
		});
		expect(chip(container).className).toContain('px-2');
		expect(chip(container).className).not.toContain('px-1.5');
	});
});
