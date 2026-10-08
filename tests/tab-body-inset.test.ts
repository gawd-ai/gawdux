import { describe, expect, it } from 'vitest';

/**
 * A gawdux component that renders its own PageTabs puts its tab bodies in
 * `.scroll-surface`, the inset host. The body opens on the host's inset: its
 * first element pads nothing and carries no margin toward the panel's edges
 * (AlertOpsConsole's bodies were `space-y-3 p-3`, a second inset of 12px
 * inside the panel's 16). The same rule a product enforces on its own tabs.
 */
const sources = import.meta.glob('../src/lib/**/*.svelte', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;
const files = Object.entries(sources).map(([path, source]) => ({
	file: path.replace('../src/lib/', ''),
	source
}));

/** The first element of every TabItem body in `source`, title slot left out. */
function tabBodyOpeners(source: string): { tag: string; classes: string[] }[] {
	const out: { tag: string; classes: string[] }[] = [];
	for (const match of source.matchAll(/<TabItem\b[^>]*>([\s\S]*?)<\/TabItem>/g)) {
		const body = (match[1] ?? '')
			.replace(/<!--[\s\S]*?-->/g, '')
			.replace(/<TabTitle\b[^>]*\/>/g, '')
			.replace(/<(\w+)\b[^>]*\bslot="title"[\s\S]*?<\/\1>/g, '');
		const opener = /<([A-Za-z][\w.:-]*)\b([^>]*)>/.exec(body);
		if (!opener) continue;
		const classes = [...(opener[2] ?? '').matchAll(/\bclass(?:Name)?="([^"]*)"/g)]
			.flatMap((x) => (x[1] ?? '').split(/\s+/))
			.filter(Boolean);
		out.push({ tag: opener[1] ?? '', classes });
	}
	return out;
}

describe('a tab body opens on the panel inset', () => {
	it('finds the tab bodies it guards', () => {
		const withTabs = files.filter(({ source }) => /<TabItem\b/.test(source));
		expect(withTabs.map(({ file }) => file)).toContain('alert-ops/AlertOpsConsole.svelte');
	});

	it('no tab body pads itself or pushes off the panel edges', () => {
		const offenders = files.flatMap(({ file, source }) =>
			tabBodyOpeners(source).flatMap(({ tag, classes }) => {
				const refused = classes.filter((c) => {
					const bare = c.replace(/^(?:[\w@-]+:)*!?/, '');
					return /^-?p[xytrblse]?-(?!0\b)/.test(bare) || /^-?m[xytrblse]?-(?!0\b|auto\b)/.test(bare);
				});
				return refused.length ? [`${file}: <${tag}> ${refused.join(' ')}`] : [];
			})
		);
		expect(offenders).toEqual([]);
	});
});
