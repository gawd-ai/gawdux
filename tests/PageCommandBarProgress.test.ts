import { cleanup, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';
import PageCommandBarProgress from '../src/lib/primitives/PageCommandBarProgress.svelte';

afterEach(() => cleanup());

describe('PageCommandBarProgress', () => {
	it('draws the words above a track that carries the count and the words', () => {
		const { container } = render(PageCommandBarProgress, {
			props: { label: '2 of 5 signatures · Awaiting Quality', value: 2, total: 5, name: 'Signatures' }
		});
		const group = container.querySelector('[data-bar-progress]')!;
		const [words, track] = [...group.children];
		expect(words!.matches('[data-bar-progress-words]')).toBe(true);
		expect(words!.textContent).toBe('2 of 5 signatures · Awaiting Quality');
		expect(track!.matches('[data-bar-progress-track]')).toBe(true);
		const bar = screen.getByRole('progressbar', { name: 'Signatures' });
		expect(bar).toBe(track);
		expect(bar.getAttribute('aria-valuemin')).toBe('0');
		expect(bar.getAttribute('aria-valuemax')).toBe('5');
		expect(bar.getAttribute('aria-valuenow')).toBe('2');
		expect(bar.getAttribute('aria-valuetext')).toBe('2 of 5 signatures · Awaiting Quality');
		expect((bar.firstElementChild as HTMLElement).style.width).toBe('40%');
		expect(group.getAttribute('title')).toBe('2 of 5 signatures · Awaiting Quality');
	});

	it('names the track by its words when no name is given', () => {
		render(PageCommandBarProgress, { props: { label: '1 of 3 steps', value: 1, total: 3 } });
		expect(screen.getByRole('progressbar', { name: '1 of 3 steps' })).toBeTruthy();
	});

	it('draws no track without a count', () => {
		for (const props of [
			{ label: '1 proposed change goes into review with the draft' },
			{ label: 'Nothing to count', value: 0, total: 0 },
			{ label: 'Nothing to count', value: 3, total: null }
		]) {
			const { container } = render(PageCommandBarProgress, { props });
			expect(container.querySelector('[data-bar-progress-words]')!.textContent).toBe(props.label);
			expect(container.querySelector('[role="progressbar"]')).toBeNull();
			cleanup();
		}
	});

	it('keeps the fill within the track', () => {
		const { container } = render(PageCommandBarProgress, {
			props: { label: '7 of 5', value: 7, total: 5 }
		});
		const bar = container.querySelector('[role="progressbar"]')!;
		expect(bar.getAttribute('aria-valuenow')).toBe('5');
		expect((bar.firstElementChild as HTMLElement).style.width).toBe('100%');
	});
});
