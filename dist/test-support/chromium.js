/**
 * The Chromium the geometry tests run in: an installed headless shell whose
 * revision is the one the installed playwright-core expects, so a newer core
 * never drives an older shell (which hangs on the first page).
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { homedir, platform } from 'node:os';
import path from 'node:path';
/** A person's own Chromium for the geometry tests, in place of the search. */
export const GEOMETRY_CHROMIUM_ENV = 'GAWDUX_GEOMETRY_CHROMIUM';
/** Where Playwright keeps its browsers on this machine. */
function browsersHome() {
    const set = process.env['PLAYWRIGHT_BROWSERS_PATH']?.trim();
    if (set && set !== '0')
        return path.resolve(set);
    if (platform() === 'darwin')
        return path.join(homedir(), 'Library', 'Caches', 'ms-playwright');
    if (platform() === 'win32') {
        return path.join(process.env['LOCALAPPDATA'] ?? path.join(homedir(), 'AppData', 'Local'), 'ms-playwright');
    }
    return path.join(process.env['XDG_CACHE_HOME'] ?? path.join(homedir(), '.cache'), 'ms-playwright');
}
const EXECUTABLES = new Set([
    'chrome-headless-shell',
    'chrome-headless-shell.exe',
    'headless_shell',
    'headless_shell.exe',
    'chrome',
    'chrome.exe'
]);
/** The browser's executable inside one installed revision, two levels deep at most. */
function executableIn(directory) {
    const look = (at, depth) => {
        let entries;
        try {
            entries = readdirSync(at);
        }
        catch {
            return null;
        }
        for (const entry of entries) {
            const full = path.join(at, entry);
            if (EXECUTABLES.has(entry) && statSync(full).isFile())
                return full;
        }
        if (depth === 0)
            return null;
        for (const entry of entries) {
            const full = path.join(at, entry);
            try {
                if (!statSync(full).isDirectory())
                    continue;
            }
            catch {
                continue;
            }
            const found = look(full, depth - 1);
            if (found)
                return found;
        }
        return null;
    };
    return look(directory, 2);
}
/** The revisions the installed playwright-core expects, the headless shell first. */
function expectedRevisions(from) {
    try {
        const require = createRequire(path.join(from, 'package.json'));
        const manifest = require.resolve('playwright-core/package.json');
        const browsers = JSON.parse(readFileSync(path.join(path.dirname(manifest), 'browsers.json'), 'utf8'));
        const of = (name) => browsers.browsers.find((browser) => browser.name === name);
        const wanted = [];
        const shell = of('chromium-headless-shell');
        if (shell)
            wanted.push({ directory: 'chromium_headless_shell', revision: shell.revision });
        const full = of('chromium');
        if (full)
            wanted.push({ directory: 'chromium', revision: full.revision });
        return wanted;
    }
    catch {
        return null;
    }
}
/**
 * The Chromium to launch, or why there is none. `from` is the directory
 * playwright-core is resolved from: the repository running the tests.
 */
export function geometryChromium(from = process.cwd()) {
    const own = process.env[GEOMETRY_CHROMIUM_ENV]?.trim();
    if (own) {
        return existsSync(own)
            ? { ok: true, executablePath: own }
            : { ok: false, reason: `${GEOMETRY_CHROMIUM_ENV} names no file` };
    }
    const wanted = expectedRevisions(from);
    if (!wanted)
        return { ok: false, reason: 'playwright-core is not installed' };
    const home = browsersHome();
    for (const { directory, revision } of wanted) {
        const found = executableIn(path.join(home, `${directory}-${revision}`));
        if (found)
            return { ok: true, executablePath: found };
    }
    const revisions = wanted.map(({ directory, revision }) => `${directory}-${revision}`).join(' or ');
    return {
        ok: false,
        reason: `no Chromium of the revision the installed playwright-core expects (${revisions}) under ${home}; set ${GEOMETRY_CHROMIUM_ENV} to one, or install it`
    };
}
/** Why the geometry tests cannot run here, null when they can. */
export function geometrySkipReason(from = process.cwd()) {
    const chromium = geometryChromium(from);
    return chromium.ok ? null : chromium.reason;
}
