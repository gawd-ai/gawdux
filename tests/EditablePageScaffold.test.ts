import { describe, expect, it } from 'vitest';
import source from '../src/lib/primitives/EditablePageScaffold.svelte?raw';

describe('EditablePageScaffold body: an inset host', () => {
	const style = source.slice(source.indexOf('<style>'));
	const body = /\.editable-page-body \{([^}]*)\}/.exec(style)?.[1] ?? '';

	it('pads the body from the inset knob, one value on all four sides', () => {
		expect(body.replace(/\s+/g, ' ')).toContain('padding: var(--gawdux-page-inset, 1rem);');
		expect(body).not.toContain('--gawdux-page-inset-bottom');
	});

	it('gives a surface that hosts panes no inset, without touching the knob', () => {
		expect(source).toContain('class:editable-page-body--panes={panes}');
		expect(style.replace(/\s+/g, ' ')).toContain('.editable-page-body--panes { padding: 0; }');
		expect(source).not.toMatch(/--gawdux-page-inset:\s*0/);
	});

	it('keeps its padding around a two-pane shell: the shell adds none inside it', () => {
		expect(style).not.toContain(':has(> :global(.master-detail-shell))');
		// Only a surface that says it hosts panes drops the inset.
		expect(style.replace(/\.editable-page-body--panes \{\s*padding: 0;\s*\}/, '')).not.toMatch(
			/padding:\s*0;/
		);
	});
});

describe('EditablePageScaffold: the header draws the trail', () => {
	it('takes no breadcrumb of its own, so a page never mounts a second, hidden trail', () => {
		expect(source).not.toMatch(/<slot\s+name="breadcrumb"/);
		expect(source).not.toContain('class="hidden" aria-hidden="true"');
	});
});
