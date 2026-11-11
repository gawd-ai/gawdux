/**
 * A row of controls that each carry an icon and a label shows the labels
 * whenever they fit and the icons alone when they do not: one rule for a tab
 * strip and for a row that holds a strip and the tools after it.
 *
 * `fitLabels` reads, with the labels shown, the width the row's controls need
 * against the width the row has, and marks the row `data-labels="icons"` when
 * they do not fit. tokens.css ("Icons alone while the labels do not fit")
 * then hides each label (`.gawdux-control-label`) as words a screen reader
 * still reads, gives a tab its icon alone on a 44px target and draws a tool
 * (`.gawdux-tool-button`) as the house icon button. While the labels are
 * hidden, each control whose label hid carries it as its tooltip (`title`),
 * unless it has one of its own.
 *
 * It reads the row's own box, never the viewport, so a wide pane on a narrow
 * screen keeps its labels and a narrow pane on a wide one shows its icons. A
 * fixed width cannot stand for "the labels fit": five tabs need more room
 * than two. The measure is taken with the labels shown each time, so the
 * answer never depends on the state it sets, and it is read again when the
 * row's box or anything in it changes size, when a control comes or goes and
 * when a web font arrives. A strip that still does not fit with its icons
 * alone scrolls within itself (`.gawdux-tab-strip`, `scrollEdges`).
 */
/** The labelled controls fit their row, a pixel's slack for rounding. */
export declare function labelsFit({ need, room }: {
    need: number;
    room: number;
}): boolean;
export type FitLabels = {
    /** Reads the row again: a host that changed what it holds without a resize. */
    measure(): void;
    destroy(): void;
};
/** Marks `node` `data-labels="icons"` while its labelled controls do not fit its box. */
export declare function fitLabels(node: HTMLElement): FitLabels;
