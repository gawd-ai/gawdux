import { afterEach, describe, expect, it } from 'vitest';
import { slideFadeIn, slideFadeOut } from '../src/lib/utils/transitions';

afterEach(() => {
	document.body.replaceChildren();
});

function transitionNode(): HTMLDivElement {
	const node = document.createElement('div');
	node.style.height = 'auto';
	node.style.opacity = '0.8';
	document.body.append(node);
	return node;
}

describe('slide/fade transitions', () => {
	it('never emits non-finite CSS when computed height is auto', () => {
		const transition = slideFadeIn(transitionNode());
		const css = transition.css(0.5);

		expect(css).not.toMatch(/NaN|Infinity/);
		expect(css).toContain('height: 0px');
	});

	it('supports zero-duration transitions without dividing by zero', () => {
		const node = transitionNode();
		const intro = slideFadeIn(node, { duration: 0 });
		const outro = slideFadeOut(node, { duration: 0 });

		expect(intro.duration).toBe(0);
		expect(outro.duration).toBe(0);
		expect(intro.css(0)).not.toMatch(/NaN|Infinity/);
		expect(intro.css(1)).not.toMatch(/NaN|Infinity/);
		expect(outro.css(0.5)).not.toMatch(/NaN|Infinity/);
	});

	it('falls back from a non-finite duration', () => {
		const transition = slideFadeOut(transitionNode(), { duration: Number.NaN });

		expect(transition.duration).toBe(230);
		expect(transition.css(0.5)).not.toMatch(/NaN|Infinity/);
	});
});
