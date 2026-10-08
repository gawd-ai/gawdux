<!-- One KPI tile: a micro-label, a value, a meta line. The hero strip of a
     detail overview is a row of these inside a StatTileStrip.

     - `tone` tints the tile with a state (ok, warn, bad, info); a strip
       usually tints one. `dot` adds the tone's status dot before the value,
       and `pulse` makes it ping (honouring reduced motion).
     - The drill-down is the go-to icon (SectionLink) at the right of the
       label row, never the whole tile and never a text link: `onclick` or
       `href`, named by `actionLabel` (the tooltip and accessible name).
     - `nested` is the variant for tiles inside a card: no border, the
       subtle surface, tighter padding, a smaller value.
     - `children` renders after the meta line, for a body the value cannot
       express (two link states, a short list); `aside` sits at the right of
       the label row (a freshness stamp, a count), before the go-to icon.
     Padding is the --gawdux-tile-padding knobs (tokens.css). Lifted from a
     consuming product's detail-page hero tiles. -->
<script module lang="ts">
	export type StatTileTone = 'neutral' | 'ok' | 'warn' | 'bad' | 'info';

	const TILE_TONE: Record<StatTileTone, string> = {
		neutral: 'border-[var(--gawdux-border)] bg-[var(--gawdux-surface-card)]',
		ok: 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30',
		warn: 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/30',
		bad: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30',
		info: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30'
	};

	const NESTED_TONE: Record<StatTileTone, string> = {
		neutral: 'bg-gray-50 dark:bg-gray-700/50',
		ok: 'bg-emerald-50 dark:bg-emerald-950/30',
		warn: 'bg-yellow-50 dark:bg-yellow-950/30',
		bad: 'bg-red-50 dark:bg-red-950/30',
		info: 'bg-blue-50 dark:bg-blue-950/30'
	};

	const DOT_TONE: Record<StatTileTone, string> = {
		neutral: 'bg-gray-400',
		ok: 'bg-emerald-500',
		warn: 'bg-yellow-400',
		bad: 'bg-red-500',
		info: 'bg-blue-500'
	};

	/** The tint classes for a tone, for a host that must match a tile. */
	export function statTileToneClass(tone: StatTileTone, nested = false): string {
		return (nested ? NESTED_TONE : TILE_TONE)[tone];
	}
</script>

<script lang="ts">
	import type { Component, Snippet } from 'svelte';
	import { twMerge } from 'tailwind-merge';
	import SectionLink from './SectionLink.svelte';

	let {
		label,
		value,
		meta,
		icon: Icon = null,
		tone = 'neutral',
		dot = false,
		pulse = false,
		nested = false,
		valueClass = '',
		valueTitle,
		metaTitle,
		onclick,
		href,
		actionLabel = 'View details',
		aside,
		children,
		className = ''
	}: {
		/** The micro-label, rendered uppercase. */
		label: string;
		value?: string | number | null;
		meta?: string | null;
		/** Optional icon before the label. */
		icon?: Component | null;
		tone?: StatTileTone;
		/** A status dot in the tone's colour before the value. */
		dot?: boolean;
		/** The dot pings (attention). Implies `dot`. */
		pulse?: boolean;
		/** The in-card variant. */
		nested?: boolean;
		/** Merged over the value's classes (a colour, a mono readout). */
		valueClass?: string;
		/** Tooltip for the value; defaults to the value itself. */
		valueTitle?: string;
		/** Tooltip for the meta line (an absolute time behind a relative one). */
		metaTitle?: string;
		/** Drill-down handler, rendered as the go-to icon button. */
		onclick?: (event: MouseEvent) => void;
		/** Drill-down target, rendered as the go-to icon link. */
		href?: string;
		/** Where the drill-down goes: its tooltip and accessible name. */
		actionLabel?: string;
		aside?: Snippet;
		children?: Snippet;
		className?: string;
	} = $props();

	const hasValue = $derived(value !== undefined && value !== null && String(value) !== '');
	const showDot = $derived(dot || pulse);
	const rootClass = $derived(
		[
			'stat-tile min-w-0 rounded-lg',
			nested
				? `p-[var(--gawdux-tile-padding-nested,0.625rem)] ${NESTED_TONE[tone]}`
				: `border p-[var(--gawdux-tile-padding,0.75rem)] transition-shadow hover:shadow-md ${TILE_TONE[tone]}`,
			className
		]
			.filter(Boolean)
			.join(' ')
	);
	const valueClasses = $derived(
		twMerge(
			`min-w-0 truncate font-semibold tabular-nums text-gray-900 dark:text-white ${nested ? 'text-base' : 'text-lg'}`,
			valueClass
		)
	);
</script>

<div class={rootClass} data-tone={tone}>
	<div class="flex items-center justify-between gap-2">
		<div class="flex min-w-0 items-center gap-1.5 text-gray-500 dark:text-gray-400">
			{#if Icon}
				<Icon class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
			{/if}
			<span class="truncate text-[10px] font-semibold uppercase tracking-wide" title={label}
				>{label}</span
			>
		</div>
		{#if aside || href || onclick}
			<div class="-my-1 flex shrink-0 items-center gap-1">
				{#if aside}{@render aside()}{/if}
				{#if href}
					<SectionLink label={actionLabel} {href} />
				{:else if onclick}
					<SectionLink label={actionLabel} {onclick} />
				{/if}
			</div>
		{/if}
	</div>
	{#if hasValue}
		{#if showDot}
			<div class="mt-1 flex min-w-0 items-center gap-2">
				<span class="relative flex h-3 w-3 shrink-0" data-stat-tile-dot>
					{#if pulse}
						<span
							class={`absolute inline-flex h-full w-full rounded-full opacity-75 motion-safe:animate-ping ${DOT_TONE[tone]}`}
						></span>
					{/if}
					<span class={`relative inline-flex h-3 w-3 rounded-full ${DOT_TONE[tone]}`}></span>
				</span>
				<span class={valueClasses} title={valueTitle ?? String(value)}>{value}</span>
			</div>
		{:else}
			<div class={`mt-1 ${valueClasses}`} title={valueTitle ?? String(value)}>{value}</div>
		{/if}
	{/if}
	{#if meta}
		<div class="mt-1 text-[11px] tabular-nums text-gray-500 dark:text-gray-400" title={metaTitle}>
			{meta}
		</div>
	{/if}
	{#if children}
		<div class="mt-1 min-w-0">{@render children()}</div>
	{/if}
</div>
