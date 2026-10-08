<!-- A titled detail panel. Its header and body padding are the
     --gawdux-card-* density knobs (tokens.css); the fallbacks are the same
     defaults, for a host that has not imported the tokens yet. `link` puts
     the go-to icon (SectionLink) at the right end of the header, after the
     header slot: the one place a card leads to another section. -->
<script lang="ts">
	import { Card } from 'flowbite-svelte';
	import SectionLink from './SectionLink.svelte';
	export let title: string;
	/** The section this card leads to: `label` names it ("Open Network"). */
	export let link: { label: string; href?: string; onclick?: (event: MouseEvent) => void } | null =
		null;
	export let invalid = false;
	export let className = '';
	export let contentClass = '';
</script>

<Card
	class={`max-w-none !p-0 overflow-hidden ${className} ${invalid ? 'card-invalid' : ''}`}
>
	<div
		class={`card-container-header flex items-center justify-between gap-3 px-[var(--gawdux-card-header-px,1.5rem)] py-[var(--gawdux-card-header-py,0.75rem)] text-left ${invalid ? 'bg-red-50 dark:bg-red-950/40' : 'bg-gray-50 dark:bg-gray-700'}`}
	>
		<h3
			class={`text-xs font-bold uppercase ${invalid ? 'text-red-700 dark:text-red-300' : 'text-gray-500 dark:text-gray-400'}`}
		>
			{title}
		</h3>
		<!-- Optional right-aligned header content (metadata, hints) -->
		{#if link}
			<div class="flex min-w-0 items-center gap-2">
				<slot name="header" />
				<SectionLink
					label={link.label}
					{...link.href ? { href: link.href } : {}}
					{...link.onclick ? { onclick: link.onclick } : {}}
					className="-my-1"
				/>
			</div>
		{:else}
			<slot name="header" />
		{/if}
	</div>
	<div
		class={`card-container-content p-[var(--gawdux-card-body-py,0.75rem)] px-[var(--gawdux-card-body-px,1.5rem)] ${contentClass}`}
	>
		<slot name="content" />
	</div>
</Card>

<style>
	:global(.card-invalid) {
		border-color: rgb(248 113 113) !important;
		box-shadow: 0 0 0 1px rgb(248 113 113 / 0.35) !important;
	}

	:global(.dark .card-invalid) {
		border-color: rgb(185 28 28) !important;
		box-shadow: 0 0 0 1px rgb(185 28 28 / 0.6) !important;
	}

	/* Narrow layouts cap the inline padding. The cap is a ceiling, not a
	   value: a product that compacts the card knobs below it keeps its
	   tighter padding here too, and the defaults land on the same 1rem and
	   0.75rem as before. */
	@media (max-width: 1024px) {
		.card-container-header {
			padding-inline: min(var(--gawdux-card-header-px, 1.5rem), 1rem);
		}
		.card-container-content {
			padding-inline: min(var(--gawdux-card-body-px, 1.5rem), 1rem);
		}
	}

	@media (max-width: 640px) {
		.card-container-header {
			padding-inline: min(var(--gawdux-card-header-px, 1.5rem), 0.75rem);
		}
		.card-container-content {
			padding-inline: min(var(--gawdux-card-body-px, 1.5rem), 0.75rem);
		}
	}
</style>
