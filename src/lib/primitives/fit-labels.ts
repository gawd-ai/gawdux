/**
 * A row of controls that each carry an icon and a label shows the labels
 * whenever they fit and the icons alone when they do not: one rule for a tab
 * strip and for a row that holds a strip and the tools after it.
 *
 * `fitLabels` reads, with the labels shown, the width the row's controls need
 * against the width the row has, and marks the row `data-labels="icons"` when
 * they do not fit. tokens.css ("Icons alone while the labels do not fit")
 * then hides each label (`.gawdux-control-label`) as words a screen reader
 * still reads, gives a tab its icon alone on a 44px target and draws a tool
 * (`.gawdux-tool-button`) as the house icon button. While the labels are
 * hidden, each control whose label hid carries it as its tooltip (`title`),
 * unless it has one of its own.
 *
 * It reads the row's own box, never the viewport, so a wide pane on a narrow
 * screen keeps its labels and a narrow pane on a wide one shows its icons. A
 * fixed width cannot stand for "the labels fit": five tabs need more room
 * than two. The measure is taken with the labels shown each time, so the
 * answer never depends on the state it sets, and it is read again when the
 * row's box or anything in it changes size, when a control comes or goes and
 * when a web font arrives. A strip that still does not fit with its icons
 * alone scrolls within itself (`.gawdux-tab-strip`, `scrollEdges`).
 */

/** The labelled controls fit their row, a pixel's slack for rounding. */
export function labelsFit({ need, room }: { need: number; room: number }): boolean {
	return need <= room + 1;
}

const LABEL = '.gawdux-control-label';
const TITLED = 'data-fit-labels-title';

function scrolls(el: Element): boolean {
	const overflow = getComputedStyle(el).overflowX;
	return overflow === 'auto' || overflow === 'scroll' || overflow === 'hidden';
}

function px(value: string | null | undefined): number {
	const n = Number.parseFloat(value ?? '');
	return Number.isFinite(n) ? n : 0;
}

/**
 * What an element needs across: a strip that scrolls, its whole content
 * (with its own edges); anything else, its box or its content, whichever is
 * wider.
 */
function needOf(el: HTMLElement): number {
	if (scrolls(el)) return el.scrollWidth + Math.max(0, el.offsetWidth - el.clientWidth);
	return Math.max(el.offsetWidth, el.scrollWidth);
}

/** The width the row's controls need with their labels, and the width the row has. */
function measureLabelled(node: HTMLElement): { need: number; room: number } {
	if (scrolls(node)) return { need: node.scrollWidth, room: node.clientWidth };
	const style = getComputedStyle(node);
	const children = Array.from(node.children).filter((child): child is HTMLElement => {
		if (!(child instanceof HTMLElement)) return false;
		const own = getComputedStyle(child);
		return own.display !== 'none' && own.position !== 'absolute' && own.position !== 'fixed';
	});
	const gap = px(style.columnGap) * Math.max(0, children.length - 1);
	const need = children.reduce((sum, child) => {
		const own = getComputedStyle(child);
		return sum + needOf(child) + px(own.marginLeft) + px(own.marginRight);
	}, px(style.paddingLeft) + px(style.paddingRight) + gap);
	return { need, room: node.clientWidth };
}

/** Each hidden label is its control's tooltip; shown again, the tooltip it lent goes. */
function lendTitles(node: HTMLElement, icons: boolean) {
	for (const label of Array.from(node.querySelectorAll<HTMLElement>(LABEL))) {
		const control = label.closest<HTMLElement>('button, a, [role="tab"]');
		if (!control || !node.contains(control)) continue;
		if (icons) {
			if (control.hasAttribute('title')) continue;
			const words = label.textContent?.trim();
			if (!words) continue;
			control.setAttribute('title', words);
			control.setAttribute(TITLED, '');
		} else if (control.hasAttribute(TITLED)) {
			control.removeAttribute('title');
			control.removeAttribute(TITLED);
		}
	}
}

export type FitLabels = {
	/** Reads the row again: a host that changed what it holds without a resize. */
	measure(): void;
	destroy(): void;
};

/** Marks `node` `data-labels="icons"` while its labelled controls do not fit its box. */
export function fitLabels(node: HTMLElement): FitLabels {
	node.classList.add('gawdux-fit-labels');
	let measuring = false;
	let live = true;
	const measure = () => {
		if (measuring || !live) return;
		measuring = true;
		try {
			delete node.dataset['labels'];
			const icons = !labelsFit(measureLabelled(node));
			if (icons) node.dataset['labels'] = 'icons';
			lendTitles(node, icons);
		} finally {
			measuring = false;
		}
	};
	const sized = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
	const observe = () => {
		if (!sized) return;
		sized.disconnect();
		sized.observe(node);
		for (const child of Array.from(node.children)) sized.observe(child);
	};
	const changed =
		typeof MutationObserver === 'undefined'
			? null
			: new MutationObserver(() => {
					observe();
					measure();
				});
	changed?.observe(node, { childList: true, subtree: true, characterData: true });
	observe();
	measure();
	const fonts = typeof document !== 'undefined' ? document.fonts : undefined;
	fonts?.addEventListener?.('loadingdone', measure);
	void fonts?.ready?.then(measure);
	return {
		measure,
		destroy() {
			live = false;
			sized?.disconnect();
			changed?.disconnect();
			fonts?.removeEventListener?.('loadingdone', measure);
			delete node.dataset['labels'];
			lendTitles(node, false);
			node.classList.remove('gawdux-fit-labels');
		}
	};
}
