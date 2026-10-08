import { cleanup, render } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';
import tokens from '../src/lib/styles/tokens.css?raw';
import cardSource from '../src/lib/primitives/CardContainer.svelte?raw';
import flowbiteBodyCell from '../node_modules/flowbite-svelte/dist/table/TableBodyCell.svelte?raw';
import flowbiteHeadCell from '../node_modules/flowbite-svelte/dist/table/TableHeadCell.svelte?raw';
import CardContainer from '../src/lib/primitives/CardContainer.svelte';

afterEach(() => cleanup());

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

/** The declared value of `--name` inside a block. */
function tokenValue(block: string, name: string): string {
	const match = block.match(new RegExp(`${name}:\\s*([^;]+);`));
	expect(match, `${name} must be declared`).toBeTruthy();
	return (match?.[1] ?? '').trim();
}

/** Tailwind's spacing step N as the knob writes it (N × --spacing). */
const step = (n: number) => `calc(var(--spacing, 0.25rem) * ${n})`;

const rootBlock = blockOf(':root');
const darkBlock = blockOf('.dark');

/** The utility padding each surface shipped with before the knobs existed. */
const PREVIOUS = {
	tableBody: 'px-6 py-4',
	tableHead: 'px-6 py-3',
	cardHeader: 'px-6 py-3',
	cardBody: 'p-3 px-6'
};

