import { describe, expect, it, vi } from 'vitest';
import { createHistoryTab } from '../src/lib/utils/history-tab.svelte';

describe('history refresh failures', () => {
	it('retains observations when refreshing the same record fails', async () => {
		const fetcher = vi
			.fn()
			.mockResolvedValueOnce(['First entry'])
			.mockRejectedValueOnce(new Error('offline'));
		const history = createHistoryTab<string>(fetcher);
		await history.load('alpha', true);
		await history.load('alpha', true);
		expect(history.entries).toEqual(['First entry']);
		expect(history.error).toBe('The history could not be loaded.');
		expect(history.loading).toBe(false);
	});

	it('does not display another record’s observations when its replacement fails to load', async () => {
		const fetcher = vi
			.fn()
			.mockResolvedValueOnce(['Alpha entry'])
			.mockRejectedValueOnce(new Error('offline'));
		const history = createHistoryTab<string>(fetcher);
		await history.load('alpha', true);
		await history.load('beta', true);
		expect(history.entries).toBeUndefined();
		expect(history.error).toBe('The history could not be loaded.');
	});

	it('keeps an initial failure distinct from an empty history', async () => {
		const history = createHistoryTab<string>(
			vi.fn().mockRejectedValue(new Error('offline'))
		);
		await history.load('alpha', true);
		expect(history.entries).toBeUndefined();
		expect(history.error).toBe('The history could not be loaded.');
	});
});
