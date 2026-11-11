<!-- A titled detail panel. Its surface is the house card (`.card-container`
     in tokens.css): the card surface, the house edge and radius, and no
     shadow, since it sits in the page (no shadow inside the page). Its
     header and body padding are the --gawdux-card-* density knobs
     (tokens.css); the fallbacks are the same defaults, for a host that has
     not imported the tokens yet. `link` puts the go-to icon (SectionLink) at
     the right end of the header, after the header slot: the one place a
     card leads to another section. -->
<script lang="ts">
	import SectionLink from './SectionLink.svelte';
	export let title: string;
	/** The section this card leads to: `label` names it ("Open Network"). */
	export let link: { label: string; href?: string; onclick?: (event: MouseEvent) => void } | null =
		null;
	export let invalid = false;
	export let className = '';
	export let contentClass = '';
</script>

<section class={`card-container ${className} ${invalid ? 'card-invalid' : ''}`}>
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
</section>

<style>
	/* An invalid card doubles its red edge with an outline, never a shadow. */
	:global(.card-invalid) {
		border-color: rgb(248 113 113) !important;
		outline: 1px solid rgb(248 113 113 / 0.35);
	}

	:global(.dark .card-invalid) {
		border-color: rgb(185 28 28) !important;
		outline-color: rgb(185 28 28 / 0.6);
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
