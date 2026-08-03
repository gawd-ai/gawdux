import { describe, expect, it } from 'vitest';
import tokens from '../src/lib/styles/tokens.css?raw';

/** Extracts the body of the first top-level `selector { … }` block. */
function blockOf(selector: string): string {
	const start = tokens.indexOf(`\n${selector} {`);
	expect(start, `tokens.css must declare a top-level ${selector} block`).toBeGreaterThan(-1);
	const open = tokens.indexOf('{', start);
	let depth = 0;
	for (let i = open; i < tokens.length; i++) {
		if (tokens[i] === '{') depth++;
		else if (tokens[i] === '}') {
			depth--;
			if (depth === 0) return tokens.slice(open + 1, i);
		}
	}
	throw new Error(`Unbalanced braces for ${selector}`);
}

const rootBlock = blockOf(':root');
const darkBlock = blockOf('.dark');

describe('tokens.css 0.3.0 additions', () => {
	it('ships the panel content column widths', () => {
		expect(tokens).toContain('.panel-col {');
		expect(tokens).toContain('.panel-col-wide {');
		expect(tokens).toMatch(/\.panel-col \{[^}]*max-width: 56rem/);
		expect(tokens).toMatch(/\.panel-col-wide \{[^}]*max-width: 72rem/);
	});

	it('ships the dense-table → card responsive pattern with product-neutral names', () => {
		for (const cls of [
			'.responsive-card-table',
			'.responsive-list-page',
			'.responsive-detail-page',
			'.mobile-sort',
			'.row-link',
			'.combobox-option',
			'.checkbox-target',
			'.dialog-actions'
		]) {
			expect(tokens, `${cls} must exist`).toContain(cls);
		}
		// Generic label hook: consumers without bespoke ::before rules use data-label.
		expect(tokens).toContain("td[data-label]::before");
		expect(tokens).toContain('content: attr(data-label)');
		// No product vocabulary leaks into the shared file.
		expect(tokens).not.toMatch(/\.lab-/);
	});

	it('ships the touch-input anti-zoom correction, scoped to coarse pointers', () => {
		const antiZoom = tokens.slice(tokens.indexOf('Touch input anti-zoom'));
		expect(antiZoom).toContain('(max-width: 1024px) and (hover: none) and (pointer: coarse)');
		expect(antiZoom).toContain('font-size: 16px');
		expect(antiZoom).toContain("input[type='datetime-local']");
	});

	it('themes every new rule through variables defined for both light and dark', () => {
		const additions = tokens.slice(tokens.indexOf('Panel content columns'));
		const used = new Set(
			[...additions.matchAll(/var\((--gawdux-[a-z-]+)\)/g)].map((match) => match[1] as string)
		);
		expect(used.size).toBeGreaterThan(0);
		for (const name of used) {
			expect(rootBlock, `${name} must have a light (:root) value`).toContain(`${name}:`);
		}
		// The color-bearing tokens the pattern consumes must carry dark halves.
		for (const name of [
			'--gawdux-border',
			'--gawdux-border-input',
			'--gawdux-surface-card',
			'--gawdux-surface-input',
			'--gawdux-text-muted',
			'--gawdux-text-primary'
		]) {
			expect(used, `the pattern should consume ${name}`).toContain(name);
			expect(darkBlock, `${name} must have a dark (.dark) value`).toContain(`${name}:`);
		}
	});
});
