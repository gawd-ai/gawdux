/**
 * Layout measured in a real browser, for the tests that hold a geometry: the
 * markup a component renders on the server, set in Chromium with the
 * stylesheets the app ships (its Tailwind entry compiled for the classes the
 * markup uses, the tokens with it, and each component's own scoped rules),
 * at a viewport the test names. jsdom lays nothing out, so a rule a phone
 * depends on (one row, a 44px target, a centred group) is read here as the
 * browser draws it. Where a press or a key sets the geometry (a menu opened
 * under its button), the component itself runs in the page (`clientBundle`,
 * `mountAt`).
 *
 * Node only: test support, never imported by a page. It needs
 * playwright-core, esbuild and @tailwindcss/node in the host's install
 * (`root`): each is resolved from there.
 */
import { readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { compile as compileSvelte } from 'svelte/compiler';
import { geometryChromium } from './chromium.js';
/** The viewports the phone geometry is held at: two phones, a tablet, a desk. */
export const GEOMETRY_WIDTHS = [360, 390, 900, 1440];
/**
 * A package the harness runs, taken from the host's own install: the
 * stylesheet is the host's, so the Tailwind that compiles it, the bundler
 * and the browser driver are the ones the host installed, never a copy that
 * sits beside this library (a carried or linked tree installs its own
 * development packages, of other versions).
 */
export async function hostPackage(root, specifier) {
    const require = createRequire(path.join(path.resolve(root), 'package.json'));
    return (await import(pathToFileURL(require.resolve(specifier)).href));
}
/** A headless Chromium of the revision the installed playwright-core expects. */
export async function launchGeometry(from = process.cwd()) {
    const found = geometryChromium(from);
    if (!found.ok)
        throw new Error(`No Chromium for the geometry tests: ${found.reason}`);
    const { chromium } = await hostPackage(from, 'playwright-core');
    return chromium.launch({ headless: true, executablePath: found.executablePath });
}
/** Every class token in the markup: the candidates Tailwind builds utilities for. */
function classCandidates(html) {
    const found = new Set();
    for (const match of html.matchAll(/class="([^"]*)"/g)) {
        for (const token of match[1].split(/\s+/))
            if (token)
                found.add(token);
    }
    return [...found];
}
const PLACEHOLDER = 'svelte-geometryprobe';
/** Every class a component's scoped rules name beside its hash. */
function scopedClasses(css, hash) {
    const found = new Set();
    for (const match of css.matchAll(new RegExp(`\\.([A-Za-z_][\\w-]*)\\.${hash}`, 'g'))) {
        found.add(match[1]);
    }
    return [...found];
}
/**
 * A component's scoped rules, scoped as the server rendered them in `body`.
 * The component is compiled as the test runner compiled it, so its class
 * hash is the one its markup carries, and a component the body does not
 * draw throws. Where a host's bundler hashes another way (`fromMarkup`),
 * the hash is read from the markup: the one carried beside the most of the
 * component's own classes. That reading cannot tell two components that
 * share a class name apart, so give it only the components the body draws.
 */
export async function componentStylesheet(file, body, { fromMarkup = false } = {}) {
    const source = await readFile(file, 'utf8');
    const natural = compileSvelte(source, { filename: file, css: 'external', generate: 'server' });
    const own = natural.css?.code ?? '';
    if (!own)
        return '';
    const hash = own.match(/\.(svelte-[a-z0-9]+)/)?.[1];
    if (hash && new RegExp(`class="[^"]*\\b${hash}\\b`).test(body))
        return own;
    if (!fromMarkup) {
        throw new Error(`The body does not draw ${path.basename(file)}`);
    }
    const compiled = compileSvelte(source, {
        filename: file,
        css: 'external',
        generate: 'server',
        cssHash: () => PLACEHOLDER
    });
    const css = compiled.css?.code ?? '';
    const votes = new Map();
    for (const name of scopedClasses(css, PLACEHOLDER)) {
        const carried = new Set();
        for (const match of body.matchAll(/class="([^"]*)"/g)) {
            const tokens = match[1].split(/\s+/);
            if (!tokens.includes(name))
                continue;
            for (const token of tokens)
                if (/^svelte-[a-z0-9]+$/.test(token))
                    carried.add(token);
        }
        for (const found of carried)
            votes.set(found, (votes.get(found) ?? 0) + 1);
    }
    const [best] = [...votes].sort((a, b) => b[1] - a[1]);
    if (best)
        return css.replaceAll(PLACEHOLDER, best[0]);
    throw new Error(`No markup in the body carries the scoped classes of ${path.basename(file)}`);
}
/**
 * The scoped rules of every component in `files` that `body` draws; one not
 * drawn there adds nothing.
 */
