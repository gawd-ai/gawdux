<!-- A titled detail panel. Its surface is the house card (`.card-container`
     in tokens.css): the card surface, the house edge and radius, and no
     shadow, since it sits in the page (no shadow inside the page). Its
     header and body stand their text one padding in from the card's edge,
     the card padding (`--gawdux-card-padding`, 16px at every width: a card
     is a box nested in the content and keeps its padding on a phone), the
     header's band its own height (`--gawdux-card-header-py`); the body is
     the house card body (`.card-content`, tokens.css). `link` puts the go-to icon (SectionLink) at
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
		class={`card-container-header flex items-center justify-between gap-3 px-[var(--gawdux-card-padding,1rem)] py-[var(--gawdux-card-header-py,0.75rem)] text-left ${invalid ? 'bg-red-50 dark:bg-red-950/40' : 'bg-gray-50 dark:bg-gray-700'}`}
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
	<div class={`card-container-content card-content ${contentClass}`}>
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
</style>
