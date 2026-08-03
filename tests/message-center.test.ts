import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	createDocumentVisibilitySource,
	createMessageCenter,
	createStorageHiddenConditionPersistence,
	type KeyValueStorageLike,
	type MessageCenterVisibilitySource
} from '../src/lib/utils/message-center';

class FakeVisibility implements MessageCenterVisibilitySource {
	#hidden = false;
	readonly #listeners = new Set<(hidden: boolean) => void>();

	isHidden(): boolean {
		return this.#hidden;
	}

	subscribe(listener: (hidden: boolean) => void): () => void {
		this.#listeners.add(listener);
		return () => this.#listeners.delete(listener);
	}

	setHidden(hidden: boolean): void {
		this.#hidden = hidden;
		for (const listener of this.#listeners) listener(hidden);
	}
}

function memoryStorage(): KeyValueStorageLike & { values: Map<string, string> } {
	const values = new Map<string, string>();
	return {
		values,
		getItem: (key) => values.get(key) ?? null,
		setItem: (key, value) => values.set(key, value),
		removeItem: (key) => {
			values.delete(key);
		}
	};
}

afterEach(() => {
	vi.useRealTimers();
});

describe('MessageCenter', () => {
	it('separates transient overlays from durable conditions and follows the Svelte store contract', () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-07-18T12:00:00Z'));
		const center = createMessageCenter();
		const snapshots: string[][] = [];
		const unsubscribe = center.subscribe((snapshot) => {
			snapshots.push(snapshot.items.map((item) => item.id));
		});

		center.publishTransient({
			id: 'profile-saved',
			revision: 1,
			tone: 'success',
			message: 'Profile saved.'
		});
		center.publishCondition({
			id: 'credits-exhausted',
			revision: 'copy-v1',
			tone: 'error',
			title: 'Automation is paused',
			message: 'Add credits to resume background work.',
			actions: [{ id: 'top-up', label: 'Top up', href: '/app/billing' }]
		});

		expect(snapshots[0]).toEqual([]);
		expect(center.getSnapshot().overlay.map((item) => item.id)).toEqual([
			'credits-exhausted',
			'profile-saved'
		]);
		expect(center.getSnapshot().notices.map((item) => item.id)).toEqual(['credits-exhausted']);
		expect(center.getSnapshot().notices[0]?.actions).toEqual([
			{ id: 'top-up', label: 'Top up', href: '/app/billing' }
		]);

		unsubscribe();
		center.destroy();
	});

	it('deduplicates a stable ID and revision without extending its lifetime', async () => {
		vi.useFakeTimers();
		vi.setSystemTime(0);
		const center = createMessageCenter();
		const input = {
			id: 'saved',
			revision: 4,
			tone: 'success' as const,
			message: 'Saved.'
		};

		expect(center.publishTransient(input).outcome).toBe('created');
		await vi.advanceTimersByTimeAsync(3_000);
		expect(center.publishTransient({ ...input, message: 'Duplicate delivery.' }).outcome).toBe(
			'deduplicated'
		);
		expect(center.getSnapshot().items[0]?.message).toBe('Saved.');
		await vi.advanceTimersByTimeAsync(999);
		expect(center.getSnapshot().items).toHaveLength(1);
		await vi.advanceTimersByTimeAsync(1);
		expect(center.getSnapshot().items).toHaveLength(0);
	});

	it('treats a new revision as a new occurrence and resets visibility and lifetime', async () => {
		vi.useFakeTimers();
		vi.setSystemTime(0);
		const center = createMessageCenter();
		center.publishTransient({
			id: 'saved',
			revision: 1,
			tone: 'success',
			message: 'Saved.'
		});
		await vi.advanceTimersByTimeAsync(3_000);

		expect(
			center.publishTransient({
				id: 'saved',
				revision: 2,
				tone: 'success',
				message: 'Saved again.'
			}).outcome
		).toBe('revised');
		await vi.advanceTimersByTimeAsync(3_999);
		expect(center.getSnapshot().items[0]?.revision).toBe(2);
		await vi.advanceTimersByTimeAsync(1);
		expect(center.getSnapshot().items).toHaveLength(0);
	});

	it('uses 4s success and 6s info defaults while warning and error persist', async () => {
		vi.useFakeTimers();
		vi.setSystemTime(0);
		const center = createMessageCenter({ maxVisible: 4 });
		for (const tone of ['success', 'info', 'warning', 'error'] as const) {
			center.publishTransient({ id: tone, revision: 1, tone, message: tone });
		}

		await vi.advanceTimersByTimeAsync(4_000);
		expect(center.getSnapshot().items.map((item) => item.id)).toEqual(['error', 'warning', 'info']);
		await vi.advanceTimersByTimeAsync(2_000);
		expect(center.getSnapshot().items.map((item) => item.id)).toEqual(['error', 'warning']);
		await vi.advanceTimersByTimeAsync(60_000);
		expect(center.getSnapshot().items.map((item) => item.id)).toEqual(['error', 'warning']);
	});

	it('bounds overlay selection without dropping queued items or hidden notices', () => {
		const center = createMessageCenter({ maxVisible: 2 });
		center.publishTransient({
			id: 'success',
			revision: 1,
			tone: 'success',
			message: 'Done.'
		});
		center.publishTransient({
			id: 'info',
			revision: 1,
			tone: 'info',
			message: 'Working.'
		});
		center.publishCondition({
			id: 'warning',
			revision: 1,
			tone: 'warning',
			message: 'Review this.'
		});
		center.publishCondition({
			id: 'error',
			revision: 1,
			tone: 'error',
			message: 'Action required.'
		});

		expect(center.getSnapshot().overlay.map((item) => item.id)).toEqual(['error', 'warning']);
		expect(center.getSnapshot().pendingOverlayCount).toBe(2);
		expect(center.hideCondition('error', 1)).toBe(true);
		expect(center.getSnapshot().overlay.map((item) => item.id)).toEqual(['warning', 'info']);
		expect(center.getSnapshot().notices.map((item) => item.id)).toEqual(['error', 'warning']);
		expect(center.getSnapshot().hiddenNoticeCount).toBe(1);
	});

	it('dismisses transients while hide, reveal, and revision-guarded resolution govern conditions', () => {
		const center = createMessageCenter();
		center.publishTransient({
			id: 'transient',
			revision: 1,
			tone: 'error',
			message: 'Retry failed.'
		});
		center.publishCondition({
			id: 'condition',
			revision: 'v1',
			tone: 'warning',
			message: 'Service unavailable.'
		});

		expect(center.dismissTransient('condition')).toBe(false);
		expect(center.dismissTransient('transient', 2)).toBe(false);
		expect(center.dismissTransient('transient', 1)).toBe(true);
		expect(center.hideCondition('condition', 'v1')).toBe(true);
		expect(center.getSnapshot().overlay).toHaveLength(0);
		expect(center.getSnapshot().notices).toHaveLength(1);
		expect(center.revealCondition('condition', 'v1')).toBe(true);
		expect(center.getSnapshot().overlay[0]?.id).toBe('condition');
		expect(center.resolveCondition('condition', 'stale')).toBe(false);
		expect(center.resolveCondition('condition', 'v1')).toBe(true);
		expect(center.getSnapshot().items).toHaveLength(0);
	});

	it('pauses and resumes countdowns using their remaining lifetime', async () => {
		vi.useFakeTimers();
		vi.setSystemTime(0);
		const center = createMessageCenter();
		center.publishTransient({
			id: 'success',
			revision: 1,
			tone: 'success',
			message: 'Saved.'
		});
		await vi.advanceTimersByTimeAsync(2_500);
		center.pauseTimers();
		expect(center.getSnapshot().timersPaused).toBe(true);
		await vi.advanceTimersByTimeAsync(30_000);
		expect(center.getSnapshot().items).toHaveLength(1);

		center.resumeTimers();
		await vi.advanceTimersByTimeAsync(1_499);
		expect(center.getSnapshot().items).toHaveLength(1);
		await vi.advanceTimersByTimeAsync(1);
		expect(center.getSnapshot().items).toHaveLength(0);
	});

	it('keeps countdowns paused until every independent pause reason is released', async () => {
		vi.useFakeTimers();
		vi.setSystemTime(0);
		const center = createMessageCenter();
		center.publishTransient({
			id: 'success',
			revision: 1,
			tone: 'success',
			message: 'Saved.'
		});
		await vi.advanceTimersByTimeAsync(1_000);
		center.pauseTimers('pointer');
		center.pauseTimers('focus');
		center.resumeTimers('pointer');
		await vi.advanceTimersByTimeAsync(20_000);
		expect(center.getSnapshot().timersPaused).toBe(true);
		expect(center.getSnapshot().items).toHaveLength(1);

		center.resumeTimers('focus');
		await vi.advanceTimersByTimeAsync(2_999);
		expect(center.getSnapshot().items).toHaveLength(1);
		await vi.advanceTimersByTimeAsync(1);
		expect(center.getSnapshot().items).toHaveLength(0);
	});

	it('tracks document visibility through an injected DOM-free source', async () => {
		vi.useFakeTimers();
		vi.setSystemTime(0);
		const visibility = new FakeVisibility();
		const center = createMessageCenter({ visibility });
		center.publishTransient({
			id: 'info',
			revision: 1,
			tone: 'info',
			message: 'Background task complete.'
		});
		await vi.advanceTimersByTimeAsync(2_000);
		visibility.setHidden(true);
		await vi.advanceTimersByTimeAsync(20_000);
		expect(center.getSnapshot().timersPaused).toBe(true);
		expect(center.getSnapshot().items).toHaveLength(1);

		visibility.setHidden(false);
		await vi.advanceTimersByTimeAsync(3_999);
		expect(center.getSnapshot().items).toHaveLength(1);
		await vi.advanceTimersByTimeAsync(1);
		expect(center.getSnapshot().items).toHaveLength(0);
	});

	it('persists hidden condition revisions per caller identity and re-shows a new revision', () => {
		const storage = memoryStorage();
		const persistence = createStorageHiddenConditionPersistence(
			storage,
			'org:7|workspace:3|user:42'
		);
		const first = createMessageCenter({ hiddenConditionPersistence: persistence });
		first.publishCondition({
			id: 'credits-exhausted',
			revision: 'copy-v1',
			tone: 'error',
			message: 'Automation is paused.'
		});
		first.hideCondition('credits-exhausted', 'copy-v1');
		expect(storage.values.size).toBe(1);
		first.destroy();

		const reloaded = createMessageCenter({ hiddenConditionPersistence: persistence });
		reloaded.publishCondition({
			id: 'credits-exhausted',
			revision: 'copy-v1',
			tone: 'error',
			message: 'Automation is paused.'
		});
		expect(reloaded.getSnapshot().overlay).toHaveLength(0);
		expect(reloaded.getSnapshot().notices[0]?.overlayHidden).toBe(true);

		reloaded.publishCondition({
			id: 'credits-exhausted',
			revision: 'copy-v2',
			tone: 'error',
			message: 'Automation remains paused.'
		});
		expect(reloaded.getSnapshot().overlay[0]?.revision).toBe('copy-v2');
		expect(storage.values.size).toBe(0);

		reloaded.hideCondition('credits-exhausted', 'copy-v2');
		expect(reloaded.resolveCondition('credits-exhausted', 'copy-v1')).toBe(false);
		expect(storage.values.size).toBe(1);
		expect(reloaded.resolveCondition('credits-exhausted', 'copy-v2')).toBe(true);
		expect(storage.values.size).toBe(0);
	});

	it('isolates hidden-condition persistence by identity', () => {
		const storage = memoryStorage();
		const first = createMessageCenter({
			hiddenConditionPersistence: createStorageHiddenConditionPersistence(storage, 'user:1')
		});
		first.publishCondition({
			id: 'service-offline',
			revision: 1,
			tone: 'warning',
			message: 'Service offline.'
		});
		first.hideCondition('service-offline');

		const otherIdentity = createMessageCenter({
			hiddenConditionPersistence: createStorageHiddenConditionPersistence(storage, 'user:2')
		});
		otherIdentity.publishCondition({
			id: 'service-offline',
			revision: 1,
			tone: 'warning',
			message: 'Service offline.'
		});
		expect(otherIdentity.getSnapshot().overlay[0]?.id).toBe('service-offline');
	});

	it('adapts a document-like visibility lifecycle without accessing global document', () => {
		let hidden = false;
		const listeners = new Set<() => void>();
		const documentLike = {
			get hidden() {
				return hidden;
			},
			addEventListener: (_type: 'visibilitychange', listener: () => void) =>
				listeners.add(listener),
			removeEventListener: (_type: 'visibilitychange', listener: () => void) =>
				listeners.delete(listener)
		};
		const values: boolean[] = [];
		const source = createDocumentVisibilitySource(documentLike);
		const unsubscribe = source.subscribe((value) => values.push(value));
		hidden = true;
		for (const listener of listeners) listener();
		unsubscribe();
		hidden = false;
		for (const listener of listeners) listener();

		expect(source.isHidden()).toBe(false);
		expect(values).toEqual([true]);
	});
});
