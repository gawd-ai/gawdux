/**
 * The geometry harness as this repository's own tests use it: the library's
 * sources, its tokens compiled with Tailwind for the classes the markup
 * uses, and each component's scoped rules. A machine with no Chromium of
 * the revision playwright-core expects skips these tests, saying so.
 */
import path from 'node:path';
import { readdirSync } from 'node:fs';
import { render } from 'svelte/server';
import type { Component } from 'svelte';
import type { Browser, Page } from 'playwright-core';
import {
	componentStylesheets,
	createGeometry,
	geometrySkipReason,
	mountAt,
	openAt
} from '../../src/lib/test-support';

export const ROOT = path.resolve(import.meta.dirname, '../..');

export const geometry = createGeometry({
	root: ROOT,
	stylesheet: {
		css: [
			"@import 'tailwindcss';",
			"@import './src/lib/styles/tokens.css';",
			'@custom-variant dark (&:where(.dark, .dark *));'
		].join('\n'),
		base: ROOT
	}
});

/** Why these tests do not run here, null when they do. Said once per file. */
export const GEOMETRY_SKIP = geometrySkipReason(ROOT);
if (GEOMETRY_SKIP) {
	process.stderr.write(`[geometry] skipped: ${GEOMETRY_SKIP}\n`);
}

/** Every component of the library and of the shell fixtures: their scoped rules. */
function svelteFiles(directory: string): string[] {
	return readdirSync(directory, { withFileTypes: true })
		.filter((entry) => entry.isFile() && entry.name.endsWith('.svelte'))
		.map((entry) => path.join(directory, entry.name));
}
const SCOPED = [
	...svelteFiles(path.join(ROOT, 'src/lib/shell')),
	...svelteFiles(path.join(ROOT, 'src/lib/components')),
	...svelteFiles(path.join(ROOT, 'src/lib/primitives')),
	...svelteFiles(path.join(ROOT, 'tests/fixtures/shell'))
];

/** A fixture's server markup in Chromium at `width`. */
export async function serverPage(
	browser: Browser,
	component: unknown,
	width: number,
	props: Record<string, unknown> = {},
	dark = false
): Promise<Page> {
	const { body } = render(component as Component<Record<string, unknown>>, { props });
	const css = [await geometry.appStylesheet(body), ...(await componentStylesheets(SCOPED, body))];
	return openAt(browser, { width, html: body, css, dark });
}

const bundles = new Map<string, Promise<string>>();

/** A fixture running in the page at `width`, for a geometry a press sets. */
export async function livePage(
	browser: Browser,
	component: unknown,
	fixture: string,
	width: number,
	props: Record<string, unknown> = {},
	dark = false
): Promise<Page> {
	const key = `${fixture}:${JSON.stringify(props)}`;
	if (!bundles.has(key)) bundles.set(key, geometry.clientBundle(geometry.repoFile(fixture), props));
	const { body } = render(component as Component<Record<string, unknown>>, { props });
	const page = await mountAt(browser, {
		width,
		script: await bundles.get(key)!,
		css: [await geometry.appStylesheet(body)],
		dark
	});
	await page.evaluate(
		() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
	);
	return page;
}
