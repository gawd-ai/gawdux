// @vitest-environment node
/**
 * The geometry harness finds the Chromium the installed playwright-core
 * expects, never another revision, and says why when there is none.
 */
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
	GEOMETRY_CHROMIUM_ENV,
	GEOMETRY_WIDTHS,
	componentStylesheet,
	geometryChromium,
	geometrySkipReason,
	hostPackage,
	launchGeometry
} from '../src/lib/test-support';

const ROOT = path.resolve(import.meta.dirname, '..');
const require = createRequire(path.join(ROOT, 'package.json'));
const browsers = JSON.parse(
	readFileSync(
		path.join(path.dirname(require.resolve('playwright-core/package.json')), 'browsers.json'),
		'utf8'
	)
) as { browsers: { name: string; revision: string }[] };
const revision = (name: string) =>
	browsers.browsers.find((browser) => browser.name === name)!.revision;

let home: string;
const saved: Record<string, string | undefined> = {};
beforeEach(() => {
	home = mkdtempSync(path.join(tmpdir(), 'gawdux-geometry-'));
	for (const name of ['PLAYWRIGHT_BROWSERS_PATH', GEOMETRY_CHROMIUM_ENV]) saved[name] = process.env[name];
	process.env['PLAYWRIGHT_BROWSERS_PATH'] = home;
	delete process.env[GEOMETRY_CHROMIUM_ENV];
});
afterEach(() => {
	for (const [name, value] of Object.entries(saved)) {
		if (value === undefined) delete process.env[name];
		else process.env[name] = value;
	}
	rmSync(home, { recursive: true, force: true });
});

/** An installed revision: its directory and an executable inside it. */
function install(directory: string, file: string): string {
	const at = path.join(home, directory, path.dirname(file));
	mkdirSync(at, { recursive: true });
	const full = path.join(home, directory, file);
	writeFileSync(full, '');
	return full;
}

describe('the Chromium of the geometry tests', () => {
	it('is the headless shell of the revision playwright-core expects', () => {
		const shell = install(
			`chromium_headless_shell-${revision('chromium-headless-shell')}`,
			'chrome-headless-shell-linux64/chrome-headless-shell'
		);
		expect(geometryChromium(ROOT)).toEqual({ ok: true, executablePath: shell });
		expect(geometrySkipReason(ROOT)).toBeNull();
	});

	it('never takes a shell of another revision: a newer core does not drive an older shell', async () => {
		const expected = Number(revision('chromium-headless-shell'));
		install(`chromium_headless_shell-${expected - 1}`, 'chrome-linux/headless_shell');
		install(`chromium_headless_shell-${expected + 4}`, 'chrome-headless-shell-linux64/chrome-headless-shell');
		const found = geometryChromium(ROOT);
		expect(found.ok).toBe(false);
		const reason = geometrySkipReason(ROOT)!;
		expect(reason).toContain(`chromium_headless_shell-${expected}`);
		expect(reason).toContain(home);
		expect(reason).toContain(GEOMETRY_CHROMIUM_ENV);
		// A launch throws, saying why: nothing hangs on a browser that is not there.
		await expect(launchGeometry(ROOT)).rejects.toThrow(/No Chromium for the geometry tests/);
	});

	it('falls back to the full Chromium of the expected revision', () => {
		const full = install(`chromium-${revision('chromium')}`, 'chrome-linux64/chrome');
		expect(geometryChromium(ROOT)).toEqual({ ok: true, executablePath: full });
	});

	it("takes a person's own Chromium when they name one, and says so when the name is wrong", () => {
		const own = install('own', 'chrome');
		process.env[GEOMETRY_CHROMIUM_ENV] = own;
		expect(geometryChromium(ROOT)).toEqual({ ok: true, executablePath: own });
		process.env[GEOMETRY_CHROMIUM_ENV] = path.join(home, 'missing');
		expect(geometrySkipReason(ROOT)).toBe(`${GEOMETRY_CHROMIUM_ENV} names no file`);
	});

	it('says so where playwright-core is not installed', () => {
		expect(geometrySkipReason(home)).toBe('playwright-core is not installed');
	});

	it('holds the phone geometry at two phones, a tablet and a desk', () => {
		expect([...GEOMETRY_WIDTHS]).toEqual([360, 390, 900, 1440]);
	});
});

describe("a component's scoped rules for a server body", () => {
	const file = path.join(ROOT, 'src/lib/shell/ShellBarEnd.svelte');

	it('refuses a component the body does not draw', async () => {
		await expect(componentStylesheet(file, '<div class="other svelte-abc123"></div>')).rejects.toThrow(
			'The body does not draw ShellBarEnd.svelte'
		);
	});

	it('reads the hash from the markup only when asked, by the classes the component owns', async () => {
		const body =
			'<div class="gawdux-shell-bar-account svelte-abc123"></div><div class="other svelte-zzz999"></div>';
		const css = await componentStylesheet(file, body, { fromMarkup: true });
		expect(css).toContain('.gawdux-shell-bar-account.svelte-abc123');
		expect(css).not.toContain('svelte-zzz999');
		await expect(
			componentStylesheet(file, '<div class="other svelte-zzz999"></div>', { fromMarkup: true })
		).rejects.toThrow('No markup in the body carries the scoped classes of ShellBarEnd.svelte');
	});
});

describe('the packages the harness runs are the host\'s own', () => {
	let host: string;
	beforeEach(() => {
		host = mkdtempSync(path.join(tmpdir(), 'gawdux-host-'));
		// A host that installed its own @tailwindcss/node: a stand-in module
		// that says which copy it is.
		const at = path.join(host, 'node_modules', '@tailwindcss', 'node');
		mkdirSync(at, { recursive: true });
		writeFileSync(path.join(host, 'package.json'), '{"name":"host","type":"module"}');
		writeFileSync(path.join(at, 'package.json'), '{"name":"@tailwindcss/node","version":"9.9.9","type":"module","main":"index.js"}');
		writeFileSync(path.join(at, 'index.js'), "export const copy = 'the host one';\n");
	});
	afterEach(() => rmSync(host, { recursive: true, force: true }));

	it('takes a package from the root it is given, never the copy beside the library', async () => {
		// This repository installs its own @tailwindcss/node too: a bare import
		// from the harness would find that one, of another version than a host's.
		expect(require.resolve('@tailwindcss/node')).not.toContain(host);
		const found = await hostPackage<{ copy: string }>(host, '@tailwindcss/node');
		expect(found.copy).toBe('the host one');
	});

	it('says which package a host has not installed', async () => {
		await expect(hostPackage(host, 'esbuild-not-installed-here')).rejects.toThrow(/esbuild-not-installed-here/);
	});
});
