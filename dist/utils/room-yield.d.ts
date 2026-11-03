/**
 * Which controls of a header row yield their room to a sibling that needs
 * it: an account menu that shows its avatar alone so the breadcrumb trail
 * beside it reads whole. Pure arithmetic over widths the host measured.
 *
 * The decision reads the room the sibling would have with every control at
 * full size: its box now, plus what each control that yields gave it. It
 * never reads how the sibling fits after a control yielded, so a yield never
 * undoes itself and the row never oscillates. The controls yield in the
 * order given, each only when the ones before it are not enough, and each
 * comes back as soon as the sibling fits without it.
 */
export type YieldingControl = {
    /** Its width as laid out now. */
    width: number;
    /** Its width at full size: the last width it had while it did not yield. */
    full: number;
    /** Its width while it yields (the avatar alone). */
    compact: number;
};
export type RoomYieldMeasure = {
    /** The width the sibling needs (a trail's width whole). */
    need: number;
    /** The width the sibling has now: its box's content width. */
    available: number;
    /** The controls in the order they yield: the first yields first. */
    controls: readonly YieldingControl[];
};
/** The width the sibling would have with every control at full size, rounded down. */
export declare function roomAtFullSize(available: number, controls: readonly YieldingControl[]): number;
/**
 * One flag per control, in order: true for a control that yields. The flags
 * are a prefix: once a control does not yield, none after it does. A sibling
 * that needs nothing (an empty trail) takes no room from anyone.
 */
export declare function planRoomYield({ need, available, controls }: RoomYieldMeasure): boolean[];
