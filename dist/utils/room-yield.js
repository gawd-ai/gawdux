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
 * comes back as soon as the sibling fits without it. A control already as
 * narrow as it yields (an avatar by a narrow viewport's own rule) gives
 * nothing and never yields.
 */
/**
 * Layout widths are multiples of a fraction of a pixel; a sum that should be
 * whole is never floored one pixel under by a rounding error.
 */
const EPSILON = 1e-6;
/** The width the sibling would have with every control at full size, rounded down. */
export function roomAtFullSize(available, controls) {
    let room = available;
    for (const control of controls)
        room += control.width - control.full;
    return Math.floor(room + EPSILON);
}
/**
 * One flag per control, in order: true for a control that yields. A control
 * yields only when it gives the sibling room (its full width is more than
 * its compact one) and the sibling needs more than the room it would have
 * with that control and every one after it at full size; once a control that
 * gives room does not yield, none after it does. A sibling that needs nothing
 * (an empty trail) takes no room from anyone.
 */
export function planRoomYield({ need, available, controls }) {
    // The need rounds up and the room down, as a trail plans its own fit.
    const target = Math.ceil(need - EPSILON);
    if (target <= 0)
        return controls.map(() => false);
    let room = available;
    for (const control of controls)
        room += control.width - control.full;
    return controls.map((control) => {
        const gives = control.full - control.compact;
        if (gives <= EPSILON || target <= Math.floor(room + EPSILON))
            return false;
        room += gives;
        return true;
    });
}
