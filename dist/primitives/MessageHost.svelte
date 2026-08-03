<!--
    Overlay host for the message-center feedback state (gawdux/utils
    message-center). The shell mounts exactly one host per message center and
    positions it via the .message-host class (absolute, top-right by default);
    consumers reposition by overriding that class. Rendering defers to
    PageFeedback so overlay messages share the page-feedback visual language.
-->
<script lang="ts">
	import { fromStore } from 'svelte/store';
	import PageFeedback from './PageFeedback.svelte';
	import type { MessageAction, MessageCenter, MessageCenterItem } from '../utils/message-center';

	let {
		center,
		compactViewport = false,
		suspended = false,
		label = 'Notifications',
		dismissLabel = 'Dismiss message',
		onAction
	}: {
		center: MessageCenter;
		compactViewport?: boolean;
		suspended?: boolean;
		label?: string;
		dismissLabel?: string;
		onAction?: (item: MessageCenterItem, action: MessageAction) => void;
	} = $props();

	// The shell owns one center for this component's complete lifetime.
	// svelte-ignore state_referenced_locally
	const snapshot = fromStore(center);
	const visibleItems = $derived(
		snapshot.current.overlay.slice(0, compactViewport ? 1 : snapshot.current.maxVisible)
	);
	const HOVER_PAUSE = 'message-host-hover';
	const FOCUS_PAUSE = 'message-host-focus';
	const SUSPEND_PAUSE = 'message-host-suspended';
	let host = $state<HTMLElement>();

	$effect(() => {
		if (suspended) center.pauseTimers(SUSPEND_PAUSE);
		else center.resumeTimers(SUSPEND_PAUSE);
	});

	function dismiss(item: MessageCenterItem) {
		center.resumeTimers(HOVER_PAUSE);
		center.resumeTimers(FOCUS_PAUSE);
		if (item.kind === 'condition') center.hideCondition(item.id, item.revision);
		else center.dismissTransient(item.id, item.revision);
	}

	function runAction(item: MessageCenterItem, action: MessageAction) {
		center.resumeTimers(HOVER_PAUSE);
		center.resumeTimers(FOCUS_PAUSE);
		onAction?.(item, action);
	}

	function handleFocusOut(event: FocusEvent) {
		if (!host?.contains(event.relatedTarget as Node | null)) center.resumeTimers(FOCUS_PAUSE);
	}
</script>

{#if !suspended && visibleItems.length > 0}
	<section
		class="message-host"
		aria-label={label}
		bind:this={host}
		onmouseenter={() => center.pauseTimers(HOVER_PAUSE)}
		onmouseleave={() => center.resumeTimers(HOVER_PAUSE)}
		onfocusin={() => center.pauseTimers(FOCUS_PAUSE)}
		onfocusout={handleFocusOut}
	>
		{#each visibleItems as item (`${item.id}:${item.revision}`)}
			{@const action = item.actions[0] ?? null}
			<div class="message-host-item">
				<PageFeedback
					title={item.title}
					message={item.message}
					tone={item.tone}
					dismissable
					{dismissLabel}
					role={item.kind === 'transient' && item.tone === 'error' ? 'alert' : 'status'}
					actionLabel={action?.label ?? null}
					actionHref={action?.href ?? null}
					onaction={() => {
						if (action && !action.href) runAction(item, action);
					}}
					ondismiss={() => dismiss(item)}
				/>
			</div>
		{/each}
	</section>
{/if}

<style>
	.message-host {
		position: absolute;
		top: 3.75rem;
		right: 0.75rem;
		z-index: 80;
		display: grid;
		width: min(26rem, calc(100% - 1.5rem));
		gap: 0.5rem;
		pointer-events: none;
	}

	.message-host-item {
		min-width: 0;
		pointer-events: auto;
	}

	.message-host-item :global(.page-feedback-card) {
		width: 100%;
		max-width: none;
		box-shadow: 0 4px 12px rgb(15 23 42 / 0.14);
	}

	@media (max-width: 640px) {
		.message-host {
			right: 0.5rem;
			width: calc(100% - 1rem);
		}

		.message-host-item :global(.page-feedback-card) {
			display: grid;
			grid-template-columns: 1.25rem minmax(0, 1fr) 2.75rem;
			align-items: start;
			column-gap: 0.5rem;
			row-gap: 0.25rem;
		}

		.message-host-item :global(.page-feedback-icon) {
			grid-column: 1;
			grid-row: 1;
		}

		.message-host-item :global(.page-feedback-content) {
			grid-column: 2;
			grid-row: 1;
		}

		.message-host-item :global(.page-feedback-dismiss) {
			grid-column: 3;
			grid-row: 1;
		}

		.message-host-item :global(.page-feedback-action) {
			grid-column: 2 / 4;
			grid-row: 2;
			justify-self: start;
		}
	}
</style>
