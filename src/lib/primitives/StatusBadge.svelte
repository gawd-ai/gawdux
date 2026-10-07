<!--
    Presentation-only status badge. Consumers compute the {color, label}
    pair from their own domain status taxonomy and pass it in. This
    keeps gawdux free of any caller's status vocabulary.

    `icon` is an optional cue rendered before the word (an icon component,
    e.g. from flowbite-svelte-icons). It takes the badge's text colour.
    Without it the badge renders exactly as before.
-->
<script context="module" lang="ts">
	export type StatusBadgeColor =
		| 'green'
		| 'red'
		| 'orange'
		| 'dark'
		| 'blue'
		| 'yellow'
		| 'indigo'
		| 'purple';
</script>

<script lang="ts">
	import type { Component } from 'svelte';
	import { twMerge } from 'tailwind-merge';

	export let color: StatusBadgeColor;
	export let label: string;
	export let rounded: boolean = true;
	/** Optional icon before the word. Decorative: the word carries the meaning. */
	export let icon: Component | null = null;
	/** Extra classes for the icon (size, colour); merged over the defaults. */
	export let iconClass: string = '';

	let className: string = '';
	export { className as class };

	const colorClasses: Record<StatusBadgeColor, string> = {
		green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
		red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
		orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
		dark: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
		blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
		yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
		indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
		purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
	};

	$: baseClass = `inline-flex items-center justify-center px-2.5 py-0.5 text-xs font-medium ${colorClasses[color]} ${rounded ? 'rounded-full' : 'rounded'}${icon ? ' gap-1' : ''}`;
	$: badgeClass = className ? twMerge(baseClass, className) : baseClass;
	$: iconClasses = twMerge('h-3 w-3 shrink-0', iconClass);
</script>

<span class={badgeClass}
	>{#if icon}<svelte:component this={icon} class={iconClasses} aria-hidden="true" />{/if}{label}</span
>
