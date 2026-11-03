import { planRoomYield } from './room-yield';
/**
 * Header controls that give their room to a sibling that needs it: an
 * account menu that shows its avatar alone so the breadcrumb trail beside it
 * reads whole. The decision is `planRoomYield` over the sibling's report and
 * the controls' widths, read when the report changes (a resize, a new trail):
 * every change in the row reaches the sibling's box, which takes the room the
 * controls leave. Each control's full width is the last one measured while
 * it did not yield, so the room at full size is known in either state and
 * the decision never undoes itself.
 *
 * Read `yields(index)` in the markup that renders the controls: a control's
 * widths are filed under the state it was last rendered in.
 */
export function createRoomYield(ports) {
    const compactDefault = ports.compactWidth ?? 44;
    const widths = new WeakMap();
    /** The decision the row shows: the last one rendered. */
    let shown = [];
    const decision = $derived.by(() => {
        const sibling = ports.sibling();
        const elements = ports.controls();
        // Until the sibling is measured the row keeps what it shows: full size
        // on the first render, so a server render and its hydration agree.
        if (!sibling)
            return shown;
        const present = [];
        elements.forEach((element, index) => {
            if (!element)
                return;
            const width = element.getBoundingClientRect().width;
            const known = widths.get(element) ?? {};
            if (shown[index])
                known.compact = width;
            else
                known.full = width;
            widths.set(element, known);
            present.push({
                index,
                control: { width, full: known.full ?? width, compact: known.compact ?? compactDefault }
            });
        });
        const plan = planRoomYield({
            need: sibling.need,
            available: sibling.available,
            controls: present.map((entry) => entry.control)
        });
        const next = elements.map(() => false);
        present.forEach((entry, position) => (next[entry.index] = plan[position] ?? false));
        shown = next;
        return next;
    });
    return {
        yields: (index) => decision[index] ?? false
    };
}