export async function componentStylesheets(files, body, options = {}) {
    const css = [];
    for (const file of files) {
        try {
            css.push(await componentStylesheet(file, body, options));
        }
        catch {
            // Not drawn in this markup.
        }
    }
    return css;
}
/** A page at `width` (and `height`) with the markup and the stylesheets. */
export async function openAt(browser, { width, height = 844, html, css, dark = false, bodyClass = 'bg-gray-100 m-0' }) {
    const page = await browser.newPage({ viewport: { width, height } });
    await page.setContent(`<!doctype html><html class="${dark ? 'dark' : ''}"><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>${css.join('\n')}</style></head><body class="${bodyClass}" style="margin:0">${html}</body></html>`);
    return page;
}
/** Each matching element's box, in document order. */
export async function boxes(page, selector) {
    return page.$$eval(selector, (elements) => elements.map((element) => {
        const r = element.getBoundingClientRect();
        return {
            left: r.left,
            right: r.right,
            top: r.top,
            bottom: r.bottom,
            width: r.width,
            height: r.height
        };
    }));
}
/** A page at `width` with the stylesheets and `script` (a `clientBundle`) mounted and settled. */
export async function mountAt(browser, { script, ...options }) {
    const page = await openAt(browser, { ...options, html: '<div id="host"></div>' });
    // A component that throws as it mounts fails the test with its error,
    // never as an element the test then cannot find.
    const thrown = [];
    page.on('pageerror', (error) => thrown.push(error.message));
    await page.addScriptTag({ content: script });
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    if (thrown.length > 0)
        throw new Error(`The component threw as it mounted: ${thrown.join('; ')}`);
    return page;
}
/** The framework's runtime modules, as a page outside a navigation reads them. */
const APP_MODULES = {
    '$app/navigation': 'export const goto=async()=>{};export const invalidate=async()=>{};export const invalidateAll=async()=>{};export const beforeNavigate=()=>{};export const afterNavigate=()=>{};export const onNavigate=()=>{};export const pushState=()=>{};export const replaceState=()=>{};',
    '$app/state': 'export const page={url:new URL("http://localhost/app"),params:{},data:{},state:{}};export const navigating={};',
    '$app/stores': 'const value=(v)=>({subscribe:(run)=>{run(v);return()=>{}}});export const page=value({url:new URL("http://localhost/app"),params:{},data:{}});export const navigating=value(null);',
    '$app/environment': 'export const browser=true;export const dev=false;export const building=false;'
};
/** An icon barrel import rewritten to the icons it names, so a bundle
 *  compiles the few a component draws and not the whole set. */
function iconImports(source, icons) {
    return source.replace(/import\s*\{([^}]*)\}\s*from\s*['"]flowbite-svelte-icons['"];?/g, (_, names) => names
        .split(',')
        .map((name) => name.trim())
        .filter(Boolean)
        .map((name) => {
        const [icon, local] = name.split(/\s+as\s+/);
        return `import ${local ?? icon} from ${JSON.stringify(path.join(icons, `${icon}.svelte`))};`;
    })
        .join('\n'));
}
function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
/**
 * The harness for one repository: its stylesheet, its libraries and its
 * bundler's aliases, read as the app resolves them.
 */
