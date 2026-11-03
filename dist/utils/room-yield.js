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
 * One flag per control, in order: true for a control that yields. The flags
 * are a prefix: once a control does not yield, none after it does. A sibling
 * that needs nothing (an empty trail) takes no room from anyone.
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
        if (target <= Math.floor(room + EPSILON))
            return false;
        room += Math.max(0, control.full - control.compact);
        return true;
    });
}
