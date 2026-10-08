import { cleanup, render } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';
import TabFillPanel from '../src/lib/primitives/TabFillPanel.svelte';

afterEach(() => cleanup());

const classesOf = (element: Element | null) =>
	[...(element?.classList ?? [])].filter((c) => !c.startsWith('svelte-'));

describe('TabFillPanel', () => {
	it('adds no inset and no scroller by default: the host owns the inset', () => {
		const { container } = render(TabFillPanel, { props: { class: 'gap-3' } });
		expect(classesOf(container.firstElementChild)).toEqual(['tab-fill-panel', 'gap-3']);
	});

	it('scroll makes the panel the scrolling form that spans its host', () => {
		const { container } = render(TabFillPanel, { props: { scroll: true } });
		expect(classesOf(container.firstElementChild)).toEqual(['tab-fill-panel', 'tab-fill-scroll']);
	});
});
