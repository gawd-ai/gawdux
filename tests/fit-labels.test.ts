import postcss from 'postcss';
import { afterEach, describe, expect, it } from 'vitest';
import { fitLabels, labelsFit } from '../src/lib/primitives/fit-labels';
import * as primitives from '../src/lib/primitives/index';
import tokens from '../src/lib/styles/tokens.css?raw';
import packaged from '../dist/styles/tokens.css?raw';

// A row of controls each carrying an icon and a label shows the labels while
// they fit and the icons alone when they do not. jsdom lays nothing out, so
// the widths are stated here; the row as drawn is measured in a real browser
// by the hosts that use it.

type Sizes = { scrollWidth: number; clientWidth: number; offsetWidth?: number };

/** `node` reports `labelled` while it shows its labels and `icons` once it shows its icons alone. */
function sized(node: HTMLElement, row: HTMLElement, labelled: Sizes, icons: Sizes = labelled) {
	const read = (key: keyof Sizes) => () => {
		const sizes = row.dataset['labels'] === 'icons' ? icons : labelled;
		return sizes[key] ?? sizes.clientWidth;
	};
	for (const key of ['scrollWidth', 'clientWidth', 'offsetWidth'] as const) {
		Object.defineProperty(node, key, { configurable: true, get: read(key) });
	}
}

function tab(label: string, withIcon = true): HTMLButtonElement {
	const button = document.createElement('button');
	button.setAttribute('role', 'tab');
	button.innerHTML = withIcon
		? `<span class="gawdux-tab-title"><span class="gawdux-control-icon"></span><span class="gawdux-control-label">${label}</span></span>`
		: `<span class="gawdux-tab-title"><span>${label}</span></span>`;
	return button;
}

/** A strip of tabs that scrolls sideways within itself. */
function strip(labelled: Sizes, icons?: Sizes): HTMLElement {
	const node = document.createElement('div');
	node.style.overflowX = 'auto';
	node.append(tab('Content'), tab('Workflow'), tab('History'));
	sized(node, node, labelled, icons);
	document.body.append(node);
	return node;
}

afterEach(() => {
	document.body.innerHTML = '';
});

describe('labelsFit', () => {
	it('fits while the labelled controls need no more than the room, a pixel of slack', () => {
		expect(labelsFit({ need: 300, room: 300 })).toBe(true);
		expect(labelsFit({ need: 300.6, room: 300 })).toBe(true);
		expect(labelsFit({ need: 302, room: 300 })).toBe(false);
	});
});

describe('fitLabels', () => {
	it('keeps the labels of a strip whose labelled tabs fit its box', () => {
		const node = strip({ scrollWidth: 320, clientWidth: 360 });
		const fit = fitLabels(node);
		expect(node.classList.contains('gawdux-fit-labels')).toBe(true);
		expect(node.hasAttribute('data-labels')).toBe(false);
		expect(node.querySelector('[role="tab"]')?.hasAttribute('title')).toBe(false);
		fit.destroy();
	});

	it('shows the icons alone when the labelled tabs do not fit, each tab titled with its label', () => {
		const node = strip({ scrollWidth: 420, clientWidth: 360 }, { scrollWidth: 132, clientWidth: 360 });
		const fit = fitLabels(node);
		expect(node.dataset['labels']).toBe('icons');
		const titles = Array.from(node.querySelectorAll('[role="tab"]'), (el) => el.getAttribute('title'));
		expect(titles).toEqual(['Content', 'Workflow', 'History']);
		fit.destroy();
		expect(node.hasAttribute('data-labels')).toBe(false);
		expect(node.classList.contains('gawdux-fit-labels')).toBe(false);
		expect(node.querySelector('[role="tab"]')?.hasAttribute('title')).toBe(false);
	});

	it("reads the labelled need again on every measure, so the labels come back once they fit", () => {
		let room = 360;
		const node = document.createElement('div');
		node.style.overflowX = 'auto';
		node.append(tab('Content'), tab('Workflow'));
		Object.defineProperty(node, 'clientWidth', { configurable: true, get: () => room });
		Object.defineProperty(node, 'scrollWidth', {
			configurable: true,
			// The strip needs 400px with its labels and 88px with its icons alone.
			get: () => (node.dataset['labels'] === 'icons' ? Math.max(88, room) : Math.max(400, room))
		});
		document.body.append(node);
		const fit = fitLabels(node);
		expect(node.dataset['labels']).toBe('icons');
		room = 480;
		fit.measure();
		expect(node.hasAttribute('data-labels')).toBe(false);
		room = 390;
		fit.measure();
		expect(node.dataset['labels']).toBe('icons');
		fit.destroy();
	});

	it("keeps a control's own title and leaves a tab with no icon its words", () => {
		const node = strip({ scrollWidth: 420, clientWidth: 360 });
		const titled = node.querySelector<HTMLElement>('[role="tab"]')!;
		titled.title = 'Show the content';
		const bare = tab('Notes', false);
		node.append(bare);
		const fit = fitLabels(node);
		expect(node.dataset['labels']).toBe('icons');
		expect(titled.title).toBe('Show the content');
		expect(bare.hasAttribute('title')).toBe(false);
		fit.destroy();
		expect(titled.title).toBe('Show the content');
	});

	it('measures a row holding a strip and its tools by what each needs, the strip its whole content', () => {
		const row = document.createElement('nav');
		row.style.display = 'flex';
		row.style.columnGap = '8px';
		const tabs = document.createElement('div');
		tabs.style.overflowX = 'auto';
		tabs.append(tab('Content'), tab('Workflow'), tab('History'));
		const tools = document.createElement('div');
		tools.innerHTML =
			'<button class="gawdux-tool-button"><span class="gawdux-control-icon"></span><span class="gawdux-control-label">Contents</span></button>';
		row.append(tabs, tools);
		document.body.append(row);
		let room = 600;
		Object.defineProperty(row, 'clientWidth', { configurable: true, get: () => room });
		// The strip takes the room the tools leave; with labels it needs 300px.
		const toolsWidth = () => (row.dataset['labels'] === 'icons' ? 44 : 120);
		Object.defineProperty(tools, 'offsetWidth', { configurable: true, get: toolsWidth });
		Object.defineProperty(tools, 'clientWidth', { configurable: true, get: toolsWidth });
		Object.defineProperty(tools, 'scrollWidth', { configurable: true, get: toolsWidth });
		const stripBox = () => Math.max(0, room - toolsWidth() - 8);
		const stripNeed = () => (row.dataset['labels'] === 'icons' ? 132 : 300);
		Object.defineProperty(tabs, 'offsetWidth', { configurable: true, get: stripBox });
		Object.defineProperty(tabs, 'clientWidth', { configurable: true, get: stripBox });
		Object.defineProperty(tabs, 'scrollWidth', {
			configurable: true,
			get: () => Math.max(stripNeed(), stripBox())
		});
		const fit = fitLabels(row);
		// 300 + 8 + 120 = 428 fits 600.
		expect(row.hasAttribute('data-labels')).toBe(false);
		room = 390;
		fit.measure();
		expect(row.dataset['labels']).toBe('icons');
		expect(tools.querySelector('button')?.getAttribute('title')).toBe('Contents');
		room = 428;
		fit.measure();
		expect(row.hasAttribute('data-labels')).toBe(false);
		fit.destroy();
	});

	it('is exported with the primitives', () => {
		expect(primitives.fitLabels).toBe(fitLabels);
		expect(primitives.labelsFit).toBe(labelsFit);
	});
});

