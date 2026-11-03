import { planRoomYield, type YieldingControl } from './room-yield';

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
	 * part. Each must be a box of the row whose width is the control's.
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

type Widths = { full?: number; compact?: number };

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
export function createRoomYield(ports: RoomYieldPorts): RoomYieldController {
	const compactDefault = ports.compactWidth ?? 44;
	const widths = new WeakMap<Element, Widths>();
	/** The decision the row shows: the last one rendered. */
	let shown: readonly boolean[] = [];

	const decision = $derived.by<readonly boolean[]>(() => {
		const sibling = ports.sibling();
		const elements = ports.controls();
		// Until the sibling is measured the row keeps what it shows: full size
		// on the first render, so a server render and its hydration agree.
		if (!sibling) return shown;
		const present: { index: number; control: YieldingControl }[] = [];
		elements.forEach((element, index) => {
			if (!element) return;
			const width = element.getBoundingClientRect().width;
			const known = widths.get(element) ?? {};
			if (shown[index]) known.compact = width;
			else known.full = width;
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