describe('density knobs: the defaults are the previous geometry', () => {
	it('flowbite still pads its cells the way the table knobs mirror', () => {
		// The knobs stand in for these exact utilities. If flowbite changes its
		// defaults, the knob defaults below must move with them.
		expect(flowbiteBodyCell).toContain(`tdClass = "${PREVIOUS.tableBody} whitespace-nowrap font-medium `);
		expect(flowbiteHeadCell).toContain(`padding = "${PREVIOUS.tableHead}"`);
	});

	it('declares every table, card and tile knob at its previous value', () => {
		const expected: Record<string, string> = {
			// px-6 / py-4 body, py-3 head; no row height
			'--gawdux-table-cell-px': step(6),
			'--gawdux-table-cell-py': step(4),
			'--gawdux-table-head-py': step(3),
			'--gawdux-table-row-height': 'auto',
			// CardContainer header px-6 py-3, body p-3 px-6
			'--gawdux-card-header-px': step(6),
			'--gawdux-card-header-py': step(3),
			'--gawdux-card-body-px': step(6),
			'--gawdux-card-body-py': step(3),
			// the lifted tile recipe: p-3, nested p-2.5, gap-3
			'--gawdux-tile-padding': step(3),
			'--gawdux-tile-padding-nested': step(2.5),
			'--gawdux-tile-gap': step(3),
			'--gawdux-tile-min-width': '9rem'
		};
		for (const [name, value] of Object.entries(expected)) {
			expect(tokenValue(rootBlock, name), name).toBe(value);
			// Density is not a colour: one value serves both themes.
			expect(darkBlock, `${name} is theme-independent`).not.toContain(`${name}:`);
		}
	});

	it('routes only the default flowbite cell utilities through the knobs, with no specificity', () => {
		const section = tokens.slice(
			tokens.indexOf('Density knobs: table cells'),
			tokens.indexOf('---------- Aesthetic globals')
		);
		// Body block padding: only a cell still carrying py-4.
		expect(section).toMatch(/:where\(\s*:is\(\.table-container, \.data-table\)\s*td\.py-4:not\(/);
		expect(section).toContain('padding-block: var(--gawdux-table-cell-py);');
		// Head block padding: only a head cell still carrying py-3.
		expect(section).toMatch(/th\.py-3:not\(/);
		expect(section).toContain('padding-block: var(--gawdux-table-head-py);');
		// Inline padding: body and head cells still carrying px-6.
		expect(section).toMatch(/:is\(td, th\)\.px-6:not\(/);
		expect(section).toContain('padding-inline: var(--gawdux-table-cell-px);');
		expect(section).toContain('height: var(--gawdux-table-row-height);');
		// A cell that refines or varies its own padding is left alone.
		for (const fragment of ["'pt-'", "'pb-'", "':py-'", "':p-'", "'pl-'", "'pr-'", "'ps-'", "'pe-'", "':px-'"]) {
			expect(section, `cells with ${fragment} keep their own padding`).toContain(`[class*=${fragment}]`);
		}
		// Every selector is wrapped in :where(), so consumer rules still win.
		const rules = section.slice(section.indexOf('*/') + 2).replace(/\/\*[\s\S]*?\*\//g, '');
		const selectors = [...rules.matchAll(/([^{}]+)\{[^{}]*\}/g)].map((m) => (m[1] ?? '').trim());
		expect(selectors.length).toBe(4);
		for (const selector of selectors) expect(selector.startsWith(':where(')).toBe(true);
	});

	it('the card header class reads the header knobs', () => {
		const cardHeader = tokens.slice(tokens.indexOf('.card-header {'));
		expect(cardHeader.slice(0, cardHeader.indexOf('}'))).toContain(
			'padding: var(--gawdux-card-header-py) var(--gawdux-card-header-px);'
		);
	});

	it('CardContainer pads through the knobs, with fallbacks equal to the old utilities', () => {
		const { container } = render(CardContainer, { props: { title: 'Details' } });
		const header = container.querySelector('.card-container-header');
		const content = container.querySelector('.card-container-content');
		// px-6 py-3 header, p-3 px-6 body: 1.5rem and 0.75rem at the default spacing.
		expect(header?.className).toContain('px-[var(--gawdux-card-header-px,1.5rem)]');
		expect(header?.className).toContain('py-[var(--gawdux-card-header-py,0.75rem)]');
		expect(content?.className).toContain('p-[var(--gawdux-card-body-py,0.75rem)]');
		expect(content?.className).toContain('px-[var(--gawdux-card-body-px,1.5rem)]');
		for (const old of ['px-6', 'py-3', 'p-3']) {
			expect(header?.classList.contains(old)).toBe(false);
			expect(content?.classList.contains(old)).toBe(false);
		}
		// The narrow-layout caps still land on 1rem and 0.75rem by default.
		expect(cardSource).toContain('min(var(--gawdux-card-header-px, 1.5rem), 1rem)');
		expect(cardSource).toContain('min(var(--gawdux-card-body-px, 1.5rem), 0.75rem)');
	});
});

describe('tab states: hover is not active', () => {
	const tabs = tokens.slice(
		tokens.indexOf('---------- Tabs underline system'),
		tokens.indexOf('---------- Scrollbar styling')
	);

	it('hover changes the text colour only', () => {
		expect(tabs).toMatch(
			/@media \(hover: hover\) \{\s*\.tabs-underline \[role='tab'\]:hover \{\s*color: var\(--gawdux-tab-text-hover\);\s*\}\s*\}/
		);
		// No underline grows on hover, and hovering never restyles the active tab.
		expect(tabs).not.toContain(':hover::after');
		expect(tabs).not.toContain(':has(');
		expect(tabs).not.toContain('opacity: 0.4');
	});

	it('active keeps its colour and underline, after the hover rule', () => {
		expect(tabs).toMatch(/\.tabs-underline \[role='tab'\]\.active::after \{\s*transform: scaleX\(1\);/);
		const hoverAt = tabs.indexOf(":hover {");
		const activeAt = tabs.indexOf(".tabs-underline [role='tab'].active {");
		expect(activeAt).toBeGreaterThan(hoverAt);
		expect(tabs.slice(activeAt)).toContain('color: var(--gawdux-tab-text-active);');
	});

	it('keeps the previous active look and idle colours in both themes', () => {
		expect(tokenValue(rootBlock, '--gawdux-tab-text')).toBe('var(--color-gray-500)');
		expect(tokenValue(darkBlock, '--gawdux-tab-text')).toBe('var(--color-gray-400)');
		expect(tokenValue(rootBlock, '--gawdux-tab-text-active')).toMatch(/^rgb\(37 99 235\)/);
		expect(tokenValue(darkBlock, '--gawdux-tab-text-active')).toMatch(/^rgb\(96 165 250\)/);
		expect(tokenValue(rootBlock, '--gawdux-tab-indicator')).toMatch(/^rgb\(191 219 254\)/);
		expect(tokenValue(darkBlock, '--gawdux-tab-indicator')).toMatch(/^rgb\(30 58 138\)/);
	});

	it('the hover colour is not the active colour in either theme', () => {
		for (const block of [rootBlock, darkBlock]) {
			expect(tokenValue(block, '--gawdux-tab-text-hover')).not.toBe(
				tokenValue(block, '--gawdux-tab-text-active')
			);
		}
	});
});

describe('content inset: one inset, owned once by the host', () => {
	/** The body of the first rule whose selector is exactly `selector`, at any depth. */
	function ruleOf(selector: string): string {
		const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		const match = new RegExp(`(?:^|[\\n}])\\s*${escaped}\\s*\\{([^}]*)\\}`).exec(tokens);
		expect(match, `tokens.css must declare a ${selector} rule`).toBeTruthy();
		return match?.[1] ?? '';
	}

	const HOST_PADDING =
		'padding: var(--gawdux-page-inset) var(--gawdux-page-inset) var(--gawdux-page-inset-bottom);';

	it('declares the inset and wide-column knobs at the geometry that shipped', () => {
		const expected: Record<string, string> = {
			// pt-4 px-4 on the top and sides, pb-1 above the command bar
			'--gawdux-page-inset': step(4),
			'--gawdux-page-inset-bottom': step(1),
			// max-w-6xl
			'--gawdux-panel-wide-max-width': '72rem'
		};
		for (const [name, value] of Object.entries(expected)) {
			expect(tokenValue(rootBlock, name), name).toBe(value);
			expect(darkBlock, `${name} is theme-independent`).not.toContain(`${name}:`);
		}
	});

	it('every inset host pads from the knobs and keeps no padding utility', () => {
		for (const host of ['.scroll-surface', '.page-inset', '.master-detail-inset', '.tab-fill-scroll']) {
			const body = ruleOf(host);
			expect(body, `${host} pads from the knobs`).toContain(HOST_PADDING);
			for (const utility of ['pt-4', 'px-4', 'pb-1', 'p-4']) {
				expect(body, `${host} keeps no ${utility}`).not.toMatch(new RegExp(`\\b${utility}\\b`));
			}
		}
		// The panel still fills and scrolls the way it always did.
		expect(ruleOf('.scroll-surface')).toContain('@apply min-h-0 flex-1 overflow-auto;');
		expect(ruleOf('.tab-fill-scroll')).toContain('overflow-y: auto;');
	});

	it("the shell's fallback inset is zero inside every host", () => {
		const body = ruleOf(
			':is(.scroll-surface, .editable-page-body, .page-inset, .tab-fill-scroll) .master-detail-inset'
		);
		expect(body.trim()).toBe('padding: 0;');
	});

	it("the scrolling fill panel spans its host's padding box", () => {
		const body = ruleOf(':is(.scroll-surface, .editable-page-body, .page-inset) .tab-fill-scroll');
		expect(body.replace(/\s+/g, ' ').trim()).toBe(
			'margin: calc(-1 * var(--gawdux-page-inset)) calc(-1 * var(--gawdux-page-inset)) calc(-1 * var(--gawdux-page-inset-bottom));'
		);
	});

	it('the fill-mode chain and the list chrome are untouched', () => {
		// The panel keeps its padding in fill mode: a fill tab ends one inset
		// above the bar. List chrome never reads the inset knobs.
		const fill = tokens.slice(
			tokens.indexOf('.page-tabs-shell:has(.tab-fill-panel) {'),
			tokens.indexOf('---------- Card system')
		);
		expect(fill).not.toMatch(/padding|--gawdux-page-inset/);
		expect(ruleOf('.list-table-scroll')).toContain('@apply min-h-0 flex-1 overflow-auto pb-1;');
		expect(ruleOf('.list-table-scroll')).not.toContain('--gawdux-page-inset');
	});

	it('the wide content column reads the knob', () => {
		expect(ruleOf('.panel-col-wide')).toContain('max-width: var(--gawdux-panel-wide-max-width);');
	});
});
