/** What the sibling reports: a Breadcrumbs `room`, its `whole` or `page` as the need. */
export interface RoomYieldSibling {
    /** The width the sibling has now: its box's content width. */
    available: number;
    /** The width it needs. */
    need: number;
}
export interface RoomYieldPorts {
    /** The sibling's room and need; null until it is measured. */
    sibling: () => RoomYieldSibling | null | undefined;
    /**
     * The elements that hold the controls, in the order they yield: the first
     * yields first. A missing one (a control the row does not show) takes no
     * part. Each must be a box of the row whose width is the control's. A box
     * that holds an element marked `data-room-full` reads the control's full
     * width from it, in every state: an invisible probe laid out at the
     * control's full size whatever it shows. A control whose full width
     * changes with the viewport (an avatar below a breakpoint of its own)
     * needs one; without one, the full width is the last one the box had
     * while the control did not yield.
     */
    controls: () => readonly (Element | null | undefined)[];
    /**
     * A control's width while it yields, until it has yielded once and been
     * measured: 44 by default, the account menu's avatar card.
     */
    compactWidth?: number;
}
export interface RoomYieldController {
    /** Whether the control at `index`, in yield order, yields now. */
    yields(index: number): boolean;
}
/**
 * Header controls that give their room to a sibling that needs it: an
 * account menu that shows its avatar alone so the breadcrumb trail beside it
 * reads whole. The decision is `planRoomYield` over the sibling's report and
 * the controls' widths, read when the report changes (a resize, a new trail):
 * every change in the row reaches the sibling's box, which takes the room the
 * controls leave. Each control's full width is read from its probe
 * (`data-room-full`) at the viewport the row has now, or, for a control
 * without one, is the last one measured while it did not yield; so the room
 * at full size is known in either state and the decision never undoes itself.
 *
 * Read `yields(index)` in the markup that renders the controls: a control's
 * widths are filed under the state it was last rendered in.
 */
export declare function createRoomYield(ports: RoomYieldPorts): RoomYieldController;
