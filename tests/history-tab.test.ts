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

describe('host words for a failed history load', () => {
	class RequestFailure extends Error {
		constructor(
			readonly kind: string,
			readonly reference: string
		) {
			super('upstream said 502');
		}
	}

	it('shows the host’s two-part text, given the rejection and the default sentence', async () => {
		const failure = new RequestFailure('server', 'req-7f3a');
		const errorMessage = vi.fn(
			(error: unknown, fallback: string) =>
				`${fallback} (${(error as RequestFailure).kind}, ${(error as RequestFailure).reference})`
		);
		const history = createHistoryTab<string>(vi.fn().mockRejectedValue(failure), {
			errorMessage
		});
		await history.load('alpha', true);
		expect(errorMessage).toHaveBeenCalledTimes(1);
		expect(errorMessage.mock.calls[0][0]).toBe(failure);
		expect(errorMessage.mock.calls[0][1]).toBe('The history could not be loaded.');
		expect(history.error).toBe('The history could not be loaded. (server, req-7f3a)');
		expect(history.entries).toBeUndefined();
		expect(history.loading).toBe(false);
	});

	it('keeps last-good entries on a failed refresh when the host words the failure', async () => {
		const history = createHistoryTab<string>(
			vi
				.fn()
				.mockResolvedValueOnce(['First entry'])
				.mockRejectedValueOnce(new RequestFailure('network', 'req-1')),
			{ errorMessage: (_error, fallback) => `${fallback} Reference req-1.` }
		);
		await history.load('alpha', true);
		await history.load('alpha', true);
		expect(history.entries).toEqual(['First entry']);
		expect(history.error).toBe('The history could not be loaded. Reference req-1.');
	});

	it('falls back to the default sentence when the host returns blank words', async () => {
		const history = createHistoryTab<string>(vi.fn().mockRejectedValue(new Error('offline')), {
			errorMessage: () => '   '
		});
		await history.load('alpha', true);
		expect(history.error).toBe('The history could not be loaded.');
		expect(history.loading).toBe(false);
	});

	it('falls back to the default sentence and stays usable when the host formatter throws', async () => {
		const fetcher = vi
			.fn()
			.mockRejectedValueOnce(new Error('offline'))
			.mockResolvedValueOnce(['Recovered entry']);
		const history = createHistoryTab<string>(fetcher, {
			errorMessage: () => {
				throw new Error('formatter bug');
			}
		});
		await expect(history.load('alpha', true)).resolves.toBeUndefined();
		expect(history.error).toBe('The history could not be loaded.');
		expect(history.loading).toBe(false);
		await history.load('alpha', true);
		expect(history.entries).toEqual(['Recovered entry']);
		expect(history.error).toBeNull();
	});
});