export function createGeometry(options) {
    const root = path.resolve(options.root);
    const libraries = options.libraries ?? {};
    const libraryNames = Object.keys(libraries);
    const libraryFilter = libraryNames.length
        ? new RegExp(`^(${libraryNames.map(escapeRegExp).join('|')})(\\/.*)?$`)
        : null;
    const appModules = { ...APP_MODULES, ...options.appModules };
    const icons = path.join(root, 'node_modules/flowbite-svelte-icons/dist');
    function libraryRoot(library) {
        const found = libraries[library];
        if (!found)
            throw new Error(`The geometry harness knows no library named ${library}`);
        return path.resolve(found);
    }
    /** A library import as its package's `exports` resolve it. */
    function libraryEntry(specifier) {
        const found = libraryFilter ? specifier.match(libraryFilter) : null;
        if (!found)
            return null;
        const at = libraryRoot(found[1]);
        const manifest = JSON.parse(readFileSync(path.join(at, 'package.json'), 'utf8'));
        const entry = manifest.exports[`.${found[2] ?? ''}`];
        const target = typeof entry === 'string' ? entry : (entry?.svelte ?? entry?.default);
        return target ? path.join(at, target) : null;
    }
    async function appStylesheet(html) {
        const { compile } = await hostPackage(root, '@tailwindcss/node');
        const entry = typeof options.stylesheet === 'string'
            ? {
                css: await readFile(options.stylesheet, 'utf8'),
                base: path.dirname(options.stylesheet)
            }
            : options.stylesheet;
        const imports = options.stylesheetImports ?? {};
        const compiler = await compile(entry.css, {
            base: entry.base,
            onDependency: () => { },
            customCssResolver: async (id) => imports[id]
        });
        return compiler.build(classCandidates(html));
    }
    async function clientBundle(file, props = {}) {
        const { build, transform } = await hostPackage(root, 'esbuild');
        const { compile, compileModule } = await hostPackage(root, 'svelte/compiler');
        const result = await build({
            stdin: {
                contents: `import { mount } from 'svelte';\nimport Component from ${JSON.stringify(file)};\nmount(Component, { target: document.getElementById('host'), props: ${JSON.stringify(props)} });`,
                resolveDir: root,
                loader: 'js'
            },
            bundle: true,
            write: false,
            format: 'iife',
            // A stylesheet a component imports is the test's to give (`css`).
            loader: { '.css': 'empty' },
            conditions: ['svelte', 'browser'],
            mainFields: ['svelte', 'browser', 'module', 'main'],
            alias: { ...options.aliases },
            // A linked library's own imports fall back to the app's packages.
            nodePaths: [path.join(root, 'node_modules')],
            logLevel: 'silent',
            plugins: [
                {
                    name: 'svelte-client',
                    setup(bundler) {
                        bundler.onResolve({ filter: /^\$app\// }, (args) => ({
                            path: args.path,
                            namespace: 'sveltekit'
                        }));
                        bundler.onLoad({ filter: /.*/, namespace: 'sveltekit' }, (args) => ({
                            contents: appModules[args.path] ?? '',
                            loader: 'js'
                        }));
                        // One Svelte, one Flowbite: a linked library's own copies (its
                        // checkout's node_modules) resolve to the app's, as the app's
                        // bundler dedupes them.
                        bundler.onResolve({ filter: /^(svelte|flowbite-svelte|flowbite-svelte-icons)(\/.*)?$/ }, async (args) => {
                            if (args.resolveDir.startsWith(path.join(root, 'node_modules')))
                                return undefined;
                            if (args.pluginData === 'app')
                                return undefined;
                            const found = await bundler.resolve(args.path, {
                                resolveDir: root,
                                kind: args.kind,
                                pluginData: 'app'
                            });
                            return found.errors.length > 0 ? undefined : { path: found.path };
                        });
                        if (libraryFilter) {
                            bundler.onResolve({ filter: libraryFilter }, (args) => {
                                const found = libraryEntry(args.path);
                                return found ? { path: found } : undefined;
                            });
                        }
                        bundler.onLoad({ filter: /\.svelte$/ }, async (args) => {
                            const source = iconImports(await readFile(args.path, 'utf8'), icons);
                            const { js } = compile(source, {
                                filename: args.path,
                                generate: 'client',
                                css: 'injected'
                            });
                            return { contents: js.code, loader: 'js', resolveDir: path.dirname(args.path) };
                        });
                        bundler.onLoad({ filter: /\.svelte\.(js|ts)$/ }, async (args) => {
                            let source = iconImports(await readFile(args.path, 'utf8'), icons);
                            if (args.path.endsWith('.ts'))
                                source = (await transform(source, { loader: 'ts' })).code;
                            const { js } = compileModule(source, { filename: args.path, generate: 'client' });
                            return { contents: js.code, loader: 'js', resolveDir: path.dirname(args.path) };
                        });
                        bundler.onLoad({ filter: /\.(js|ts)$/ }, async (args) => {
                            const source = await readFile(args.path, 'utf8');
                            if (!source.includes('flowbite-svelte-icons'))
                                return undefined;
                            return {
                                contents: iconImports(source, icons),
                                loader: args.path.endsWith('.ts') ? 'ts' : 'js',
                                resolveDir: path.dirname(args.path)
                            };
                        });
                    }
                }
            ]
        });
        const script = result.outputFiles.find((output) => !output.path.endsWith('.css'));
        if (!script)
            throw new Error(`No client bundle for ${path.basename(file)}`);
        return script.text;
    }
    return {
        launch: () => launchGeometry(root),
        appStylesheet,
        repoFile: (rel) => path.join(root, rel),
        libraryFile: (library, rel) => path.join(libraryRoot(library), 'dist', rel),
        clientBundle
    };
}
