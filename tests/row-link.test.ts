import { afterEach, describe, expect, it, vi } from 'vitest';
import { isRowClickTarget as primitivesRowClickTarget } from '../src/lib/primitives/index';
import { activateRowLink, isRowClickTarget, rowLinkIntent } from '../src/lib/utils/row-link';

function eventOn(markup = '<td>Item</td>', init: MouseEventInit = {}) {
	document.body.innerHTML = `<table><tbody><tr>${markup}</tr></tbody></table>`;
	const row = document.querySelector('tr')!;
	const target = row.querySelector('[data-target]') ?? row.firstElementChild!;
	const event = new MouseEvent(init.button === 1 ? 'auxclick' : 'click', {
		bubbles: true,
		cancelable: true,
		...init
	});
	let intent: ReturnType<typeof rowLinkIntent> = null;
	row.addEventListener(event.type, (received) => {
		intent = rowLinkIntent(received as MouseEvent);
	});
	target.dispatchEvent(event);
	return { event, intent, row, target };
}

afterEach(() => {
	window.getSelection()?.removeAllRanges();
	document.body.replaceChildren();
	vi.restoreAllMocks();
});

describe('row background link activation', () => {
	it('routes an ordinary primary click without changing table semantics', () => {
		const { event, intent } = eventOn();
		expect(intent).toBe('current');
		const navigate = vi.fn();
		const open = vi.fn();
		activateRowLink(event, '/items/7', { navigate, open });
		expect(navigate).toHaveBeenCalledWith('/items/7');
		expect(open).not.toHaveBeenCalled();
		expect(event.defaultPrevented).toBe(true);
	});

	it.each([{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { button: 1 }])(
		'opens a separate context for %j, without using the host router',
		(init) => {
			const { event, intent } = eventOn(undefined, init);
			expect(intent).toBe('new-context');
			const navigate = vi.fn();
			const open = vi.fn();
			activateRowLink(event, '/items/7', { navigate, open });
			expect(open).toHaveBeenCalledWith('/items/7');
			expect(navigate).not.toHaveBeenCalled();
		}
	);

	it('uses the clicked document window with noopener when no open adapter is supplied', () => {
		const open = vi.spyOn(document.defaultView!, 'open').mockReturnValue(null);
		const { event } = eventOn(undefined, { button: 1 });
		activateRowLink(event, '/items/7', { navigate: vi.fn() });
		expect(open).toHaveBeenCalledWith('/items/7', '_blank', 'noopener');
	});

	it.each([
		'<a href="#elsewhere"><span data-target>Link</span></a>',
		'<button><svg data-target></svg></button>',
		'<input data-target>',
		'<select data-target><option>One</option></select>',
		'<textarea data-target></textarea>',
		'<label data-target>Field</label>',
		'<details><summary data-target>Details</summary></details>',
		'<span role="checkbox" data-target>Toggle</span>',
		'<span role="button" data-target>Action</span>',
		'<span contenteditable="true" data-target>Editor</span>',
		'<span data-row-interactive data-target>Custom control</span>'
	])('leaves nested interactive content alone: %s', (content) => {
		const { event, intent } = eventOn(`<td>${content}</td>`);
		expect(intent).toBeNull();
		const navigate = vi.fn();
		activateRowLink(event, '/items/7', { navigate });
		expect(navigate).not.toHaveBeenCalled();
		expect(event.defaultPrevented).toBe(false);
	});

	it.each([{ altKey: true }, { button: 2 }])('ignores %j', (init) => {
		expect(eventOn(undefined, init).intent).toBeNull();
	});

	it('respects a child handler cancellation', () => {
		const { event } = eventOn();
		event.preventDefault();
		expect(rowLinkIntent(event)).toBeNull();
	});

	it('does not navigate while the user selects row text', () => {
		const { row, event } = eventOn();
		const range = document.createRange();
		range.selectNodeContents(row.firstElementChild!);
		window.getSelection()!.addRange(range);
		expect(rowLinkIntent(event)).toBeNull();
	});

	it('recognizes a text-node target inside a native anchor', () => {
		const { row } = eventOn('<td><a href="#other">Item</a></td>');
		const event = new MouseEvent('click', { bubbles: true });
		row.querySelector('a')!.firstChild!.dispatchEvent(event);
		expect(rowLinkIntent(event)).toBeNull();
	});

	it('returns the router result so the host can observe navigation failures', async () => {
		const { event } = eventOn();
		const result = Promise.resolve('finished');
		expect(activateRowLink(event, '/items/7', { navigate: () => result })).toBe(result);
		await result;
	});
});

/** A row with a disclosure control whose icon the control swaps on click, as
 * a chevron does when it opens the row's detail. */
function swappingControl(): { row: HTMLTableRowElement; icon: Element; text: Element } {
	document.body.innerHTML =
		'<table><tbody><tr><td><span data-text>Item</span></td><td><button><svg data-icon></svg></button></td></tr></tbody></table>';
	const button = document.querySelector('button')!;
	button.addEventListener('click', () =>
		button.replaceChildren(document.createElementNS('http://www.w3.org/2000/svg', 'svg'))
	);
	return {
		row: document.querySelector('tr')!,
		icon: document.querySelector('[data-icon]')!,
		text: document.querySelector('[data-text]')!
	};
}

/** What the row's own listener reads of a click on `target`. */
function rowReads(row: HTMLTableRowElement, target: Element) {
	const read: { intent?: ReturnType<typeof rowLinkIntent>; rows?: boolean } = {};
	row.addEventListener('click', (event) => {
		read.intent = rowLinkIntent(event);
		read.rows = isRowClickTarget(event);
	});
	target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
	return read;
}

describe('a control that redraws itself under the click', () => {
	// A real click runs the page's microtasks between one listener and the
	// next, so the control has removed the click's target from the document
	// before the click reaches the row. Read as the row's, the row undoes what
	// the control did.
	it('leaves the click to the control whose icon left the document', () => {
		const { row, icon } = swappingControl();
		const read = rowReads(row, icon);
		expect(icon.isConnected).toBe(false);
		expect(read.intent).toBeNull();
		expect(read.rows).toBe(false);
	});

	it("still takes a click on the row's text as the row's", () => {
		const { row, text } = swappingControl();
		const read = rowReads(row, text);
		expect(read.intent).toBe('current');
		expect(read.rows).toBe(true);
	});
});

describe('the one row-click guard', () => {
	it('is the guard the primitives export, the one the data table asks', () => {
		expect(primitivesRowClickTarget).toBe(isRowClickTarget);
	});

	it.each([
		'<a href="#elsewhere"><span data-target>Link</span></a>',
		'<button><svg data-target></svg></button>',
		'<label data-target>Field</label>',
		'<details><summary data-target>Details</summary></details>',
		'<span role="checkbox" data-target>Toggle</span>',
		'<span role="link" data-target>Open</span>',
		'<span contenteditable="true" data-target>Editor</span>',
		'<span data-row-interactive data-target>Custom control</span>'
	])('leaves the controls the row link leaves to them: %s', (content) => {
		const { event } = eventOn(`<td>${content}</td>`);
		expect(isRowClickTarget(event)).toBe(false);
	});

	it('reads a text-node target by the element that holds it', () => {
		const { row } = eventOn('<td><a href="#other">Item</a><span>Text</span></td>');
		const inLink = new MouseEvent('click', { bubbles: true });
		row.querySelector('a')!.firstChild!.dispatchEvent(inLink);
		expect(isRowClickTarget(inLink)).toBe(false);
		const inText = new MouseEvent('click', { bubbles: true });
		row.querySelector('span')!.firstChild!.dispatchEvent(inText);
		expect(isRowClickTarget(inText)).toBe(true);
	});
});
