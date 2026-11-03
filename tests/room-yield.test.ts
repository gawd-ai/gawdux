import { describe, expect, it } from 'vitest';
import {
	planRoomYield,
	roomAtFullSize,
	type YieldingControl
} from '../src/lib/utils/room-yield';

// A header row 1100px wide: a trail beside an account menu (240px, 44px as
// its avatar alone) and a scope switcher (180px, 44px), in that yield order.
// The trail takes what the controls leave: its box is the row less the
// controls as they are laid out.
const FULL = [240, 180];
const COMPACT = [44, 44];

function controlsAt(yielded: readonly boolean[]): YieldingControl[] {
	return FULL.map((full, i) => ({
		width: yielded[i] ? COMPACT[i]! : full,
		full,
		compact: COMPACT[i]!
	}));
}

/** The trail's box in a row `row` wide with the controls `yielded` as given. */
function availableAt(row: number, yielded: readonly boolean[]): number {
	return controlsAt(yielded).reduce((left, control) => left - control.width, row);
}

function planAt(row: number, need: number, yielded: readonly boolean[] = [false, false]) {
	return planRoomYield({ need, available: availableAt(row, yielded), controls: controlsAt(yielded) });
}

describe('roomAtFullSize', () => {
	it('is the room the sibling would have with every control at full size', () => {
		expect(roomAtFullSize(680, controlsAt([false, false]))).toBe(680);
		expect(roomAtFullSize(876, controlsAt([true, false]))).toBe(680);
		expect(roomAtFullSize(1012, controlsAt([true, true]))).toBe(680);
	});

	it('rounds down, so a sibling given that room fits', () => {
		expect(roomAtFullSize(680.75, controlsAt([false, false]))).toBe(680);
		// A sum that should be whole is never floored one under by a rounding error.
		expect(roomAtFullSize(876 - 1e-9, controlsAt([true, false]))).toBe(680);
	});
});

describe('planRoomYield', () => {
	it('yields nothing while the sibling fits beside every control at full size', () => {
		expect(planAt(1100, 680)).toEqual([false, false]);
		expect(planAt(1100, 0)).toEqual([false, false]);
	});

	it('yields the first control first, when the sibling needs more than the room at full size', () => {
		// 680 at full size; the account menu's avatar gives 196 more.
		expect(planAt(1100, 681)).toEqual([true, false]);
		expect(planAt(1100, 876)).toEqual([true, false]);
	});

	it('yields the next control only when the ones before it are not enough', () => {
		expect(planAt(1100, 877)).toEqual([true, true]);
		expect(planAt(1100, 5000)).toEqual([true, true]);
	});

	it('decides the same in every state: it reads the room at full size, never the room a yield made', () => {
		const states = [
			[false, false],
			[true, false],
			[true, true],
			[false, true]
		];
		for (let row = 300; row <= 1600; row += 7) {
			for (const need of [0, 120, 458, 680, 882, 1200]) {
				const decisions = states.map((yielded) => planAt(row, need, yielded));
				for (const decision of decisions) expect(decision, `${row}px, need ${need}`).toEqual(decisions[0]);
			}
		}
	});

	it('gives the controls back as soon as there is room: a yielded control returns at the boundary', () => {
		// The trail has 876px with the account menu yielded; it needs 680.
		expect(planAt(1100, 680, [true, false])).toEqual([false, false]);
		expect(planAt(1100, 681, [true, false])).toEqual([true, false]);
		expect(planAt(1100, 876, [true, true])).toEqual([true, false]);
	});

	it('never settles into a loop: applying a decision and planning again gives the same decision', () => {
		for (let row = 300; row <= 1600; row += 3) {
			for (const need of [200, 458, 700, 882]) {
				const first = planAt(row, need);
				expect(planAt(row, need, first), `${row}px, need ${need}`).toEqual(first);
			}
		}
	});

	it('rounds the need up and the room down, the way the trail plans its own fit', () => {
		expect(planRoomYield({ need: 680.2, available: 680.9, controls: controlsAt([false, false]) })).toEqual([
			true,
			false
		]);
		expect(planRoomYield({ need: 679.8, available: 680.4, controls: controlsAt([false, false]) })).toEqual([
			false,
			false
		]);
	});

	it('yields nothing to a sibling that needs nothing (an empty trail), even in a row too narrow for it', () => {
		expect(planAt(200, 0)).toEqual([false, false]);
		expect(planAt(200, 0, [true, true])).toEqual([false, false]);
	});

	it('counts a control already as narrow as its avatar as giving nothing, and moves on to the next', () => {
		// The account menu is already its avatar (a narrow viewport's own rule).
		const controls: YieldingControl[] = [
			{ width: 44, full: 44, compact: 44 },
			{ width: 180, full: 180, compact: 44 }
		];
		expect(planRoomYield({ need: 700, available: 650, controls })).toEqual([true, true]);
		expect(planRoomYield({ need: 650, available: 650, controls })).toEqual([false, false]);
	});

	it('plans nothing for no controls', () => {
		expect(planRoomYield({ need: 900, available: 100, controls: [] })).toEqual([]);
	});
});
