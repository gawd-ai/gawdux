// Vitest stand-in for SvelteKit's `$app/navigation`. The library modules that
// import it (utils/list-state, utils/discard-navigation, primitives/
// CommandPalette) receive these no-ops under test; suites that care about
// navigation inject their own runtime (DiscardNavigationRuntime) or callback
// (CommandPalette `onnavigate`) instead of relying on these.
export const goto = async (..._args: unknown[]): Promise<void> => {};
export const beforeNavigate = (_callback: (navigation: unknown) => void): void => {};
export const afterNavigate = (_callback: (navigation: unknown) => void): void => {};
export const invalidate = async (..._args: unknown[]): Promise<void> => {};
export const invalidateAll = async (): Promise<void> => {};
