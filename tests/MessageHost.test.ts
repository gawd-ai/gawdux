import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import MessageHost from '../src/lib/primitives/MessageHost.svelte';
import { createMessageCenter } from '../src/lib/utils/message-center';

afterEach(() => cleanup());

describe('MessageHost', () => {
	it('renders overlay items through PageFeedback with kind-appropriate roles', () => {
		const center = createMessageCenter();
		center.publishTransient({
			id: 'save-failed',
			revision: 1,
			tone: 'error',
			message: 'The record could not be saved.'
		});
		center.publishCondition({
			id: 'sync-degraded',
			revision: 1,
			tone: 'warning',
			title: 'Sync degraded',
			message: 'Updates may arrive late.'
		});

		render(MessageHost, { props: { center, label: 'Notifications' } });

		const host = screen.getByRole('region', { name: 'Notifications' });
		expect(host.classList.contains('message-host')).toBe(true);
		// transient error → alert; condition → status
		expect(screen.getByRole('alert').textContent).toContain('could not be saved');
		expect(screen.getByRole('status').textContent).toContain('Updates may arrive late.');
		center.destroy();
	});

	it('dismissing hides a condition but removes a transient', async () => {
		const center = createMessageCenter();
		center.publishTransient({
			id: 'transient',
			revision: 1,
			tone: 'warning',
			message: 'Transient warning.'
		});
		center.publishCondition({
			id: 'condition',
			revision: 'v1',
			tone: 'error',
			message: 'Persistent condition.'
		});

		render(MessageHost, { props: { center } });
		const dismissButtons = screen.getAllByRole('button', { name: 'Dismiss message' });
		expect(dismissButtons).toHaveLength(2);

		// Overlay is severity-ordered: the error condition renders first.
		await fireEvent.click(dismissButtons[0]!);
		await waitFor(() => {
			expect(center.getSnapshot().notices[0]?.overlayHidden).toBe(true);
		});
		expect(center.getSnapshot().items.map((item) => item.id)).toContain('condition');

		await fireEvent.click(screen.getByRole('button', { name: 'Dismiss message' }));
		await waitFor(() => {
			expect(center.getSnapshot().items.map((item) => item.id)).not.toContain('transient');
		});
		center.destroy();
	});

	it('routes the first action through onAction and bounds compact viewports to one item', async () => {
		const center = createMessageCenter();
		const onAction = vi.fn();
		center.publishCondition({
			id: 'credits',
			revision: 1,
			tone: 'error',
			message: 'Credits exhausted.',
			actions: [{ id: 'top-up', label: 'Top up' }]
		});
		center.publishTransient({
			id: 'saved',
			revision: 1,
			tone: 'success',
			message: 'Saved.'
		});

		render(MessageHost, { props: { center, compactViewport: true, onAction } });
		// compact viewport shows only the highest-priority item
		expect(document.querySelectorAll('.message-host-item')).toHaveLength(1);

		await fireEvent.click(screen.getByRole('button', { name: 'Top up' }));
		expect(onAction).toHaveBeenCalledTimes(1);
		expect(onAction.mock.calls[0]?.[0]?.id).toBe('credits');
		expect(onAction.mock.calls[0]?.[1]?.id).toBe('top-up');
		center.destroy();
	});

	it('suspends rendering and message timers together', async () => {
		const center = createMessageCenter();
		center.publishTransient({ id: 'saved', revision: 1, tone: 'success', message: 'Saved.' });

		const view = render(MessageHost, { props: { center, suspended: true } });
		expect(document.querySelector('.message-host')).toBeNull();
		await waitFor(() => expect(center.getSnapshot().timersPaused).toBe(true));

		await view.rerender({ center, suspended: false });
		await waitFor(() => expect(center.getSnapshot().timersPaused).toBe(false));
		expect(document.querySelector('.message-host')).not.toBeNull();
		center.destroy();
	});
});
