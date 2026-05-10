<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import {
		CheckCircleOutline,
		CloseOutline,
		ExclamationCircleOutline,
		InfoCircleOutline
	} from 'flowbite-svelte-icons';

	export let message: string | null | undefined = null;
	export let title = 'Needs attention';
	export let tone: 'error' | 'success' | 'info' = 'error';
	export let dismissable = true;
	export let compact = false;

	const dispatch = createEventDispatcher<{ dismiss: void }>();

	$: normalizedMessage = message?.trim() ?? '';
	$: visible = normalizedMessage.length > 0;
</script>

{#if visible}
	<div
		class={`page-feedback-card ${tone} ${compact ? 'compact' : ''}`}
		role={tone === 'error' ? 'alert' : 'status'}
		aria-live={tone === 'error' ? 'assertive' : 'polite'}
	>
		<div class="page-feedback-icon" aria-hidden="true">
			{#if tone === 'success'}
				<CheckCircleOutline class="h-5 w-5" />
			{:else if tone === 'info'}
				<InfoCircleOutline class="h-5 w-5" />
			{:else}
				<ExclamationCircleOutline class="h-5 w-5" />
			{/if}
		</div>
		<div class="min-w-0 flex-1">
			{#if !compact}
				<div class="page-feedback-title">{title}</div>
			{/if}
			<div class="page-feedback-message">{normalizedMessage}</div>
		</div>
		{#if dismissable}
			<button
				type="button"
				class="page-feedback-dismiss"
				aria-label="Dismiss message"
				on:click={() => dispatch('dismiss')}
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
		border: 1px solid;
		border-radius: 0.5rem;
		padding: 0.625rem 0.75rem;
		box-shadow: 0 1px 2px rgb(15 23 42 / 0.06);
		max-width: min(34rem, 100%);
	}

	.page-feedback-card.compact {
		align-items: center;
		gap: 0.5rem;
		padding: 0.375rem 0.5rem;
		border-radius: 9999px;
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

	.page-feedback-card.info {
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

	:global(.dark) .page-feedback-card.info {
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

	.page-feedback-title {
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	.page-feedback-message {
		margin-top: 0.125rem;
		font-size: 0.875rem;
		line-height: 1.35;
	}

	.page-feedback-card.compact .page-feedback-message {
		margin-top: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.page-feedback-dismiss {
		flex: 0 0 auto;
		border-radius: 9999px;
		padding: 0.25rem;
		color: currentColor;
		opacity: 0.7;
	}

	.page-feedback-dismiss:hover {
		opacity: 1;
		background: rgb(255 255 255 / 0.42);
	}
</style>
