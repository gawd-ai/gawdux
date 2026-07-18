<script module lang="ts">
	import type { Component, Snippet } from 'svelte';

	export type PageFeedbackTone = 'error' | 'success' | 'warning' | 'info' | 'pending';
	export type PageFeedbackRole = 'alert' | 'status' | null;
	export type PageFeedbackLive = 'assertive' | 'polite' | 'off' | null;

	export interface PageFeedbackProps {
		/** Plain-text feedback. Rich `children` content takes precedence when provided. */
		message?: string | null;
		title?: string | null;
		tone?: PageFeedbackTone;
		dismissable?: boolean;
		compact?: boolean;
		className?: string;
		children?: Snippet;
		icon?: Component<{ class?: string }>;
		actionLabel?: string | null;
		actionHref?: string | null;
		actionPending?: boolean;
		actionPendingLabel?: string;
		dismissLabel?: string;
		onaction?: () => void;
		/** Svelte 5 callback form. The legacy `dismiss` component event is also emitted. */
		ondismiss?: () => void;
		/** `undefined` selects a tone-appropriate default; `null` omits the role. */
		role?: PageFeedbackRole;
		/** `undefined` follows the resolved role; `null` omits `aria-live`. */
		ariaLive?: PageFeedbackLive;
		ariaAtomic?: boolean;
	}
</script>

<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import {
		CheckCircleOutline,
		CloseOutline,
		ExclamationCircleOutline,
		InfoCircleOutline
	} from 'flowbite-svelte-icons';

	let {
		message = null,
		title = 'Needs attention',
		tone = 'error',
		dismissable = true,
		compact = false,
		className = '',
		children,
		icon,
		actionLabel = null,
		actionHref = null,
		actionPending = false,
		actionPendingLabel = 'Working...',
		dismissLabel = 'Dismiss message',
		onaction,
		ondismiss,
		role,
		ariaLive,
		ariaAtomic = true
	}: PageFeedbackProps = $props();

	const dispatch = createEventDispatcher<{ dismiss: void }>();
	const normalizedMessage = $derived(message?.trim() ?? '');
	const normalizedTitle = $derived(title?.trim() ?? '');
	const visible = $derived(Boolean(children) || normalizedMessage.length > 0);
	const hasAction = $derived(Boolean(actionLabel?.trim() && (actionHref || onaction)));
	const resolvedRole = $derived(
		role === undefined ? (tone === 'error' ? 'alert' : 'status') : (role ?? undefined)
	);
	const resolvedLive = $derived(
		ariaLive === undefined
			? resolvedRole === 'alert'
				? 'assertive'
				: resolvedRole === 'status'
					? 'polite'
					: undefined
			: (ariaLive ?? undefined)
	);
	const ResolvedIcon = $derived(
		icon ??
			(tone === 'success'
				? CheckCircleOutline
				: tone === 'info' || tone === 'pending'
					? InfoCircleOutline
					: ExclamationCircleOutline)
	);

	function handleDismiss() {
		ondismiss?.();
		dispatch('dismiss');
	}

	function handleAction(event: MouseEvent) {
		if (actionPending) {
			event.preventDefault();
			return;
		}
		onaction?.();
	}
</script>

