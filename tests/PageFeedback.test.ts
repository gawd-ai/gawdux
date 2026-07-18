import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import PageFeedback from '../src/lib/primitives/PageFeedback.svelte';
import pageFeedbackSource from '../src/lib/primitives/PageFeedback.svelte?raw';
import TestFeedbackIcon from './fixtures/TestFeedbackIcon.svelte';

afterEach(() => cleanup());

describe('PageFeedback', () => {
	it('renders warning feedback with polite defaults and rich children', () => {
		const children = createRawSnippet(() => ({
			render: () => '<span><strong>AI bots</strong> are paused.</span>',
		}));

		render(PageFeedback, {
			props: {
				message: 'Fallback copy',
				title: 'Credits required',
				tone: 'warning',
				children,
				icon: TestFeedbackIcon,
			},
		});

		const feedback = screen.getByRole('status');
		expect(feedback.classList.contains('warning')).toBe(true);
		expect(feedback.getAttribute('aria-live')).toBe('polite');
		expect(feedback.getAttribute('aria-atomic')).toBe('true');
		expect(screen.getByText('Credits required')).toBeTruthy();
		expect(screen.getByText('AI bots')).toBeTruthy();
		expect(screen.queryByText('Fallback copy')).toBeNull();
		expect(screen.getByTestId('feedback-icon-override')).toBeTruthy();
	});

	it('omits an empty title without forcing rich content into compact truncation', () => {
		const children = createRawSnippet(() => ({
			render: () => '<span>First line<br />Second line</span>',
		}));

		render(PageFeedback, { props: { title: null, tone: 'info', children } });

		const feedback = screen.getByRole('status');
		expect(feedback.classList.contains('compact')).toBe(false);
		expect(feedback.querySelector('.page-feedback-title')).toBeNull();
		expect(feedback.querySelector('br')).toBeTruthy();
	});

	it('runs a callback action once and exposes its pending state', async () => {
		const onaction = vi.fn();
		const view = render(PageFeedback, {
			props: {
				message: 'The background refresh failed.',
				actionLabel: 'Retry',
				onaction,
			},
		});

		await fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
		expect(onaction).toHaveBeenCalledOnce();

		await view.rerender({
			message: 'The background refresh failed.',
			actionLabel: 'Retry',
			actionPending: true,
			actionPendingLabel: 'Retrying...',
			onaction,
		});
		const pending = screen.getByRole('button', { name: 'Retrying...' });
		expect(pending.hasAttribute('disabled')).toBe(true);
		expect(pending.getAttribute('aria-busy')).toBe('true');
		await fireEvent.click(pending);
		expect(onaction).toHaveBeenCalledOnce();
	});

	it('supports href actions and prevents navigation while pending', async () => {
		const onaction = vi.fn();
		const view = render(PageFeedback, {
			props: {
				message: 'Credits are exhausted.',
				tone: 'warning',
				actionLabel: 'Add credits',
				actionHref: '#billing',
				onaction,
			},
		});

		const link = screen.getByRole('link', { name: 'Add credits' });
		expect(link.getAttribute('href')).toBe('#billing');
		await fireEvent.click(link);
		expect(onaction).toHaveBeenCalledOnce();

		await view.rerender({
			message: 'Credits are exhausted.',
			tone: 'warning',
			actionLabel: 'Add credits',
			actionHref: '#billing',
			actionPending: true,
			actionPendingLabel: 'Opening...',
			onaction,
		});
		const pendingLink = screen.getByRole('link', { name: 'Opening...' });
		expect(pendingLink.getAttribute('aria-disabled')).toBe('true');
		const event = new MouseEvent('click', { bubbles: true, cancelable: true });
		expect(pendingLink.dispatchEvent(event)).toBe(false);
		expect(onaction).toHaveBeenCalledOnce();
	});

	it('supports modern and legacy dismissal and caller-controlled announcements', async () => {
		const ondismiss = vi.fn();
		const legacyDismiss = vi.fn();
		render(PageFeedback, {
			props: {
				message: 'Saved.',
				tone: 'success',
				role: null,
				ariaLive: null,
				dismissLabel: 'Masquer le message',
				ondismiss,
			},
			events: { dismiss: legacyDismiss },
		});

		const feedback = screen.getByText('Saved.').closest('.page-feedback-card');
		expect(feedback?.hasAttribute('role')).toBe(false);
		expect(feedback?.hasAttribute('aria-live')).toBe(false);
		await fireEvent.click(
			screen.getByRole('button', { name: 'Masquer le message' }),
		);
		expect(ondismiss).toHaveBeenCalledOnce();
		expect(legacyDismiss).toHaveBeenCalledOnce();
	});

	it('renders a compact pending treatment without a pill shape', () => {
		render(PageFeedback, {
			props: { message: 'Processing payment.', tone: 'pending', compact: true },
		});

		const feedback = screen.getByRole('status');
		expect(feedback.classList.contains('pending')).toBe(true);
		expect(feedback.classList.contains('compact')).toBe(true);
		expect(feedback.querySelector('.page-feedback-spinner')).toBeTruthy();
	});

	it('keeps compact feedback rectangular with neutral typography and touch targets', () => {
		expect(pageFeedbackSource).toContain('min-height: 44px');
		expect(pageFeedbackSource).toContain('width: 44px');
		expect(pageFeedbackSource).toContain('letter-spacing: 0');
		expect(pageFeedbackSource).not.toContain('text-transform: uppercase');
		expect(pageFeedbackSource).not.toContain('border-radius: 9999px');
	});
});
