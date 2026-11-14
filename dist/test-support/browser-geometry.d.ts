import type { Browser, Page } from 'playwright-core';
export interface GeometryOptions {
    /** The repository's root: bare imports and `node_modules` resolve from it. */
    root: string;
    /**
     * The stylesheet the app ships, the entry Tailwind compiles: a file, or
     * its text with the directory its imports resolve from.
     */
    stylesheet: string | {
        css: string;
        base: string;
    };
    /** Stylesheet imports resolved by hand: the id as written, to a file. */
    stylesheetImports?: Readonly<Record<string, string>>;
    /**
     * Libraries resolved through their package's `exports`, by name, to the
     * root that holds their `package.json` (a carried tree, a linked checkout).
     */
    libraries?: Readonly<Record<string, string>>;
    /** Import aliases of the app's bundler (`$lib`), to a directory. */
    aliases?: Readonly<Record<string, string>>;
    /** The framework's runtime modules as a page outside a navigation reads them. */
    appModules?: Readonly<Record<string, string>>;
}
export type Box = {
    left: number;
    right: number;
    top: number;
    bottom: number;
    width: number;
    height: number;
};
export interface PageOptions {
    width: number;
    height?: number;
    css: string[];
    dark?: boolean;
    /** The body's classes; a quiet grey page with no margin by default. */
    bodyClass?: string;
}
export interface Geometry {
    /** A headless Chromium. Throws, saying why, when there is none to launch. */
    launch(): Promise<Browser>;
    /** The app's stylesheet for the classes in `html`. */
    appStylesheet(html: string): Promise<string>;
    /** A file of the repository. */
    repoFile(rel: string): string;
    /** A library's packaged file. */
    libraryFile(library: string, rel: string): string;
    /** A component compiled for the browser and bundled with what it imports. */
    clientBundle(file: string, props?: Record<string, unknown>): Promise<string>;
}
/** The viewports the phone geometry is held at: two phones, a tablet, a desk. */
export declare const GEOMETRY_WIDTHS: readonly [360, 390, 900, 1440];
/** A headless Chromium of the revision the installed playwright-core expects. */
export declare function launchGeometry(from?: string): Promise<Browser>;
/**
 * A component's scoped rules, scoped as the server rendered them in `body`.
 * The component is compiled as the test runner compiled it, so its class
 * hash is the one its markup carries, and a component the body does not
 * draw throws. Where a host's bundler hashes another way (`fromMarkup`),
 * the hash is read from the markup: the one carried beside the most of the
 * component's own classes. That reading cannot tell two components that
 * share a class name apart, so give it only the components the body draws.
 */
export declare function componentStylesheet(file: string, body: string, { fromMarkup }?: {
    fromMarkup?: boolean;
}): Promise<string>;
/**
 * The scoped rules of every component in `files` that `body` draws; one not
 * drawn there adds nothing.
 */
export declare function componentStylesheets(files: readonly string[], body: string, options?: {
    fromMarkup?: boolean;
}): Promise<string[]>;
/** A page at `width` (and `height`) with the markup and the stylesheets. */
export declare function openAt(browser: Browser, { width, height, html, css, dark, bodyClass }: PageOptions & {
    html: string;
}): Promise<Page>;
/** Each matching element's box, in document order. */
export declare function boxes(page: Page, selector: string): Promise<Box[]>;
/** A page at `width` with the stylesheets and `script` (a `clientBundle`) mounted and settled. */
export declare function mountAt(browser: Browser, { script, ...options }: PageOptions & {
    script: string;
}): Promise<Page>;
/**
 * The harness for one repository: its stylesheet, its libraries and its
 * bundler's aliases, read as the app resolves them.
 */
export declare function createGeometry(options: GeometryOptions): Geometry;