{#if visible}
	<div
		class={`page-feedback-card ${tone} ${compact ? 'compact' : ''} ${className}`}
		role={resolvedRole}
		aria-live={resolvedLive}
		aria-atomic={resolvedLive ? ariaAtomic : undefined}
	>
		<div class="page-feedback-icon" aria-hidden="true">
			{#if tone === 'pending' && !icon}
				<svg class="page-feedback-spinner" viewBox="0 0 24 24" fill="none" aria-hidden="true">
					<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="3" opacity="0.25" />
					<path fill="currentColor" d="M12 3a9 9 0 0 1 9 9h-3a6 6 0 0 0-6-6V3Z" />
				</svg>
			{:else}
				<ResolvedIcon class="h-5 w-5" />
			{/if}
		</div>
		<div class="page-feedback-content min-w-0 flex-1">
			{#if normalizedTitle}
				<div class="page-feedback-title">{normalizedTitle}</div>
			{/if}
			<div class="page-feedback-message">
				{#if children}
					{@render children()}
				{:else}
					{normalizedMessage}
				{/if}
			</div>
		</div>
		{#if hasAction}
			{#if actionHref}
				<a
					href={actionHref}
					class="page-feedback-action"
					aria-busy={actionPending}
					aria-disabled={actionPending || undefined}
					onclick={handleAction}
				>
					{actionPending ? actionPendingLabel : actionLabel}
				</a>
			{:else}
				<button
					type="button"
					class="page-feedback-action"
					aria-busy={actionPending}
					disabled={actionPending}
					onclick={handleAction}
				>
					{actionPending ? actionPendingLabel : actionLabel}
				</button>
			{/if}
		{/if}
		{#if dismissable}
			<button
				type="button"
				class="page-feedback-dismiss"
				aria-label={dismissLabel}
				onclick={handleDismiss}
			>
				<CloseOutline class="h-4 w-4" />
			</button>
		{/if}
	</div>
{/if}

<style>
	.page-feedback-card {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		max-width: min(34rem, 100%);
		padding: 0.625rem 0.75rem;
		border: 1px solid;
		border-radius: 0.5rem;
		box-shadow: 0 1px 2px rgb(15 23 42 / 0.06);
	}

	.page-feedback-card.compact {
		align-items: center;
		gap: 0.5rem;
		padding: 0.375rem 0.5rem;
		border-radius: 0.375rem;
		box-shadow: none;
	}

	.page-feedback-card.error {
		border-color: rgb(254 202 202);
		background: rgb(254 242 242);
		color: rgb(127 29 29);
	}

	.page-feedback-card.success {
		border-color: rgb(187 247 208);
		background: rgb(240 253 244);
		color: rgb(20 83 45);
	}

	.page-feedback-card.warning {
		border-color: rgb(253 230 138);
		background: rgb(255 251 235);
		color: rgb(120 53 15);
	}

	.page-feedback-card.info,
	.page-feedback-card.pending {
		border-color: rgb(191 219 254);
		background: rgb(239 246 255);
		color: rgb(30 64 175);
	}

	:global(.dark) .page-feedback-card.error {
		border-color: rgb(127 29 29 / 0.8);
		background: rgb(69 10 10 / 0.96);
		color: rgb(254 226 226);
	}

	:global(.dark) .page-feedback-card.success {
		border-color: rgb(20 83 45 / 0.8);
		background: rgb(5 46 22 / 0.96);
		color: rgb(220 252 231);
	}

	:global(.dark) .page-feedback-card.warning {
		border-color: rgb(146 64 14 / 0.8);
		background: rgb(69 26 3 / 0.96);
		color: rgb(254 243 199);
	}

	:global(.dark) .page-feedback-card.info,
	:global(.dark) .page-feedback-card.pending {
		border-color: rgb(30 64 175 / 0.8);
		background: rgb(23 37 84 / 0.96);
		color: rgb(219 234 254);
	}

	.page-feedback-icon {
		flex: 0 0 auto;
		margin-top: 0.125rem;
	}

	.page-feedback-card.compact .page-feedback-icon {
		margin-top: 0;
	}

	.page-feedback-spinner {
		width: 1.25rem;
		height: 1.25rem;
		animation: page-feedback-spin 0.8s linear infinite;
	}

	.page-feedback-title {
		font-size: 0.8125rem;
		font-weight: 650;
		line-height: 1.25;
		letter-spacing: 0;
	}

	.page-feedback-message {
		margin-top: 0.125rem;
		font-size: 0.875rem;
		line-height: 1.35;
		letter-spacing: 0;
	}

	.page-feedback-card.compact .page-feedback-message {
		margin-top: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.page-feedback-action,
	.page-feedback-dismiss {
		display: inline-flex;
		flex: 0 0 auto;
		align-items: center;
		justify-content: center;
		min-height: 44px;
		border-radius: 0.375rem;
		color: currentColor;
		letter-spacing: 0;
	}

	.page-feedback-action {
		align-self: center;
		padding: 0.5rem 0.625rem;
		border: 1px solid rgb(255 255 255 / 0.56);
		font-size: 0.75rem;
		font-weight: 650;
		line-height: 1.2;
		text-decoration: none;
		white-space: nowrap;
	}

	.page-feedback-action:hover:not(:disabled, [aria-disabled='true']),
	.page-feedback-action:focus-visible {
		background: rgb(255 255 255 / 0.48);
	}

	.page-feedback-action:focus-visible,
	.page-feedback-dismiss:focus-visible {
		outline: 2px solid currentColor;
		outline-offset: 2px;
	}

	.page-feedback-action:disabled,
	.page-feedback-action[aria-disabled='true'] {
		cursor: wait;
		opacity: 0.68;
	}

	.page-feedback-dismiss {
		width: 44px;
		padding: 0;
		opacity: 0.7;
	}

	.page-feedback-dismiss:hover {
		opacity: 1;
		background: rgb(255 255 255 / 0.42);
	}

	@keyframes page-feedback-spin {
		to {
			transform: rotate(360deg);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.page-feedback-spinner {
			animation-duration: 1.6s;
		}
	}
</style>
