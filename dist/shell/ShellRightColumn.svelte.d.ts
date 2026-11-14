import type { Snippet } from 'svelte';
type $$ComponentProps = {
    /** The column's panel is open: the cap spans it. */
    panelOpen?: boolean;
    /** The open panel's width, in px. */
    panelWidth?: number;
    /** The panel is being resized: the cap follows without a transition. */
    resizing?: boolean;
    /** The theme toggle's cookie; left out, the cap holds no toggle. */
    themeCookieName?: string;
    themeLabel?: string;
    /** A reading in the cap, beside the theme (a meter). */
    capStart?: Snippet;
    /**
     * The panel's name while it is the view at the compact width: the
     * frame is then a dialog with this name. Left out, it is a plain box.
     */
    viewLabel?: string;
    /** What the column holds. */
    children?: Snippet;
};
/**
 * The shell's right column: a cap level with the header, then what the
 * column holds (a chat panel beside its rail). The host draws it only when
 * it holds something for this reader on this page (`rightColumnHolds`);
 * without it the main column reaches the right edge and the header carries
 * the theme toggle the cap would hold.
 *
 * The cap is as wide as the open panel plus the 48px rail: a spacer the
 * panel's width (0 while it is closed), holding what the host reads beside
 * the theme (`capStart`: a meter), then the theme toggle over the rail.
 *
 * At or below the compact width the column takes no width: its rail is the
 * phone shell's one bar along the bottom (ShellBar), the cap is not drawn
 * (the account menu in the bar holds the theme and the meter), and an open
 * panel is the view. The frame then says so to assistive technology
 * (`viewLabel`: a dialog with that name).
 */
declare const ShellRightColumn: import("svelte").Component<$$ComponentProps, {}, "">;
type ShellRightColumn = ReturnType<typeof ShellRightColumn>;
export default ShellRightColumn;