for (const [name, css] of [
	['tokens.css', tokens],
	['the packaged tokens.css', packaged]
] as const) {
	describe(`icons alone while the labels do not fit (${name})`, () => {
		const root = postcss.parse(css);
		const decls = (selector: string, media?: string) => {
			const found: Record<string, string> = {};
			root.walkRules((rule) => {
				const parent = rule.parent;
				const inMedia = parent?.type === 'atrule' ? (parent as postcss.AtRule).params : undefined;
				if (media ? inMedia !== media : parent?.type !== 'root') return;
				if (!rule.selectors.map((s) => s.replace(/\s+/g, ' ').trim()).includes(selector)) return;
				rule.walkDecls((decl) => {
					found[decl.prop] = decl.value.replace(/\s+/g, ' ');
				});
			});
			return found;
		};

		it('hides a label as words a screen reader still reads', () => {
			expect(decls(".gawdux-fit-labels[data-labels='icons'] .gawdux-control-label")).toMatchObject({
				position: 'absolute',
				width: '1px',
				height: '1px',
				overflow: 'hidden',
				clip: 'rect(0 0 0 0)',
				'white-space': 'nowrap'
			});
		});

		it('gives a tab its icon alone on a 44px target', () => {
			expect(
				decls(".gawdux-fit-labels[data-labels='icons'] :is([role='tab'], button):has(> .gawdux-tab-title .gawdux-control-icon)")
			).toMatchObject({ 'min-width': '2.75rem', 'min-height': '2.75rem', 'padding-inline': '0.75rem' });
			expect(decls(".gawdux-fit-labels[data-labels='icons'] .gawdux-tab-title")).toMatchObject({
				gap: '0',
				'justify-content': 'center'
			});
		});

		it("draws a tool as the house icon button once its row shows icons, the header's size", () => {
			expect(decls(".gawdux-fit-labels[data-labels='icons'] .gawdux-tool-button")).toMatchObject({
				width: '2rem',
				height: '2rem',
				padding: '0',
				'border-color': 'transparent',
				'background-color': 'transparent',
				'box-shadow': 'none'
			});
			expect(
				decls(".gawdux-fit-labels[data-labels='icons'] .gawdux-tool-button", '(max-width: 1024px)')
			).toMatchObject({ width: '2.75rem', height: '2.75rem' });
			expect(
				decls(".gawdux-fit-labels[data-labels='icons'] .gawdux-tool-button:is([aria-pressed='true'], [aria-expanded='true'])")
			).toMatchObject({
				color: 'var(--gawdux-row-selected-text)',
				'background-color': 'var(--gawdux-row-selected-surface)'
			});
		});

		it("shows a choice's short value once its row shows icons, the choice laid over it", () => {
			expect(decls('.gawdux-tool-select-short')).toMatchObject({ display: 'none' });
			expect(decls(".gawdux-fit-labels[data-labels='icons'] .gawdux-tool-select-short")).toMatchObject({
				display: 'inline-flex',
				height: '2rem'
			});
			expect(decls(".gawdux-fit-labels[data-labels='icons'] .gawdux-tool-select > select")).toMatchObject({
				position: 'absolute',
				inset: '0',
				opacity: '0'
			});
		});
	});
}
