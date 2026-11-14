import { describe, expect, it, vi } from 'vitest';
import { createCompactFold } from '../src/lib/shell/compact-fold';
import { createCompactViewport } from '../src/lib/shell/compact-viewport.svelte';
import { SHELL_BAR_QUERY } from '../src/lib/primitives/shell-bar';

function panel(open: boolean) {
	const state = { open };
	const setOpen = vi.fn((next: boolean) => (state.open = next));
	return { state, setOpen, fold: createCompactFold({ isOpen: () => state.open, setOpen }) };
}

describe('a side panel folded when the screen turns compact', () => {
	it('folds an open panel on the way in and opens it again on the way out', () => {
		const p = panel(true);
		p.fold.sync(true);
		expect(p.state.open).toBe(false);
		p.fold.sync(false);
		expect(p.state.open).toBe(true);
		expect(p.setOpen).toHaveBeenCalledTimes(2);
	});

	it('leaves a closed panel closed both ways', () => {
		const p = panel(false);
		p.fold.sync(true);
		p.fold.sync(false);
		expect(p.setOpen).not.toHaveBeenCalled();
	});

	it('acts on the crossing alone: a panel opened by hand while compact stays', () => {
		const p = panel(false);
		p.fold.sync(true);
		p.state.open = true;
		p.fold.sync(true);
		expect(p.state.open).toBe(true);
		expect(p.setOpen).not.toHaveBeenCalled();
		// It was not the crossing that closed anything: growing back changes nothing.
		p.fold.sync(false);
		expect(p.state.open).toBe(true);
		expect(p.setOpen).not.toHaveBeenCalled();
	});

	it('does nothing while the screen stays wide', () => {
		const p = panel(true);
		p.fold.sync(false);
		p.fold.sync(false);
		expect(p.setOpen).not.toHaveBeenCalled();
	});

	it('remembers one crossing, never an older one', () => {
		const p = panel(true);
		p.fold.sync(true);
		p.fold.sync(false);
		p.state.open = false;
		p.fold.sync(true);
		p.fold.sync(false);
		expect(p.state.open).toBe(false);
	});
});

describe('the compact switch', () => {
	it('reads the shell bar query and follows it until stopped', () => {
		const listeners = new Set<() => void>();
		const media = {
			matches: true,
			addEventListener: (_: string, run: () => void) => listeners.add(run),
			removeEventListener: (_: string, run: () => void) => listeners.delete(run)
		};
		const matchMedia = vi.fn(() => media as unknown as MediaQueryList);
		const viewport = createCompactViewport();
		expect(viewport.compact).toBe(false);
		const stop = viewport.watch({ matchMedia });
		expect(matchMedia).toHaveBeenCalledWith(SHELL_BAR_QUERY);
		expect(SHELL_BAR_QUERY).toBe('(max-width: 1024px)');
		expect(viewport.compact).toBe(true);
		media.matches = false;
		for (const run of listeners) run();
		expect(viewport.compact).toBe(false);
		stop();
		expect(listeners.size).toBe(0);
	});
});
