import { describe, expect, it } from 'vitest';
import source from '../src/lib/primitives/EditablePageScaffold.svelte?raw';

describe('EditablePageScaffold body: an inset host', () => {
	const style = source.slice(source.indexOf('<style>'));
	const body = /\.editable-page-body \{([^}]*)\}/.exec(style)?.[1] ?? '';

	it('pads the body from the inset knobs', () => {
		expect(body.replace(/\s+/g, ' ')).toContain(
			'padding: var(--gawdux-page-inset, 1rem) var(--gawdux-page-inset, 1rem) var(--gawdux-page-inset-bottom, 0.25rem);'
		);
		expect(body).not.toContain('padding: 1rem 1rem 0.25rem');
	});

	it('keeps its padding around a two-pane shell: the shell adds none inside it', () => {
		expect(style).not.toContain(':has(> :global(.master-detail-shell))');
		expect(style).not.toMatch(/padding:\s*0;/);
	});
});
