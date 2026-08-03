import { describe, it, expect } from 'vitest';
import type { Snippet } from 'svelte';
import { createPageCommandBarRegistry } from '../src/lib/primitives/page-command-bar-registry';

// Snippets are opaque to the registry — use labeled sentinels we can assert on.
const snip = (label: string): Snippet => ({ label }) as unknown as Snippet;

/** Mirror of the three reactive zone slots the layout drives via `apply`. */
function makeHarness() {
	const zones: Record<'left' | 'center' | 'right', Snippet | null> = {
		left: null,
		center: null,
		right: null
	};
	const registry = createPageCommandBarRegistry((zone, snippet) => {
		zones[zone] = snippet;
	});
	const labelOf = (z: 'left' | 'center' | 'right') =>
		(zones[z] as unknown as { label: string } | null)?.label ?? null;
	return { registry, zones, labelOf };
}

describe('createPageCommandBarRegistry', () => {
	it('shows a registrant after it fills its snippet, clears it on destroy', () => {
		const h = makeHarness();
		const id = h.registry.register('center', null); // PageCommandBarCenter registers null first
		expect(h.labelOf('center')).toBe(null);
		h.registry.update(id, snip('edit')); // deferred $effect fills it
		expect(h.labelOf('center')).toBe('edit');
		h.registry.clear(id);
		expect(h.labelOf('center')).toBe(null);
	});

	it('keeps zones independent', () => {
		const h = makeHarness();
		h.registry.register('left', snip('back'));
		const c = h.registry.register('center', snip('edit'));
		h.registry.register('right', snip('help'));
		expect(h.labelOf('left')).toBe('back');
		expect(h.labelOf('center')).toBe('edit');
		expect(h.labelOf('right')).toBe('help');
		h.registry.clear(c);
		expect(h.labelOf('center')).toBe(null);
		expect(h.labelOf('left')).toBe('back');
		expect(h.labelOf('right')).toBe('help');
	});

	it('most-recently-registered live registrant wins (incoming page over outgoing)', () => {
		const h = makeHarness();
		const out = h.registry.register('center', null);
		h.registry.update(out, snip('list'));
		expect(h.labelOf('center')).toBe('list');

		// Incoming page mounts (registers) before outgoing clears, then fills.
		const incoming = h.registry.register('center', null);
		h.registry.update(incoming, snip('detail'));
		expect(h.labelOf('center')).toBe('detail');

		// Outgoing finally destroys — its clear must not disturb the live winner.
		h.registry.clear(out);
		expect(h.labelOf('center')).toBe('detail');
	});

	it('does NOT strand the zone when a superseding registrant dies before filling (the refresh-fixes-it bug)', () => {
		const h = makeHarness();
		// Y: a still-alive registrant with content (e.g. an open workspace pane).
		const y = h.registry.register('center', null);
		h.registry.update(y, snip('pane'));
		expect(h.labelOf('center')).toBe('pane');

		// X: a transient/superseded mount steals the slot with a null snippet...
		const x = h.registry.register('center', null);
		expect(h.labelOf('center')).toBe(null); // briefly empty while X is the newest live

		// ...and is destroyed before its deferred update() ever runs.
		h.registry.clear(x);

		// The older still-alive registrant Y must come back immediately — NOT stay
		// stranded until a full page reload. (Old "active id" model left this null.)
		expect(h.labelOf('center')).toBe('pane');
	});

	it('clearing a non-winning registrant leaves the winner untouched', () => {
		const h = makeHarness();
		const a = h.registry.register('center', null);
		h.registry.update(a, snip('a'));
		const b = h.registry.register('center', null);
		h.registry.update(b, snip('b'));
		expect(h.labelOf('center')).toBe('b');

		h.registry.clear(a); // older, non-winning
		expect(h.labelOf('center')).toBe('b');
	});

	it('honors a null snippet from the newest registrant (a page with no actions clears the bar)', () => {
		const h = makeHarness();
		const prev = h.registry.register('center', null);
		h.registry.update(prev, snip('prev'));
		h.registry.register('center', null); // next page declares no center actions
		expect(h.labelOf('center')).toBe(null);
		h.registry.clear(prev);
		expect(h.labelOf('center')).toBe(null);
	});

	it('update() does not reorder a registrant relative to its peers', () => {
		const h = makeHarness();
		const a = h.registry.register('center', null);
		const b = h.registry.register('center', null);
		h.registry.update(b, snip('b'));
		h.registry.update(a, snip('a-updated')); // a re-fires its effect; must not jump ahead of b
		expect(h.labelOf('center')).toBe('b');
		h.registry.clear(b);
		expect(h.labelOf('center')).toBe('a-updated');
	});

	it('ignores update()/clear() for unknown ids', () => {
		const h = makeHarness();
		h.registry.register('center', snip('keep'));
		const bogus = Symbol('bogus');
		h.registry.update(bogus, snip('nope'));
		h.registry.clear(bogus);
		expect(h.labelOf('center')).toBe('keep');
	});
});
