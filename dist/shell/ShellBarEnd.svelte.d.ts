import type { Snippet } from 'svelte';
type $$ComponentProps = {
    /** The notices, before the account. */
    notices?: Snippet;
    /** The account menu, last in the bar. */
    account?: Snippet;
};
/**
 * The host's controls at the right end of the phone shell's one bar along
 * the bottom (ShellBar's `end`): the notices, then the account, last in the
 * bar, after an occupant's own controls when something occupies the bar (a
 * chat rail) and in the same place when nothing does. The header carries
 * them above the compact width.
 *
 * Both are the host's: `account` is its account menu, which in the bar is
 * the avatar alone and opens upward as a sheet above it (UserMenu and
 * AccountCard read `inShellBar()`), holding what the header and a right
 * column's cap carry beside it up there (a switcher's rows, a meter, the
 * theme). A slot left empty draws nothing.
 */
declare const ShellBarEnd: import("svelte").Component<$$ComponentProps, {}, "">;
type ShellBarEnd = ReturnType<typeof ShellBarEnd>;
export default ShellBarEnd;
