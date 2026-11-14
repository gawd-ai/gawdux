/** A person's own Chromium for the geometry tests, in place of the search. */
export declare const GEOMETRY_CHROMIUM_ENV = "GAWDUX_GEOMETRY_CHROMIUM";
export type GeometryChromium = {
    ok: true;
    executablePath: string;
} | {
    ok: false;
    reason: string;
};
/**
 * The Chromium to launch, or why there is none. `from` is the directory
 * playwright-core is resolved from: the repository running the tests.
 */
export declare function geometryChromium(from?: string): GeometryChromium;
/** Why the geometry tests cannot run here, null when they can. */
export declare function geometrySkipReason(from?: string): string | null;
